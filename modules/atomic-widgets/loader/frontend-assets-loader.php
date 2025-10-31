<?php
namespace Elementor\Modules\AtomicWidgets\Loader;

use Elementor\Core\Utils\Assets_Config_Provider;
use Elementor\Core\Utils\Collection;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Frontend_Assets_Loader {
	const PACKAGES = [
		'frontend-handlers',
		'alpinejs',
	];

	/**
	 * @var Collection
	 */
	private $config;

	/**
	 * @var Assets_Config_Provider
	 */
	private $assets_config_provider;

	/**
	 * @param Collection             $config
	 * @param Assets_Config_Provider $assets_config_provider
	 */
	public function __construct( Collection $config, Assets_Config_Provider $assets_config_provider ) {
		$this->config = $config;
		$this->assets_config_provider = $assets_config_provider;
	}

	/**
	 * @return void
	 */
	public function init() {
		foreach ( self::PACKAGES as $package ) {
			$this->assets_config_provider->load( $package );
		}

		do_action( 'elementor/atomic-widgets/frontend/loader/init' );
	}

	/**
	 * @return void
	 */
	public function register_scripts() {
		$this->register_package_scripts();

		do_action( 'elementor/atomic-widgets/frontend/loader/scripts/register', $this );
	}

	private function register_package_scripts() {
		$assets_url = $this->config->get( 'assets_url' );
		$min_suffix = $this->config->get( 'min_suffix' );

		foreach ( self::PACKAGES as $package ) {
			$package_config = $this->assets_config_provider->get( $package );

			if ( ! $package_config ) {
				continue;
			}

			wp_register_script(
				$package_config['handle'],
				"{$assets_url}js/packages/{$package}/{$package}{$min_suffix}.js",
				$package_config['deps'],
				ELEMENTOR_VERSION,
				true
			);
		}
	}

	public function get_assets_url() {
		return $this->config->get( 'assets_url' );
	}

	public function get_min_suffix() {
		return $this->config->get( 'min_suffix' );
	}

	public function get_package_handle( $package ) {
		$config = $this->assets_config_provider->get( $package );
		return $config ? $config['handle'] : null;
	}
}
