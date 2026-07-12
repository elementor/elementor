<?php

namespace Elementor\Modules\AtomicWidgets\PropTypes;

use Elementor\Modules\AtomicWidgets\PropDependencies\Manager as Dependency_Manager;
use Elementor\Modules\AtomicWidgets\PropTypes\Contracts\Transformable_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Contracts\Prop_Type;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Union_Prop_Type implements Prop_Type {
	// Backward compatibility, do not change to "const". Keep name in uppercase.
	// phpcs:ignore
	static $KIND = 'union';

	use Concerns\Has_Meta;
	use Concerns\Has_Settings;
	use Concerns\Has_Required_Setting;
	use Concerns\Has_Json_Schema_Meta;

	protected $default = null;

	protected $initial_value = null;

	private ?array $dependencies = null;

	/**
	 * Variant keys (e.g. `overridable`) that should never be advertised in the JSON schema.
	 * Populated by the owning modules via `register_omitted_variant_key()` when they boot, so this
	 * class doesn't need to know about specific prop types (e.g. `Overridable_Prop_Type`) by name.
	 *
	 * @var array<string, true>
	 */
	private static array $omitted_variant_keys = [];

	/**
	 * Variant keys (e.g. `dynamic`) that are advertised at most once per branch, via a custom schema
	 * builder, and suppressed for descendants of the node that offered them. Populated the same way
	 * as `$omitted_variant_keys`.
	 *
	 * @var array<string, callable>
	 */
	private static array $exclusive_variant_builders = [];

	public static function register_omitted_variant_key( string $key ): void {
		self::$omitted_variant_keys[ $key ] = true;
	}

	public static function register_exclusive_variant( string $key, callable $schema_builder ): void {
		self::$exclusive_variant_builders[ $key ] = $schema_builder;
	}

	/**
	 * Resets the state populated by `register_omitted_variant_key()`/`register_exclusive_variant()`.
	 * Intended for tests that register their own variants and need a clean slate between cases.
	 */
	public static function reset_registered_variants(): void {
		self::$omitted_variant_keys = [];
		self::$exclusive_variant_builders = [];
	}

	/** @var Array<string, Transformable_Prop_Type> */
	protected array $prop_types = [];

	public static function get_key(): string {
		return 'union';
	}

	public static function make(): self {
		return new static();
	}

	public static function create_from( Transformable_Prop_Type $prop_type ): self {
		$dependencies = $prop_type->get_dependencies();

		$prop_type->set_dependencies( [] );

		$prop_meta = $prop_type->get_meta() ?? [];

		$result = static::make()
			->add_prop_type( $prop_type )
			->default( $prop_type->get_default() )
			->set_dependencies( $dependencies );

		foreach ( $prop_meta as $key => $value ) {
			$result->meta( $key, $value );
		}

		return $result
			->initial_value( $prop_type->get_initial_value() )
			->set_dependencies( $dependencies )
			->set_required_settings( $prop_type );
	}

	public function get_type(): string {
		return 'union';
	}

	public function add_prop_type( Transformable_Prop_Type $prop_type ): self {
		$this->prop_types[ $prop_type::get_key() ] = $prop_type;

		return $this;
	}

	public function get_prop_types(): array {
		return $this->prop_types;
	}

	public function get_prop_type( $type ): ?Transformable_Prop_Type {
		return $this->prop_types[ $type ] ?? null;
	}

	public function get_prop_type_from_value( $value ): ?Prop_Type {
		if ( isset( $value['$$type'] ) ) {
			return $this->get_prop_type( $value['$$type'] );
		}

		if ( is_numeric( $value ) ) {
			return $this->get_prop_type( 'number' );
		}

		if ( is_bool( $value ) ) {
			return $this->get_prop_type( 'boolean' );
		}

		if ( is_string( $value ) ) {
			return $this->get_prop_type( 'string' );
		}

		return null;
	}

	public function default( $value, ?string $type = null ): self {
		$this->default = ! $type ?
			$value :
			[
				'$$type' => $type,
				'value' => $value,
			];

		return $this;
	}

	public function initial_value( $value, ?string $type = null ): self {
		$this->initial_value = ! $type ?
			$value :
			[
				'$$type' => $type,
				'value' => $value,
			];

		return $this;
	}

	public function get_default() {
		return $this->default;
	}

	public function get_initial_value() {
		return $this->initial_value;
	}

	public function validate( $value ): bool {
		if ( is_null( $value ) ) {
			return ! $this->is_required();
		}

		$prop_type = $this->get_prop_type_from_value( $value );

		return $prop_type && $prop_type->validate( $value );
	}

	public function sanitize( $value ) {
		$prop_type = $this->get_prop_type_from_value( $value );

		return $prop_type ? $prop_type->sanitize( $value ) : null;
	}

	public function jsonSerialize(): array {
		return [
			// phpcs:ignore
			'kind' => static::$KIND,
			'default' => $this->get_default(),
			'meta' => $this->get_meta(),
			'settings' => $this->get_settings(),
			'prop_types' => $this->get_prop_types(),
			'dependencies' => $this->get_dependencies(),
			'initial_value' => $this->get_initial_value(),
		];
	}

	public function set_dependencies( ?array $dependencies ): self {
		$this->dependencies = empty( $dependencies ) ? null : $dependencies;

		return $this;
	}

	public function get_dependencies(): ?array {
		return $this->dependencies;
	}

	private function set_required_settings( Transformable_Prop_Type $prop_type ): self {
		if ( $prop_type->get_setting( 'required', false ) ) {
			$this->required();
		}

		return $this;
	}

	/**
	 * An "exclusive" variant (e.g. `dynamic`) replaces the value of the exact node it is attached to,
	 * which may be a nested field (e.g. an image's `src`) rather than the property root. It is
	 * advertised once per branch, at the outermost prop type that supports it, and suppressed for
	 * descendants of that node to avoid offering the same option twice on a single branch.
	 *
	 * Which variant keys are omitted or exclusive is not known to this class: it is populated by the
	 * owning modules via `register_omitted_variant_key()`/`register_exclusive_variant()` when they
	 * boot, keeping this class decoupled from specific prop types (e.g. `dynamic`, `overridable`).
	 */
	public function to_json_schema( bool $suppress_dynamic = false ): array {
		$prop_types = $this->get_prop_types();
		$offers_exclusive_variant = ! $suppress_dynamic && $this->has_exclusive_variant( $prop_types );
		$suppress_nested_exclusive_variant = $suppress_dynamic || $offers_exclusive_variant;

		$schemas = [];

		foreach ( $prop_types as $key => $prop_type ) {
			if ( isset( self::$omitted_variant_keys[ $key ] ) ) {
				continue;
			}

			if ( isset( self::$exclusive_variant_builders[ $key ] ) ) {
				if ( $offers_exclusive_variant ) {
					$schemas[] = call_user_func( self::$exclusive_variant_builders[ $key ], $prop_type );
				}

				continue;
			}

			$schemas[] = $prop_type->to_json_schema( $suppress_nested_exclusive_variant );
		}

		$schema = $this->with_json_schema_meta( [] );

		if ( ! empty( $schemas ) ) {
			$schema['anyOf'] = $schemas;
		}

		return $schema;
	}

	private function has_exclusive_variant( array $prop_types ): bool {
		foreach ( array_keys( $prop_types ) as $key ) {
			if ( isset( self::$exclusive_variant_builders[ $key ] ) ) {
				return true;
			}
		}

		return false;
	}
}
