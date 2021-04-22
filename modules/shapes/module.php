<?php

namespace Elementor\Modules\Shapes;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}

class Module extends \Elementor\Core\Base\Module {

	/**
	 * @param bool $add_custom Determine if the output should include the `Custom` option.
	 *
	 * @return array List of paths.
	 */
	public static function get_paths( $add_custom = true ) {
		$paths = [
			'wave' => __( 'Wave', 'elementor' ),
			'arc' => __( 'Arc', 'elementor' ),
			'circle' => __( 'Circle', 'elementor' ),
			'line' => __( 'Line', 'elementor' ),
			'oval' => __( 'Oval', 'elementor' ),
			'spiral' => __( 'Spiral', 'elementor' ),
		];

		if ( $add_custom ) {
			$paths['custom'] = __( 'Custom', 'elementor' );
		}

		return $paths;
	}

	/**
	 * @param $path string Path name.
	 *
	 * @return string The path SVG markup.
	 */
	public static function get_path_svg( $path ) {
		$file_name = ELEMENTOR_ASSETS_PATH . 'svg-paths/' . $path . '.svg';

		if ( ! is_file( $file_name ) ) {
			return '';
		}

		return file_get_contents( $file_name );
	}

	/**
	 * Get the module's associated widgets.
	 *
	 * @return string[]
	 */
	protected function get_widgets() {
		return [
			'TextPath',
		];
	}

	/**
	 * Retrieve the module name.
	 *
	 * @return string
	 */
	public function get_name() {
		return 'shapes';
	}
}
