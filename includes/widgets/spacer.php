<?php
namespace Elementor;

if ( ! defined( 'ABSPATH' ) ) exit; // Exit if accessed directly

class Widget_Spacer extends Widget_Base {

	public function get_name() {
		return 'spacer';
	}

	public function get_title() {
		return __( 'Spacer', 'elementor' );
	}

	public function get_icon() {
		return 'eicon-spacer';
	}

	public function get_categories() {
		return [ 'basic' ];
	}

	protected function _register_controls() {
		$this->start_controls_section(
			'section_spacer',
			[
				'label' => __( 'Spacer', 'elementor' ),
			]
		);

		$this->add_responsive_control(
			'space',
			[
				'label' => __( 'Space', 'elementor' ),
				'type' => Controls_Manager::SLIDER,
				'default' => [
					'size' => 50,
				],
				'range' => [
					'px' => [
						'min' => 10,
						'max' => 600,
					],
				],
				'selectors' => [
					'{{WRAPPER}} .elementor-spacer-inner' => 'height: {{SIZE}}{{UNIT}};',
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

	protected function render() {
		?>
		<div class="elementor-spacer">
			<div class="elementor-spacer-inner"></div>
		</div>
		<?php
	}

	protected function _content_template() {
		?>
		<div class="elementor-spacer">
			<div class="elementor-spacer-inner"></div>
		</div>
		<?php
	}
}
