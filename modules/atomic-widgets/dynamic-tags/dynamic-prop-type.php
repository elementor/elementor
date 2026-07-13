<?php

namespace Elementor\Modules\AtomicWidgets\DynamicTags;

use Elementor\Modules\AtomicWidgets\PropTypes\Base\Plain_Prop_Type;
use Elementor\Modules\AtomicWidgets\Parsers\Props_Parser;
use Elementor\Modules\AtomicWidgets\PropTypes\Union_Prop_Type;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Dynamic_Prop_Type extends Plain_Prop_Type {

	const META_KEY = 'dynamic';

	/**
	 * @var callable|null Maps a dynamic prop's accepted categories to the names of the dynamic tags
	 *                     allowed for it. Injectable so this class stays decoupled from the dynamic
	 *                     tags registry, mirroring the frontend's `setDynamicTagNamesResolver`.
	 */
	private static $tag_names_resolver = null;

	public static function set_tag_names_resolver( ?callable $resolver ): void {
		self::$tag_names_resolver = $resolver;
	}

	/**
	 * Registers `dynamic` as a `Union_Prop_Type` exclusive JSON schema variant, so unions know how
	 * to advertise it without needing to know anything about dynamic tags themselves.
	 */
	public static function register_union_json_schema_variant(): void {
		Union_Prop_Type::register_exclusive_variant( self::get_key(), [ self::class, 'build_union_variant_schema' ] );
	}

	/**
	 * Emits a compact representation of the `dynamic` union member. Only `name` is required from the
	 * LLM (constrained to the tags allowed here via the injected resolver); `settings` are described
	 * per-tag in the dynamic-tags resource, so the full tag catalog is never inlined here.
	 */
	public static function build_union_variant_schema( self $dynamic_prop_type ): array {
		$allowed_tag_names = self::$tag_names_resolver
			? call_user_func( self::$tag_names_resolver, $dynamic_prop_type->get_categories() )
			: [];

		$name_schema = [
			'type' => 'string',
			'description' => 'Dynamic tag name from "elementor://dynamic-tags".',
		];

		if ( ! empty( $allowed_tag_names ) ) {
			$name_schema['enum'] = $allowed_tag_names;
		}

		return [
			'type' => 'object',
			'description' =>
				'Bind THIS value to a dynamic tag instead of a static value (this may be a nested field, ' .
				'e.g. an image\'s "src"). Look up the chosen tag in the "elementor://dynamic-tags" resource ' .
				'and populate "settings" exactly as its schema requires.',
			'properties' => [
				'$$type' => [
					'type' => 'string',
					'const' => self::get_key(),
				],
				'value' => [
					'type' => 'object',
					'properties' => [
						'name' => $name_schema,
						'settings' => [
							'type' => 'object',
							'description' => "Tag settings matching the chosen tag's schema in the resource.",
						],
					],
					'required' => [ 'name' ],
				],
			],
			'required' => [ '$$type', 'value' ],
		];
	}

	/**
	 * Return a tuple that lets the developer ignore the dynamic prop type in the props schema
	 * using `Prop_Type::meta()`, e.g. `String_Prop_Type::make()->meta( Dynamic_Prop_Type::ignore() )`.
	 */
	public static function ignore(): array {
		return [ static::META_KEY, false ];
	}

	public static function get_key(): string {
		return 'dynamic';
	}

	public function categories( array $categories ) {
		$this->settings['categories'] = $categories;

		return $this;
	}

	public function get_categories() {
		return $this->settings['categories'] ?? [];
	}

	public static function is_dynamic_prop_value( $value ): bool {
		return isset( $value['$$type'] ) && self::get_key() === $value['$$type'];
	}

	/**
	 * Delegates to the same schema builder used when this prop type is offered as a `Union_Prop_Type`
	 * exclusive variant, so standalone calls (outside a union) stay consistent with the union path.
	 */
	public function to_json_schema( bool $suppress_dynamic = false ): array {
		return self::build_union_variant_schema( $this );
	}

	protected function validate_value( $value ): bool {
		$is_valid_structure = (
			isset( $value['name'] ) &&
			is_string( $value['name'] ) &&
			isset( $value['group'] ) &&
			is_string( $value['group'] ) &&
			isset( $value['settings'] ) &&
			is_array( $value['settings'] )
		);

		if ( ! $is_valid_structure ) {
			return false;
		}

		$tag = Dynamic_Tags_Module::instance()->registry->get_tag( $value['name'] );

		if ( ! $tag || ! $this->is_tag_in_supported_categories( $tag ) ) {
			return false;
		}

		return Props_Parser::make( $tag['props_schema'] )
			->validate( $value['settings'] )
			->is_valid();
	}

	protected function sanitize_value( $value ): array {
		$tag = Dynamic_Tags_Module::instance()->registry->get_tag( $value['name'] );

		$sanitized = Props_Parser::make( $tag['props_schema'] )
			->sanitize( $value['settings'] )
			->unwrap();

		return [
			'name' => $value['name'],
			'group' => $value['group'],
			'settings' => $sanitized,
		];
	}

	private function is_tag_in_supported_categories( array $tag ): bool {
		$intersection = array_intersect(
			$tag['categories'],
			$this->get_categories()
		);

		return ! empty( $intersection );
	}
}
