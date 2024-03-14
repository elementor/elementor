<?php

namespace Elementor\Modules\MemoryGame\Widgets;

use Elementor\Controls_Manager;
use Elementor\Repeater;
use Elementor\Utils;
use Elementor\Widget_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class MemoryGame extends Widget_Base {

	public function get_name() {
		return 'memory-game';
	}

	public function get_title() {
		return esc_html__( 'Memory Game', 'elementor' );
	}

	public function get_icon() {
		return 'eicon-code';
	}

	public function get_categories() {
		return [ 'basic' ];
	}

	protected function register_controls() {

		$this->start_controls_section(
			'memory_game_content_section',
			[
				'label' => esc_html__( 'Content', 'elementor' ),
				'tab'   => Controls_Manager::TAB_CONTENT,
			]
		);

		$repeater = new Repeater();

		$repeater->add_control(
			'card_caption',
			[
				'type'    => Controls_Manager::TEXT,
				'label'   => esc_html__( 'Caption', 'elementor' ),
				'default' => esc_html__( 'A photo of stuff', 'elementor' ),
			]
		);

		$repeater->add_control(
			'card_image',
			[
				'label'   => esc_html__( 'Choose Image', 'elementor' ),
				'type'    => Controls_Manager::MEDIA,
				'default' => [
					'url' => Utils::get_placeholder_image_src(),
				],
			]
		);

		$this->add_control(
			'cards',
			[
				'label'       => esc_html__( 'Cards', 'elementor' ),
				'type'        => Controls_Manager::REPEATER,
				'fields'      => $repeater->get_controls(),
				'title_field' => '{{{ card_caption }}}',
			]
		);

		$this->end_controls_section();

		$this->start_controls_section(
			'memory_game_style_section',
			[
				'label' => esc_html__( 'Style', 'elementor' ),
				'tab'   => Controls_Manager::TAB_STYLE,
			]
		);

		$this->add_control(
			'card_border',
			[
				'label'      => esc_html__( 'Border width', 'elementor' ),
				'type'       => Controls_Manager::DIMENSIONS,
				'size_units' => [ 'px', '%', 'em', 'rem', 'vw', 'custom' ],
				'selectors'  => [
					'{{WRAPPER}} .card' => 'border-width: {{TOP}}{{UNIT}} {{RIGHT}}{{UNIT}} {{BOTTOM}}{{UNIT}} {{LEFT}}{{UNIT}};',
				],
				'default'    => [
					'size' => 4
				]
			]
		);

		$this->add_control(
			'card_background_color',
			[
				'label'      => esc_html__( 'Background Color', 'elementor' ),
				'type'       => Controls_Manager::COLOR,
				'size_units' => [ 'px', '%', 'em', 'rem', 'vw', 'custom' ],
				'selectors'  => [
					'{{WRAPPER}}' => '--e-memory-game-cover-color: {{VALUE}}',
				],
				'default'    => '#444cf7'
			]
		);

		$this->add_responsive_control(
			'gap',
			[
				'label'      => esc_html__( 'Gap', 'elementor' ),
				'type'       => Controls_Manager::SLIDER,
				'size_units' => [ 'px', '%', 'em', 'rem', 'vw', 'custom' ],
				'range'      => [
					'px'  => [
						'max'  => 50,
						'step' => 1,
					],
					'%'   => [
						'max'  => 10,
						'step' => 1,
					],
					'em'  => [
						'max'  => 3,
						'step' => 0.1,
					],
					'rem' => [
						'max'  => 2.8,
						'step' => 0.1,
					],
					'vw'  => [
						'max'  => 5,
						'step' => 0.2,
					],
				],
				'selectors'  => [
					'{{WRAPPER}}' => '--e-memory-game-gap: {{SIZE}}{{UNIT}}',
				],
				'default'    => [
					'size' => 5
				]
			]
		);

		$this->add_responsive_control(
			'columns',
			[
				'label'              => esc_html__( 'Columns', 'elementor' ),
				'type'               => Controls_Manager::SLIDER,
				'range'              => [
					'fr' => [
						'min'  => 1,
						'max'  => 8,
						'step' => 1,
					],
				],
				'default'            => [
					'size' => 4,
				],
				'mobile_default'     => [
					'size' => 2,
				],
				'selectors'          => [
					'{{WRAPPER}}' => '--e-memory-game-columns: {{SIZE}}',
				],
				'frontend_available' => true,
			]
		);

		$this->end_controls_section();

		// Style Tab End

	}

	public function duplicate_and_shuffle($inputArray) {
		// Duplicate each element
		$duplicatedArray = array_merge($inputArray, $inputArray);

		// Shuffle the duplicated array
		shuffle($duplicatedArray);

		return $duplicatedArray;
	}

	protected function render() {
		$settings = $this->get_settings_for_display();
		if ( $settings['cards'] ) {
			$cards = $this->duplicate_and_shuffle($settings['cards']);
			foreach ( $cards as $index => $item ) {
				echo '<div class="card" data-src="' . $item['card_image']['url'] . '"></div>';
			}
		}
	}

	protected function content_template() {
		?>
		<# if ( settings.cards.length ) {
		const duplicated = settings.cards.reduce((duplicated, card) => {
			duplicated.push(card);
			duplicated.push(card);
			return duplicated;
		}, []);
		function shuffleArray(array) {
			for (var i = array.length - 1; i > 0; i--) {
				var j = Math.floor(Math.random() * (i + 1));
				var temp = array[i];
				array[i] = array[j];
				array[j] = temp;
			}
		}
		shuffleArray(duplicated);
		_.each( duplicated, function( item, i ) { #>
			<div class="card" data-src="{{{ item.card_image.url }}}"></div>
		<# });
		} #>
		<?php
	}
}
