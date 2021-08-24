<?php
namespace Elementor\Core\Admin\Notices;

use Elementor\User;
use Elementor\Plugin;
use Elementor\Core\Experiments\Manager as Experiments_Manager;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Elementor_Dev_Notice extends Base_Notice {
	/**
	 * Notice ID.
	 */
	const ID = 'elementor_dev_promote';

	/**
	 * Plugin slug to install.
	 */
	const PLUGIN_SLUG = 'elementor-beta';

	/**
	 * Plugin name.
	 */
	const PLUGIN_NAME = 'elementor-beta/elementor-beta.php';

	/**
	 * Holds the plugins names.
	 *
	 * @var array
	 */
	private $plugins = [];

	/**
	 * If one of those plugin is installed it will show the notice.
	 *
	 * @var string[]
	 */
	private $promotion_plugins = [
		'woocommerce-beta-tester/woocommerce-beta-tester.php',
		'wp-jquery-update-test/wp-jquery-update-test.php',
		'wordpress-beta-tester/wp-beta-tester.php',
		'gutenberg/gutenberg.php',
	];

	/**
	 * If one of those options is enabled it will show the notice.
	 *
	 * @var string[]
	 */
	private $promotion_options = [
		'elementor_beta',
	];

	/**
	 * @inheritDoc
	 */
	public function should_print() {
		return current_user_can( 'install_plugins' ) &&
			! User::is_user_notice_viewed( static::ID ) &&
			! $this->is_elementor_dev_installed() &&
			! $this->is_install_screen() &&
			(
				$this->has_at_least_one_active_experiment() ||
				$this->is_promotion_plugins_installed() ||
				$this->is_promotion_options_enabled()
			);
	}

	/**
	 * @inheritDoc
	 */
	public function get_config() {
		return [
			'id' => static::ID,
			'title' => esc_html__( 'Elementor Developer Edition', 'elementor' ),
			'description' => __(
				'Get a sneak peek at our in progress development versions, and help us improve Elementor to perfection. Developer Edition releases contain experimental functionality for testing purposes.',
				'elementor'
			),
			'button' => [
				'text' => esc_html__( 'Install & Activate', 'elementor' ),
				'url' => wp_nonce_url(
					self_admin_url( 'update.php?action=install-plugin&plugin=' . static::PLUGIN_SLUG ),
					'install-plugin_' . static::PLUGIN_SLUG
				),
				'type' => 'cta',
			],
		];
	}

	/**
	 * Return all the plugins names.
	 *
	 * This method is protected so it can be mocked in tests.
	 *
	 * @return array
	 */
	protected function get_plugins() {
		if ( ! $this->plugins ) {
			$this->plugins = array_keys( get_plugins() );
		}

		return $this->plugins;
	}

	/**
	 * Checks if elementor dev is installed
	 *
	 * @return bool
	 */
	private function is_elementor_dev_installed() {
		return in_array( static::PLUGIN_NAME, $this->get_plugins(), true );
	}

	/**
	 * Checks if the admin screen is install screen.
	 *
	 * @return bool
	 */
	private function is_install_screen() {
		$screen = get_current_screen();

		if ( ! $screen ) {
			return false;
		}

		return 'update' === $screen->id;
	}

	/**
	 * Checks if is one of the promotion plugins is installed
	 *
	 * @return bool
	 */
	private function is_promotion_plugins_installed() {
		return array_reduce( $this->promotion_plugins, function ( $should_show_notice, $plugin_name ) {
			if ( $should_show_notice ) {
				return true;
			}

			return in_array( $plugin_name, $this->get_plugins(), true );
		}, false );
	}

	/**
	 * Checks if is one of the promotion options is enable.
	 *
	 * @return bool
	 */
	private function is_promotion_options_enabled() {
		return array_reduce( $this->promotion_options, function ( $should_show_notice, $option ) {
			if ( $should_show_notice ) {
				return true;
			}

			return 'yes' === get_option( $option, 'no' );
		}, false );
	}

	/**
	 * Checks if as at least one active experiment (The state must be "active" and not default-active).
	 *
	 * @return bool
	 */
	private function has_at_least_one_active_experiment() {
		foreach ( Plugin::$instance->experiments->get_features() as $feature_name => $feature ) {
			if ( Experiments_Manager::STATE_ACTIVE === $feature['state'] ) {
				return true;
			}
		}

		return false;
	}
}
