<?php
namespace Elementor\Core\Editor\Loader;

use Elementor\Core\Utils\Assets_Config_Provider;
use Elementor\Core\Utils\Assets_Translation_Loader;
use Elementor\Core\Utils\Collection;
use Elementor\Modules\AtomicWidgets\Utils\Image\Placeholder_Image;
use Elementor\Plugin;
use Elementor\Utils;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

final class Editor_Loader {
	const APP_PACKAGE = 'editor';
	const ENV_PACKAGE = 'env';

	const LIBS = [
		'editor-modal-shell',
		'editor-responsive',
		'editor-ui',
		'editor-v1-adapters',
		self::ENV_PACKAGE,
		'http-client',
		'icons',
		'locations',
		'menus',
		'query',
		'schema',
		'store',
		'session',
		'twing',
		'ui',
		'utils',
		'wp-media',
		'editor-current-user',
		'editor-elements-panel-notice',
		'elementor-mcp-common',
		'editor-embedded-documents-manager',
	];

	const EXTENSIONS = [
		'events',
		'editor-documents',
		'editor-notifications',
		'editor-panels',
		'editor-elements-panel',
		'unlock-v4-promo',
		'editor-mcp',
		'elementor-v3-mcp',
		'elementor-kit-mcp',
	];

	const ADDITIONAL_DEPS = [
		'editor-v1-adapters' => [
			'elementor-web-cli',
		],
		'wp-media' => [
			'media-models',
		],
	];

	/**
	 * @var Collection
	 */
	private $config;

	/**
	 * @var Assets_Config_Provider
	 */
	private $assets_config_provider;

	public function __construct( Collection $config, Assets_Config_Provider $assets_config_provider ) {
		$this->config = $config;
		$this->assets_config_provider = $assets_config_provider;
	}

	public function init() {
		$packages = array_merge( $this->get_packages_to_enqueue(), self::LIBS );
		$packages_with_app = array_merge( $packages, [ self::APP_PACKAGE ] );

		foreach ( $packages_with_app as $package ) {
			$this->assets_config_provider->load( $package );
		}

		do_action( 'elementor/editor/v2/init' );
	}

	public function register_scripts() {
		$this->register_base_scripts();

		$assets_url = $this->config->get( 'assets_url' );
		$min_suffix = $this->config->get( 'min_suffix' );

		foreach ( $this->assets_config_provider->all() as $package => $config ) {
			if ( self::ENV_PACKAGE === $package ) {
				wp_register_script(
					'elementor-editor-environment',
					"{$assets_url}js/editor-environment{$min_suffix}.js",
					[ $config['handle'] ],
					ELEMENTOR_VERSION,
					true
				);
			}

			if ( self::APP_PACKAGE === $package ) {
				wp_register_script(
					'elementor-editor-loader',
					"{$assets_url}js/editor-loader{$min_suffix}.js",
					[ 'elementor-editor', $config['handle'] ],
					ELEMENTOR_VERSION,
					true
				);
			}

			$additional_deps = self::ADDITIONAL_DEPS[ $package ] ?? [];
			$deps = array_merge( $config['deps'], $additional_deps );

			wp_register_script(
				$config['handle'],
				"{$assets_url}js/packages/{$package}/{$package}{$min_suffix}.js",
				$deps,
				ELEMENTOR_VERSION,
				true
			);
		}

		$packages_handles = $this->assets_config_provider->pluck( 'handle' )->all();

		Assets_Translation_Loader::for_handles( $packages_handles, 'elementor' );

		do_action( 'elementor/editor/v2/scripts/register' );
	}

	public function enqueue_scripts() {
		do_action( 'elementor/editor/v2/scripts/enqueue/before' );

		wp_enqueue_script( 'elementor-responsive-bar' );

		wp_enqueue_script( 'elementor-editor-environment' );

		$env_config = $this->assets_config_provider->get( self::ENV_PACKAGE );

		if ( $env_config ) {
			$client_env = apply_filters( 'elementor/editor/v2/scripts/env', [
				'@elementor/http-client' => [
					'base_url' => rest_url(),
					'headers' => [
						'X-WP-Nonce' => wp_create_nonce( 'wp_rest' ),
					],
				],
				'@elementor/editor-controls' => [
					'background_placeholder_image' => Placeholder_Image::get_background_placeholder_image(),
				],
			] );

			Utils::print_js_config(
				$env_config['handle'],
				'elementorEditorEnv',
				$client_env
			);
		}

		$packages_with_app = array_merge( $this->get_packages_to_enqueue(), [ self::APP_PACKAGE ] );

		foreach ( $this->assets_config_provider->only( $packages_with_app ) as $config ) {
			wp_enqueue_script( $config['handle'] );
		}

		do_action( 'elementor/editor/v2/scripts/enqueue' );

		Utils::print_js_config(
			'elementor-editor',
			'ElementorConfig',
			Editor_Scripts_Settings::get()
		);

		wp_enqueue_script( 'elementor-editor-loader' );

		do_action( 'elementor/editor/v2/scripts/enqueue/after' );
	}

