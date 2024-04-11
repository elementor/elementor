<?php

namespace Elementor\Modules\ConversionCenter\Widgets;

use Elementor\Modules\ConversionCenter\Classes\Render\Core_Render_Strategy;
use Elementor\Modules\ConversionCenter\Module as ConversionCenterModule;
use Elementor\Plugin;
use Elementor\Widget_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}

/**
 * Elementor Nested Accordion widget.
 *
 * Elementor widget that displays a collapsible display of content in an
 * accordion style.
 *
 * @since 3.15.0
 */
class Link_In_Bio extends Widget_Base {

	public function get_name() {
		return 'link-in-bio';
	}

	public function get_title() {
		return esc_html__( 'Link In Bio', 'elementor' );
	}

	public function get_icon() {
		return 'eicon-bullet-list';
	}

	public function get_categories() {
		return [ 'general' ];
	}

	public function get_keywords() {
		return [ 'buttons', 'bio', 'widget' ];
	}

	public function show_in_panel(): bool {
		return Plugin::$instance->experiments->is_feature_active( ConversionCenterModule::EXPERIMENT_NAME );
	}

	protected function register_controls() {
		$this->start_controls_section(
			'bio_section',
			[
				'label' => esc_html__( 'Bio', 'elementor-list-widget' ),
				'tab'   => \Elementor\Controls_Manager::TAB_CONTENT,
			]
		);
		$this->add_control(
			'heading',
			[
				'label'       => esc_html__( 'Heading', 'elementor-oembed-widget' ),
				'type'        => \Elementor\Controls_Manager::TEXTAREA,
				'dynamic'     => [
					'active' => true,
				],
				'placeholder' => esc_html__( 'Heading', 'elementor-oembed-widget' ),
			]
		);

		$this->end_controls_section();

		$this->add_style_tab();
	}

	private function add_style_tab() {

	}


	protected function render() {
		$render_strategy = new Core_Render_Strategy();

		$render_strategy->render( $this );
	}
}
