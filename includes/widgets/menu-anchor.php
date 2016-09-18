<?php
namespace Elementor;

if ( ! defined( 'ABSPATH' ) ) exit; // Exit if accessed directly

class Widget_Menu_Anchor extends Widget_Base {

	public static function get_name() {
		return 'menu-anchor';
	}

	public static function get_title() {
		return __( 'Menu Anchor', 'elementor' );
	}

	public static function get_icon() {
		return 'anchor';
	}

	protected static function _register_controls() {
		self::add_control(
			'section_anchor',
			[
				'label' => __( 'Anchor', 'elementor' ),
				'type' => Controls_Manager::SECTION,
			]
		);

		self::add_control(
			'anchor_description',
			[
				'raw' => __( 'This ID will be the CSS ID you will have to use in your own page, Without #.', 'elementor' ),
				'type' => Controls_Manager::RAW_HTML,
				'section' => 'section_anchor',
				'classes' => 'elementor-control-descriptor',
			]
		);

		self::add_control(
			'anchor',
			[
				'label' => __( 'The ID of Menu Anchor.', 'elementor' ),
				'type' => Controls_Manager::TEXT,
				'placeholder' => __( 'For Example: About', 'elementor' ),
	            'label_block' => true,
				'section' => 'section_anchor',
			]
		);
	}

	protected function render( $instance = [] ) {
		if ( ! empty( $instance['anchor'] ) ) {
			$this->add_render_attribute( 'inner', 'id', $instance['anchor'] );
		}

		$this->add_render_attribute( 'inner', 'class', 'elementor-menu-anchor' );
		?>
		<div <?php echo $this->get_render_attribute_string( 'inner' ); ?>></div>
		<?php
	}

	protected static function _content_template() {
		?>
		<div class="elementor-menu-anchor"{{{ settings.anchor ? ' id="' + settings.anchor + '"' : '' }}}></div>
		<?php
	}
}