	public function register_styles() {
		$this->register_base_styles();

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

	public function enqueue_styles() {
		wp_enqueue_style( 'elementor-editor' );
		wp_enqueue_style( 'elementor-responsive-bar' );

		foreach ( $this->get_styles() as $style ) {
			wp_enqueue_style( "elementor-{$style}" );
		}

		do_action( 'elementor/editor/v2/styles/enqueue' );
	}

	public function print_root_template() {
		$body_file_path = __DIR__ . '/templates/editor-body-view.php';

		include ELEMENTOR_PATH . 'includes/editor-templates/editor-wrapper.php';
	}

	public function register_additional_templates() {
		$templates = [
			'global',
			'panel',
			'panel-elements',
			'repeater',
			'templates',
			'navigator',
			'hotkeys',
			'responsive-bar',
		];

		$templates = apply_filters( 'elementor/editor/templates', $templates );

		foreach ( $templates as $template ) {
			Plugin::$instance->common->add_template( ELEMENTOR_PATH . "includes/editor-templates/{$template}.php" );
		}
	}

	private function get_packages_to_enqueue(): array {
		return apply_filters( 'elementor/editor/v2/packages', self::EXTENSIONS );
	}

	private function get_styles(): array {
		$styles = apply_filters( 'elementor/editor/v2/styles', [] );

		return Collection::make( $styles )
			->unique()
			->all();
	}

	private function scripts_source_map() {
		$assets_url = $this->config->get( 'assets_url' );
		$min_suffix = $this->config->get( 'min_suffix' );

		return [
			'ace' => [
				'src' => 'https://cdn.jsdelivr.net/npm/ace-builds@1.43.2/src-min-noconflict/ace.min.js',
				'deps' => [],
				'ver' => '1.43.2',
			],

			'ace-language-tools' => [
				'src' => 'https://cdn.jsdelivr.net/npm/ace-builds@1.43.2/src-min-noconflict/ext-language_tools.js',
				'deps' => [ 'ace' ],
				'ver' => '1.43.2',
			],

			'pickr' => [
				'src' => "{$assets_url}lib/pickr/pickr.min.js",
				'deps' => [],
				'ver' => '1.8.2',
			],

			'flatpickr' => [
				'src' => "{$assets_url}lib/flatpickr/flatpickr{$min_suffix}.js",
				'deps' => [ 'jquery' ],
				'ver' => '4.6.13',
			],
		];
	}

	private function styles_source_map() {
		$assets_url = $this->config->get( 'assets_url' );
		$min_suffix = $this->config->get( 'min_suffix' );

		return [
			'font-awesome' => [
				'src' => "{$assets_url}lib/font-awesome/css/font-awesome{$min_suffix}.css",
				'deps' => [],
				'ver' => '4.7.0',
			],

			'elementor-select2' => [
				'src' => "{$assets_url}lib/e-select2/css/e-select2{$min_suffix}.css",
				'deps' => [],
				'ver' => '4.0.6-rc.1',
			],

			'pickr' => [
				'src' => "{$assets_url}lib/pickr/themes/monolith.min.css",
				'deps' => [],
				'ver' => '1.8.2',
			],

			'flatpickr' => [
				'src' => "{$assets_url}lib/flatpickr/flatpickr{$min_suffix}.css",
				'deps' => [],
				'ver' => '4.6.13',
			],
		];
	}

	private function register_base_scripts() {
		$assets_url = $this->config->get( 'assets_url' );
		$min_suffix = $this->config->get( 'min_suffix' );

		wp_register_script(
			'elementor-editor-modules',
			"{$assets_url}js/editor-modules{$min_suffix}.js",
			[ 'elementor-common-modules' ],
			ELEMENTOR_VERSION,
			true
		);

		wp_register_script(
			'elementor-editor-document',
			"{$assets_url}js/editor-document{$min_suffix}.js",
			[ 'elementor-common-modules' ],
			ELEMENTOR_VERSION,
			true
		);

		wp_register_script(
			'perfect-scrollbar',
			"{$assets_url}lib/perfect-scrollbar/js/perfect-scrollbar{$min_suffix}.js",
			[],
			'1.4.0',
			true
		);

		wp_register_script(
			'jquery-easing',
			"{$assets_url}lib/jquery-easing/jquery-easing{$min_suffix}.js",
			[ 'jquery' ],
			'1.3.2',
			true
		);

		wp_register_script(
			'nprogress',
			"{$assets_url}lib/nprogress/nprogress{$min_suffix}.js",
			[],
			'0.2.0',
			true
		);

		wp_register_script(
			'tipsy',
			"{$assets_url}lib/tipsy/tipsy{$min_suffix}.js",
			[ 'jquery' ],
			'1.0.0',
			true
		);

		wp_register_script(
			'jquery-elementor-select2',
			"{$assets_url}lib/e-select2/js/e-select2.full{$min_suffix}.js",
			[ 'jquery' ],
			'4.0.6-rc.1',
			true
		);

		wp_register_script(
			'jquery-hover-intent',
			"{$assets_url}lib/jquery-hover-intent/jquery-hover-intent{$min_suffix}.js",
			[],
			'1.0.0',
			true
		);

		wp_register_script(
			'nouislider',
			"{$assets_url}lib/nouislider/nouislider{$min_suffix}.js",
			[],
			'13.0.0',
			true
		);

		$source_map = $this->scripts_source_map();

		foreach ( $source_map as $handle => $script ) {
			wp_register_script(
				$handle,
				$script['src'],
				$script['deps'],
				$script['ver'],
				true
			);
		}

		add_action( 'elementor/assets-manager/register_scripts', function( $assets ) use ( $source_map ) {
			foreach ( $source_map as $handle => $script ) {
				$assets->append(
					$handle,
					$script['src'],
					$script['deps'],
					$script['ver']
				);
			}
		} );

		wp_register_script(
			'elementor-editor',
			"{$assets_url}js/editor{$min_suffix}.js",
			[
				'elementor-common',
				'elementor-editor-modules',
				'elementor-editor-document',
				'wp-auth-check',
				'jquery-ui-sortable',
				'jquery-ui-resizable',
				'perfect-scrollbar',
				'nprogress',
				'tipsy',
				'imagesloaded',
				'heartbeat',
				'jquery-elementor-select2',
				'flatpickr',
				'ace',
				'ace-language-tools',
				'jquery-hover-intent',
				'nouislider',
				'pickr',
				'react',
				'react-dom',
			],
			ELEMENTOR_VERSION,
			true
		);

		wp_set_script_translations( 'elementor-editor', 'elementor' );

		wp_register_script(
			'elementor-responsive-bar',
			"{$assets_url}js/responsive-bar{$min_suffix}.js",
			[ 'elementor-editor' ],
			ELEMENTOR_VERSION,
			true
		);

		wp_set_script_translations( 'elementor-responsive-bar', 'elementor' );
	}

	private function register_base_styles() {
		$assets_url = $this->config->get( 'assets_url' );
		$min_suffix = $this->config->get( 'min_suffix' );
		$direction_suffix = $this->config->get( 'direction_suffix' );

		wp_register_style(
			'google-font-roboto',
			'https://fonts.googleapis.com/css?family=Roboto:300,400,500,700',
			[],
			ELEMENTOR_VERSION
		);

		$source_map = $this->styles_source_map();

		foreach ( $source_map as $handle => $style ) {
			wp_register_style(
				$handle,
				$style['src'],
				$style['deps'],
				$style['ver']
			);
		}

		add_action( 'elementor/assets-manager/register_styles', function( $assets ) use ( $source_map ) {
			foreach ( $source_map as $handle => $style ) {
				$assets->append(
					$handle,
					$style['src'],
					$style['deps'],
					$style['ver']
				);
			}
		} );

		wp_register_style(
			'elementor-editor',
			"{$assets_url}css/editor{$direction_suffix}{$min_suffix}.css",
			[
				'elementor-common',
				'elementor-select2',
				'elementor-icons',
				'wp-auth-check',
				'google-font-roboto',
				'flatpickr',
				'pickr',
			],
			ELEMENTOR_VERSION
		);

		wp_register_style(
			'elementor-responsive-bar',
			"{$assets_url}css/responsive-bar{$min_suffix}.css",
			[],
			ELEMENTOR_VERSION
		);
	}
}
