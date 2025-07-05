<?php

namespace Elementor\Modules\Sdk\V4\Builder\Elements;

use Elementor\Core\Utils\Registry;
use Elementor\Modules\AtomicWidgets\Controls\Section;
use Elementor\Modules\AtomicWidgets\Elements\Atomic_Widget_Base;
use Elementor\Modules\AtomicWidgets\Elements\Has_Template;
use Elementor\Modules\AtomicWidgets\PropTypes\Classes_Prop_Type;
use Elementor\Modules\AtomicWidgets\Styles\Style_Definition;
use Elementor\Modules\AtomicWidgets\Styles\Style_Variant;

use Elementor\Plugin;

class User_Defined_Atomic_Element extends Atomic_Widget_Base {

	protected $controls_by_category = [];

	use Has_Template {
		render as protected _render;
	}

	public static function get_render_functions_registry() {
		return Registry::instance( 'atomic-custom-render-functions' );
	}

	/**
	 * @return array
	 */
	public function get_initial_config(): array {
		$config = parent::get_initial_config();
		$config['external_icon'] = '1';
		return $config;
	}

	public static function get_schema_registry() {
		return Registry::instance( 'atomic-custom-schemas' );
	}

	public static function get_schema(): array {
		$reg = self::get_schema_registry();
		return $reg->get( static::class );
	}

	public static function get_render_function(): callable|null {
		$reg = self::get_render_functions_registry();
		return $reg->get( static::class );
	}

	public static function get_element_type(): string {
		$reg = self::get_schema_registry();
		return $reg->get( static::class )['widget_alias'];
	}

	public function get_icon() {
		return $this->get_own_schema()['icon'] ?? 'eicon-heart';
	}

	protected function get_own_schema() {
		return self::get_schema();
	}

	public function get_title() {
		return $this->get_schema()['name'];
	}

	protected static function define_props_schema(): array {
		$controls_builder = new Controls_Builder( self::get_schema() );
		$props_schema = $controls_builder->build_props_schema();
		$classes_props = Classes_Prop_Type::make()->default( [] );
		return array_merge( $props_schema, [ 'classes' => $classes_props ] );
	}

	protected function define_atomic_controls(): array {
		$all_sections = $this->controls_by_category;
		$sections = [];
		foreach ( $all_sections as $category => $controls ) {
			if ( $category === 'Settings' ) {
				continue;
			}
			$section = Section::make()->set_label( $category );
			$section->set_items( $controls );
			$sections[] = $section;
		}
		return $sections;
	}

	protected function define_base_styles(): array {
		$style_def = Style_Definition::make();
		$style_variant = Style_Variant::make();
		$style_def->add_variant( $style_variant );
		return [
			'base' => $style_def,
		];
	}

	protected function get_templates(): array {
		$template_ref = $this->get_schema()['template'] ?? null;
		$assets_path = $this->get_schema()['_path'] ?? null;
		if ( $template_ref ) {
			$class_name = 'elementor/user-elements/' . get_class( $this );
			return [ $class_name => $assets_path . '/' . $template_ref ];
		}
		return [];
	}

	protected function render() {
		$css = $this->get_own_schema()['css'] ?? null;
		if ( $css ) {
			$css_path = $this->get_own_schema()['_path'] . '/' . $css;
			$this->add_render_attribute( 'wrapper', 'class', $css_path );
		}
		$this->_render();
	}

	public function prepare_controls() {
		$schema = $this->get_own_schema();
		$controls_builder = new Controls_Builder( $schema );
		$properties = $schema['properties'] ?? [];
		foreach ( $properties as $property ) {
			$control = $controls_builder->build_control( $property );
			$category = $property['section'] ?? 'Settings';
			if ( ! isset( $this->controls_by_category[ $category ] ) ) {
				$this->controls_by_category[ $category ] = [];
			}
			$this->controls_by_category[ $category ][] = $control;
		}
	}

	protected function get_settings_controls(): array {
		$settings_controls = $this->controls_by_category['Settings'] ?? [];
		return $settings_controls;
	}

	public function prepare_styles() {
		$css = $this->get_own_schema()['css'] ?? null;
		if ( $css ) {
			$assets_path = $this->get_own_schema()['_path'];
			$css_path = $assets_path . '/' . $css;
			$css_handle = 'elementor-atomic-custom-css-' . $this->get_title();
			$wp_content_dir = WP_CONTENT_DIR;
			$site_url = get_site_url();
			$relative_path = str_replace( $wp_content_dir, '', $css_path );
			$css_path = $site_url . '/wp-content' . $relative_path;
			wp_register_style(
				$css_handle,
				$css_path,
				[],
				ELEMENTOR_VERSION,
			);
			wp_enqueue_style( $css_handle );
		}
	}

	protected function do_inject_raw_css( $post ) {
		$css = $this->get_own_schema()['css'] ?? null;
		if ( $css ) {
			$css_path = $this->get_own_schema()['_path'] . '/' . $css;
			$css_handle = 'elementor-atomic-custom-css-' . $this->get_title();
			wp_register_style(
				$css_handle,
				$css_path,
				[],
				ELEMENTOR_VERSION,
			);
		}
	}

	public function prepare_scripts( $assets_path ) {
		$is_edit_mode = Plugin::$instance->editor->is_edit_mode();
		if ( $is_edit_mode ) {
			return;
		}
		$schema = $this->get_own_schema();
		$script = $schema['script'] ?? null;
		$alias = $schema['widget_alias'];
		if ( $script ) {
			$script_path = $assets_path . '/' . $script;
			$wp_content_dir = WP_CONTENT_DIR;
			$site_url = get_site_url();
			$relative_path = str_replace( $wp_content_dir, '', $script_path );
			$script_path = $site_url . '/wp-content' . $relative_path;
			$script_handle = 'elementor-atomic-custom-script-' . $alias . '-' . $script;
			wp_register_script(
				$script_handle,
				$script_path,
				[ 'elementor-v2-frontend-handlers' ],
				ELEMENTOR_VERSION,
			);
			wp_enqueue_script( $script_handle );
		}
	}
}
