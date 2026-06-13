<?php
namespace Elementor\Tests\Phpunit\Elementor\Modules\Promotions;

use Elementor\Modules\Promotions\Widgets\Pro_Widget_Promotion;
use ElementorEditorTesting\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Test_Pro_Widget_Promotion_Frozen_Preview extends Elementor_Test_Base {

	public function test_has_rendered_html_returns_false_when_setting_is_empty() {
		$widget = new Pro_Widget_Promotion( [], [
			'widget_name' => 'form',
			'widget_title' => 'Form',
		] );

		$reflection = new \ReflectionClass( $widget );
		$method = $reflection->getMethod( 'has_rendered_html' );
		$method->setAccessible( true );

		$result = $method->invoke( $widget );

		$this->assertFalse( $result );
	}

	public function test_has_rendered_html_returns_true_when_setting_is_present() {
		$widget = new Pro_Widget_Promotion( [
			'settings' => [
				'__rendered_html' => '<div>Some HTML</div>',
			],
		], [
			'widget_name' => 'form',
			'widget_title' => 'Form',
		] );

		$reflection = new \ReflectionClass( $widget );
		$method = $reflection->getMethod( 'has_rendered_html' );
		$method->setAccessible( true );

		$result = $method->invoke( $widget );

		$this->assertTrue( $result );
	}

	public function test_render_frozen_preview_includes_rendered_html() {
		$test_html = '<div class="test-content">Test Content</div>';
		
		$widget = new Pro_Widget_Promotion( [
			'settings' => [
				'__rendered_html' => $test_html,
			],
		], [
			'widget_name' => 'form',
			'widget_title' => 'Form',
		] );

		$reflection = new \ReflectionClass( $widget );
		$method = $reflection->getMethod( 'render_frozen_preview' );
		$method->setAccessible( true );

		ob_start();
		$method->invoke( $widget );
		$output = ob_get_clean();

		$this->assertStringContainsString( 'e-site-builder-frozen-preview', $output );
		$this->assertStringContainsString( 'e-frozen-content', $output );
		$this->assertStringContainsString( 'e-frozen-overlay', $output );
		$this->assertStringContainsString( $test_html, $output );
		$this->assertStringContainsString( 'e-promotion-delete', $output );
		$this->assertStringContainsString( 'e-promotion-go-pro', $output );
	}

	public function test_render_frozen_frontend_includes_rendered_html_without_overlay() {
		$test_html = '<div class="test-content">Frontend Content</div>';
		
		$widget = new Pro_Widget_Promotion( [
			'settings' => [
				'__rendered_html' => $test_html,
			],
		], [
			'widget_name' => 'slides',
			'widget_title' => 'Slides',
		] );

		$reflection = new \ReflectionClass( $widget );
		$method = $reflection->getMethod( 'render_frozen_frontend' );
		$method->setAccessible( true );

		ob_start();
		$method->invoke( $widget );
		$output = ob_get_clean();

		$this->assertStringContainsString( 'e-site-builder-frozen-content', $output );
		$this->assertStringContainsString( $test_html, $output );
		$this->assertStringNotContainsString( 'e-frozen-overlay', $output );
		$this->assertStringNotContainsString( 'e-promotion-delete', $output );
	}

	public function test_render_frozen_frontend_strips_document_noise_from_rendered_html() {
		$document_html = '<head><style>.headline{color:blue}</style></head>'
			. '<body><script>var wc_order_attribution = {};</script>'
			. '<div class="elementor-widget-animated-headline">Bold Style</div></body>';

		$widget = new Pro_Widget_Promotion( [
			'settings' => [
				'__rendered_html' => $document_html,
			],
		], [
			'widget_name' => 'animated-headline',
			'widget_title' => 'Animated Headline',
		] );

		$reflection = new \ReflectionClass( $widget );
		$method = $reflection->getMethod( 'render_frozen_frontend' );
		$method->setAccessible( true );

		ob_start();
		$method->invoke( $widget );
		$output = ob_get_clean();

		$this->assertStringContainsString( 'Bold Style', $output );
		$this->assertStringContainsString( '.headline{color:blue}', $output );
		$this->assertStringNotContainsString( 'wc_order_attribution', $output );
		$this->assertStringNotContainsString( '<script>', $output );
	}

	public function test_render_sanitizes_html_output() {
		$malicious_html = '<div>Safe content</div><script>alert("xss")</script>';
		
		$widget = new Pro_Widget_Promotion( [
			'settings' => [
				'__rendered_html' => $malicious_html,
			],
		], [
			'widget_name' => 'gallery',
			'widget_title' => 'Gallery',
		] );

		$reflection = new \ReflectionClass( $widget );
		$method = $reflection->getMethod( 'render_frozen_preview' );
		$method->setAccessible( true );

		ob_start();
		$method->invoke( $widget );
		$output = ob_get_clean();

		$this->assertStringContainsString( 'Safe content', $output );
		$this->assertStringNotContainsString( '<script>', $output );
		$this->assertStringNotContainsString( 'alert', $output );
	}
}
