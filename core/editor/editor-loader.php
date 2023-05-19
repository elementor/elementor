<?php
namespace Elementor\Core\Editor;

use Elementor\Core\Editor\Config_Providers\Config_Provider_Interface;
use Elementor\Core\Utils\Collection;
use Elementor\Plugin;
use Elementor\Utils;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Editor_Loader {
	/**
	 * @var Config_Provider_Interface
	 */
	private $config_provider;

	/**
	 * @param Config_Provider_Interface $config_provider
	 */
	public function __construct( Config_Provider_Interface $config_provider ) {
		$this->config_provider = $config_provider;
	}

	/**
	 * @return void
	 */
	public function register_hooks() {
		$script_configs = $this->get_script_configs();

		// Pointing WordPress to use translations for external files ('assets/js/editor.strings.js') and not
		// for the original file (assets/js/editor.js).
		add_filter( 'load_script_textdomain_relative_path', function ( $relative_path, $src ) use ( $script_configs ) {
			return $this->replace_requested_translation_file( $relative_path, $src, $script_configs );
		}, 10, 2 );
	}

	/**
	 * @return void
	 */
	public function register_scripts() {
		$script_configs = $this->get_script_configs();

		foreach ( $script_configs as $script_config ) {
			wp_register_script(
				$script_config['handle'],
				$script_config['src'],
				$script_config['deps'],
				$script_config['version'],
				$script_config['in_footer']
			);
		}
	}

	public function print_client_env() {
		$client_env = $this->config_provider->get_client_env();

		$client_env = Collection::make( $client_env )
			->filter( function ( $config ) {
				return (
					! empty( $config['handle'] ) &&
					! empty( $config['name'] ) &&
					! empty( $config['env'] )
				);
			} );

		foreach ( $client_env as $env ) {
			Utils::print_js_config(
				$env['handle'],
				$env['name'],
				$env['env']
			);
		}
	}

	/**
	 * @return void
	 */
	public function enqueue_scripts() {
		foreach ( $this->config_provider->get_script_handles_to_enqueue() as $script_handle ) {
			wp_enqueue_script( $script_handle );
		}
	}

	/**
	 * @return void
	 */
	public function load_scripts_translations() {
		$script_configs = $this->get_script_configs();

		foreach ( $script_configs as $script_config ) {
			if ( $script_config['i18n']['domain'] ) {
				wp_set_script_translations(
					$script_config['handle'],
					$script_config['i18n']['domain']
				);
			}
		}
	}

	/**
	 * @return void
	 */
	public function register_styles() {
		$styles_config = $this->get_style_configs();

		foreach ( $styles_config as $style_config ) {
			wp_register_style(
				$style_config['handle'],
				$style_config['src'],
				$style_config['deps'],
				$style_config['version'],
				$style_config['media']
			);
		}
	}

	/**
	 * @return void
	 */
	public function enqueue_styles() {
		foreach ( $this->config_provider->get_style_handles_to_enqueue() as $style_handle ) {
			wp_enqueue_style( $style_handle );
		}
	}

	/**
	 * @return void
	 */
	public function print_root_template() {
		// Exposing the path for the view part to render the body of the editor template.
		$body_file_path = $this->config_provider->get_template_body_file_path();

		include ELEMENTOR_PATH . 'includes/editor-templates/editor-wrapper.php';
	}

	public function register_additional_templates() {
		$templates = $this->config_provider->get_additional_template_paths();

		foreach ( $templates as $template_path ) {
			Plugin::$instance->common->add_template( $template_path );
		}
	}

	/**
	 * @return Collection
	 */
	private function get_script_configs() {
		return $this->normalize_asset_configs(
			$this->config_provider->get_script_configs(),
			'script'
		);
	}

	/**
	 * @return Collection
	 */
	private function get_style_configs() {
		return $this->normalize_asset_configs(
			$this->config_provider->get_style_configs(),
			'style'
		);
	}

	/**
	 * Normalize script/style configs to enqueue and register methods.
	 *
	 * @param array $script_configs
	 * @param string $type can be ['script', 'style']
	 *
	 * @return Collection
	 */
	private function normalize_asset_configs( array $script_configs, $type ) {
		$additional_defaults = 'style' === $type ?
			[ 'media' => 'all' ] :
			[
				'in_footer' => true,
				'i18n' => [
					'domain' => null,
					'replace_requested_file' => false,
					'replace_requested_file_callback' => function ( $relative_path ) {
						// By default, we suffix the file with `.strings` e.g 'assets/js/editor.js' => 'assets/js/editor.strings.js'.

						// Translations are always based on the non-minified filename.
						$relative_path_without_ext = preg_replace( '/(\.min)?\.js$/i', '', $relative_path );

						return implode( '.', [
							$relative_path_without_ext,
							'strings',
							'js',
						] );
					},
				],
			];

		$default = array_replace_recursive( [
			'handle' => '',
			'src' => '',
			'deps' => [],
			'version' => ELEMENTOR_VERSION,
			'in_footer' => true,
		], $additional_defaults );

		$replacements = [
			'{{ELEMENTOR_ASSETS_URL}}' => ELEMENTOR_ASSETS_URL,
			'{{MIN_SUFFIX}}' => ( Utils::is_script_debug() || Utils::is_elementor_tests() ) ? '' : '.min',
			'{{DIRECTION_SUFFIX}}' => is_rtl() ? '-rtl' : '',
		];

		return Collection::make( $script_configs )
			->filter( function ( $config ) {
				return ! empty( $config['handle'] ) && ! empty( $config['src'] );
			} )
			->map( function ( $config ) use ( $default, $replacements ) {
				// Assign default values.
				$config = array_replace_recursive( $default, $config );

				// Replace placeholders with actual values.
				foreach ( $replacements as $replacement_key => $replacement_value ) {
					$config['src'] = str_replace(
						$replacement_key,
						$replacement_value,
						$config['src']
					);
				}

				return $config;
			} );
	}

	/**
	 * The purpose of this function is to replace the requested translation file
	 * with a file that contains all the translations for specific scripts.
	 *
	 * When writing a script and using Webpack's dynamic load feature,
	 * the script will be split into multiple chunks,
	 * therefore the translations that generated by WordPress will also split into multiple files,
	 * for that reason we replace the requested translation file with another file (generated in the build process)
	 * that contains all the translations for the specific script (including dynamically loaded chunks).
	 *
	 * Want to go deeper? Read the following article:
	 * @see https://developer.wordpress.com/2022/01/06/wordpress-plugin-i18n-webpack-and-composer/
	 *
	 * @param string $relative_path
	 * @param string $src
	 * @param Collection $script_configs Collection of all the script configs
	 *
	 * @return string
	 */
	private function replace_requested_translation_file( $relative_path, $src, $script_configs ) {
		$script_config = $script_configs->find( function ( $script_config ) use ( $src ) {
			return $script_config['src'] === $src;
		} );

		$should_suffix_path = $script_config &&
			$script_config['i18n']['domain'] &&
			$script_config['i18n']['replace_requested_file'];

		if ( ! $should_suffix_path ) {
			return $relative_path;
		}

		return $script_config['i18n']['replace_requested_file_callback'](
			$relative_path,
			$script_config
		);
	}
}
