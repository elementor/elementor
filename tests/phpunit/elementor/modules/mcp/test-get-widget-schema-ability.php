<?php

namespace Elementor\Tests\Phpunit\Modules\Mcp;

use Elementor\Modules\Mcp\Abilities\Get_Widget_Schema_Ability;
use Elementor\Plugin;
use Elementor\Widgets_Manager;
use ElementorEditorTesting\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * @group Elementor\Modules\Mcp
 */
class Test_Get_Widget_Schema_Ability extends Elementor_Test_Base {

	private Get_Widget_Schema_Ability $ability;
	private Widgets_Manager $original_widgets_manager;

	public function setUp(): void {
		parent::setUp();
		$this->ability = new Get_Widget_Schema_Ability();
		$this->original_widgets_manager = Plugin::$instance->widgets_manager;
	}

	public function tearDown(): void {
		Plugin::$instance->widgets_manager = $this->original_widgets_manager;
		parent::tearDown();
	}

	public function test_execute__rejects_v3_widget_type() {
		$this->act_as_admin();
		$this->given_widget_manager_with_fake_v3_widget( 'fake-v3' );

		$result = $this->ability->execute( [ 'widget_type' => 'fake-v3' ] );

		$this->assertWPError( $result );
		$this->assertSame( 'elementor_v3_not_supported', $result->get_error_code() );
		$data = $result->get_error_data();
		$this->assertSame( \WP_Http::BAD_REQUEST, $data['status'] );
		$this->assertSame( 'fake-v3', $data['widget_type'] );
		$this->assertSame( 'v3', $data['version'] );
	}

	public function test_execute__returns_404_for_unknown_widget_type() {
		$this->act_as_admin();

		$result = $this->ability->execute( [ 'widget_type' => 'does-not-exist-anywhere' ] );

		$this->assertWPError( $result );
		$this->assertSame( 'elementor_not_found', $result->get_error_code() );
	}

	public function test_execute__missing_widget_type_returns_bad_request() {
		$this->act_as_admin();

		$result = $this->ability->execute( [] );

		$this->assertWPError( $result );
		$this->assertSame( 'invalid_input', $result->get_error_code() );
		$this->assertSame( \WP_Http::BAD_REQUEST, $result->get_error_data()['status'] );
	}

	private function given_widget_manager_with_fake_v3_widget( string $type ): void {
		$widget = new class() {
			public function get_config(): array {
				return [
					'controls' => [ 'title' => [ 'type' => 'text' ] ],
					'atomic_props_schema' => null,
					'title' => 'Fake V3',
				];
			}
		};

		$widgets_manager = $this->createMock( Widgets_Manager::class );
		$widgets_manager->method( 'get_widget_types' )->willReturnCallback(
			function ( $name = null ) use ( $type, $widget ) {
				if ( null === $name ) {
					return [ $type => $widget ];
				}
				return $type === $name ? $widget : null;
			}
		);
		Plugin::$instance->widgets_manager = $widgets_manager;
	}
}
