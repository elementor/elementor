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
		delete_option( Ally_Dashboard_Widget::ALLY_SCANNER_RUN );

		$result = Ally_Dashboard_Widget::is_scanner_run();

		$this->assertFalse( $result );
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
