<?php

namespace Elementor\Core\Base;

use Elementor\Plugin;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}

abstract class DB_Upgrades_Manager extends Background_Task_Manager {
	protected $current_version;

	abstract public function get_new_version();
	abstract public function get_version_option_name();
	abstract public function get_upgrades_class();

	public function get_task_runner_class() {
		return 'Elementor\Core\Upgrade\Updater';
	}

	public function get_query_limit() {
		return 100;
	}

	public function on_runner_complete() {
		$logger = Plugin::$instance->logger->get_logger();

		$logger->info( 'Update DB completed', [
			'meta' => [
				'plugin' => $this->get_plugin_label(),
				'from' => $this->current_version,
				'to' => $this->get_new_version(),
			],
		] );

		Plugin::$instance->files_manager->clear_cache();

		$this->update_db_version();

		$this->add_flag( 'completed' );
	}

	public function admin_notice_start_upgrade() {
		$upgrade_link = $this->get_start_action_url();
		$message = '<p>' . sprintf( __( '%s needs upgrade the Database.', 'elementor' ), $this->get_plugin_label() ) . '</p>';
		$message .= '<p>' . sprintf( '<a href="%s" class="button-primary">%s</a>', $upgrade_link, __( 'Update Now', 'elementor' ) ) . '</p>';

		echo '<div class="notice notice-error">' . $message . '</div>';
	}

	public function admin_notice_upgrade_is_running() {
		$upgrade_link = $this->get_continue_action_url();
		$message = '<p>' . sprintf( __( '%s is updating the database in background..', 'elementor' ), $this->get_plugin_label() ) . '</p>';
		$message .= '<p>' . sprintf( '<a href="%s" class="button-primary">%s</a>', $upgrade_link, __( 'Run immediately', 'elementor' ) ) . '</p>';

		echo '<div class="notice notice-warning">' . $message . '</div>';
	}

	public function admin_notice_upgrade_is_completed() {
		$this->delete_flag( 'completed' );

		$message = '<p>' . sprintf( __( '%s has been update the database. Enjoy!', 'elementor' ), $this->get_plugin_label() ) . '</p>';

		echo '<div class="notice notice-success">' . $message . '</div>';
	}

	/**
	 * @access protected
	 *
	 * @throws \ReflectionException
	 */
	protected function start_run() {
		$updater = $this->get_task_runner();

		if ( $updater->is_running() ) {
			return;
		}

		$prefix = '_v_';
		$upgrades_class = $this->get_upgrades_class();
		$upgrades_reflection = new \ReflectionClass( $upgrades_class );

		$update_queued = false;

		foreach ( $upgrades_reflection->getMethods() as $method ) {
			$method_name = $method->getName();
			if ( false === strpos( $method_name, $prefix ) ) {
				continue;
			}

			if ( ! preg_match_all( "/$prefix(\d+_\d+_\d+)/", $method_name, $matches ) ) {
				continue;
			}

			$method_version = str_replace( '_', '.', $matches[1][0] );

			if ( ! version_compare( $method_version, $this->current_version, '>' ) ) {
				continue;
			}

			$updater->push_to_queue( [
				'callback' => [ $upgrades_class, $method_name ],
			] );

			$update_queued = true;
		}

		if ( $update_queued ) {
			$updater->save()->dispatch();

			Plugin::$instance->logger->get_logger()->info( 'Update DB has been queued', [
				'meta' => [
					'plugin' => $this->get_plugin_label(),
					'from' => $this->current_version,
					'to' => $this->get_new_version(),
				],
			] );
		} else {
			$this->on_runner_complete();
		}
	}

	protected function update_db_version() {
		update_option( $this->get_version_option_name(), $this->get_new_version() );
	}

	public function __construct() {
		if ( ! is_admin() || ! current_user_can( 'update_plugins' ) ) {
			return;
		}

		if ( $this->get_flag( 'completed' ) ) {
			add_action( 'admin_notices', [ $this, 'admin_notice_upgrade_is_completed' ] );
		}

		$this->current_version = get_option( $this->get_version_option_name() );

		// It's a new install.
		if ( ! $this->current_version ) {
			$this->update_db_version();
		}

		// Already upgraded.
		if ( $this->get_new_version() === $this->current_version ) {
			return;
		}

		$updater = $this->get_task_runner();

		if ( $updater->is_running() ) {
			add_action( 'admin_notices', [ $this, 'admin_notice_upgrade_is_running' ] );
		} else {
			add_action( 'admin_notices', [ $this, 'admin_notice_start_upgrade' ] );
		}

		parent::__construct();
	}
}
