<?php
namespace Elementor;

if ( ! defined( 'ABSPATH' ) ) exit; // Exit if accessed directly

class Widget_Sidebar extends Widget_Base {

	public function get_name() {
		return 'sidebar';
	}

	public function get_title() {
		return __( 'Sidebar', 'elementor' );
	}

	public function get_icon() {
		return 'eicon-sidebar';
	}

	public function get_categories() {
		return [ 'general-elements' ];
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

		$this->start_controls_section(
			'section_sidebar',
			[
				'label' => __( 'Sidebar', 'elementor' ),
			]
		);

		$this->add_control( 'sidebar', [
			'label' => __( 'Choose Sidebar', 'elementor' ),
			'type' => Controls_Manager::SELECT,
			'default' => $default_key,
			'options' => $options,
		] );

		$this->end_controls_section();
	}

	protected function render() {
		$sidebar = $this->get_settings( 'sidebar' );

		if ( empty( $sidebar ) ) {
			return;
		}

		dynamic_sidebar( $sidebar );
	}

	protected function _content_template() {}

	public function render_plain_content() {}
}
