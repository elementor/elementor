<?php
namespace Elementor;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

/**
 * Elementor menu anchor widget.
 *
 * Elementor widget that allows to link and menu to a specific position on the
 * page.
 *
 * @since 1.0.0
 */
class Widget_Menu_Anchor extends Widget_Base {

	/**
	 * Get widget name.
	 *
	 * Retrieve menu anchor widget name.
	 *
	 * @since 1.0.0
	 * @access public
	 *
	 * @return string Widget name.
	 */
	public function get_name() {
		return 'menu-anchor';
	}

	/**
	 * Get widget title.
	 *
	 * Retrieve menu anchor widget title.
	 *
	 * @since 1.0.0
	 * @access public
	 *
	 * @return string Widget title.
	 */
	public function get_title() {
		return __( 'Menu Anchor', 'elementor' );
	}

	/**
	 * Get widget icon.
	 *
	 * Retrieve menu anchor widget icon.
	 *
	 * @since 1.0.0
	 * @access public
	 *
	 * @return string Widget icon.
	 */
	public function get_icon() {
		return 'eicon-anchor';
	}

	/**
	 * Get widget keywords.
	 *
	 * Retrieve the list of keywords the widget belongs to.
	 *
	 * @since 2.1.0
	 * @access public
	 *
	 * @return array Widget keywords.
	 */
	public function get_keywords() {
		return [ 'menu', 'anchor', 'link' ];
	}

	/**
	 * Register menu anchor widget controls.
	 *
	 * Adds different input fields to allow the user to change and customize the widget settings.
	 *
	 * @since 1.0.0
	 * @access protected
	 */
	protected function _register_controls() {
		$this->start_controls_section(
			'section_anchor',
			[
				'label' => __( 'Anchor', 'elementor' ),
			]
		);

		$this->add_control(
			'anchor',
			[
				'label' => __( 'The ID of Menu Anchor.', 'elementor' ),
				'type' => Controls_Manager::TEXT,
				'placeholder' => __( 'For Example: About', 'elementor' ),
				'description' => __( 'This ID will be the CSS ID you will have to use in your own page, Without #.', 'elementor' ),
				'label_block' => true,
			]
		);

		$this->add_control(
			'anchor_note',
			[
				'type' => Controls_Manager::RAW_HTML,
				'raw' => sprintf( __( 'Note: The ID link ONLY accepts these chars: %s', 'elementor' ), '`A-Z, a-z, 0-9, _ , -`' ),
				'content_classes' => 'elementor-panel-alert elementor-panel-alert-warning',
			]
		);

		$this->end_controls_section();
	}

	/**
	 * Render menu anchor widget output on the frontend.
	 *
	 * Written in PHP and used to generate the final HTML.
	 *
	 * @since 1.0.0
	 * @access protected
	 */
	protected function render() {
		$anchor = $this->get_settings_for_display( 'anchor' );

		if ( ! empty( $anchor ) ) {
			$this->add_render_attribute( 'inner', 'id', sanitize_html_class( $anchor ) );
		}

		$this->add_render_attribute( 'inner', 'class', 'elementor-menu-anchor' );
		?>
		<div <?php echo $this->get_render_attribute_string( 'inner' ); ?>></div>
		<?php
	}

	/**
	 * Render menu anchor widget output in the editor.
	 *
	 * Written as a Backbone JavaScript template and used to generate the live preview.
	 *
	 * @since 1.0.0
	 * @access protected
	 */
	protected function _content_template() {
		?>
		<div class="elementor-menu-anchor"{{{ settings.anchor ? ' id="' + settings.anchor + '"' : '' }}}></div>
		<?php
	}
}
