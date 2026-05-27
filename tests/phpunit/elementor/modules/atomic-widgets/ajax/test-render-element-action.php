<?php

namespace Elementor\Testing\Modules\AtomicWidgets\Ajax;

use Elementor\Modules\AtomicWidgets\Ajax\Render_Element_Action;
use Elementor\Modules\AtomicWidgets\Elements\Atomic_Heading\Atomic_Heading;
use ElementorEditorTesting\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Test_Render_Element_Action extends Elementor_Test_Base {
	public function test_handle__renders_atomic_element_html(): void {
		// Arrange.
		$this->act_as_admin();
		$post_id = $this->factory()->documents->create_and_get()->get_id();

		$payload = [
			'editor_post_id' => $post_id,
			'data' => [
				'id' => 'e1234567',
				'elType' => 'widget',
				'settings' => [],
				'widgetType' => Atomic_Heading::get_element_type(),
			],
		];

		// Act.
		$result = ( new Render_Element_Action() )->handle( $payload );

		// Assert.
		$this->assertArrayHasKey( 'render', $result );
		$this->assertIsString( $result['render'] );
		$this->assertNotEmpty( $result['render'] );
	}

	public function test_handle__throws_when_payload_missing_post_id(): void {
		// Arrange.
		$this->act_as_admin();

		// Assert.
		$this->expectException( \Exception::class );

		// Act.
		( new Render_Element_Action() )->handle( [
			'data' => [ 'elType' => 'widget' ],
		] );
	}

	public function test_handle__throws_when_payload_missing_data(): void {
		// Arrange.
		$this->act_as_admin();
		$post_id = $this->factory()->documents->create_and_get()->get_id();

		// Assert.
		$this->expectException( \Exception::class );

		// Act.
		( new Render_Element_Action() )->handle( [
			'editor_post_id' => $post_id,
		] );
	}

	public function test_handle__throws_for_unauthorised_user(): void {
		// Arrange.
		$post_id = $this->factory()->documents->create_and_get()->get_id();
		wp_set_current_user( 0 );

		// Assert.
		$this->expectException( \Exception::class );

		// Act.
		( new Render_Element_Action() )->handle( [
			'editor_post_id' => $post_id,
			'data' => [
				'id' => 'e1234567',
				'elType' => 'widget',
				'settings' => [],
				'widgetType' => Atomic_Heading::get_element_type(),
			],
		] );
	}

	public function test_handle__throws_when_element_data_invalid(): void {
		// Arrange.
		$this->act_as_admin();
		$post_id = $this->factory()->documents->create_and_get()->get_id();

		// Assert.
		$this->expectException( \Exception::class );

		// Act.
		( new Render_Element_Action() )->handle( [
			'editor_post_id' => $post_id,
			'data' => [
				'elType' => 'widget',
				'widgetType' => 'non-existent-widget-type',
			],
		] );
	}
}
