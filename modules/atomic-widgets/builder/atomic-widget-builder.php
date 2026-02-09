<?php

	namespace Elementor\Modules\AtomicWidgets\Builder;

use Elementor\Core\Utils\Registry;
use Elementor\Modules\AtomicWidgets\Builder\Utils\WidgetDescriptorUtils;

class Atomic_Widget_Builder {

	/**
	 * @var mixed
	 */
	protected $widget_descriptor;

	protected $widget_class_name;

	protected $widget_schema = [];

	/**
	 * @type Registry<Atomic_Widget_Builder>
	 */
	protected static $registry = Registry::instance( 'elementor/widget-builder' );

	protected static $schema_registry = Registry::instance( 'elementor/widget-schema' );

	public static function generate_widget_class_name( $clazz ): string {
		return str_replace( '\\', '_', $clazz::class );
	}

	public function __construct( mixed $widget_descriptor ) {
		$this->widget_descriptor = $widget_descriptor;
		if ( ! WidgetDescriptorUtils::validate_widget_descriptor( $this->widget_descriptor ) ) {
			throw new \Exception( 'Invalid widget descriptor' );
		}
		add_action( 'elementor/widgets/register', fn ( $ctx ) => $this->build_and_register_widget( $ctx ) );
	}

	public function set_title( string $title ): self {
		$this->widget_schema['title'] = $title;
		return $this;
	}

	public function set_name( string $name ): self {
		$this->widget_schema['name'] = $name;
		return $this;
	}

	public function atomic(): self {
		$this->widget_schema['atomic'] = true;
		return $this;
	}

	public function get_widget_schema(): array {
		return $this->widget_schema;
	}

	protected function build_and_register_widget( $ctx ) {
		$this
			->set_name( $this->widget_descriptor['name'] ?? 'Unknown widget' )
			->set_title( $this->widget_descriptor['title'] ?? 'Unknown widget' );
		$this->widget_class_name = 'V4Element_' . static::generate_widget_class_name( $this->widget_descriptor );
		$schema = &$this->get_widget_schema();
		self::$registry->set( $this->widget_class_name, $this );
		self::$schema_registry->set( $this->widget_class_name, $schema );
	}

	public function build_controls() {
		$props = Registry::get_value( 'elementor/widget-prop-schema', $this->widget_class_name, null );
		if ( null === $props ) {
			$this->build_props_schema();
		}

		$control_builders = [];
		$facade = new class($control_builders) {
			public $builders;
			public function __construct( &$builders ) {
				$this->builders = &$builders;
			}
		};
	}

	protected function build_props_schema() {}
}
