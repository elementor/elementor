<?php
namespace Elementor\Core\Editor\Loader\V2;

use Elementor\Core\Editor\Loader\Common\Editor_Common_Scripts_Settings;
use Elementor\Core\Editor\Loader\Editor_Base_Loader;
use Elementor\Core\Utils\Assets_Config_Provider;
use Elementor\Core\Utils\Collection;
use Elementor\Utils;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Editor_V2_Loader extends Editor_Base_Loader {
	const APP = 'editor';
	const ENV = 'env';

	const PACKAGES_TO_ENQUEUE = [
		// App
		self::APP,

		// Extensions
		'editor-app-bar',
		'editor-documents',
		'editor-panels',
		'editor-responsive',
		'editor-site-navigation',
		'editor-v1-adapters',
	];

	const PACKAGES_TO_NOT_ENQUEUE = [
		// Libs
		self::ENV,
		'icons',
		'locations',
		'store',
		'ui',
	];

	/**
	 * @var Assets_Config_Provider
	 */
	protected $assets_config_provider;

	/**
	 * @param Collection $config
	 */
	public function __construct( Collection $config ) {
		parent::__construct( $config );

		$this->assets_config_provider = new Assets_Config_Provider();
	}

	/**
	 * @return void
	 */
	public function init() {
		parent::init();

		$packages = array_merge( self::PACKAGES_TO_ENQUEUE, self::PACKAGES_TO_NOT_ENQUEUE );

		$assets_path = $this->config->get( 'assets-path' );

		foreach ( $packages as $package ) {
			$this->assets_config_provider->load(
				$package,
				"{$assets_path}js/packages/{$package}/{$package}.asset.php"
			);
		}

		do_action( 'elementor/editor/v2/init' );
	}

	/**
	 * @return void
	 */
	public function register_scripts() {
		parent::register_scripts();

		$assets_url = $this->config->get( 'assets-url' );
		$min_suffix = $this->config->get( 'min-suffix' );

		foreach ( $this->assets_config_provider->all() as $package => $config ) {
			if ( self::ENV === $package ) {
				wp_register_script(
					'elementor-editor-environment-v2',
					"{$assets_url}js/editor-environment-v2{$min_suffix}.js",
					[ $config['handle'] ],
					ELEMENTOR_VERSION,
					true
				);
			}

			if ( static::APP === $package ) {
				wp_register_script(
					'elementor-editor-loader-v2',
					"{$assets_url}js/editor-loader-v2{$min_suffix}.js",
					[ 'elementor-editor', $config['handle'] ],
					ELEMENTOR_VERSION,
					true
				);
			}

			wp_register_script(
				$config['handle'],
				"{$assets_url}js/packages/{$package}/{$package}{$min_suffix}.js",
				$config['deps'],
				ELEMENTOR_VERSION,
				true
			);
		}

		do_action( 'elementor/editor/v2/scripts/register' );
	}

	/**
	 * @return void
	 */
	public function enqueue_scripts() {
		parent::enqueue_scripts();

		do_action( 'elementor/editor/v2/scripts/enqueue/before-env' );

		wp_enqueue_script( 'elementor-editor-environment-v2' );

		foreach ( $this->assets_config_provider->only( self::PACKAGES_TO_ENQUEUE ) as $config ) {
			if ( self::ENV === $config['handle'] ) {
				$client_env = apply_filters( 'elementor/editor/v2/scripts/env', [] );

				Utils::print_js_config(
					$config['handle'],
					'elementorEditorV2Env',
					$client_env
				);
			}

			wp_enqueue_script( $config['handle'] );
			wp_set_script_translations( $config['handle'], 'elementor' );
		}

		do_action( 'elementor/editor/v2/scripts/enqueue' );

		Utils::print_js_config(
			'elementor-editor',
			'ElementorConfig',
			Editor_Common_Scripts_Settings::get()
		);

		wp_enqueue_script( 'elementor-editor-loader-v2' );

		wp_set_script_translations( 'elementor-editor', 'elementor' );

		do_action( 'elementor/editor/v2/scripts/enqueue/after-loader' );
	}

	/**
	 * @return void
	 */
	public function register_styles() {
		parent::register_styles();

		$assets_url = $this->config->get( 'assets-url' );
		$min_suffix = $this->config->get( 'min-suffix' );

		wp_register_style(
			'elementor-editor-v2-overrides',
			"{$assets_url}css/editor-v2-overrides{$min_suffix}.css",
			[ 'elementor-editor' ],
			ELEMENTOR_VERSION
		);

		do_action( 'elementor/editor/v2/styles/register' );
	}

	/**
	 * @return void
	 */
	public function enqueue_styles() {
		parent::enqueue_styles();

		wp_enqueue_style( 'elementor-editor-v2-overrides' );

		do_action( 'elementor/editor/v2/styles/enqueue' );
	}

	/**
	 * @return void
	 */
	public function print_root_template() {
		// Exposing the path for the view part to render the body of the editor template.
		$body_file_path = __DIR__ . '/templates/editor-body-v2.view.php';

		include ELEMENTOR_PATH . 'includes/editor-templates/editor-wrapper.php';
	}
}
