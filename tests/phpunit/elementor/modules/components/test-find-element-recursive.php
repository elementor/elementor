<?php
namespace Elementor\Testing\Modules\Components;

use Elementor\Modules\Components\Documents\Component as Component_Document;
use Elementor\Modules\Components\Utils\Format_Component_Elements_Id;
use Elementor\Modules\Components\Widgets\Component_Instance;
use Elementor\Plugin;
use Elementor\Utils;
use ElementorEditorTesting\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Test_Find_Element_Recursive extends Elementor_Test_Base {

	const COMPONENT_INSTANCE_ID = 'component-instance';

	private bool $registered_component_widget = false;

	public function setUp(): void {
		parent::setUp();

		$this->act_as_admin();

		Plugin::$instance->documents->register_document_type(
			Component_Document::TYPE,
			Component_Document::get_class_full_name()
		);

		register_post_type( Component_Document::TYPE, [
			'label' => Component_Document::get_title(),
			'labels' => Component_Document::get_labels(),
			'public' => false,
			'supports' => Component_Document::get_supported_features(),
		] );

		if ( ! Plugin::$instance->widgets_manager->get_widget_types( Component_Instance::get_element_type() ) ) {
			Plugin::$instance->widgets_manager->register( new Component_Instance( [], [] ) );
			$this->registered_component_widget = true;
		}
	}

	public function tearDown(): void {
		$this->clean_up_components();

		if ( $this->registered_component_widget ) {
			Plugin::$instance->widgets_manager->unregister( Component_Instance::get_element_type() );
		}

		parent::tearDown();
	}

	public function test_find_element_recursive_searches_raw_child_elements_without_instantiation() {
		$target = [
			'id' => 'target-element',
			'elType' => 'unknown-element',
			'elements' => [],
		];

		$elements = [
			[
				'id' => 'parent-element',
				'elType' => 'unknown-parent',
				'elements' => [
					$target,
				],
			],
		];

		$result = Utils::find_element_recursive( $elements, $target['id'] );

		$this->assertSame( $target, $result );
	}

	public function test_find_element_recursive_searches_component_origin_elements() {
		$component_elements = [
			[
				'id' => 'component-parent',
				'elType' => 'e-flexbox',
				'settings' => [],
				'elements' => [
					[
						'id' => 'component-target',
						'elType' => 'widget',
						'widgetType' => 'e-heading',
						'settings' => [],
						'elements' => [],
					],
				],
			],
		];

		$component_id = $this->create_test_component( $component_elements );
		$formatted_elements = Format_Component_Elements_Id::format( $component_elements, [ self::COMPONENT_INSTANCE_ID ] );
		$expected = $formatted_elements[0]['elements'][0];

		$elements = [
			[
				'id' => self::COMPONENT_INSTANCE_ID,
				'elType' => 'widget',
				'widgetType' => Component_Instance::get_element_type(),
				'elements' => [],
				'settings' => [
					'component_instance' => [
						'$$type' => 'component-instance',
						'value' => [
							'component_id' => [
								'$$type' => 'number',
								'value' => $component_id,
							],
						],
					],
				],
			],
		];

		$result = Utils::find_element_recursive( $elements, $expected['id'] );

		$this->assertIsArray( $result );
		$this->assertSame( $expected['id'], $result['id'] );
		$this->assertSame( $expected['origin_id'], $result['origin_id'] );
		$this->assertSame( $expected['widgetType'], $result['widgetType'] );
	}

	private function create_test_component( array $elements ): int {
		$document = Plugin::$instance->documents->create(
			Component_Document::get_type(),
			[
				'post_title' => 'Test Component',
				'post_status' => 'publish',
			]
		);

		$document->save( [
			'elements' => $elements,
			'settings' => [],
		] );

		return $document->get_main_id();
	}

	private function clean_up_components(): void {
		$components = get_posts( [
			'post_type' => Component_Document::TYPE,
			'post_status' => 'any',
			'posts_per_page' => -1,
		] );

		foreach ( $components as $component ) {
			wp_delete_post( $component->ID, true );
		}
	}
}
