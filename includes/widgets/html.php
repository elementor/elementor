<?php
namespace Elementor;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

/**
 * Elementor HTML widget.
 *
 * Elementor widget that insert a custom HTML code into the page.
 *
 * @since 1.0.0
 */
class Widget_Html extends Widget_Base {

	/**
	 * Get widget name.
	 *
	 * Retrieve HTML widget name.
	 *
	 * @since 1.0.0
	 * @access public
	 *
	 * @return string Widget name.
	 */
	public function get_name() {
		return 'html';
	}

	/**
	 * Get widget title.
	 *
	 * Retrieve HTML widget title.
	 *
	 * @since 1.0.0
	 * @access public
	 *
	 * @return string Widget title.
	 */
	public function get_title() {
		return __( 'HTML', 'elementor' );
	}

	/**
	 * Get widget icon.
	 *
	 * Retrieve HTML widget icon.
	 *
	 * @since 1.0.0
	 * @access public
	 *
	 * @return string Widget icon.
	 */
	public function get_icon() {
		return 'eicon-code';
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
		return [ 'html', 'code' ];
	}

	/**
	 * Register HTML widget controls.
	 *
	 * Adds different input fields to allow the user to change and customize the widget settings.
	 *
	 * @since 1.0.0
	 * @access protected
	 */
	protected function _register_controls() {
		$this->start_controls_section(
			'section_title',
			[
				'label' => __( 'HTML Code', 'elementor' ),
			]
		);

		$this->add_control(
			'html',
			[
				'label' => '',
				'type' => Controls_Manager::CODE,
				'default' => '',
				'placeholder' => __( 'Enter your code', 'elementor' ),
				'show_label' => false,
			]
		);

		$this->end_controls_section();
	}

	/**
	 * Render HTML widget output on the frontend.
	 *
	 * Written in PHP and used to generate the final HTML.
	 *
	 * @since 1.0.0
	 * @access protected
	 */
	protected function render() {
		 echo $this->get_settings_for_display( 'html' );
	}

	/**
	 * Render HTML widget output in the editor.
	 *
	 * Written as a Backbone JavaScript template and used to generate the live preview.
	 *
	 * @since 1.0.0
	 * @access protected
	 */
	protected function _content_template() {
		?>
		{{{ settings.html }}}
		<?php
	}
}
