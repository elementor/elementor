<?php
namespace Elementor\Core\Editor\Loader\V2;

use Elementor\Core\Editor\Loader\Editor_Base_Loader;
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

	public function init() {
		parent::init();

		$packages = array_merge( self::PACKAGES_TO_ENQUEUE, self::PACKAGES_TO_NOT_ENQUEUE );

		foreach ( $packages as $package ) {
			$this->assets_config_provider->load(
				$package,
				$this->placeholder_replacer->replace( "{{ASSETS_PATH}}js/packages/{$package}/{$package}.asset.php" )
			);
		}

		do_action( 'elementor/editor/v2/init' );
	}

	public function register_scripts() {
		parent::register_scripts();

		foreach ( $this->assets_config_provider->all() as $package => $config ) {
			if ( self::ENV === $package ) {
				wp_register_script(
					'elementor-editor-environment-v2',
					$this->placeholder_replacer->replace( '{{ASSETS_URL}}js/editor-environment-v2{{MIN_SUFFIX}}.js' ),
					[ $config['handle'] ],
					ELEMENTOR_VERSION,
					true
				);
			}

			if ( static::APP === $package ) {
				wp_register_script(
					'elementor-editor-loader-v2',
					$this->placeholder_replacer->replace( '{{ASSETS_URL}}js/editor-loader-v2{{MIN_SUFFIX}}.js' ),
					[ 'elementor-editor', $config['handle'] ],
					ELEMENTOR_VERSION,
					true
				);
			}

			wp_register_script(
				$config['handle'],
				$this->placeholder_replacer->replace( "{{ASSETS_URL}}js/packages/{$package}/{$package}{{MIN_SUFFIX}}.js" ),
				$config['deps'],
				ELEMENTOR_VERSION,
				true
			);
		}

		do_action( 'elementor/editor/v2/scripts/register' );
	}

	public function enqueue_scripts() {
		parent::enqueue_scripts();

		do_action( 'elementor/editor/v2/scripts/enqueue/before-env' );

		wp_enqueue_script( 'elementor-editor-environment-v2' );

		foreach ( $this->assets_config_provider->only( self::PACKAGES_TO_ENQUEUE ) as $config ) {
			wp_enqueue_script( $config['handle'] );
		}

		do_action( 'elementor/editor/v2/scripts/enqueue' );

		wp_enqueue_script( 'elementor-editor-loader-v2' );

		do_action( 'elementor/editor/v2/scripts/enqueue/after-loader' );
	}

	public function load_scripts_translations() {
		parent::load_scripts_translations();

		foreach ( $this->assets_config_provider->all() as $config ) {
			wp_set_script_translations( $config['handle'], 'elementor' );
		}

		do_action( 'elementor/editor/v2/scripts/translations' );
	}

	public function print_scripts_settings() {
		parent::print_scripts_settings();

		$env_config = $this->assets_config_provider->get( self::ENV );

		if ( $env_config ) {
			$client_env = apply_filters( 'elementor/editor/v2/scripts/env', [] );

			Utils::print_js_config(
				$env_config['handle'],
				'elementorEditorV2Env',
				$client_env
			);
		}

		do_action( 'elementor/editor/v2/scripts/settings' );
	}

	public function register_styles() {
		parent::register_styles();

		wp_register_style(
			'elementor-editor-v2-overrides',
			$this->placeholder_replacer->replace( '{{ASSETS_URL}}css/editor-v2-overrides{{MIN_SUFFIX}}.css' ),
			[ 'elementor-editor' ],
			ELEMENTOR_VERSION
		);

		do_action( 'elementor/editor/v2/styles/register' );
	}

	public function enqueue_styles() {
		parent::enqueue_styles();

		wp_enqueue_style( 'elementor-editor-v2-overrides' );

		do_action( 'elementor/editor/v2/styles/enqueue' );
	}

	public function print_root_template() {
		// Exposing the path for the view part to render the body of the editor template.
		$body_file_path = __DIR__ . '/templates/editor-body-v2.view.php';

		include ELEMENTOR_PATH . 'includes/editor-templates/editor-wrapper.php';
	}
}
