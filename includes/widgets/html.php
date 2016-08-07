<?php
namespace Elementor;

if ( ! defined( 'ABSPATH' ) ) exit; // Exit if accessed directly

class Widget_Html extends Widget_Base {

	public function get_id() {
		return 'html';
	}

	public function get_title() {
		return __( 'HTML', 'elementor' );
	}

	public function get_icon() {
		return 'coding';
	}

	protected function _register_controls() {
		$this->add_control(
			'section_title',
			[
				'label' => __( 'HTML Code', 'elementor' ),
				'type' => Controls_Manager::SECTION,
			]
		);

		$this->add_control(
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

	protected function content_template() {
		?>
		<%= settings.code %>
		<?php
	}
}
