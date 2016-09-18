<?php
namespace Elementor;

if ( ! defined( 'ABSPATH' ) ) exit; // Exit if accessed directly

class Widget_Spacer extends Widget_Base {

	public static function get_name() {
		return 'spacer';
	}

	public static function get_title() {
		return __( 'Spacer', 'elementor' );
	}

	public static function get_categories() {
		return [ 'basic' ];
	}

	public static function get_icon() {
		return 'spacer';
	}

	protected static function _register_controls() {
		self::add_control(
			'section_spacer',
			[
				'label' => __( 'Spacer', 'elementor' ),
				'type' => Controls_Manager::SECTION,
			]
		);

		self::add_responsive_control(
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

		self::add_control(
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

	protected static function _content_template() {
		?>
		<div class="elementor-spacer">
			<div class="elementor-spacer-inner"></div>
		</div>
		<?php
	}
}
