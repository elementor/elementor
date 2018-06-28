<?php
namespace Elementor;

use Elementor\Modules\DynamicTags\Module as TagsModule;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

/**
 * Elementor google maps widget.
 *
 * Elementor widget that displays an embedded google map.
 *
 * @since 1.0.0
 */
class Widget_Google_Maps extends Widget_Base {

	/**
	 * Get widget name.
	 *
	 * Retrieve google maps widget name.
	 *
	 * @since 1.0.0
	 * @access public
	 *
	 * @return string Widget name.
	 */
	public function get_name() {
		return 'google_maps';
	}

	/**
	 * Get widget title.
	 *
	 * Retrieve google maps widget title.
	 *
	 * @since 1.0.0
	 * @access public
	 *
	 * @return string Widget title.
	 */
	public function get_title() {
		return __( 'Google Maps', 'elementor' );
	}

	/**
	 * Get widget icon.
	 *
	 * Retrieve google maps widget icon.
	 *
	 * @since 1.0.0
	 * @access public
	 *
	 * @return string Widget icon.
	 */
	public function get_icon() {
		return 'eicon-google-maps';
	}

	/**
	 * Get widget categories.
	 *
	 * Retrieve the list of categories the google maps widget belongs to.
	 *
	 * Used to determine where to display the widget in the editor.
	 *
	 * @since 2.0.0
	 * @access public
	 *
	 * @return array Widget categories.
	 */
	public function get_categories() {
		return [ 'basic' ];
	}

	/**
	 * Get widget keywords.
	 *
	 * Retrieve the list of keywords the widget belongs to.
	 *
	 * @since 2.1.0
	 * @access public
	 *
	 * @return array Widget keywords.
	 */
	public function get_keywords() {
		return [ 'google', 'map', 'embed' ];
	}

	/**
	 * Register google maps widget controls.
	 *
	 * Adds different input fields to allow the user to change and customize the widget settings.
	 *
	 * @since 1.0.0
	 * @access protected
	 */
	protected function _register_controls() {
		$this->start_controls_section(
			'section_map',
			[
				'label' => __( 'Map', 'elementor' ),
			]
		);

		$default_address = __( 'London Eye, London, United Kingdom', 'elementor' );
		$this->add_control(
			'address',
			[
				'label' => __( 'Address', 'elementor' ),
				'type' => Controls_Manager::TEXT,
				'dynamic' => [
					'active' => true,
					'categories' => [
						TagsModule::POST_META_CATEGORY,
					],
				],
				'placeholder' => $default_address,
				'default' => $default_address,
				'label_block' => true,
			]
		);

		$this->add_control(
			'zoom',
			[
				'label' => __( 'Zoom Level', 'elementor' ),
				'type' => Controls_Manager::SLIDER,
				'default' => [
					'size' => 10,
				],
				'range' => [
					'px' => [
						'min' => 1,
						'max' => 20,
					],
				],
			]
		);

		$this->add_responsive_control(
			'height',
			[
				'label' => __( 'Height', 'elementor' ),
				'type' => Controls_Manager::SLIDER,
				'range' => [
					'px' => [
						'min' => 40,
						'max' => 1440,
					],
				],
				'selectors' => [
					'{{WRAPPER}} iframe' => 'height: {{SIZE}}{{UNIT}};',
				],
			]
		);

		$this->add_control(
			'prevent_scroll',
			[
				'label' => __( 'Prevent Scroll', 'elementor' ),
				'type' => Controls_Manager::SWITCHER,
				'default' => 'yes',
				'selectors' => [
					'{{WRAPPER}} iframe' => 'pointer-events: none;',
				],
			]
		);

		$this->add_control(
			'view',
			[
				'label' => __( 'View', 'elementor' ),
				'type' => Controls_Manager::HIDDEN,
				'default' => 'traditional',
			]
		);

		$this->end_controls_section();
	}

	/**
	 * Render google maps widget output on the frontend.
	 *
	 * Written in PHP and used to generate the final HTML.
	 *
	 * @since 1.0.0
	 * @access protected
	 */
	protected function render() {
		$settings = $this->get_settings_for_display();

		if ( empty( $settings['address'] ) ) {
			return;
		}

		if ( 0 === absint( $settings['zoom']['size'] ) ) {
			$settings['zoom']['size'] = 10;
		}

		printf(
			'<div class="elementor-custom-embed"><iframe frameborder="0" scrolling="no" marginheight="0" marginwidth="0" src="https://maps.google.com/maps?q=%s&amp;t=m&amp;z=%d&amp;output=embed&amp;iwloc=near" aria-label="%s"></iframe></div>',
			rawurlencode( $settings['address'] ),
			absint( $settings['zoom']['size'] ),
			esc_attr( $settings['address'] )
		);
	}

	/**
	 * Render google maps widget output in the editor.
	 *
	 * Written as a Backbone JavaScript template and used to generate the live preview.
	 *
	 * @since 1.0.0
	 * @access protected
	 */
	protected function _content_template() {}
}
