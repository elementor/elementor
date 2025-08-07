<?php

namespace Elementor\Modules\AtomicWidgets;

use Elementor\Modules\AtomicWidgets\Elements\Atomic_Element_Base;

class Atomic_Elements_Registry {
	private $elements = [];

	public function register_hooks(){
		do_action( 'elementor/atomic-widgets/elements/register', $this );
		add_filter( 'elementor/editor/localize_settings', fn ( $settings ) => $this->add_elements_config( $settings ) );
		add_action( 'elementor/elements/elements_registered', fn ( $elements_manager ) => $this->register_elements( $elements_manager ) );
	}

	private function add_elements_config( $settings ) {
		if ( ! isset( $settings['atomic'] ) ) {
			$settings['atomic'] = [];
		}

		$settings['atomic']['elements'] = array_keys( $this->elements );
		return $settings;
	}

	public function register_element( Atomic_Element_Base $element_instance ) {
		$this->elements[ $element_instance->get_name() ] = $element_instance;
	}

	private function register_elements( $elements_manager ) {
		foreach ( $this->elements as $element_instance ) {
			$elements_manager->register_element_type( $element_instance );
		}
	}
}
