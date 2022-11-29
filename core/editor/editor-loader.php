<?php
namespace Elementor\Core\Editor;

use Elementor\Core\Utils\Collection;
use Elementor\Utils;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Editor_Loader {
	const VERSION_1 = 1;
	const VERSION_2 = 2;

	const AVAILABLE_VERSIONS = [
		self::VERSION_1,
		self::VERSION_2,
	];

	/**
	 * @var number
	 */
	private $post_id;

	/**
	 * @var number
	 */
	private $version;

	/**
	 * @param int|string $post_id
	 * @param int|string $version
	 */
	public function __construct( $post_id, $version = self::VERSION_1 ) {
		$this->post_id = (int) $post_id;
		$this->version = in_array( (int) $version, self::AVAILABLE_VERSIONS, true )
			? (int) $version
			: self::VERSION_1;
	}

	/**
	 * @return void
	 */
	public function register_scripts() {
		$scripts_config = require_once __DIR__ . '/config/scripts.php';

		Collection::make( $scripts_config['common'] )
			->merge( $scripts_config[ $this->version ] )
			->each( function ( $script_config ) {
				$script_config = wp_parse_args( $script_config, [
					'deps' => [],
					'ver' => ELEMENTOR_VERSION,
					'in_footer' => true,
				] );

				if ( empty( $script_config['handle'] ) || empty( $script_config['src'] ) ) {
					return;
				}

				$replacements = [
					'{{ASSETS_URL}}' => ELEMENTOR_ASSETS_URL,
					'{{SUFFIX}}' => Utils::is_script_debug() || Utils::is_elementor_tests() ?
						'' :
						'.min',
				];

				foreach ( $replacements as $replacement_key => $replacement_value ) {
					$script_config['src'] = str_replace(
						$replacement_key,
						$replacement_value,
						$script_config['src']
					);
				}

				wp_register_script(
					$script_config['handle'],
					$script_config['src'],
					$script_config['deps'],
					$script_config['ver'],
					$script_config['in_footer']
				);
			} );
	}

	public function enqueue_scripts() {
		// TODO: Replace it to the path of the build file.
		wp_enqueue_script(
			'elementor-editor-loader',
			ELEMENTOR_URL . 'core/editor/assets/js/editor-loader.js',
			[ 'elementor-editor' ],
			ELEMENTOR_VERSION,
			true
		);

		$config = wp_json_encode( [
			'version' => $this->version,
		] );

		wp_add_inline_script(
			'elementor-editor-loader',
			"globalThis.elementorEditorLoaderConfig = {$config};",
			'before'
		);
	}

	public function print_root_template() {
		// Exposing the version to the view template
		$editor_version = $this->version;

		include ELEMENTOR_PATH . 'includes/editor-templates/editor-wrapper.php';
	}
}
