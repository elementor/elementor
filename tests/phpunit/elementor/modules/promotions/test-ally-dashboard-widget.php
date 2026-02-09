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
		remove_filter( 'wp_die_handler', [ $this, 'wp_die_exception_handler' ] );
		parent::tear_down();
	}

	public function wp_die_exception_handler( $message ) {
		throw new \WPDieException( $message );
	}

	private function run_handle_click_capturing_output(): ?\WPDieException {
		add_filter( 'wp_die_handler', [ $this, 'wp_die_exception_handler' ] );
		ob_start();
		try {
			Ally_Dashboard_Widget::handle_click();
		} catch ( \WPDieException $e ) {
			ob_end_clean();
			remove_filter( 'wp_die_handler', [ $this, 'wp_die_exception_handler' ] );
			return $e;
		} finally {
			if ( ob_get_level() ) {
				ob_end_clean();
			}
			remove_filter( 'wp_die_handler', [ $this, 'wp_die_exception_handler' ] );
		}
		return null;
	}

	public function test_is_scanner_run_returns_false_by_default() {
		delete_option( Ally_Dashboard_Widget::ALLY_SCANNER_RUN );

		$result = Ally_Dashboard_Widget::is_scanner_run();

		$this->assertFalse( $result );
	}

	public function test_is_scanner_run_returns_true_after_option_set() {
		update_option( Ally_Dashboard_Widget::ALLY_SCANNER_RUN, true );

		$result = Ally_Dashboard_Widget::is_scanner_run();

		$this->assertTrue( $result );
	}

	public function test_register_ally_dashboard_widgets_adds_meta_box_to_dashboard() {
		global $wp_meta_boxes;
		$wp_meta_boxes = [];

		Ally_Dashboard_Widget::register_ally_dashboard_widgets();

		$this->assertArrayHasKey( 'dashboard', $wp_meta_boxes );
		$this->assertArrayHasKey( 'column3', $wp_meta_boxes['dashboard'] );
		$this->assertArrayHasKey( 'high', $wp_meta_boxes['dashboard']['column3'] );
		$this->assertArrayHasKey( 'e-dashboard-ally', $wp_meta_boxes['dashboard']['column3']['high'] );
		$widget = $wp_meta_boxes['dashboard']['column3']['high']['e-dashboard-ally'];
		$this->assertSame( [ Ally_Dashboard_Widget::class, 'ally_widget_render' ], $widget['callback'] );
		$this->assertStringContainsString( 'Accessibility', $widget['title'] );
	}
}
