<?php
namespace Elementor;

use Elementor\Core\Breakpoints\Manager as Breakpoints_Manager;
use Elementor\Modules\DynamicTags\Module as TagsModule;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

/**
 * Elementor background control.
 *
 * A base control for creating background control. Displays input fields to define
 * the background color, background image, background gradient or background video.
 *
 * @since 1.2.2
 */
class Group_Control_Background extends Group_Control_Base {

	/**
	 * Fields.
	 *
	 * Holds all the background control fields.
	 *
	 * @since 1.2.2
	 * @access protected
	 * @static
	 *
	 * @var array Background control fields.
	 */
	protected static $fields;

	/**
	 * Background Types.
	 *
	 * Holds all the available background types.
	 *
	 * @since 1.2.2
	 * @access private
	 * @static
	 *
	 * @var array
	 */
	private static $background_types;

	/**
	 * Get background control type.
	 *
	 * Retrieve the control type, in this case `background`.
	 *
	 * @since 1.0.0
	 * @access public
	 * @static
	 *
	 * @return string Control type.
	 */
	public static function get_type() {
		return 'background';
	}

	/**
	 * Get background control types.
	 *
	 * Retrieve available background types.
	 *
	 * @since 1.2.2
	 * @access public
	 * @static
	 *
	 * @return array Available background types.
	 */
	public static function get_background_types() {
		if ( null === self::$background_types ) {
			self::$background_types = self::get_default_background_types();
		}

		return self::$background_types;
	}

	/**
	 * Get Default background types.
	 *
	 * Retrieve background control initial types.
	 *
	 * @since 2.0.0
	 * @access private
	 * @static
	 *
	 * @return array Default background types.
	 */
	private static function get_default_background_types() {
		return array(
			'classic' => array(
				'title' => esc_html__( 'Classic', 'elementor' ),
				'icon' => 'eicon-paint-brush',
			),
			'gradient' => array(
				'title' => esc_html__( 'Gradient', 'elementor' ),
				'icon' => 'eicon-barcode',
			),
			'video' => array(
				'title' => esc_html__( 'Video', 'elementor' ),
				'icon' => 'eicon-video-camera',
			),
			'slideshow' => array(
				'title' => esc_html__( 'Slideshow', 'elementor' ),
				'icon' => 'eicon-slideshow',
			),
		);
	}

