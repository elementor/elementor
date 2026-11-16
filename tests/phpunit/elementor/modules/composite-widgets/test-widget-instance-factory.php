<?php

namespace Elementor\Testing\Modules\CompositeWidgets;

use Elementor\Modules\CompositeWidgets\Instance\Widget_Instance_Factory;
use Elementor\Plugin;
use ElementorEditorTesting\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Test_Widget_Instance_Factory extends Elementor_Test_Base {
	const ICON_BUTTON_PATH = __DIR__ . '/../../../../../modules/composite-widgets/schema/examples/icon-button.json';
	const GLOBAL_CLASS_ID = 'g-123abc';

	private Widget_Instance_Factory $instance_factory;

	public function setUp(): void {
		parent::setUp();

		$this->instance_factory = new Widget_Instance_Factory();
	}

	public function test_create__gives_every_element_a_new_unique_id() {
		// Act.
		$instance = $this->instance_factory->create( $this->read_icon_button() );

		// Assert.
		$ids = array_column( $this->flatten( $instance ), 'id' );

		$this->assertCount( 3, $ids );
		$this->assertCount( 3, array_unique( array_filter( $ids ) ) );
	}

	public function test_create__rewrites_local_style_ids_and_their_class_references() {
		// Arrange.
		$definition = $this->read_icon_button();
		$definition['template']['settings']['classes']['value'][] = self::GLOBAL_CLASS_ID;

		// Act.
		$instance = $this->instance_factory->create( $definition );

		// Assert.
		$style_ids = array_keys( $instance['styles'] );

		$this->assertCount( 1, $style_ids );
		$this->assertMatchesRegularExpression( '/^e-' . preg_quote( $instance['id'], '/' ) . '-/', $style_ids[0] );
		$this->assertSame( $style_ids[0], $instance['styles'][ $style_ids[0] ]['id'] );
		$this->assertSame( [ $style_ids[0], self::GLOBAL_CLASS_ID ], $instance['settings']['classes']['value'] );
	}

	public function test_create__stamps_the_widget_marker_on_the_root_only() {
		// Act.
		$instance = $this->instance_factory->create( $this->read_icon_button() );

		// Assert.
		$this->assertSame( [ 'id' => 'elementor/icon-button', 'version' => 1 ], $instance['widget'] );

		foreach ( $instance['elements'] as $child ) {
			$this->assertArrayNotHasKey( 'widget', $child );
		}
	}

	public function test_create__locks_every_part_except_the_root() {
		// Act.
		$instance = $this->instance_factory->create( $this->read_icon_button() );

		// Assert.
		$this->assertArrayNotHasKey( 'isLocked', $instance );
		$this->assertSame( [ 'root', 'icon', 'label' ], array_column( $this->flatten( $instance ), 'part' ) );

		foreach ( $instance['elements'] as $part ) {
			$this->assertTrue( $part['isLocked'] );
		}
	}

	public function test_create__keeps_slots_and_leaves_slot_content_unlocked() {
		// Arrange.
		$definition = $this->read_icon_button();
		$definition['template']['elements'][] = [
			'elType' => 'e-div-block',
			'part' => 'content',
			'slot' => true,
			'elements' => [
				[ 'elType' => 'widget', 'widgetType' => 'e-heading' ],
			],
		];

		// Act.
		$instance = $this->instance_factory->create( $definition );

		// Assert.
		$slot = $instance['elements'][2];

		$this->assertTrue( $slot['slot'] );
		$this->assertTrue( $slot['isLocked'] );
		$this->assertArrayNotHasKey( 'isLocked', $slot['elements'][0] );
	}

	public function test_create__does_not_mutate_the_definition() {
		// Arrange.
		$definition = $this->read_icon_button();
		$original = $definition;

		// Act.
		$this->instance_factory->create( $definition );

		// Assert.
		$this->assertSame( $original, $definition );
	}

	public function test_create__markers_and_locks_survive_a_document_save() {
		// Arrange.
		$this->act_as_admin();
		$definition = $this->read_icon_button();
		// The e-svg default URL fails validation where assets are served from file://.
		$definition['template']['elements'][0]['widgetType'] = 'e-heading';
		$instance = $this->instance_factory->create( $definition );
		$post = $this->factory()->create_and_get_custom_post( [] );
		$document = Plugin::$instance->documents->get( $post->ID );

		// Act.
		$document->save( [ 'elements' => [ $instance ] ] );

		// Assert.
		$saved = Plugin::$instance->documents->get( $post->ID, false )->get_elements_data()[0];

		$this->assertSame( $instance['id'], $saved['id'] );
		$this->assertSame( [ 'id' => 'elementor/icon-button', 'version' => 1 ], $saved['widget'] );
		$this->assertSame( 'root', $saved['part'] );
		$this->assertArrayNotHasKey( 'isLocked', $saved );
		$this->assertSame( [ 'icon', 'label' ], array_column( $saved['elements'], 'part' ) );
		$this->assertSame( [ true, true ], array_column( $saved['elements'], 'isLocked' ) );
	}

	private function read_icon_button(): array {
		return wp_json_file_decode( self::ICON_BUTTON_PATH, [ 'associative' => true ] );
	}

	private function flatten( array $element ): array {
		$children = array_map( [ $this, 'flatten' ], $element['elements'] ?? [] );

		return array_merge( [ $element ], ...$children );
	}
}
