<?php
namespace Elementor;

if ( ! defined( 'ABSPATH' ) ) exit; // Exit if accessed directly

class Widget_Shortcode extends Widget_Base {

	public function get_id() {
		return 'shortcode';
	}

	public function get_title() {
		return __( 'Shortcode', 'elementor' );
	}

	public function get_icon() {
		return 'shortcode';
	}

	protected function _register_controls() {
		$this->add_control(
			'section_shortcode',
			[
				'label' => __( 'Shortcode', 'elementor' ),
				'type' => Controls_Manager::SECTION,
			]
		);

		$this->add_control(
			'shortcode',
			[
				'label' => __( 'Insert your shortcode here', 'elementor' ),
				'type' => Controls_Manager::TEXTAREA,
				'placeholder' => '[gallery id="123" size="medium"]',
				'default' => '',
				'section' => 'section_shortcode',
			]
		);
	}

	protected function render( $instance = [] ) {
		$instance['shortcode'] = shortcode_unautop( $instance['shortcode'] );
		$instance['shortcode'] = do_shortcode( $instance['shortcode'] );
		?>
		<div class="elementor-shortcode"><?php echo $instance['shortcode']; ?></div>
		<?php
	}

	public function render_plain_content( $instance = [] ) {
		// In plain mode, render without shortcode
		echo $instance['shortcode'];
	}

	protected function content_template() {}
}
