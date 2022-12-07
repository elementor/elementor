<?php
namespace Elementor\Core\Editor;

use Elementor\Core\Editor\Loading_Strategies\Loading_Strategy_Interface;
use Elementor\Core\Utils\Collection;
use Elementor\Utils;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Editor_Loader {
	/**
	 * @var Loading_Strategy_Interface
	 */
	private $strategy;

	/**
	 * @param Loading_Strategy_Interface $strategy
	 */
	public function __construct( Loading_Strategy_Interface $strategy ) {
		$this->strategy = $strategy;
	}

	/**
	 * @return void
	 */
	public function register_scripts() {
		$script_configs = $this->normalize_script_configs(
			$this->strategy->get_scripts()
		);

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

	/**
	 * @return void
	 */
	public function enqueue_scripts() {
		$script_configs = $this->normalize_script_configs(
			$this->strategy->get_loader_scripts()
		);

		foreach ( $script_configs as $script_config ) {
			wp_enqueue_script(
				$script_config['handle'],
				$script_config['src'],
				$script_config['deps'],
				$script_config['version'],
				$script_config['in_footer']
			);
		}
	}

	/**
	 * @return void
	 */
	public function print_root_template() {
		// Exposing the path for the view part to render the body of the editor template.
		$body_file_path = $this->strategy->get_template_body_file_path();

		include ELEMENTOR_PATH . 'includes/editor-templates/editor-wrapper.php';
	}

	/**
	 * Normalize script configs for enqueue and register methods.
	 *
	 * @param array $script_configs
	 *
	 * @return array
	 */
	private function normalize_script_configs( array $script_configs ) {
		$default = [
			'handle' => '',
			'src' => '',
			'deps' => [],
			'version' => ELEMENTOR_VERSION,
			'in_footer' => true,
		];

		$replacements = [
			'{{ASSETS_URL}}' => ELEMENTOR_ASSETS_URL,
			'{{SUFFIX}}' => Utils::is_script_debug() || Utils::is_elementor_tests() ? '' : '.min',
		];

		return Collection::make( $script_configs )
			->filter( function ( $config ) {
				return ! empty( $config['handle'] ) && ! empty( $config['src'] );
			} )
			->map( function ( $config ) use ( $default, $replacements ) {
				// Assign default values.
				$config = wp_parse_args( $config, $default );

				// Replace placeholders with actual values.
				foreach ( $replacements as $replacement_key => $replacement_value ) {
					$config['src'] = str_replace(
						$replacement_key,
						$replacement_value,
						$config['src']
					);
				}

				return $config;
			} )
			->all();
	}
}
