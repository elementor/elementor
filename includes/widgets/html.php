<?php
namespace Elementor;

if ( ! defined( 'ABSPATH' ) ) exit; // Exit if accessed directly

class Widget_Html extends Widget_Base {

	public static function get_name() {
		return 'html';
	}

	public static function get_title() {
		return __( 'HTML', 'elementor' );
	}

	public static function get_icon() {
		return 'coding';
	}

	protected static function _register_controls() {
		self::add_control(
			'section_title',
			[
				'label' => __( 'HTML Code', 'elementor' ),
				'type' => Controls_Manager::SECTION,
			]
		);

		self::add_control(
			'html',
			[
				'label' => '',
				'type' => Controls_Manager::TEXTAREA,
				'default' => '',
				'placeholder' => __( 'Enter your embed code here', 'elementor' ),
				'section' => 'section_title',
				'show_label' => false,
			]
		);
	}

	protected function render( $instance = [] ) {
		 echo $instance['html'];
	}

	protected static function _content_template() {
		?>
		{{{ settings.html }}}
		<?php
	}
}
