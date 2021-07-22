<?php
namespace Elementor\Core\Upgrade;

use Elementor\Core\Base\DB_Upgrades_Manager;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}

class Manager extends DB_Upgrades_Manager {

	const INSTALLS_HISTORY_META = 'elementor_install_history';

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
		return esc_html__( 'Elementor', 'elementor' );
	}

	public function get_updater_label() {
		return esc_html__( 'Elementor Data Updater', 'elementor' );
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

	public static function get_installs_history() {
		return get_option( self::INSTALLS_HISTORY_META, [] );
	}

	public static function install_compare( $version, $operator ) {
		$installs_history = self::get_installs_history();

		return version_compare( key( $installs_history ), $version, $operator );
	}

	protected function update_db_version() {
		parent::update_db_version();

		$installs_history = self::get_installs_history();

		$time = time();

		$installs_history[ ELEMENTOR_VERSION ] = $time;

		$old_version = $this->get_current_version();

		// If there was an old version of Elementor, and there's no record for that install yet
		if ( $old_version && empty( $installs_history[ $old_version ] ) ) {
			$installs_history[ $old_version ] = $installs_history[ ELEMENTOR_VERSION ] - 1;
		}

		uksort( $installs_history, 'version_compare' );

		update_option( self::INSTALLS_HISTORY_META, $installs_history );
	}
}
