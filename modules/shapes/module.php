<?php

namespace Elementor\Modules\Shapes;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}

class Module extends \Elementor\Core\Base\Module {

	/**
	 * Return a translated user-friendly list of the available SVG shapes.
	 *
	 * @param bool $add_custom Determine if the output should include the `Custom` option.
	 *
	 * @return array List of paths.
	 */
	public static function get_paths( $add_custom = true ) {
		$paths = [
			'wave' => esc_html__( 'Wave', 'elementor' ),
			'arc' => esc_html__( 'Arc', 'elementor' ),
			'circle' => esc_html__( 'Circle', 'elementor' ),
			'line' => esc_html__( 'Line', 'elementor' ),
			'oval' => esc_html__( 'Oval', 'elementor' ),
			'spiral' => esc_html__( 'Spiral', 'elementor' ),
		];

		if ( $add_custom ) {
			$paths['custom'] = esc_html__( 'Custom', 'elementor' );
		}

		return $paths;
	}

	/**
	 * Gets an SVG path name as a parameter and returns its SVG markup from the `svg-paths`
	 * folder under the assets directory.
	 *
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
