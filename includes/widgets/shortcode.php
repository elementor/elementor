<?php
namespace Elementor;

if ( ! defined( 'ABSPATH' ) ) exit; // Exit if accessed directly

class Widget_Shortcode extends Widget_Base {

	public function get_name() {
		return 'shortcode';
	}

	public function get_title() {
		return __( 'Shortcode', 'elementor' );
	}

	public function get_icon() {
		return 'eicon-shortcode';
	}

	public function get_categories() {
		return [ 'general-elements' ];
	}

	public function is_reload_preview_required() {
		return true;
	}

	protected function _register_controls() {
		$this->start_controls_section(
			'section_shortcode',
			[
				'label' => __( 'Shortcode', 'elementor' ),
			]
		);

		$this->add_control(
			'shortcode',
			[
				'label' => __( 'Insert your shortcode here', 'elementor' ),
				'type' => Controls_Manager::TEXTAREA,
				'placeholder' => '[gallery id="123" size="medium"]',
				'default' => '',
			]
		);

		$this->end_controls_section();
	}

	protected function render() {
		$shortcode = $this->get_settings( 'shortcode' );

		$shortcode = do_shortcode( shortcode_unautop( $shortcode ) );
		?>
		<div class="elementor-shortcode"><?php echo $shortcode; ?></div>
		<?php
	}

	public function render_plain_content() {
		// In plain mode, render without shortcode
		echo $this->get_settings( 'shortcode' );
	}

	protected function _content_template() {}
}
