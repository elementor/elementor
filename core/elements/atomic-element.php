<?php

namespace Elementor\Core\Elements;

use Elementor\Core\Elements\Concerns\Has_Base_Styles;
use Elementor\Core\Elements\Concerns\Has_Editor_Settings;
use Elementor\Core\Elements\Concerns\Has_Settings;
use Elementor\Core\Elements\Concerns\Has_Settings_Controls;
use Elementor\Core\Elements\Concerns\Has_Styles;
use Elementor\Core\Elements\Concerns\Has_Template;
use Elementor\Element_Base;
use Elementor\Plugin;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

abstract class Atomic_Element extends Element_Base {
	use Has_Base_Styles;
	use Has_Template;
	use Has_Settings;
	use Has_Settings_Controls;
	use Has_Styles;
	use Has_Editor_Settings;

	protected $styles = [];
	protected $editor_settings = [];

	public function __construct( $data = [], $args = null ) {
		parent::__construct( $data, $args );

		$this->styles = $data['styles'] ?? [];
		$this->editor_settings = $data['editor_settings'] ?? [];
	}

	public function get_initial_config() {
		return array_merge( parent::get_initial_config(), [
			'atomic' => true,
			'twig_main_template' => $this->get_main_template(),
			'twig_templates' => $this->get_templates_contents(),
			'atomic_controls' => $this->get_atomic_settings_controls(),
			'atomic_props_schema' => $this->get_atomic_settings_schema(),
			'base_styles' => $this->get_base_styles(),
			'base_styles_dictionary' => $this->get_base_styles_dictionary(),
			'show_in_panel' => true,
			'categories' => [ 'v4-elements' ],
			'hide_on_search' => false,
			'controls' => [],
			'keywords' => $this->get_keywords(),
			'avoid_wrapping' => true,
		] );
	}

	public function get_data_for_save() {
		$data = parent::get_data_for_save();

		return array_merge( $data, [
			'settings' => $this->parse_atomic_settings( $data['settings'] ),
			'styles' => $this->parse_atomic_styles( $data['styles'] ),
			'editor_settings' => $this->parse_editor_settings( $data['editor_settings'] ),
		] );
	}

	public function get_raw_data( $with_html_content = false ) {
		return array_merge(
			parent::get_raw_data( $with_html_content ),
			[
				'styles' => $this->styles,
				'editor_settings' => $this->editor_settings,
			]
		);
	}

	protected function _get_default_child_type( array $element_data ) {
		// Support all element and widget types.
		if ( 'widget' === $element_data['elType'] ) {
			return Plugin::$instance->widgets_manager->get_widget_types( $element_data['widgetType'] );
		}

		return Plugin::$instance->elements_manager->get_element_types( $element_data['elType'] );
	}

	public function get_name() {
		return static::get_type();
	}

	protected function get_keywords() {
		return [ 'atomic' ];
	}

	public function get_global_scripts() {
		return [];
	}

	public function get_controls( $control_id = null ) {
		if ( ! empty( $control_id ) ) {
			return null;
		}

		return [];
	}

	public function get_stack( $with_common_controls = true ) {
		return [
			'controls' => [],
			'tabs' => [],
		];
	}

	public function has_widget_inner_wrapper(): bool {
		return false;
	}
}
