<?php
namespace Elementor;

if ( ! defined( 'ABSPATH' ) ) exit; // Exit if accessed directly

class Widget_Menu_Anchor extends Widget_Base {

	public function get_name() {
		return 'menu-anchor';
	}

	public function get_title() {
		return __( 'Menu Anchor', 'elementor' );
	}

	public function get_icon() {
		return 'eicon-anchor';
	}

	public function get_categories() {
		return [ 'general-elements' ];
	}

	protected function _register_controls() {
		$this->start_controls_section(
			'section_anchor',
			[
				'label' => __( 'Anchor', 'elementor' ),
			]
		);

		$this->add_control(
			'anchor_description',
			[
				'raw' => __( 'This ID will be the CSS ID you will have to use in your own page, Without #.', 'elementor' ),
				'type' => Controls_Manager::RAW_HTML,
				'content_classes' => 'elementor-descriptor',
			]
		);

		$this->add_control(
			'anchor',
			[
				'label' => __( 'The ID of Menu Anchor.', 'elementor' ),
				'type' => Controls_Manager::TEXT,
				'placeholder' => __( 'For Example: About', 'elementor' ),
	            'label_block' => true,
			]
		);

		$this->end_controls_section();
	}

	protected function render() {
		$anchor = $this->get_settings( 'anchor' );

		if ( ! empty( $anchor ) ) {
			$this->add_render_attribute( 'inner', 'id', $anchor );
		}

		$this->add_render_attribute( 'inner', 'class', 'elementor-menu-anchor' );
		?>
		<div <?php echo $this->get_render_attribute_string( 'inner' ); ?>></div>
		<?php
	}

	protected function _content_template() {
		?>
		<div class="elementor-menu-anchor"{{{ settings.anchor ? ' id="' + settings.anchor + '"' : '' }}}></div>
		<?php
	}
}
