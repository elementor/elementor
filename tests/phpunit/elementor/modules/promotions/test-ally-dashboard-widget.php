<?php
namespace Elementor\Tests\Phpunit\Elementor\Modules\Promotions;

use Elementor\Modules\Promotions\Widgets\Ally_Dashboard_Widget;
use ElementorEditorTesting\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Test_Ally_Dashboard_Widget extends Elementor_Test_Base {

	public function set_up() {
		parent::set_up();
		wp_set_current_user( self::factory()->get_administrator_user()->ID );
		delete_option( Ally_Dashboard_Widget::ALLY_SCANNER_RUN );
	}

	public function tear_down() {
		delete_option( Ally_Dashboard_Widget::ALLY_SCANNER_RUN );
		parent::tear_down();
	}

	public function test_is_scanner_run_returns_false_by_default() {
		// Arrange.
		delete_option( Ally_Dashboard_Widget::ALLY_SCANNER_RUN );

		// Act.
		$result = Ally_Dashboard_Widget::is_scanner_run();

		// Assert.
		$this->assertFalse( $result );
	}

	public function test_is_scanner_run_returns_true_after_option_set() {
		// Arrange.
		update_option( Ally_Dashboard_Widget::ALLY_SCANNER_RUN, true );

		// Act.
		$result = Ally_Dashboard_Widget::is_scanner_run();

		// Assert.
		$this->assertTrue( $result );
	}

	public function test_register_ally_dashboard_widgets_adds_meta_box_to_dashboard() {
		// Arrange.
		global $wp_meta_boxes;
		$wp_meta_boxes = [];

		// Act.
		Ally_Dashboard_Widget::register_ally_dashboard_widgets();

		// Assert.
		$this->assertArrayHasKey( 'dashboard', $wp_meta_boxes );
		$this->assertArrayHasKey( 'column3', $wp_meta_boxes['dashboard'] );
		$this->assertArrayHasKey( 'high', $wp_meta_boxes['dashboard']['column3'] );
		$this->assertArrayHasKey( 'e-dashboard-ally', $wp_meta_boxes['dashboard']['column3']['high'] );
		$widget = $wp_meta_boxes['dashboard']['column3']['high']['e-dashboard-ally'];
		$this->assertSame( [ Ally_Dashboard_Widget::class, 'ally_widget_render' ], $widget['callback'] );
		$this->assertStringContainsString( 'Accessibility', $widget['title'] );
	}

	public function test_handle_click_updates_option_with_valid_nonce_and_capability() {
		// Arrange.
		$_REQUEST['nonce'] = wp_create_nonce( Ally_Dashboard_Widget::ALLY_NONCE_KEY );
		$wp_die_handler = function ( $message ) {
			throw new \WPDieException( $message );
		};
		add_filter( 'wp_die_handler', function () use ( $wp_die_handler ) {
			return $wp_die_handler;
		} );

		$this->assertFalse( get_option( Ally_Dashboard_Widget::ALLY_SCANNER_RUN ) );

		// Act.
		try {
			Ally_Dashboard_Widget::handle_click();
		} catch ( \WPDieException $e ) {
			$response = json_decode( $e->getMessage(), true );
			$this->assertIsArray( $response );
			$this->assertTrue( $response['success'] );
		}

		// Assert.
		$this->assertTrue( (bool) get_option( Ally_Dashboard_Widget::ALLY_SCANNER_RUN ) );
	}

	public function test_handle_click_rejects_invalid_nonce() {
		// Arrange.
		$_REQUEST['nonce'] = 'invalid-nonce';
		$wp_die_handler = function ( $message ) {
			throw new \WPDieException( $message );
		};
		add_filter( 'wp_die_handler', function () use ( $wp_die_handler ) {
			return $wp_die_handler;
		} );

		// Act & Assert.
		$this->expectException( \WPDieException::class );
		Ally_Dashboard_Widget::handle_click();
	}

	public function test_handle_click_rejects_user_without_manage_options() {
		// Arrange.
		wp_set_current_user( self::factory()->get_subscriber_user()->ID );
		$_REQUEST['nonce'] = wp_create_nonce( Ally_Dashboard_Widget::ALLY_NONCE_KEY );
		$wp_die_handler = function ( $message ) {
			throw new \WPDieException( $message );
		};
		add_filter( 'wp_die_handler', function () use ( $wp_die_handler ) {
			return $wp_die_handler;
		} );

		// Act.
		try {
			Ally_Dashboard_Widget::handle_click();
		} catch ( \WPDieException $e ) {
			$response = json_decode( $e->getMessage(), true );
			$this->assertIsArray( $response );
			$this->assertFalse( $response['success'] );
		}

		// Assert.
		$this->assertFalse( get_option( Ally_Dashboard_Widget::ALLY_SCANNER_RUN ) );
	}
}
