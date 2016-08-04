<?php
namespace Elementor;

if ( ! defined( 'ABSPATH' ) ) exit; // Exit if accessed directly

class Widget_Menu_anchor extends Widget_Base {

	public function get_id() {
		return 'menu-anchor';
	}

	public function get_title() {
		return __( 'Menu Anchor', 'elementor' );
	}

	public function get_icon() {
		return 'anchor';
	}

	protected function _register_controls() {
		$this->add_control(
			'section_anchor',
			[
				'label' => __( 'Anchor', 'elementor' ),
				'type' => Controls_Manager::SECTION,
			]
		);

		$this->add_control(
			'anchor_description',
			[
				'raw' => __( 'This ID will be the CSS ID you will have to use in your own page, Without #.', 'elementor' ),
				'type' => Controls_Manager::RAW_HTML,
				'section' => 'section_anchor',
				'classes' => 'elementor-control-descriptor',
			]
		);

		$this->add_control(
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

	protected function content_template() {
		?>
		<div class="elementor-menu-anchor"<%= settings.anchor ? ' id="' + settings.anchor + '"' : '' %>></div>
		<?php
	}
}
