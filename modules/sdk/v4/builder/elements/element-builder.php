<?php

namespace Elementor\Modules\Sdk\V4\Builder\Elements;

use Elementor\Core\Utils\Registry;
use Elementor\Modules\Sdk\V4\Builder\I_Element_Builder;
use Elementor\Plugin;

class Element_Builder implements I_Element_Builder {

	private array $schema = [];
	private User_Defined_Atomic_Element|null $widget_instance;
	private Element_Schema_Validator $validator;

	public function __construct( $name = '' ) {
		$this->validator = new Element_Schema_Validator( $this->schema );
		if ( ! empty( $name ) ) {
			$this->set_name( $name );
		}
		$this->widget_instance = null;
	}

	public function configure( array $partial ): void {
		$this->schema = array_merge( $this->schema, $partial );
	}

	public function set_template( string $template ): void {
		$this->set( 'template', $template );
	}

	public function set_name( string $name ): void {
		$this->validator->set_element_name( $name );
	}

	protected function pre_build() {
		$schema = $this->validator->get_schema();
		$has_script = isset( $schema['script'] );
		$has_css = isset( $schema['css'] );
		$has_template = isset( $schema['template'] );
		$check_required = $has_script || $has_css || $has_template;
		if ( $check_required && ! isset( $schema['_path'] ) ) {
			$trace = debug_backtrace();
			$caller_file = $trace[1]['file'];
			$this->set_assets_dir( dirname( $caller_file ) );
		}
	}

	public function build(): void {
		$this->pre_build();
		$this->validator->validate();
		$widget_schema = $this->validator->get_schema();
		$assets_dir = $widget_schema['_path'];
		$ns = __NAMESPACE__;
		$class_name = 'USER_DEFINED_WIDGET_' . $widget_schema['widget_alias'];
		$code = "class {$class_name} extends {$ns}\User_Defined_Atomic_Element {}";
		eval( $code );
		Registry::instance( 'atomic-custom-schemas' )->set( $class_name, $widget_schema );
		$this->widget_instance = new $class_name( [], null );
		$this->widget_instance->prepare_controls();
		$this->widget_instance->prepare_styles();
		$this->widget_instance->prepare_scripts( $assets_dir );
		Plugin::$instance->widgets_manager->register( $this->widget_instance );
	}

	public function set_render_function( callable $render_function ): void {
		Registry::instance( 'atomic-custom-render-functions' )->set( $this->widget_instance->get_class_name(), $render_function );
	}

	public function set_assets_dir( string $dir ): void {
		$this->validator->set_assets_dir( $dir );
	}

	public function set( string $key, mixed $value ): void {
		$this->configure([
			$key => $value,
		]);
	}

	public function get( string $key ): mixed {
		return $this->schema[ $key ] ?? null;
	}
}
