<?php

namespace Elementor\Modules\AtomicWidgets\DynamicTags;

use Elementor\Plugin;

class Dynamic_Tags_Module {

	private static ?self $instance = null;

	public Dynamic_Tags_Registry $registry;

	private function __construct() {
		$this->registry = new Dynamic_Tags_Registry();
	}

	public static function instance( $fresh = false ): self {
		if ( null === static::$instance || $fresh ) {
			static::$instance = new static();
		}

		return static::$instance;
	}

	public static function fresh(): self {
		return static::instance( true );
	}

	public function register_hooks() {
		add_action( 'elementor/init', function () {
			$v1_tags = Plugin::$instance->dynamic_tags->get_tags_config();

			$this->registry->populate_from_v1_tags( $v1_tags );
		} );

		add_filter(
			'elementor/editor/localize_settings',
			fn( array $settings ) => $this->add_atomic_dynamic_tags_settings( $settings )
		);

		add_filter(
			'elementor/atomic-widgets/prop-types',
			fn( array $prop_types ) => Dynamic_Prop_Types_Mapping::add_to_prop_types_definition( $prop_types )
		);
	}

	private function add_atomic_dynamic_tags_settings( $settings ) {
		if ( isset( $settings['dynamicTags']['tags'] ) ) {
			$settings['atomicDynamicTags'] = [
				'tags' => $this->registry->get_tags(),
			];
		}

		return $settings;
	}
}
