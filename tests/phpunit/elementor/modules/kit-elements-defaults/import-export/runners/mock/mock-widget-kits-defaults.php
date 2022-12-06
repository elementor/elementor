<?php
namespace Elementor\Testing\Modules\KitElementsDefaults\ImportExport\Runners;

use Elementor\Widget_Base;
use Elementor\Controls_Manager;

class Mock_Widget_Kits_Defaults extends Widget_Base {
	const NAME = 'mock-widget-kits-defaults';

	public function get_name() {
		return static::NAME;
	}

	protected function register_controls() {
		$this->start_controls_section( 'test-section' );

		$this->add_control(
			'text',
			[
				'label' => esc_html__( 'Text', 'elementor' ),
				'type' => Controls_Manager::TEXT,
			]
		);

		$this->add_control(
			'color',
			[
				'label' => esc_html__( 'Color', 'elementor' ),
				'type' => Controls_Manager::COLOR,
			]
		);

		$this->add_control(
			'link',
			[
				'label' => esc_html__( 'Link', 'elementor' ),
				'type' => Controls_Manager::URL,
			]
		);

		$this->add_control(
			'remove_because_has_export_false',
			[
				'label' => esc_html__( 'Text', 'elementor' ),
				'export' => false,
			]
		);

		$this->add_control(
			'removed_on_import_and_on_export_method',
			[
				'label' => esc_html__( 'Text', 'elementor' ),
			]
		);

		$this->add_control(
			'another_setting',
			[
				'label' => esc_html__( 'Text', 'elementor' ),
			]
		);

		// Should exists on import and export.
		$this->add_control(
			'mock-control-1',
			[
				'label' => esc_html__( 'Mock Control 1', 'elementor' ),
				'type' => Mock_Control_Kits_Defaults::NAME,
			]
		);

		// Should not exists on import and export.
		$this->add_control(
			'mock-control-2',
			[
				'label' => esc_html__( 'Mock Control 2', 'elementor' ),
				'type' => Mock_Control_Kits_Defaults::NAME,
			]
		);

		$this->end_controls_section();
	}

	public function on_export( $element_data ) {
		unset( $element_data['settings']['removed_on_import_and_on_export_method'] );

		return $element_data;
	}

	public function on_import( $element_data ) {
		unset( $element_data['settings']['removed_on_import_and_on_export_method'] );

		return $element_data;
	}
}
