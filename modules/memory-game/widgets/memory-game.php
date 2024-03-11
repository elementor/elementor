<?php


namespace Elementor\Modules\MemoryGame\Widgets;

use Elementor\Controls_Manager;
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

	public function get_keywords() {
		return [ 'memory', 'game' ];
	}

	protected function register_controls() {

		// Content Tab Start

		$this->start_controls_section(
			'section_title',
			[
				'label' => esc_html__( 'Title', 'elementor' ),
				'tab'   => \Elementor\Controls_Manager::TAB_CONTENT,
			]
		);
		$this->add_control(
			'columns',
			[
				'label'   => esc_html__( 'Columns count', 'elementor' ),
				'type'    => \Elementor\Controls_Manager::NUMBER,
				'default' => 4,
			]
		);
		$this->add_control(
			'cards',
			[
				'label'       => esc_html__( 'Cards', 'elementor' ),
				'type'        => \Elementor\Controls_Manager::REPEATER,
				'fields'      => [
					[
						'name'        => 'card_caption',
						'label'       => esc_html__( 'Caption', 'elementor' ),
						'type'        => \Elementor\Controls_Manager::TEXT,
						'default'     => esc_html__( 'A photo of stuff', 'elementor' ),
						'label_block' => true,
					],
					[
						'name'    => 'card_image',
						'label'   => esc_html__( 'Choose Image', 'elementor' ),
						'type'    => Controls_Manager::MEDIA,
						'dynamic' => [
							'active' => true,
						],
						'default' => [
							'url' => Utils::get_placeholder_image_src(),
						],
					]
				],
				'title_field' => '{{{ card_caption }}}',
			]
		);

		$this->end_controls_section();

		// Style Tab End

	}

	public function duplicate_and_shuffle($inputArray) {
		// Duplicate each element
		$duplicatedArray = array_reduce($inputArray, function ($carry, $item) {
			$carry[] = $item;
			$carry[] = $item;
			return $carry;
		}, []);

		// Shuffle the duplicated array
		shuffle($duplicatedArray);

		return $duplicatedArray;
	}

	protected function render() {
		$settings = $this->get_settings_for_display();
		if ( $settings['cards'] ) {
			$cards = $this->duplicate_and_shuffle($settings['cards']);
			foreach ( $cards as $index => $item ) {
				if($index % $settings['columns'] === 0) {
					echo '<div class="row">';
				}
				echo '<div class="card" data-src="' . $item['card_image']['url'] . '"></div>';
				if($index % $settings['columns'] === $settings['columns'] - 1) {
					echo '</div>';
				}
			}
			if(count($cards) % $settings['columns'] !== 0) {
				echo '</div>';
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
		_.each( duplicated, function( item, i ) {
			if(i % settings.columns === 0) { #>
				<div class="row">
			<# } #>
			<div class="card" data-src="{{{ item.card_image.url }}}"></div>
			<# if(i % settings.columns === settings.columns - 1) { #>
				</div>
			<# }
		});
		if(duplicated.length % settings.column !== 0) { #>
		</div>
		<# }
		} #>
		<?php
	}
}
