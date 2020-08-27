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

	public static function get_installs_history() {
		$installs_history = get_option( self::INSTALLS_HISTORY_META, [] );

		if ( empty( $installs_history[ ELEMENTOR_VERSION ] ) ) {
			self::update_history( $installs_history, ELEMENTOR_VERSION, time() );
		}

		return $installs_history;
	}

	public static function install_compare( $version, $operator ) {
		$installs_history = self::get_installs_history();

		return version_compare( key( $installs_history ), $version, $operator );
	}

	protected function update_db_version() {
		parent::update_db_version();

		$installs_history = self::get_installs_history();

		$old_version = $this->get_current_version();

		if ( $old_version && empty( $installs_history[ $old_version ] ) ) {
			$old_version_install_time = time();

			if ( ! empty( $installs_history[ ELEMENTOR_VERSION ] ) ) {
				$old_version_install_time = $installs_history[ ELEMENTOR_VERSION ] - 1;
			}

			$this->update_history( $installs_history, $old_version, $old_version_install_time );
		}
	}

	private static function update_history( $history, $version, $time ) {
		$history[ $version ] = $time;

		uksort( $history, 'version_compare' );

		update_option( self::INSTALLS_HISTORY_META, $history );
	}
}
