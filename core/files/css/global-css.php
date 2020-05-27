<?php
namespace Elementor\Core\Files\CSS;

use Elementor\Core\Kits\Documents\Tabs\Global_Style;
use Elementor\Plugin;
use Elementor\Scheme_Base;
use Elementor\Settings;
use Elementor\Core\Schemes;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

/**
 * Elementor global CSS file.
 *
 * Elementor CSS file handler class is responsible for generating the global CSS
 * file.
 *
 * @since 1.2.0
 */
class Global_CSS extends Base {

	/**
	 * Elementor global CSS file handler ID.
	 */
	const FILE_HANDLER_ID = 'elementor-global';

	const META_KEY = '_elementor_global_css';

	/**
	 * Get CSS file name.
	 *
	 * Retrieve the CSS file name.
	 *
	 * @since 1.6.0
	 * @access public
	 *
	 * @return string CSS file name.
	 */
	public function get_name() {
		return 'global';
	}

	/**
	 * Get file handle ID.
	 *
	 * Retrieve the handle ID for the global post CSS file.
	 *
	 * @since 1.2.0
	 * @access protected
	 *
	 * @return string CSS file handle ID.
	 */
	protected function get_file_handle_id() {
		return self::FILE_HANDLER_ID;
	}

	/**
	 * Render CSS.
	 *
	 * Parse the CSS for all the widgets and all the scheme controls.
	 *
	 * @since 1.2.0
	 * @access protected
	 */
	protected function render_css() {
		$this->render_schemes_css();
	}

	/**
	 * Get inline dependency.
	 *
	 * Retrieve the name of the stylesheet used by `wp_add_inline_style()`.
	 *
	 * @since 1.2.0
	 * @access protected
	 *
	 * @return string Name of the stylesheet.
	 */
	protected function get_inline_dependency() {
		return 'elementor-frontend';
	}

	/**
	 * Is update required.
	 *
	 * Whether the CSS requires an update. When there are new schemes or settings
	 * updates.
	 *
	 * @since 1.2.0
	 * @access protected
	 *
	 * @return bool True if the CSS requires an update, False otherwise.
	 */
	protected function is_update_required() {
		$file_last_updated = $this->get_meta( 'time' );

		$schemes_last_update = get_option( Scheme_Base::LAST_UPDATED_META );

		if ( $file_last_updated < $schemes_last_update ) {
			return true;
		}

		$elementor_settings_last_updated = get_option( Settings::UPDATE_TIME_FIELD );

		if ( $file_last_updated < $elementor_settings_last_updated ) {
			return true;
		}

		return false;
	}

	/**
	 * Map Globals to Schemes
	 *
	 * Map the 4 default global keys to the 4 default scheme types
	 *
	 * @since 1.2.0
	 * @access private
	 */
	private function map_globals_to_schemes() {
		return [
			Global_Style::COLOR_PRIMARY => Schemes\Color::COLOR_1,
			Global_Style::COLOR_SECONDARY => Schemes\Color::COLOR_2,
			Global_Style::COLOR_TEXT => Schemes\Color::COLOR_3,
			Global_Style::COLOR_ACCENT => Schemes\Color::COLOR_4,
			Global_Style::TYPOGRAPHY_PRIMARY => Schemes\Typography::TYPOGRAPHY_1,
			Global_Style::TYPOGRAPHY_SECONDARY => Schemes\Typography::TYPOGRAPHY_2,
			Global_Style::TYPOGRAPHY_TEXT => Schemes\Typography::TYPOGRAPHY_3,
			Global_Style::TYPOGRAPHY_ACCENT => Schemes\Typography::TYPOGRAPHY_4,
		];
	}

	/**
	 * Render schemes CSS.
	 *
	 * Parse the CSS for all the widgets and all the scheme controls.
	 *
	 * @since 1.2.0
	 * @access private
	 */
	private function render_schemes_css() {
		$elementor = Plugin::$instance;
		$globals_schemes_map = $this->map_globals_to_schemes();

		foreach ( $elementor->widgets_manager->get_widget_types() as $widget ) {
			$scheme_controls = $widget->get_scheme_controls();

			foreach ( $scheme_controls as $control ) {
				$this->add_control_rules(
					$control, $widget->get_controls(), function( $control ) use ( $elementor, $globals_schemes_map ) {
						if ( isset( $control['global'] ) ) {
							$control['scheme']['type'] = strpos( $control['global'], 'colors' ) !== false ? 'color' : 'typography';
							$control['scheme']['value'] = $globals_schemes_map[ $control['global'] ];
						}

						$scheme_value = $elementor->schemes_manager->get_scheme_value( $control['scheme']['type'], $control['scheme']['value'] );

						if ( empty( $scheme_value ) ) {
							return null;
						}

						if ( ! empty( $control['scheme']['key'] ) ) {
							$scheme_value = $scheme_value[ $control['scheme']['key'] ];
						}

						if ( empty( $scheme_value ) ) {
							return null;
						}

						return $scheme_value;
					}, [ '{{WRAPPER}}' ], [ '.elementor-widget-' . $widget->get_name() ]
				);
			}
		}
	}
}
