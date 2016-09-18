<?php
namespace Elementor;

if ( ! defined( 'ABSPATH' ) ) exit; // Exit if accessed directly

class Widget_Shortcode extends Widget_Base {

	public static function get_name() {
		return 'shortcode';
	}

	public static function get_title() {
		return __( 'Shortcode', 'elementor' );
	}

	public static function get_icon() {
		return 'shortcode';
	}

	protected static function _register_controls() {
		self::add_control(
			'section_shortcode',
			[
				'label' => __( 'Shortcode', 'elementor' ),
				'type' => Controls_Manager::SECTION,
			]
		);

		self::add_control(
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

	protected static function _content_template() {}
}