	/**
	 * Init fields.
	 *
	 * Initialize background control fields.
	 *
	 * @since 1.2.2
	 * @access public
	 *
	 * @return array Control fields.
	 */
	public function init_fields() {
		$active_breakpoints = Plugin::$instance->breakpoints->get_active_breakpoints();

		$location_device_args = array();
		$location_device_defaults = array(
			'default' => array(
				'unit' => '%',
			),
		);

		$angel_device_args = array();
		$angel_device_defaults = array(
			'default' => array(
				'unit' => 'deg',
			),
		);

		$position_device_args = array();
		$position_device_defaults = array(
			'default' => 'center center',
		);

		foreach ( $active_breakpoints as $breakpoint_name => $breakpoint ) {
			$location_device_args[ $breakpoint_name ] = $location_device_defaults;
			$angel_device_args[ $breakpoint_name ] = $angel_device_defaults;
			$position_device_args[ $breakpoint_name ] = $position_device_defaults;
		}

		$fields = array();

		$fields['background'] = array(
			'label' => esc_html__( 'Background Type', 'elementor' ),
			'type' => Controls_Manager::CHOOSE,
			'render_type' => 'ui',
		);

		$fields['gradient_notice'] = array(
			'type' => Controls_Manager::ALERT,
			'alert_type' => 'warning',
			'content' => esc_html__( 'Set locations and angle for each breakpoint to ensure the gradient adapts to different screen sizes.', 'elementor' ),
			'render_type' => 'ui',
			'condition' => array(
				'background' => array( 'gradient' ),
			),
		);

		$fields['color'] = array(
			'label' => esc_html__( 'Color', 'elementor' ),
			'type' => Controls_Manager::COLOR,
			'default' => '',
			'control_type' => 'content',
			'title' => esc_html__( 'Background Color', 'elementor' ),
			'selectors' => array(
				'{{SELECTOR}}' => 'background-color: {{VALUE}};',
			),
			'condition' => array(
				'background' => array( 'classic', 'gradient', 'video' ),
			),
		);

		$fields['color_stop'] = array(
			'label' => esc_html_x( 'Location', 'Background Control', 'elementor' ),
			'type' => Controls_Manager::SLIDER,
			'size_units' => array( '%', 'custom' ),
			'default' => array(
				'unit' => '%',
				'size' => 0,
			),
			'device_args' => $location_device_args,
			'responsive' => true,
			'render_type' => 'ui',
			'condition' => array(
				'background' => array( 'gradient' ),
			),
			'of_type' => 'gradient',
		);

		$fields['color_b'] = array(
			'label' => esc_html__( 'Second Color', 'elementor' ),
			'type' => Controls_Manager::COLOR,
			'default' => '#f2295b',
			'render_type' => 'ui',
			'control_type' => 'content',
			'condition' => array(
				'background' => array( 'gradient' ),
			),
			'of_type' => 'gradient',
		);

		$fields['color_b_stop'] = array(
			'label' => esc_html_x( 'Location', 'Background Control', 'elementor' ),
			'type' => Controls_Manager::SLIDER,
			'size_units' => array( '%', 'custom' ),
			'default' => array(
				'unit' => '%',
				'size' => 100,
			),
			'device_args' => $location_device_args,
			'responsive' => true,
			'render_type' => 'ui',
			'condition' => array(
				'background' => array( 'gradient' ),
			),
			'of_type' => 'gradient',
		);

		$fields['gradient_type'] = array(
			'label' => esc_html_x( 'Type', 'Background Control', 'elementor' ),
			'type' => Controls_Manager::SELECT,
			'options' => array(
				'linear' => esc_html__( 'Linear', 'elementor' ),
				'radial' => esc_html__( 'Radial', 'elementor' ),
			),
			'default' => 'linear',
			'render_type' => 'ui',
			'condition' => array(
				'background' => array( 'gradient' ),
			),
			'of_type' => 'gradient',
		);

		$fields['gradient_angle'] = array(
			'label' => esc_html__( 'Angle', 'elementor' ),
			'type' => Controls_Manager::SLIDER,
			'size_units' => array( 'deg', 'grad', 'rad', 'turn', 'custom' ),
			'default' => array(
				'unit' => 'deg',
				'size' => 180,
			),
			'device_args' => $angel_device_args,
			'responsive' => true,
			'selectors' => array(
				'{{SELECTOR}}' => 'background-color: transparent; background-image: linear-gradient({{SIZE}}{{UNIT}}, {{color.VALUE}} {{color_stop.SIZE}}{{color_stop.UNIT}}, {{color_b.VALUE}} {{color_b_stop.SIZE}}{{color_b_stop.UNIT}})',
			),
			'condition' => array(
				'background' => array( 'gradient' ),
				'gradient_type' => 'linear',
			),
			'of_type' => 'gradient',
		);

		$fields['gradient_position'] = array(
			'label' => esc_html__( 'Position', 'elementor' ),
			'type' => Controls_Manager::SELECT,
			'options' => array(
				'center center' => esc_html__( 'Center Center', 'elementor' ),
				'center left' => esc_html__( 'Center Left', 'elementor' ),
				'center right' => esc_html__( 'Center Right', 'elementor' ),
				'top center' => esc_html__( 'Top Center', 'elementor' ),
				'top left' => esc_html__( 'Top Left', 'elementor' ),
				'top right' => esc_html__( 'Top Right', 'elementor' ),
				'bottom center' => esc_html__( 'Bottom Center', 'elementor' ),
				'bottom left' => esc_html__( 'Bottom Left', 'elementor' ),
				'bottom right' => esc_html__( 'Bottom Right', 'elementor' ),
			),
			'default' => 'center center',
			'device_args' => $position_device_args,
			'responsive' => true,
			'selectors' => array(
				'{{SELECTOR}}' => 'background-color: transparent; background-image: radial-gradient(at {{VALUE}}, {{color.VALUE}} {{color_stop.SIZE}}{{color_stop.UNIT}}, {{color_b.VALUE}} {{color_b_stop.SIZE}}{{color_b_stop.UNIT}})',
			),
			'condition' => array(
				'background' => array( 'gradient' ),
				'gradient_type' => 'radial',
			),
			'of_type' => 'gradient',
		);

		$fields['image'] = array(
			'label' => esc_html__( 'Image', 'elementor' ),
			'type' => Controls_Manager::MEDIA,
			'ai' => array(
				'category' => 'background',
			),
			'dynamic' => array(
				'active' => true,
			),
			'responsive' => true,
			'title' => esc_html__( 'Background Image', 'elementor' ),
			'selectors' => array(
				'{{SELECTOR}}' => 'background-image: url("{{URL}}");',
			),
			'has_sizes' => true,
			'render_type' => 'template',
			'condition' => array(
				'background' => array( 'classic' ),
			),
		);

		$fields['position'] = array(
			'label' => esc_html__( 'Position', 'elementor' ),
			'type' => Controls_Manager::SELECT,
			'default' => '',
			'separator' => 'before',
			'responsive' => true,
			'options' => array(
				'' => esc_html__( 'Default', 'elementor' ),
				'center center' => esc_html__( 'Center Center', 'elementor' ),
				'center left' => esc_html__( 'Center Left', 'elementor' ),
				'center right' => esc_html__( 'Center Right', 'elementor' ),
				'top center' => esc_html__( 'Top Center', 'elementor' ),
				'top left' => esc_html__( 'Top Left', 'elementor' ),
				'top right' => esc_html__( 'Top Right', 'elementor' ),
				'bottom center' => esc_html__( 'Bottom Center', 'elementor' ),
				'bottom left' => esc_html__( 'Bottom Left', 'elementor' ),
				'bottom right' => esc_html__( 'Bottom Right', 'elementor' ),
				'initial' => esc_html__( 'Custom', 'elementor' ),

			),
			'selectors' => array(
				'{{SELECTOR}}' => 'background-position: {{VALUE}};',
			),
			'condition' => array(
				'background' => array( 'classic' ),
				'image[url]!' => '',
			),
		);

		$fields['xpos'] = array(
			'label' => esc_html__( 'X Position', 'elementor' ),
			'type' => Controls_Manager::SLIDER,
			'responsive' => true,
			'size_units' => array( 'px', '%', 'em', 'rem', 'vw', 'custom' ),
			'default' => array(
				'size' => 0,
			),
			'tablet_default' => array(
				'size' => 0,
			),
			'mobile_default' => array(
				'size' => 0,
			),
			'range' => array(
				'px' => array(
					'min' => -800,
					'max' => 800,
				),
				'em' => array(
					'min' => -100,
					'max' => 100,
				),
				'%' => array(
					'min' => -100,
					'max' => 100,
				),
				'vw' => array(
					'min' => -100,
					'max' => 100,
				),
			),
			'selectors' => array(
				'{{SELECTOR}}' => 'background-position: {{SIZE}}{{UNIT}} {{ypos.SIZE}}{{ypos.UNIT}}',
			),
			'condition' => array(
				'background' => array( 'classic' ),
				'position' => array( 'initial' ),
				'image[url]!' => '',
			),
			'required' => true,
		);

		$fields['ypos'] = array(
			'label' => esc_html__( 'Y Position', 'elementor' ),
			'type' => Controls_Manager::SLIDER,
			'responsive' => true,
			'size_units' => array( 'px', '%', 'em', 'rem', 'vh', 'custom' ),
			'default' => array(
				'size' => 0,
			),
			'tablet_default' => array(
				'size' => 0,
			),
			'mobile_default' => array(
				'size' => 0,
			),
			'range' => array(
				'px' => array(
					'min' => -800,
					'max' => 800,
				),
				'em' => array(
					'min' => -100,
					'max' => 100,
				),
				'%' => array(
					'min' => -100,
					'max' => 100,
				),
				'vh' => array(
					'min' => -100,
					'max' => 100,
				),
			),
			'selectors' => array(
				'{{SELECTOR}}' => 'background-position: {{xpos.SIZE}}{{xpos.UNIT}} {{SIZE}}{{UNIT}}',
			),
			'condition' => array(
				'background' => array( 'classic' ),
				'position' => array( 'initial' ),
				'image[url]!' => '',
			),
			'required' => true,
		);

		$fields['attachment'] = array(
			'label' => esc_html_x( 'Attachment', 'Background Control', 'elementor' ),
			'type' => Controls_Manager::SELECT,
			'default' => '',
			'options' => array(
				'' => esc_html__( 'Default', 'elementor' ),
				'scroll' => esc_html_x( 'Scroll', 'Background Control', 'elementor' ),
				'fixed' => esc_html_x( 'Fixed', 'Background Control', 'elementor' ),
			),
			'selectors' => array(
				'(desktop+){{SELECTOR}}' => 'background-attachment: {{VALUE}};',
			),
			'condition' => array(
				'background' => array( 'classic' ),
				'image[url]!' => '',
			),
		);

		$fields['attachment_alert'] = array(
			'type' => Controls_Manager::RAW_HTML,
			'content_classes' => 'elementor-control-field-description',
			'raw' => esc_html__( 'Note: Attachment Fixed works only on desktop.', 'elementor' ),
			'condition' => array(
				'background' => array( 'classic' ),
				'image[url]!' => '',
				'attachment' => 'fixed',
			),
		);

		$fields['repeat'] = array(
			'label' => esc_html_x( 'Repeat', 'Background Control', 'elementor' ),
			'type' => Controls_Manager::SELECT,
			'default' => '',
			'responsive' => true,
			'options' => array(
				'' => esc_html__( 'Default', 'elementor' ),
				'no-repeat' => esc_html__( 'No-repeat', 'elementor' ),
				'repeat' => esc_html__( 'Repeat', 'elementor' ),
				'repeat-x' => esc_html__( 'Repeat-x', 'elementor' ),
				'repeat-y' => esc_html__( 'Repeat-y', 'elementor' ),
			),
			'selectors' => array(
				'{{SELECTOR}}' => 'background-repeat: {{VALUE}};',
			),
			'condition' => array(
				'background' => array( 'classic' ),
				'image[url]!' => '',
			),
		);

		$fields['size'] = array(
			'label' => esc_html__( 'Display Size', 'elementor' ),
			'type' => Controls_Manager::SELECT,
			'responsive' => true,
			'default' => '',
			'options' => array(
				'' => esc_html__( 'Default', 'elementor' ),
				'auto' => esc_html__( 'Auto', 'elementor' ),
				'cover' => esc_html__( 'Cover', 'elementor' ),
				'contain' => esc_html__( 'Contain', 'elementor' ),
				'initial' => esc_html__( 'Custom', 'elementor' ),
			),
			'selectors' => array(
				'{{SELECTOR}}' => 'background-size: {{VALUE}};',
			),
			'condition' => array(
				'background' => array( 'classic' ),
				'image[url]!' => '',
			),
		);

		$fields['bg_width'] = array(
			'label' => esc_html__( 'Width', 'elementor' ),
			'type' => Controls_Manager::SLIDER,
			'responsive' => true,
			'size_units' => array( 'px', '%', 'em', 'rem', 'vw', 'custom' ),
			'range' => array(
				'px' => array(
					'max' => 1000,
				),
			),
			'default' => array(
				'size' => 100,
				'unit' => '%',
			),
			'required' => true,
			'selectors' => array(
				'{{SELECTOR}}' => 'background-size: {{SIZE}}{{UNIT}} auto',

			),
			'condition' => array(
				'background' => array( 'classic' ),
				'size' => array( 'initial' ),
				'image[url]!' => '',
			),
		);

		$fields['video_link'] = array(
			'label' => esc_html__( 'Video Link', 'elementor' ),
			'type' => Controls_Manager::TEXT,
			'placeholder' => 'https://www.youtube.com/watch?v=XHOmBV4js_E',
			'description' => esc_html__( 'YouTube/Vimeo link, or link to video file (mp4 is recommended).', 'elementor' ),
			'label_block' => true,
			'default' => '',
			'dynamic' => array(
				'active' => true,
				'categories' => array(
					TagsModule::POST_META_CATEGORY,
					TagsModule::URL_CATEGORY,
				),
			),
			'ai' => array(
				'active' => false,
			),
			'condition' => array(
				'background' => array( 'video' ),
			),
			'of_type' => 'video',
			'frontend_available' => true,
		);

		$fields['video_start'] = array(
			'label' => esc_html__( 'Start Time', 'elementor' ),
			'type' => Controls_Manager::NUMBER,
			'description' => esc_html__( 'Specify a start time (in seconds)', 'elementor' ),
			'placeholder' => 10,
			'condition' => array(
				'background' => array( 'video' ),
			),
			'of_type' => 'video',
			'frontend_available' => true,
		);

		$fields['video_end'] = array(
			'label' => esc_html__( 'End Time', 'elementor' ),
			'type' => Controls_Manager::NUMBER,
			'description' => esc_html__( 'Specify an end time (in seconds)', 'elementor' ),
			'placeholder' => 70,
			'condition' => array(
				'background' => array( 'video' ),
			),
			'of_type' => 'video',
			'frontend_available' => true,
		);

		$fields['play_once'] = array(
			'label' => esc_html__( 'Play Once', 'elementor' ),
			'type' => Controls_Manager::SWITCHER,
			'condition' => array(
				'background' => array( 'video' ),
			),
			'of_type' => 'video',
			'frontend_available' => true,
		);

		$fields['play_on_mobile'] = array(
			'label' => esc_html__( 'Play On Mobile', 'elementor' ),
			'type' => Controls_Manager::SWITCHER,
			'condition' => array(
				'background' => array( 'video' ),
			),
			'of_type' => 'video',
			'frontend_available' => true,
		);

		// This control was added to handle a bug with the Youtube Embed API. The bug: If there is a video with Privacy
		// Mode on, and at the same time the page contains another video WITHOUT privacy mode on, one of the videos
		// will not run properly. This added control allows users to align all their videos to one host (either
		// youtube.com or youtube-nocookie.com, depending on whether the user wants privacy mode on or not).
		$fields['privacy_mode'] = array(
			'label' => esc_html__( 'Privacy Mode', 'elementor' ),
			'type' => Controls_Manager::SWITCHER,
			'condition' => array(
				'background' => array( 'video' ),
			),
			'of_type' => 'video',
			'frontend_available' => true,
		);

		$fields['video_fallback'] = array(
			'label' => esc_html__( 'Background Fallback', 'elementor' ),
			'description' => esc_html__( 'This cover image will replace the background video in case that the video could not be loaded.', 'elementor' ),
			'type' => Controls_Manager::MEDIA,
			'dynamic' => array(
				'active' => true,
			),
			'condition' => array(
				'background' => array( 'video' ),
			),
			'selectors' => array(
				'{{SELECTOR}}' => 'background: url("{{URL}}") 50% 50%; background-size: cover;',
			),
			'of_type' => 'video',
		);

		$fields['slideshow_gallery'] = array(
			'label' => esc_html__( 'Images', 'elementor' ),
			'type' => Controls_Manager::GALLERY,
			'condition' => array(
				'background' => array( 'slideshow' ),
			),
			'show_label' => false,
			'of_type' => 'slideshow',
			'frontend_available' => true,
		);

		$fields['slideshow_loop'] = array(
			'label' => esc_html__( 'Infinite Loop', 'elementor' ),
			'type' => Controls_Manager::SWITCHER,
			'default' => 'yes',
			'condition' => array(
				'background' => array( 'slideshow' ),
			),
			'of_type' => 'slideshow',
			'frontend_available' => true,
		);

		$fields['slideshow_slide_duration'] = array(
			'label' => esc_html__( 'Duration', 'elementor' ) . ' (ms)',
			'type' => Controls_Manager::NUMBER,
			'default' => 5000,
			'condition' => array(
				'background' => array( 'slideshow' ),
			),
			'frontend_available' => true,
		);

		$fields['slideshow_slide_transition'] = array(
			'label' => esc_html__( 'Transition', 'elementor' ),
			'type' => Controls_Manager::SELECT,
			'default' => 'fade',
			'options' => array(
				'fade' => 'Fade',
				'slide_right' => 'Slide Right',
				'slide_left' => 'Slide Left',
				'slide_up' => 'Slide Up',
				'slide_down' => 'Slide Down',
			),
			'condition' => array(
				'background' => array( 'slideshow' ),
			),
			'of_type' => 'slideshow',
			'frontend_available' => true,
		);

		$fields['slideshow_transition_duration'] = array(
			'label' => esc_html__( 'Transition Duration', 'elementor' ) . ' (ms)',
			'type' => Controls_Manager::NUMBER,
			'default' => 500,
			'condition' => array(
				'background' => array( 'slideshow' ),
			),
			'frontend_available' => true,
		);

		$fields['slideshow_background_size'] = array(
			'label' => esc_html__( 'Background Size', 'elementor' ),
			'type' => Controls_Manager::SELECT,
			'responsive' => true,
			'default' => '',
			'options' => array(
				'' => esc_html__( 'Default', 'elementor' ),
				'auto' => esc_html__( 'Auto', 'elementor' ),
				'cover' => esc_html__( 'Cover', 'elementor' ),
				'contain' => esc_html__( 'Contain', 'elementor' ),
			),
			'selectors' => array(
				'{{WRAPPER}} .elementor-background-slideshow__slide__image' => 'background-size: {{VALUE}};',
			),
			'condition' => array(
				'background' => array( 'slideshow' ),
			),
		);

		$fields['slideshow_background_position'] = array(
			'label' => esc_html__( 'Background Position', 'elementor' ),
			'type' => Controls_Manager::SELECT,
			'default' => '',
			'responsive' => true,
			'options' => array(
				'' => esc_html__( 'Default', 'elementor' ),
				'center center' => esc_html__( 'Center Center', 'elementor' ),
				'center left' => esc_html__( 'Center Left', 'elementor' ),
				'center right' => esc_html__( 'Center Right', 'elementor' ),
				'top center' => esc_html__( 'Top Center', 'elementor' ),
				'top left' => esc_html__( 'Top Left', 'elementor' ),
				'top right' => esc_html__( 'Top Right', 'elementor' ),
				'bottom center' => esc_html__( 'Bottom Center', 'elementor' ),
				'bottom left' => esc_html__( 'Bottom Left', 'elementor' ),
				'bottom right' => esc_html__( 'Bottom Right', 'elementor' ),
			),
			'selectors' => array(
				'{{WRAPPER}} .elementor-background-slideshow__slide__image' => 'background-position: {{VALUE}};',
			),
			'condition' => array(
				'background' => array( 'slideshow' ),
			),
		);

		$fields['slideshow_lazyload'] = array(
			'label' => esc_html__( 'Lazyload', 'elementor' ),
			'type' => Controls_Manager::SWITCHER,
			'separator' => 'before',
			'condition' => array(
				'background' => array( 'slideshow' ),
			),
			'of_type' => 'slideshow',
			'frontend_available' => true,
		);

		$fields['slideshow_ken_burns'] = array(
			'label' => esc_html__( 'Ken Burns Effect', 'elementor' ),
			'type' => Controls_Manager::SWITCHER,
			'separator' => 'before',
			'condition' => array(
				'background' => array( 'slideshow' ),
			),
			'of_type' => 'slideshow',
			'frontend_available' => true,
		);

		$fields['slideshow_ken_burns_zoom_direction'] = array(
			'label' => esc_html__( 'Direction', 'elementor' ),
			'type' => Controls_Manager::SELECT,
			'default' => 'in',
			'options' => array(
				'in' => esc_html__( 'In', 'elementor' ),
				'out' => esc_html__( 'Out', 'elementor' ),
			),
			'condition' => array(
				'background' => array( 'slideshow' ),
				'slideshow_ken_burns!' => '',
			),
			'of_type' => 'slideshow',
			'frontend_available' => true,
		);

		return $fields;
	}

