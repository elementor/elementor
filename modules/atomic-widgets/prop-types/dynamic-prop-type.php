<?php

namespace Elementor\Modules\AtomicWidgets\PropTypes;

use Elementor\Core\DynamicTags\Tag;
use Elementor\Plugin;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Dynamic_Prop_Type extends Transformable_Prop_Type {

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

	public function validate_value( $value ): void {
		$tag = Plugin::$instance->dynamic_tags->create_tag( null, $value['name'] );

		if ( ! $tag ) {
			throw new \Exception( "Dynamic tag `{$value['name']}` does not exist" );
		}

		if ( ! $this->is_tag_in_supported_categories( $tag ) ) {
			$tag_categories = implode( ', ', $tag->get_categories() );
			$prop_categories = implode( ', ', $this->get_categories() );

			throw new \Exception( "Dynamic tag `{$tag->get_name()}` categories ($tag_categories) are not in supported categories ($prop_categories)" );
		}

		// TODO: Validate the settings against the schema using the same method from the save process.
	}

	protected static function define_value_schema(): Prop_Type {
		return Object_Prop_Type::make( [
			'name' => String_Prop_Type::make(), // TODO: Enum of available dynamic tags?
			'settings' => Object_Prop_Type::make()->any(),
		] );
	}

	private function is_tag_in_supported_categories( Tag $tag ): bool {
		$intersection = array_intersect(
			$tag->get_categories(),
			$this->get_categories()
		);

		return ! empty( $intersection );
	}
}
