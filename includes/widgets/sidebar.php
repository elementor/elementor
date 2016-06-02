<?php
namespace Elementor;

if ( ! defined( 'ABSPATH' ) ) exit; // Exit if accessed directly

class Widget_Sidebar extends Widget_Base {

	public function get_id() {
		return 'sidebar';
	}

	public function get_title() {
		return __( 'Sidebar', 'elementor' );
	}

	public function get_icon() {
		return 'sidebar';
	}

	protected function _register_controls() {
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

		$this->add_control(
			'section_sidebar',
			[
				'label' => __( 'Sidebar', 'elementor' ),
				'type' => Controls_Manager::SECTION,
			]
		);

		$this->add_control( 'sidebar', [
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

	protected function content_template() {}

	public function render_plain_content( $instance = [] ) {}
}
