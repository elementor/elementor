<?php
namespace Elementor;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

/**
 * Elementor spacer widget.
 *
 * Elementor widget that inserts a space that divides various elements.
 *
 * @since 1.0.0
 */
class Widget_Spacer extends Widget_Base {

	/**
	 * Get widget name.
	 *
	 * Retrieve spacer widget name.
	 *
	 * @since 1.0.0
	 * @access public
	 *
	 * @return string Widget name.
	 */
	public function get_name() {
		return 'spacer';
	}

	/**
	 * Get widget title.
	 *
	 * Retrieve spacer widget title.
	 *
	 * @since 1.0.0
	 * @access public
	 *
	 * @return string Widget title.
	 */
	public function get_title() {
		return __( 'Spacer', 'elementor' );
	}

	/**
	 * Get widget icon.
	 *
	 * Retrieve spacer widget icon.
	 *
	 * @since 1.0.0
	 * @access public
	 *
	 * @return string Widget icon.
	 */
	public function get_icon() {
		return 'eicon-spacer';
	}

	/**
	 * Get widget categories.
	 *
	 * Retrieve the list of categories the spacer widget belongs to.
	 *
	 * Used to determine where to display the widget in the editor.
	 *
	 * @since 1.0.0
	 * @access public
	 *
	 * @return array Widget categories.
	 */
	public function get_categories() {
		return [ 'basic' ];
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
		return [ 'space' ];
	}

	/**
	 * Register spacer widget controls.
	 *
	 * Adds different input fields to allow the user to change and customize the widget settings.
	 *
	 * @since 3.1.0
	 * @access protected
	 */
	protected function register_controls() {
		$this->start_controls_section(
			'section_spacer',
			[
				'label' => __( 'Spacer', 'elementor' ),
			]
		);

		$this->add_responsive_control(
			'space',
			[
				'label' => __( 'Space', 'elementor' ),
				'type' => Controls_Manager::SLIDER,
				'default' => [
					'size' => 50,
				],
				'size_units' => [ 'px', 'vh', 'em' ],
				'range' => [
					'px' => [
						'min' => 10,
						'max' => 600,
					],
					'em' => [
						'min' => 0.1,
						'max' => 20,
					],
				],
				'selectors' => [
					'{{WRAPPER}} .elementor-spacer-inner' => 'height: {{SIZE}}{{UNIT}};',
				],
			]
		);

		$this->add_control(
			'view',
			[
				'label' => __( 'View', 'elementor' ),
				'type' => Controls_Manager::HIDDEN,
				'default' => 'traditional',
			]
		);

		$this->end_controls_section();
	}

	/**
	 * Render spacer widget output on the frontend.
	 *
	 * Written in PHP and used to generate the final HTML.
	 *
	 * @since 1.0.0
	 * @access protected
	 */
	protected function render() {
		?>
		<div class="elementor-spacer">
			<div class="elementor-spacer-inner"></div>
		</div>
		<?php
	}

	/**
	 * Render spacer widget output in the editor.
	 *
	 * Written as a Backbone JavaScript template and used to generate the live preview.
	 *
	 * @since 2.9.0
	 * @access protected
	 */
	protected function content_template() {
		?>
		<div class="elementor-spacer">
			<div class="elementor-spacer-inner"></div>
		</div>
		<?php
	}
}