	/**
	 * Get child default args.
	 *
	 * Retrieve the default arguments for all the child controls for a specific group
	 * control.
	 *
	 * @since 1.2.2
	 * @access protected
	 *
	 * @return array Default arguments for all the child controls.
	 */
	protected function get_child_default_args() {
		return array(
			'types' => array( 'classic', 'gradient' ),
			'selector' => '{{WRAPPER}}:not(.elementor-motion-effects-element-type-background), {{WRAPPER}} > .elementor-motion-effects-container > .elementor-motion-effects-layer',
		);
	}

	/**
	 * Filter fields.
	 *
	 * Filter which controls to display, using `include`, `exclude`, `condition`
	 * and `of_type` arguments.
	 *
	 * @since 1.2.2
	 * @access protected
	 *
	 * @return array Control fields.
	 */
	protected function filter_fields() {
		$fields = parent::filter_fields();

		$args = $this->get_args();

		foreach ( $fields as &$field ) {
			if ( isset( $field['of_type'] ) && ! in_array( $field['of_type'], $args['types'] ) ) {
				unset( $field );
			}
		}

		return $fields;
	}

	/**
	 * Prepare fields.
	 *
	 * Process background control fields before adding them to `add_control()`.
	 *
	 * @since 1.2.2
	 * @access protected
	 *
	 * @param array $fields Background control fields.
	 *
	 * @return array Processed fields.
	 */
	protected function prepare_fields( $fields ) {
		$args = $this->get_args();

		$background_types = self::get_background_types();

		$choose_types = array();

		foreach ( $args['types'] as $type ) {
			if ( isset( $background_types[ $type ] ) ) {
				$choose_types[ $type ] = $background_types[ $type ];
			}
		}

		$fields['background']['options'] = $choose_types;

		return parent::prepare_fields( $fields );
	}

	/**
	 * Get default options.
	 *
	 * Retrieve the default options of the background control. Used to return the
	 * default options while initializing the background control.
	 *
	 * @since 1.9.0
	 * @access protected
	 *
	 * @return array Default background control options.
	 */
	protected function get_default_options() {
		return array(
			'popover' => false,
		);
	}
}
