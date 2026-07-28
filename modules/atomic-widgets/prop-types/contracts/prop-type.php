<?php

namespace Elementor\Modules\AtomicWidgets\PropTypes\Contracts;

use Elementor\Modules\AtomicWidgets\PropDependencies\Manager as Dependency_Manager;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

interface Prop_Type extends \JsonSerializable {
	public static function get_key(): string;
	public function get_type(): string;
	public function get_default();
	public function validate( $value ): bool;
	public function sanitize( $value );
	public function get_meta(): array;
	public function get_meta_item( string $key, $default_value = null );
	public function get_settings(): array;
	public function get_setting( string $key, $default_value = null );
	public function set_dependencies( ?array $dependencies ): self;
	public function get_dependencies(): ?array;
	public function get_initial_value();

	/**
	 * Whether a sanitized prop value should be written to persisted element data.
	 *
	 * Called after sanitize() by Props_Parser and composite prop types when filtering
	 * nested values. Each prop type defines its own empty semantics.
	 *
	 * @param array $value Sanitized transformable prop value.
	 */
	public function should_persist( $value ): bool;

	/**
	 * Returns the list of alias names for this prop type.
	 * Aliases allow the LLM to use alternative names for the same prop.
	 *
	 * @return string[]
	 */
	public function get_aliases(): array;

	/**
	 * Returns a JSON Schema representation of this prop type's enveloped ({$$type, value}) input
	 * format, mirroring the frontend's propTypeToJsonSchema converter.
	 *
	 * @return array JSON Schema array.
	 */
	public function to_json_schema(): array;
}
