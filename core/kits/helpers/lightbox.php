<?php

namespace Elementor\Core\Kits\Helpers;

use Elementor\Controls_Manager;
use Elementor\Core\Base\Document;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}

class Lightbox {
	const TAB = 'lightbox';

	/**
	 * @var Document
	 */
	private $document;

	/**
	 * Lightbox constructor.
	 *
	 * @param Document $document
	 */
	public function __construct( $document ) {
		$this->document = $document;
	}

	public function add_control( $id, $args, $options = [] ) {
		$this->document->add_control( $id, $args, $options );
	}

	public function start_controls_section( $id, $args = [] ) {
		$this->document->start_controls_section( $id, $args );
	}

	public function end_controls_section() {
		$this->document->end_controls_section();
	}

	public function register_controls() {
		Controls_Manager::add_tab( self::TAB, __( 'Lightbox', 'elementor' ) );

		$this->start_controls_section(
			'section_lightbox',
			[
				'label' => __( 'Lightbox', 'elementor' ),
				'tab' => self::TAB,
			]
		);

		$this->add_control(
			'global_image_lightbox',
			[
				'label' => __( 'Image Lightbox', 'elementor' ),
				'type' => Controls_Manager::SWITCHER,
				'default' => 'yes',
				'description' => __( 'Open all image links in a lightbox popup window. The lightbox will automatically work on any link that leads to an image file.', 'elementor' ),
				'frontend_available' => true,
			]
		);

		$this->add_control(
			'lightbox_enable_counter',
			[
				'label' => __( 'Counter', 'elementor' ),
				'type' => Controls_Manager::SWITCHER,
				'default' => 'yes',
				'frontend_available' => true,
			]
		);

		$this->add_control(
			'lightbox_enable_fullscreen',
			[
				'label' => __( 'Fullscreen', 'elementor' ),
				'type' => Controls_Manager::SWITCHER,
				'default' => 'yes',
				'frontend_available' => true,
			]
		);

		$this->add_control(
			'lightbox_enable_zoom',
			[
				'label' => __( 'Zoom', 'elementor' ),
				'type' => Controls_Manager::SWITCHER,
				'default' => 'yes',
				'frontend_available' => true,
			]
		);

		$this->add_control(
			'lightbox_enable_share',
			[
				'label' => __( 'Share', 'elementor' ),
				'type' => Controls_Manager::SWITCHER,
				'default' => 'yes',
				'frontend_available' => true,
			]
		);

		$this->add_control(
			'lightbox_title_src',
			[
				'label' => __( 'Title', 'elementor' ),
				'type' => Controls_Manager::SELECT,
				'options' => [
					'' => __( 'None', 'elementor' ),
					'title' => __( 'Title', 'elementor' ),
					'caption' => __( 'Caption', 'elementor' ),
					'alt' => __( 'Alt', 'elementor' ),
					'description' => __( 'Description', 'elementor' ),
				],
				'default' => 'title',
				'frontend_available' => true,
			]
		);

		$this->add_control(
			'lightbox_description_src',
			[
				'label' => __( 'Description', 'elementor' ),
				'type' => Controls_Manager::SELECT,
				'options' => [
					'' => __( 'None', 'elementor' ),
					'title' => __( 'Title', 'elementor' ),
					'caption' => __( 'Caption', 'elementor' ),
					'alt' => __( 'Alt', 'elementor' ),
					'description' => __( 'Description', 'elementor' ),
				],
				'default' => 'description',
				'frontend_available' => true,
			]
		);

		$this->add_control(
			'lightbox_color',
			[
				'label' => __( 'Background Color', 'elementor' ),
				'type' => Controls_Manager::COLOR,
				'selectors' => [
					'.elementor-lightbox' => 'background-color: {{VALUE}}',
				],
			]
		);

		$this->add_control(
			'lightbox_ui_color',
			[
				'label' => __( 'UI Color', 'elementor' ),
				'type' => Controls_Manager::COLOR,
				'selectors' => [
					'.elementor-lightbox' => '--lightbox-ui-color: {{VALUE}}',
				],
			]
		);

		$this->add_control(
			'lightbox_ui_color_hover',
			[
				'label' => __( 'UI Hover Color', 'elementor' ),
				'type' => Controls_Manager::COLOR,
				'selectors' => [
					'.elementor-lightbox' => '--lightbox-ui-color-hover: {{VALUE}}',
				],
			]
		);

		$this->add_control(
			'lightbox_text_color',
			[
				'label' => __( 'Text Color', 'elementor' ),
				'type' => Controls_Manager::COLOR,
				'selectors' => [
					'.elementor-lightbox' => '--lightbox-text-color: {{VALUE}}',
				],
			]
		);

		$this->add_control(
			'lightbox_icons_size',
			[
				'label' => __( 'Toolbar Icons Size', 'elementor' ),
				'type' => Controls_Manager::SLIDER,
				'selectors' => [
					'.elementor-lightbox' => '--lightbox-header-icons-size: {{SIZE}}{{UNIT}}',
				],
				'separator' => 'before',
			]
		);

		$this->add_control(
			'lightbox_slider_icons_size',
			[
				'label' => __( 'Navigation Icons Size', 'elementor' ),
				'type' => Controls_Manager::SLIDER,
				'selectors' => [
					'.elementor-lightbox' => '--lightbox-navigation-icons-size: {{SIZE}}{{UNIT}}',
				],
				'separator' => 'before',
			]
		);

		$this->end_controls_section();
	}
}
