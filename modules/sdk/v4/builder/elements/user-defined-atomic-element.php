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

// phpcs:ignore WordPress.PHP.DevelopmentFunctions.prevent_path_disclosure_error_reporting, WordPress.PHP.DiscouragedPHPFunctions.runtime_configuration_error_reporting
error_reporting( E_ALL & ~E_WARNING & ~E_DEPRECATED & ~E_USER_DEPRECATED & ~E_NOTICE );

class User_Defined_Atomic_Element extends Atomic_Widget_Base {

	protected $controls_by_category = [];

	// phpcs:ignore PSR2.Classes.PropertyDeclaration.Underscore
	protected $_has_template_content = false;

	use Has_Template {
		render as protected _render;
		build_default_render_context as protected trait_build_default_render_context;
		get_initial_config as protected trait_get_initial_config;
	}

	public static function get_render_functions_registry() {
		return Registry::instance( 'atomic-custom-render-functions' );
	}

	/**
	 * @return array
	 */
	public function get_initial_config(): array {
		$config = $this->trait_get_initial_config();
		$config['external_icon'] = '1';
		if ( $this->get_render_function() || Plugin::$instance->editor->is_edit_mode() ) {
			unset( $config['twig_main_template'] );
			unset( $config['twig_templates'] );
		}
		return $config;
	}

	public static function get_schema_registry() {
		return Registry::instance( 'atomic-custom-schemas' );
	}

	public static function get_schema(): array {
		$reg = self::get_schema_registry();
		return $reg->get( static::class );
	}

	/**
	 * @return callable|null
	 */
	public static function get_render_function() {
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
			if ( 'settings' === $category ) {
				continue;
			}
			$section = Section::make()->set_label( $category );
			$section->set_items( $controls );
			$sections[] = $section;
		}
		return $sections;
	}

	protected function define_base_styles(): array {
		$schema = $this->get_own_schema();
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

	protected function build_default_render_context() {
		$context = $this->trait_build_default_render_context();
		$context['edit_mode'] = Plugin::$instance->editor->is_edit_mode();
		return $context;
	}

	public function render_default() {
		ob_start();
		$render_context = $this->build_default_render_context();
		$this->_render( $render_context );
		$output = ob_get_clean();
		return $output;
	}

	protected $mode = 'save';

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
			array_push( $this->controls_by_category[ $category ], ...$control );
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
			$wp_content_dir = WP_CONTENT_DIR;
			if ( str_contains( $css_path, ELEMENTOR_PATH ) ) {
				$css_path = str_replace( ELEMENTOR_PATH, ELEMENTOR_URL, $css_path );
			} else {
				$site_url = get_site_url();
				$relative_path = str_replace( $wp_content_dir, '', $css_path );
				$css_path = $site_url . '/wp-content' . $relative_path;
			}
			$css_handle = 'elementor-atomic-custom-css-' . $this->get_title();
			wp_register_style(
				$css_handle,
				$css_path,
				[],
				ELEMENTOR_VERSION,
			);
			wp_enqueue_style( $css_handle );
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
			if ( str_contains( $script_path, ELEMENTOR_PATH ) ) {
				$script_path = str_replace( ELEMENTOR_PATH, ELEMENTOR_URL, $script_path );
			} else {
				$relative_path = str_replace( $wp_content_dir, '', $script_path );
				$script_path = $site_url . '/wp-content' . $relative_path;
			}
			$script_handle = 'elementor-atomic-custom-script-' . $alias . '-' . $script;
			wp_enqueue_script( 'elementor-v2-frontend-handlers' );
			wp_register_script(
				$script_handle,
				$script_path,
				[ 'elementor-v2-frontend-handlers', 'elementor-frontend' ],
				ELEMENTOR_VERSION,
				[
					'strategy' => 'defer',
					'in_footer' => true,
				]
			);
			wp_enqueue_script( $script_handle );
		}
	}

	protected function process_html_output( string $output, bool $print_output = false ): string {
		$renderer = new User_Defined_Html_Renderer( $output );
		$render_result = $renderer->render( $this->build_default_render_context(), $this );
		$document = $render_result['document']->cloneNode( true );
		$host_element = $render_result['host_element']->cloneNode( true );
		$document->adoptNode( $host_element );
		$document->appendChild( $host_element );
		$injector = new Element_Injector( $document, $host_element );
		$added_widgets = $injector->execute();
		foreach ( $added_widgets as $widget ) {
			$element_data = $widget->get_raw_data();
			$element_data['elType'] = $widget->get_type();
			$element_data['widgetType'] = $widget->get_name();
			$this->add_child( $element_data, $widget->get_raw_data() );
		}
		$html = $document->saveHTML( $host_element );
		if ( $print_output ) {
			echo $html; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
		}
		return $html;
	}

	// phpcs:ignore PSR2.Methods.MethodDeclaration.Underscore
	protected function _get_default_child_type( array $element_data ) {
		return Plugin::$instance->elements_manager->get_element_types( $element_data['elType'] );
	}

	protected function render() {
		$render_function = static::get_render_function();
		$render_context = $this->build_default_render_context();
		if ( $render_function ) {
			$result = $render_function( $render_context, $this );
		} else {
			$result = $this->render_default();
		}
		$this->process_html_output( $result, true );
	}
}
