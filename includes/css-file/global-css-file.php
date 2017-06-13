<?php
namespace Elementor;

if ( ! defined( 'ABSPATH' ) ) exit; // Exit if accessed directly

class Global_CSS_File extends CSS_File {

	const META_KEY = '_elementor_global_css';

	const FILE_HANDLER_ID = 'elementor-global';

	/**
	 * @return array
	 */
	protected function load_meta() {
		return get_option( self::META_KEY );
	}

	/**
	 * @param string $meta
	 */
	protected function update_meta( $meta ) {
		update_option( self::META_KEY, $meta );
	}

	/**
	 * @return string
	 */
	protected function get_file_handle_id() {
		return self::FILE_HANDLER_ID;
	}

	protected function render_css() {
		$this->render_schemes_css();

		$this->render_settings_css();
	}

	/**
	 * @return string
	 */
	protected function get_file_name() {
		return 'global';
	}

	protected function get_inline_dependency() {
		return 'elementor-frontend';
	}

	/**
	 * @return bool
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

	private function render_schemes_css() {
		$elementor = Plugin::$instance;

		foreach ( $elementor->widgets_manager->get_widget_types() as $widget ) {
			$scheme_controls = $widget->get_scheme_controls();

			foreach ( $scheme_controls as $control ) {
				$this->add_control_rules( $control, $widget->get_controls(), function( $control ) use ( $elementor ) {
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
				}, [ '{{WRAPPER}}' ], [ '.elementor-widget-' . $widget->get_name() ] );
			}
		}
	}

	private function render_settings_css() {
		$container_width = absint( get_option( 'elementor_container_width' ) );

		if ( ! empty( $container_width ) ) {
			$this->stylesheet_obj->add_rules( '.elementor-section.elementor-section-boxed > .elementor-container', 'max-width:' . $container_width . 'px' );
		}

		$space_between_widgets = get_option( 'elementor_space_between_widgets' );

		if ( is_numeric( $space_between_widgets ) ) {
			$this->stylesheet_obj->add_rules( '.elementor-widget:not(:last-child)', [ 'margin-bottom' => $space_between_widgets . 'px' ] );
		}
	}
}
