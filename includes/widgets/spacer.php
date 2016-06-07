<?php
namespace Elementor;

if ( ! defined( 'ABSPATH' ) ) exit; // Exit if accessed directly

class Widget_Spacer extends Widget_Base {

	public function get_id() {
		return 'spacer';
	}

	public function get_title() {
		return __( 'Spacer', 'elementor' );
	}

	public function get_categories() {
		return [ 'basic' ];
	}

	public function get_icon() {
		return 'spacer';
	}

	protected function _register_controls() {
		$this->add_control(
			'section_spacer',
			[
				'label' => __( 'Spacer', 'elementor' ),
				'type' => Controls_Manager::SECTION,
			]
		);

		$this->add_control(
			'space',
			[
				'label' => __( 'Space (PX)', 'elementor' ),
				'type' => Controls_Manager::SLIDER,
				'section' => 'section_spacer',
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
				'section' => 'section_spacer',
			]
		);
	}

	protected function render( $instance = [] ) {
		?>
		<div class="elementor-spacer">
			<div class="elementor-spacer-inner"></div>
		</div>
		<?php
	}

	protected function content_template() {
		?>
		<div class="elementor-spacer">
			<div class="elementor-spacer-inner"></div>
		</div>
		<?php
	}
}
