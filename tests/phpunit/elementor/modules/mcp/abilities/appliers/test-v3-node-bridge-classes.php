<?php

namespace {
	if ( ! defined( 'ABSPATH' ) ) {
		exit;
	}

	if ( ! function_exists( '__' ) ) {
		function __( $text, $domain = null ) {
			return $text;
		}
	}

	if ( ! function_exists( 'esc_html__' ) ) {
		function esc_html__( $text, $domain = null ) {
			return $text;
		}
	}

	use Elementor\Modules\Mcp\Abilities\Appliers\V3_Node_Bridge;
	use PHPUnit\Framework\TestCase;

	class Test_V3_Node_Bridge_Classes extends TestCase {

		public function test_apply_classes_to_target__wrapper_writes_css_classes_setting(): void {
			$node = [
				'elType' => 'widget',
				'widgetType' => 'nav-menu',
				'settings' => [ '_css_classes' => 'existing' ],
			];

			$warning = V3_Node_Bridge::apply_classes_to_target( $node, 'wrapper', [ 'new-1', 'existing' ] );

			$this->assertNull( $warning );
			$this->assertSame( 'new-1 existing', $node['settings']['_css_classes'] );
		}

		public function test_apply_classes__legacy_wrapper_alias_delegates_to_target(): void {
			$node = [
				'elType' => 'widget',
				'widgetType' => 'nav-menu',
				'settings' => [],
			];

			V3_Node_Bridge::apply_classes( $node, [ 'a', 'b' ] );

			$this->assertSame( 'a b', $node['settings']['_css_classes'] );
		}

		public function test_apply_classes_to_target__unknown_target_returns_warning_and_does_not_write(): void {
			$node = [
				'elType' => 'widget',
				'widgetType' => 'nav-menu',
				'settings' => [],
			];

			$warning = V3_Node_Bridge::apply_classes_to_target( $node, 'nope', [ 'primary' ] );

			$this->assertIsString( $warning );
			$this->assertStringContainsString( "'nope'", $warning );
			$this->assertStringContainsString( 'nav-menu', $warning );
			$this->assertArrayNotHasKey( '_css_classes', $node['settings'] );
			$this->assertArrayNotHasKey( 'nope', $node['settings'] );
		}
	}
}
