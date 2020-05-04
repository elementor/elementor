<?php

namespace Elementor\Core\Kits\Documents\Tabs;

use Elementor\Controls_Manager;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}

class Layout_Settings extends Tab_Base {

	public function get_id() {
		return 'layout-settings';
	}

	public function get_title() {
		return __( 'Layout Settings', 'elementor' );
	}

	public function register_tab_controls() {
		$this->start_controls_section(
			'section_' . $this->get_id(),
			[
				'label' => $this->get_title(),
				'tab' => $this->get_id(),
			]
		);

		$this->add_control(
			'default_generic_fonts',
			[
				'label' => __( 'Default Generic Fonts', 'elementor' ),
				'type' => Controls_Manager::TEXT,
				'default' => 'Sans-serif',
				'description' => __( 'The list of fonts used if the chosen font is not available.', 'elementor' ),
				'label_block' => true,
			]
		);

		$this->add_control(
			'container_width',
			[
				'label' => __( 'Content Width', 'elementor' ) . ' (px)',
				'type' => Controls_Manager::NUMBER,
				'min' => 300,
				'description' => __( 'Sets the default width of the content area (Default: 1140)', 'elementor' ),
				'selectors' => [
					'.elementor-section.elementor-section-boxed > .elementor-container' => 'max-width: {{VALUE}}px',
				],
			]
		);

		$this->add_control(
			'space_between_widgets',
			[
				'label' => __( 'Widgets Space', 'elementor' ) . ' (px)',
				'type' => Controls_Manager::NUMBER,
				'min' => 0,
				'placeholder' => '20',
				'description' => __( 'Sets the default space between widgets (Default: 20)', 'elementor' ),
				'selectors' => [
					'.elementor-widget:not(:last-child)' => 'margin-bottom: {{VALUE}}px',
				],
			]
		);

		$this->add_control(
			'stretched_section_container',
			[
				'label' => __( 'Stretched Section Fit To', 'elementor' ),
				'type' => Controls_Manager::TEXT,
				'placeholder' => 'body',
				'description' => __( 'Enter parent element selector to which stretched sections will fit to (e.g. #primary / .wrapper / main etc). Leave blank to fit to page width.', 'elementor' ),
				'label_block' => true,
				'frontend_available' => true,
			]
		);

		$this->add_control(
			'page_title_selector',
			[
				'label' => __( 'Page Title Selector', 'elementor' ),
				'type' => Controls_Manager::TEXT,
				'default' => 'h1.entry-title',
				'placeholder' => 'h1.entry-title',
				'description' => __( 'Elementor lets you hide the page title. This works for themes that have "h1.entry-title" selector. If your theme\'s selector is different, please enter it above.', 'elementor' ),
				'label_block' => true,
				'selectors' => [
					// Hack to convert the value into a CSS selector.
					'' => '}{{VALUE}}{display: var(--page-title-display)',
				],
			]
		);

		$this->end_controls_section();
	}
}
