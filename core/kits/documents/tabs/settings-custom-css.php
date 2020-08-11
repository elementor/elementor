<?php
namespace Elementor\Core\Kits\Documents\Tabs;

use Elementor\Plugin;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}

class Settings_Custom_CSS extends Tab_Base {

	public function get_id() {
		return 'settings-custom-css';
	}

	public function get_title() {
		return __( 'Custom CSS', 'elementor' );
	}

	protected function register_tab_controls() {
		Plugin::$instance->controls_manager->add_custom_css_controls( $this->parent, $this->get_id() );
	}
}
