<?php

namespace Elementor\Modules\AtomicWidgets\PropTypes\Concerns;

use Elementor\Modules\AtomicWidgets\PropsResolver\Props_Resolver;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

trait Has_Atomic_Base {
	public function has_widget_inner_wrapper(): bool {
		return false;
	}

	public function get_atomic_controls() {
		$controls = $this->define_atomic_controls();
		$schema = static::get_props_schema();

		// Validate the schema only in the Editor.
		static::validate_schema( $schema );

		return $this->get_valid_controls( $schema, $controls );
	}

	final public function get_controls( $control_id = null ) {
		if ( ! empty( $control_id ) ) {
			return null;
		}

		return [];
	}

	final public function get_data_for_save() {
		$data = parent::get_data_for_save();

		$data['version'] = $this->version;
		$data['settings'] = $this->sanitize_atomic_settings( $data['settings'] );
		$data['styles'] = $this->sanitize_atomic_styles( $data['styles'] );

		return $data;
	}

	final public function get_raw_data( $with_html_content = false ) {
		$raw_data = parent::get_raw_data( $with_html_content );

		$raw_data['styles'] = $this->styles;

		return $raw_data;
	}

	final public function get_stack( $with_common_controls = true ) {
		return [
			'controls' => [],
			'tabs' => [],
		];
	}

	final public function get_atomic_settings(): array {
		$schema = static::get_props_schema();
		$props = $this->get_settings();

		return Props_Resolver::for_settings()->resolve( $schema, $props );
	}

	public static function get_props_schema(): array {
		return apply_filters(
			'elementor/atomic-widgets/props-schema',
			static::define_props_schema()
		);
	}
}
