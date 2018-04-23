<?php
namespace Elementor;

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
class Global_CSS_File extends CSS_File {

	/**
	 * Elementor global CSS file meta key.
	 */
	const META_KEY = '_elementor_global_css';

	/**
	 * Elementor global CSS file handler ID.
	 */
	const FILE_HANDLER_ID = 'elementor-global';

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
	 * Load meta data.
	 *
	 * Retrieve the global CSS file meta data.
	 *
	 * @since 1.2.0
	 * @access protected
	 *
	 * @return array Global CSS file meta data.
	 */
	protected function load_meta() {
		return get_option( self::META_KEY );
	}

	/**
	 * Update meta data.
	 *
	 * Update the global CSS file meta data.
	 *
	 * @since 1.2.0
	 * @access protected
	 *
	 * @param string $meta New meta data.
	 */
	protected function update_meta( $meta ) {
		update_option( self::META_KEY, $meta );
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
	 * Get file name.
	 *
	 * Retrieve the name of the global CSS file.
	 *
	 * @since 1.2.0
	 * @access protected
	 *
	 * @return string File name.
	 */
	protected function get_file_name() {
		return 'global';
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
	 * Render schemes CSS.
	 *
	 * Parse the CSS for all the widgets and all the scheme controls.
	 *
	 * @since 1.2.0
	 * @access private
	 */
	private function render_schemes_css() {
		$elementor = Plugin::$instance;

		foreach ( $elementor->widgets_manager->get_widget_types() as $widget ) {
			$scheme_controls = $widget->get_scheme_controls();

			foreach ( $scheme_controls as $control ) {
				$this->add_control_rules(
					$control, $widget->get_controls(), function( $control ) use ( $elementor ) {
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
