<?php
namespace Elementor\Core\Upgrade;

use Elementor\Core\Base\DB_Upgrades_Manager;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}

class Manager extends DB_Upgrades_Manager {

	// todo: remove in future releases
	public function should_upgrade() {
		if ( ( 'elementor' === $this->get_plugin_name() ) && version_compare( get_option( $this->get_version_option_name() ), '2.4.2', '<' ) ) {
			delete_option( 'elementor_log' );
		}

		return parent::should_upgrade();
	}

	public function get_name() {
		return 'upgrade';
	}

	public function get_action() {
		return 'elementor_updater';
	}

	public function get_plugin_name() {
		return 'elementor';
	}

	public function get_plugin_label() {
		return __( 'Elementor', 'elementor' );
	}

	public function get_updater_label() {
		return sprintf( '<strong>%s </strong> &#8211;', __( 'Elementor Data Updater', 'elementor' ) );
	}

	public function get_new_version() {
		return ELEMENTOR_VERSION;
	}

	public function get_version_option_name() {
		return 'elementor_version';
	}

	public function get_upgrades_class() {
		return 'Elementor\Core\Upgrade\Upgrades';
	}
}
