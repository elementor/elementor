<?php

namespace Elementor\Modules\AtomicWidgets\Elements;

use Elementor\Element_Base;
use Elementor\Modules\AtomicWidgets\PropDependencies\Manager as Dependency_Manager;
use Elementor\Modules\AtomicWidgets\PropTypes\Contracts\Prop_Type;
use Elementor\Modules\AtomicWidgets\Render_Context;
use Elementor\Plugin;
use Elementor\Utils;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

abstract class Atomic_Element_Base extends Element_Base {
	use Has_Atomic_Base;

	protected $version = '0.0';
	protected $styles = [];
	protected $interactions = [];
	protected $editor_settings = [];


	public function __construct( $data = [], $args = null ) {
		parent::__construct( $data, $args );

		$this->version = $data['version'] ?? '0.0';
		$this->styles = $data['styles'] ?? [];
		$this->interactions = $this->parse_atomic_interactions( $data['interactions'] ?? [] );
		$this->editor_settings = $data['editor_settings'] ?? [];
	}

	private function parse_atomic_interactions( $interactions ) {
		if ( empty( $interactions ) ) {
			return [];
		}

		if ( is_string( $interactions ) ) {
			$decoded = json_decode( $interactions, true );
			if ( json_last_error() === JSON_ERROR_NONE && is_array( $decoded ) ) {
				$interactions = $decoded;
			}
		}

		if ( ! is_array( $interactions ) ) {
			return [];
		}

		if ( isset( $interactions['items'] ) && is_array( $interactions['items'] ) ) {
			return $this->convert_prop_type_interactions_to_legacy_for_runtime( $interactions );
		}

		return $interactions;
	}

	private function convert_prop_type_interactions_to_legacy_for_runtime( $interactions ) {
		$legacy_items = [];

		foreach ( $interactions['items'] as $item ) {
			if ( isset( $item['$$type'] ) && 'interaction-item' === $item['$$type'] ) {
				$legacy_item = $this->extract_legacy_interaction_from_prop_type( $item );
				if ( $legacy_item ) {
					$legacy_items[] = $legacy_item;
				}
			} else {
				$legacy_items[] = $item;
			}
		}

		return [
			'version' => $interactions['version'] ?? 1,
			'items' => $legacy_items,
		];
	}

	abstract protected function define_atomic_controls(): array;

	protected function define_atomic_style_states(): array {
		return [];
	}

	public function get_global_scripts() {
		return [];
	}

	final public function get_initial_config() {
		$config = parent::get_initial_config();
		$props_schema = static::get_props_schema();

		$config['atomic_controls'] = $this->get_atomic_controls();
		$config['atomic_props_schema'] = $props_schema;
		$config['atomic_style_states'] = $this->define_atomic_style_states();
		$config['dependencies_per_target_mapping'] = Dependency_Manager::get_source_to_dependents( $props_schema );
		$config['base_styles'] = $this->get_base_styles();
		$config['version'] = $this->version;
		$config['show_in_panel'] = $this->should_show_in_panel();
		$config['categories'] = [ 'v4-elements' ];
		$config['hide_on_search'] = false;
		$config['controls'] = [];
		$config['keywords'] = $this->get_keywords();
		$config['default_children'] = $this->define_default_children();
		$config['initial_attributes'] = $this->define_initial_attributes();
		$config['include_in_widgets_config'] = true;
		$config['default_html_tag'] = $this->define_default_html_tag();

		return $config;
	}

	protected function should_show_in_panel() {
		return true;
	}

	protected function define_default_children() {
		return [];
	}

	protected function define_default_html_tag() {
		return 'div';
	}

	protected function define_initial_attributes() {
		return [];
	}

	protected function add_render_attributes() {
		parent::add_render_attributes();

		$interaction_ids = $this->get_interactions_ids();

		if ( ! empty( $interaction_ids ) ) {
			$this->add_render_attribute( '_wrapper', 'data-interaction-id', $this->get_id() );
			$this->add_render_attribute( '_wrapper', 'data-interactions', json_encode( $interaction_ids ) );
		}
	}

	protected function define_render_context(): array {
		return [];
	}

	/**
	 * Get Element keywords.
	 *
	 * Retrieve the element keywords.
	 *
	 * @since 3.29
	 * @access public
	 *
	 * @return array Element keywords.
	 */
	public function get_keywords() {
		return [];
	}

	/**
	 * @return array<string, Prop_Type>
	 */
	abstract protected static function define_props_schema(): array;

	/**
	 * Get the HTML tag for rendering.
	 *
	 * @return string
	 */
	protected function get_html_tag(): string {
		$settings = $this->get_atomic_settings();
		$default_html_tag = $this->define_default_html_tag();

		return ! empty( $settings['link']['href'] ) ? 'a' : ( $settings['tag'] ?? $default_html_tag );
	}

	/**
	 * Print safe HTML tag for the element based on the element settings.
	 *
	 * @return void
	 */
	protected function print_html_tag() {
		$html_tag = $this->get_html_tag();
		Utils::print_validated_html_tag( $html_tag );
	}

	/**
	 * Print custom attributes if they exist.
	 *
	 * @return void
	 */
	protected function print_custom_attributes() {
		$settings = $this->get_atomic_settings();
		$attributes = $settings['attributes'] ?? '';
		if ( ! empty( $attributes ) && is_string( $attributes ) ) {
			// phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
			echo ' ' . $attributes;
		}
	}

	/**
	 * Get default child type for container elements.
	 *
	 * @param array $element_data
	 * @return mixed
	 */
	protected function _get_default_child_type( array $element_data ) {
		$el_types = array_keys( Plugin::$instance->elements_manager->get_element_types() );

		if ( in_array( $element_data['elType'], $el_types, true ) ) {
			return Plugin::$instance->elements_manager->get_element_types( $element_data['elType'] );
		}

		if ( ! isset( $element_data['widgetType'] ) ) {
			return null;
		}

		return Plugin::$instance->widgets_manager->get_widget_types( $element_data['widgetType'] );
	}

	public function print_content() {
		$element_context = $this->define_render_context();

		$has_context = ! empty( $element_context );

		if ( ! $has_context ) {
			return parent::print_content();
		}

		Render_Context::push( static::class, $element_context );

		parent::print_content();

		Render_Context::pop( static::class );
	}

	/**
	 * Default before render for container elements.
	 *
	 * @return void
	 */
	public function before_render() {
		?>
		<<?php $this->print_html_tag(); ?> <?php $this->print_render_attribute_string( '_wrapper' );
		$this->print_custom_attributes(); ?>>
		<?php
	}

	/**
	 * Default after render for container elements.
	 *
	 * @return void
	 */
	public function after_render() {
		?>
		</<?php $this->print_html_tag(); ?>>
		<?php
	}

	/**
	 * Default content template - can be overridden by elements that need custom templates.
	 *
	 * @return void
	 */
	protected function content_template() {
		?>
		<?php
	}

	public static function generate() {
		return Element_Builder::make( static::get_type() );
	}
}
