<?php
namespace Elementor;

if ( ! defined( 'ABSPATH' ) ) exit; // Exit if accessed directly

class Widget_Sidebar extends Widget_Base {

	public static function get_name() {
		return 'sidebar';
	}

	public static function get_title() {
		return __( 'Sidebar', 'elementor' );
	}

	public static function get_icon() {
		return 'sidebar';
	}

	protected static function _register_controls() {
		global $wp_registered_sidebars;

		$options = [];

		if ( ! $wp_registered_sidebars ) {
			$options[''] = __( 'No sidebars were found', 'elementor' );
		} else {
			$options[''] = __( 'Choose Sidebar', 'elementor' );

			foreach ( $wp_registered_sidebars as $sidebar_id => $sidebar ) {
				$options[ $sidebar_id ] = $sidebar['name'];
			}
		}

		$default_key = array_keys( $options );
		$default_key = array_shift( $default_key );

		self::add_control(
			'section_sidebar',
			[
				'label' => __( 'Sidebar', 'elementor' ),
				'type' => Controls_Manager::SECTION,
			]
		);

		self::add_control( 'sidebar', [
			'label' => __( 'Choose Sidebar', 'elementor' ),
			'type' => Controls_Manager::SELECT,
			'default' => $default_key,
			'options' => $options,
			'section' => 'section_sidebar',
		] );
	}

	protected function render( $instance = [] ) {
		if ( empty( $instance['sidebar'] ) ) {
			return;
		}

		dynamic_sidebar( $instance['sidebar'] );
	}

	protected static function _content_template() {}

	public function render_plain_content( $instance = [] ) {}
}
