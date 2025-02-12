<?php

namespace Elementor\Testing\Modules\AtomicWidgets;

use Elementor\Modules\AtomicWidgets\Elements\Atomic_Widget_Base;

class Mock_Widget {
	/**
	 * @param array{controls: array, props_schema: array, settings: array} $options
	 */
	public static function make( array $options ): Atomic_Widget_Base {
		return new class( $options ) extends Atomic_Widget_Base {
			private static array $options;

			public function __construct( $options ) {
				static::$options = $options;

				parent::__construct( [
					'id' => 1,
					'settings' => $options['settings'] ?? [],
					'styles' => $options['styles'] ?? [],
					'elType' => 'widget',
					'widgetType' => 'test-widget',
				], [] );
			}

			public static function get_element_type(): string {
				return 'test-widget';
			}

			protected function define_atomic_controls(): array {
				return static::$options['controls'] ?? [];
			}

			protected static function define_props_schema(): array {
				return static::$options['props_schema'] ?? [];
			}

			public function define_base_styles(): array {
				return static::$options['base_styles'] ?? [];
			}
		};
	}
}
