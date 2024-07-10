<?php
namespace Elementor\Core\Editor\Loader\V2;

use Elementor\Core\Editor\Loader\Common\Editor_Common_Scripts_Settings;
use Elementor\Core\Editor\Loader\Editor_Base_Loader;
use Elementor\Core\Editor\Editor_V2_Experiments;
use Elementor\Core\Utils\Assets_Translation_Loader;
use Elementor\Core\Utils\Collection;
use Elementor\Plugin;
use Elementor\Utils;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Editor_V2_Loader extends Editor_Base_Loader {
	const APP_PACKAGE = 'editor';
	const ENV_PACKAGE = 'env';

	/**
	 * Packages (extensions) that should be enqueued based on the active experiments.
	 */
	const PACKAGES_TO_ENQUEUE = [
		Editor_V2_Experiments::APP_BAR => [
			'editor-app-bar',
			'editor-documents',
			'editor-panels',
			'editor-responsive',
			'editor-site-navigation',
		],
		Editor_V2_Experiments::ATOMIC_WIDGETS => [
			'editor-documents', // TODO: NEED to be removed once the editor will not be dependent on the documents package.
			'editor-editing-panel',
			'editor-panels',
		],
	];

	/**
	 * Packages that should only be registered, unless some other asset depends on them.
	 */
	const LIBS = [
		'editor-v1-adapters',
		self::ENV_PACKAGE,
		'icons',
		'locations',
		'query',
		'store',
		'ui',
	];

	/**
	 * Styles that should be enqueued based on the active experiments.
	 */
	const STYLES = [
		Editor_V2_Experiments::APP_BAR => [
			'editor-v2-app-bar-overrides',
		],
	];

	/**
	 * @return void
	 */
	public function init() {
		$packages = array_merge( $this->get_packages_to_enqueue(), self::LIBS );

		foreach ( $packages as $package ) {
			$this->assets_config_provider->load( $package );
		}

		do_action( 'elementor/editor/v2/init' );
	}

	/**
	 * @return void
	 */
	public function register_scripts() {
		parent::register_scripts();

		$assets_url = $this->config->get( 'assets_url' );
		$min_suffix = $this->config->get( 'min_suffix' );

		foreach ( $this->assets_config_provider->all() as $package => $config ) {
			if ( self::ENV_PACKAGE === $package ) {
				wp_register_script(
					'elementor-editor-environment-v2',
					"{$assets_url}js/editor-environment-v2{$min_suffix}.js",
					[ $config['handle'] ],
					ELEMENTOR_VERSION,
					true
				);
			}

			if ( static::APP_PACKAGE === $package ) {
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

		$packages_handles = $this->assets_config_provider->pluck( 'handle' )->all();

		Assets_Translation_Loader::for_handles( $packages_handles, 'elementor' );

		do_action( 'elementor/editor/v2/scripts/register' );
	}

	/**
	 * @return void
	 */
	public function enqueue_scripts() {
		do_action( 'elementor/editor/v2/scripts/enqueue/before' );

		wp_enqueue_script( 'elementor-editor-environment-v2' );

		$env_config = $this->assets_config_provider->get( self::ENV_PACKAGE );

		if ( $env_config ) {
			$client_env = apply_filters( 'elementor/editor/v2/scripts/env', [] );

			Utils::print_js_config(
				$env_config['handle'],
				'elementorEditorV2Env',
				$client_env
			);
		}

		foreach ( $this->assets_config_provider->only( $this->get_packages_to_enqueue() ) as $config ) {
			wp_enqueue_script( $config['handle'] );
		}

		do_action( 'elementor/editor/v2/scripts/enqueue' );

		Utils::print_js_config(
			'elementor-editor',
			'ElementorConfig',
			Editor_Common_Scripts_Settings::get()
		);

		// Must be last.
		wp_enqueue_script( 'elementor-editor-loader-v2' );

		do_action( 'elementor/editor/v2/scripts/enqueue/after' );
	}

	/**
	 * @return void
	 */
	public function register_styles() {
		parent::register_styles();

		$assets_url = $this->config->get( 'assets_url' );
		$min_suffix = $this->config->get( 'min_suffix' );

		foreach ( $this->get_styles() as $style ) {
			wp_register_style(
				"elementor-{$style}",
				"{$assets_url}css/{$style}{$min_suffix}.css",
				[ 'elementor-editor' ],
				ELEMENTOR_VERSION
			);
		}

		do_action( 'elementor/editor/v2/styles/register' );
	}

	/**
	 * @return void
	 */
	public function enqueue_styles() {
		parent::enqueue_styles();

		foreach ( $this->get_styles() as $style ) {
			wp_enqueue_style( "elementor-{$style}" );
		}

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

	private function get_packages_to_enqueue() : array {
		$experiments_manager = Plugin::$instance->experiments;

		$packages = Collection::make( self::PACKAGES_TO_ENQUEUE )
			->filter( fn ( $_, $experiment) => $experiments_manager->is_feature_active( $experiment ) )
			->flatten()
			->push( self::APP_PACKAGE )
			->unique()
			->all();

		return apply_filters( 'elementor/editor/v2/packages', $packages );
	}

	private function get_styles() : array {
		$experiments_manager = Plugin::$instance->experiments;

		return Collection::make( self::STYLES )
			->filter( fn ( $_, $experiment) => $experiments_manager->is_feature_active( $experiment ) )
			->flatten()
			->unique()
			->all();
	}
}
