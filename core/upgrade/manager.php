<?php

namespace Elementor\Core\Upgrade;

use Elementor\Core\Base\Module as BaseModule;
use Elementor\Plugin;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}

class Manager extends BaseModule {
	const ACTION = 'elementor_updater';
	const PLUGIN_NAME = 'elementor';
	const UPDATING_FLAG = 'ELEMENTOR_UPDATING';
	const VERSION_OPTION_NAME = 'elementor_version';
	const VERSION = ELEMENTOR_VERSION;
	const UPDATER_CLASS = 'Elementor\Core\Upgrade\Updater';
	const UPGRADES_CLASS = 'Elementor\Core\Upgrade\Upgrades';

	const QUERY_LIMIT = 100;

	protected $current_version;
	protected $updater;

	public function get_name() {
		return 'upgrade';
	}

	public function get_plugin_label() {
		return __( 'Elementor', 'elementor' );
	}

	public function get_query_limit() {
		return self::QUERY_LIMIT;
	}

	public function on_upgrade_handle() {
		if ( ! did_action( 'elementor/documents/register' ) ) {
			Plugin::$instance->documents->register_default_types();
		}
	}

	public function on_upgrade_complete() {
		$logger = Plugin::$instance->logger->get_logger();

		$logger->info( 'Update DB completed', [
			'meta' => [
				'plugin' => $this->get_plugin_label(),
				'from' => $this->current_version,
				'to' => static::VERSION,
			],
		] );

		Plugin::$instance->files_manager->clear_cache();

		update_option( static::VERSION_OPTION_NAME, static::VERSION );

		$this->add_flag( 'completed' );
	}

	public function admin_notice_start_upgrade() {
		$upgrade_link = wp_nonce_url( add_query_arg( static::ACTION, 'run' ), static::ACTION . 'run' );
		$message = '<p>' . sprintf( __( '%s needs upgrade the Database.', 'elementor' ), $this->get_plugin_label() ) . '</p>';
		$message .= '<p>' . sprintf( '<a href="%s" class="button-primary">%s</a>', $upgrade_link, __( 'Update Now', 'elementor' ) ) . '</p>';

		echo '<div class="notice notice-error">' . $message . '</div>';
	}

	public function admin_notice_upgrade_is_running() {
		$upgrade_link = wp_nonce_url( add_query_arg( static::ACTION, 'continue' ), static::ACTION . 'continue' );
		$message = '<p>' . sprintf( __( '%s is updating the database in background..', 'elementor' ), $this->get_plugin_label() ) . '</p>';
		$message .= '<p>' . sprintf( '<a href="%s" class="button-primary">%s</a>', $upgrade_link, __( 'Run immediately', 'elementor' ) ) . '</p>';

		echo '<div class="notice notice-warning">' . $message . '</div>';
	}

	public function admin_notice_upgrade_is_completed() {
		$this->delete_flag( 'completed' );

		$message = '<p>' . sprintf( __( '%s has been update the database. Enjoy!', 'elementor' ), $this->get_plugin_label() ) . '</p>';

		echo '<div class="notice notice-success">' . $message . '</div>';
	}

	// TODO: Replace with a db settings system.
	protected function add_flag( $flag ) {
		add_option( static::PLUGIN_NAME . '_' . static::ACTION . '_' . $flag, 1 );
	}

	protected function get_flag( $flag ) {
		return get_option( static::PLUGIN_NAME . '_' . static::ACTION . '_' . $flag );
	}

	protected function delete_flag( $flag ) {
		delete_option( static::PLUGIN_NAME . '_' . static::ACTION . '_' . $flag );
	}

	/**
	 * Check upgrades.
	 *
	 * Checks whether a given Elementor version needs to be upgraded.
	 *
	 * If an upgrade required for a specific Elementor version, it will update
	 * the `elementor_upgrades` option in the database.
	 *
	 * @static
	 * @access protected
	 *
	 * @throws \ReflectionException
	 */

	protected function queue_upgrades() {
		$updater = $this->get_updater();
		$prefix = '_v_';
		$version_prefixed = $prefix . str_replace( '.', '_', $this->current_version );
		$upgrades_reflection = new \ReflectionClass( static::UPGRADES_CLASS );

		$update_queued = false;

		foreach ( $upgrades_reflection->getMethods() as $method ) {
			$method_name = $method->getName();
			if ( 0 === strpos( $method_name, $prefix ) && $method_name >= $version_prefixed ) {
				$updater->push_to_queue( [
					'callback' => [ static::UPGRADES_CLASS, $method_name ],
				] );
				$update_queued = true;
			}
		}

		if ( $update_queued ) {
			$updater->save()->dispatch();

			Plugin::$instance->logger->get_logger()->info( 'Update DB has been queued', [
				'meta' => [
					'plugin' => $this->get_plugin_label(),
					'from' => $this->current_version,
					'to' => static::VERSION,
				],
			] );
		}
	}

	protected function should_upgrade() {
		$this->current_version = get_option( static::VERSION_OPTION_NAME );

		// It's a new install.
		if ( ! $this->current_version ) {
			return false;
		}

		if ( static::VERSION === $this->current_version ) {
			return false;
		}

		return true;
	}

	/**
	 * @return Updater
	 */
	protected function get_updater() {
		if ( empty( $this->updater ) ) {
			$class_name = static::UPDATER_CLASS;
			$this->updater = new $class_name( $this );
		}

		return $this->updater;
	}

	public function __construct() {
		if ( ! is_admin() || ! current_user_can( 'update_plugins' ) ) {
			return;
		}

		if ( $this->get_flag( 'completed' ) ) {
			add_action( 'admin_notices', [ $this, 'admin_notice_upgrade_is_completed' ] );
		}

		if ( ! $this->should_upgrade() ) {
			return;
		}

		$updater = $this->get_updater();

		if ( $updater->is_updating() ) {
			add_action( 'admin_notices', [ $this, 'admin_notice_upgrade_is_running' ] );
		} else {
			add_action( 'admin_notices', [ $this, 'admin_notice_start_upgrade' ] );
		}

		if ( ! empty( $_GET[ static::ACTION ] ) ) {
			if ( 'run' === $_GET[ static::ACTION ] && check_admin_referer( static::ACTION . 'run' ) ) {
				$this->queue_upgrades();
			}

			if ( 'continue' === $_GET[ static::ACTION ] && check_admin_referer( static::ACTION . 'continue' ) ) {
				$updater->continue_upgrades();
			}

			wp_safe_redirect( remove_query_arg( [ static::ACTION, '_wpnonce' ] ) );
			die;
		}
	}
}
