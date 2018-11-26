<?php

namespace Elementor\Core\Upgrade;

use Elementor\Core\Base\Background_Task;
use Elementor\Plugin;

/**
 * Background Updater
 * Based on https://github.com/woocommerce/woocommerce/blob/master/includes/class-wc-background-updater.php
 */

defined( 'ABSPATH' ) || exit;

/**
 * WC_Background_Updater Class.
 */
class Updater extends Background_Task {
	const ACTION = 'elementor_updater';

	const PLUGIN_NAME = 'elementor';
	const UPDATING_FLAG = 'ELEMENTOR_UPDATING';
	const VERSION_OPTION_NAME = 'elementor_version';
	const VERSION = ELEMENTOR_VERSION;
	const UPGRADES_CLASS = 'Elementor\Core\Upgrade\Upgrades';

	protected $current_version;

	public static function init() {
		// Create an instance the run the background tasks.
		$instance = new static();

		if ( ! empty( $_GET[ static::ACTION ] ) && $instance->should_upgrade() ) {

			$instance->queue_upgrades();

			wp_redirect( remove_query_arg( static::ACTION ) );
			die;
		}
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
	 **/

	protected function queue_upgrades() {
		$version_prefix = 'v' . str_replace( '.', '_', $this->current_version );
		$upgrades_reflection = new \ReflectionClass( static::UPGRADES_CLASS );

		$update_queued = false;

		foreach ( $upgrades_reflection->getMethods() as $method ) {
			$method_name = $method->getName();
			if ( $method_name >= $version_prefix ) {
				$this->push_to_queue( [
					'callback' => [ static::UPGRADES_CLASS, $method_name ],
				] );
				$update_queued = true;
			}
		}

		if ( $update_queued ) {
			$this->save()->dispatch();
		}
	}

	/**
	 * Complete
	 *
	 * Override if applicable, but ensure that the below actions are
	 * performed, or, call parent::complete().
	 */
	protected function complete() {
		Plugin::$instance->files_manager->clear_cache();
		update_option( static::VERSION_OPTION_NAME, static::VERSION );
		parent::complete();
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
}
