<?php
namespace Elementor;

if ( ! defined( 'ABSPATH' ) ) exit; // Exit if accessed directly

class Group_Control_Background extends Group_Control_Base {

	public static function get_type() {
		return 'background';
	}

	protected function _get_child_default_args() {
		return [
			'types' => [ 'classic' ],
		];
	}

	protected function _get_controls( $args ) {
		$available_types = [
			'classic' => [
				'title' => _x( 'Classic', 'Background Control', 'elementor' ),
				'icon' => 'paint-brush',
			],
			'video' => [
				'title' => _x( 'Background Video', 'Background Control', 'elementor' ),
				'icon' => 'video-camera',
			],
		];

		$choose_types = [
			'none' => [
				'title' => _x( 'None', 'Background Control', 'elementor' ),
				'icon' => 'ban',
			],
		];

		foreach ( $args['types'] as $type ) {
			if ( isset( $available_types[ $type ] ) ) {
				$choose_types[ $type ] = $available_types[ $type ];
			}
		}

		$controls = [];

		$controls['background'] = [
			'label' => _x( 'Background Type', 'Background Control', 'elementor' ),
			'type' => Controls_Manager::CHOOSE,
			'default' => $args['default'],
			'options' => $choose_types,
			'label_block' => true,
		];

		// Background:color
		if ( in_array( 'classic', $args['types'] ) ) {
			$controls['color'] = [
				'label' => _x( 'Color', 'Background Control', 'elementor' ),
				'type' => Controls_Manager::COLOR,
				'default' => '',
				'tab' => $args['tab'],
				'title' => _x( 'Background Color', 'Background Control', 'elementor' ),
				'selectors' => [
					$args['selector'] => 'background-color: {{VALUE}};',
				],
				'condition' => [
					'background' => [ 'classic' ],
				],
			];
		}
		// End Background:color

		// Background:image
		if ( in_array( 'classic', $args['types'] ) ) {
			$controls['image'] = [
				'label' => _x( 'Image', 'Background Control', 'elementor' ),
				'type' => Controls_Manager::MEDIA,
				'title' => _x( 'Background Image', 'Background Control', 'elementor' ),
				'selectors' => [
					$args['selector'] => 'background-image: url("{{URL}}");',
				],
				'condition' => [
					'background' => [ 'classic' ],
				],
			];

			$controls['position'] = [
				'label' => _x( 'Position', 'Background Control', 'elementor' ),
				'type' => Controls_Manager::SELECT,
				'default' => '',
				'options' => [
					'' => _x( 'None', 'Background Control', 'elementor' ),
					'top left' => _x( 'Top Left', 'Background Control', 'elementor' ),
					'top center' => _x( 'Top Center', 'Background Control', 'elementor' ),
					'top right' => _x( 'Top Right', 'Background Control', 'elementor' ),
					'center left' => _x( 'Center Left', 'Background Control', 'elementor' ),
					'center center' => _x( 'Center Center', 'Background Control', 'elementor' ),
					'center right' => _x( 'Center Right', 'Background Control', 'elementor' ),
					'bottom left' => _x( 'Bottom Left', 'Background Control', 'elementor' ),
					'bottom center' => _x( 'Bottom Center', 'Background Control', 'elementor' ),
					'bottom right' => _x( 'Bottom Right', 'Background Control', 'elementor' ),
				],
				'selectors' => [
					$args['selector'] => 'background-position: {{VALUE}};',
				],
				'condition' => [
					'background' => [ 'classic' ],
					'image[url]!' => '',
				],
			];

			$controls['attachment'] = [
				'label' => _x( 'Attachment', 'Background Control', 'elementor' ),
				'type' => Controls_Manager::SELECT,
				'default' => '',
				'options' => [
					'' => _x( 'None', 'Background Control', 'elementor' ),
					'scroll' => _x( 'Scroll', 'Background Control', 'elementor' ),
					'fixed' => _x( 'Fixed', 'Background Control', 'elementor' ),
				],
				'selectors' => [
					$args['selector'] => 'background-attachment: {{VALUE}};',
				],
				'condition' => [
					'background' => [ 'classic' ],
					'image[url]!' => '',
				],
			];

			$controls['repeat'] = [
				'label' => _x( 'Repeat', 'Background Control', 'elementor' ),
				'type' => Controls_Manager::SELECT,
				'default' => '',
				'options' => [
					'' => _x( 'None', 'Background Control', 'elementor' ),
					'no-repeat' => _x( 'No-repeat', 'Background Control', 'elementor' ),
					'repeat' => _x( 'Repeat', 'Background Control', 'elementor' ),
					'repeat-x' => _x( 'Repeat-x', 'Background Control', 'elementor' ),
					'repeat-y' => _x( 'Repeat-y', 'Background Control', 'elementor' ),
				],
				'selectors' => [
					$args['selector'] => 'background-repeat: {{VALUE}};',
				],
				'condition' => [
					'background' => [ 'classic' ],
					'image[url]!' => '',
				],
			];

			$controls['size'] = [
				'label' => _x( 'Size', 'Background Control', 'elementor' ),
				'type' => Controls_Manager::SELECT,
				'default' => '',
				'options' => [
					'' => _x( 'None', 'Background Control', 'elementor' ),
					'auto' => _x( 'Auto', 'Background Control', 'elementor' ),
					'cover' => _x( 'Cover', 'Background Control', 'elementor' ),
					'contain' => _x( 'Contain', 'Background Control', 'elementor' ),
				],
				'selectors' => [
					$args['selector'] => 'background-size: {{VALUE}};',
				],
				'condition' => [
					'background' => [ 'classic' ],
					'image[url]!' => '',
				],
			];
		}
		// End Background:image

		// Background:video
		$controls['video_link'] = [
			'label' => _x( 'Video Link', 'Background Control', 'elementor' ),
			'type' => Controls_Manager::TEXT,
			'placeholder' => 'https://www.youtube.com/watch?v=9uOETcuFjbE',
			'description' => __( 'Insert YouTube link or video file (mp4 is recommended)', 'elementor' ),
			'label_block' => true,
			'default' => '',
			'condition' => [
				'background' => [ 'video' ],
			],
		];

		$controls['video_fallback'] = [
			'label' => _x( 'Background Fallback', 'Background Control', 'elementor' ),
			'type' => Controls_Manager::MEDIA,
			'label_block' => true,
			'condition' => [
				'background' => [ 'video' ],
			],
			'selectors' => [
				$args['selector'] => 'background: url("{{URL}}") 50% 50%; background-size: cover;',
			],
		];
		// End Background:video

		return $controls;
	}
}
