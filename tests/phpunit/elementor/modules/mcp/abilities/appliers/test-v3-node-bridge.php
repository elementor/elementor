<?php

namespace Elementor {
	if ( ! class_exists( 'Elementor\\Utils', false ) ) {
		class Utils {
			public static bool $force_pro = false;

			public static function has_pro(): bool {
				return self::$force_pro;
			}
		}
	}
}

namespace {
	if ( ! defined( 'ABSPATH' ) ) {
		exit;
	}

	if ( ! function_exists( '__' ) ) {
		function __( $text, $domain = null ) {
			return $text;
		}
	}

	use Elementor\Modules\Mcp\Abilities\Appliers\V3_Node_Bridge;
	use Elementor\Utils;
	use PHPUnit\Framework\TestCase;

	class Test_V3_Node_Bridge extends TestCase {

		protected function setUp(): void {
			parent::setUp();

			if ( property_exists( Utils::class, 'force_pro' ) ) {
				Utils::$force_pro = false;
			}
		}

		public function test_is_v3_node__true_for_allowlisted_widget() {
			// Arrange.
			$node = [
				'elType' => 'widget',
				'widgetType' => 'nav-menu',
				'settings' => [],
			];

			// Act & Assert.
			$this->assertTrue( V3_Node_Bridge::is_v3_node( $node ) );
		}

		public function test_is_v3_node__false_for_non_widget_element() {
			// Arrange.
			$node = [
				'elType' => 'container',
				'widgetType' => 'nav-menu',
				'settings' => [],
			];

			// Act & Assert.
			$this->assertFalse( V3_Node_Bridge::is_v3_node( $node ) );
		}

		public function test_is_v3_node__false_for_non_allowlisted_widget() {
			// Arrange.
			$node = [
				'elType' => 'widget',
				'widgetType' => 'button',
				'settings' => [],
			];

			// Act & Assert.
			$this->assertFalse( V3_Node_Bridge::is_v3_node( $node ) );
		}

		public function test_apply_classes__merges_with_existing_and_dedupes() {
			// Arrange.
			$node = [
				'elType' => 'widget',
				'widgetType' => 'nav-menu',
				'settings' => [
					V3_Node_Bridge::V3_CSS_CLASSES_SETTING => 'existing shared',
				],
			];

			// Act.
			V3_Node_Bridge::apply_classes( $node, [ 'new', 'shared' ] );

			// Assert.
			$this->assertSame(
				'new shared existing',
				$node['settings'][ V3_Node_Bridge::V3_CSS_CLASSES_SETTING ]
			);
		}

		public function test_clear_classes__removes_css_classes_setting() {
			// Arrange.
			$node = [
				'settings' => [
					V3_Node_Bridge::V3_CSS_CLASSES_SETTING => 'menu-primary',
				],
			];

			// Act.
			V3_Node_Bridge::clear_classes( $node );

			// Assert.
			$this->assertArrayNotHasKey( V3_Node_Bridge::V3_CSS_CLASSES_SETTING, $node['settings'] );
		}

		public function test_apply_custom_css__empty_string_clears_setting() {
			// Arrange.
			$node = [
				'settings' => [
					V3_Node_Bridge::V3_CUSTOM_CSS_SETTING => 'selector { color: red; }',
				],
			];

			// Act.
			$warning = V3_Node_Bridge::apply_custom_css( $node, '   ' );

			// Assert.
			$this->assertNull( $warning );
			$this->assertArrayNotHasKey( V3_Node_Bridge::V3_CUSTOM_CSS_SETTING, $node['settings'] );
		}

		public function test_apply_custom_css__warns_and_skips_when_pro_missing() {
			if ( ! property_exists( Utils::class, 'force_pro' ) && Utils::has_pro() ) {
				$this->markTestSkipped( 'Applies only when Pro is inactive.' );
			}

			// Arrange.
			$node = [ 'settings' => [] ];

			// Act.
			$warning = V3_Node_Bridge::apply_custom_css( $node, 'color: red;' );

			// Assert.
			$this->assertIsString( $warning );
			$this->assertStringContainsString( 'Elementor Pro', $warning );
			$this->assertArrayNotHasKey( V3_Node_Bridge::V3_CUSTOM_CSS_SETTING, $node['settings'] );
		}

		public function test_apply_custom_css__warning_names_widget_type_when_pro_missing() {
			if ( ! property_exists( Utils::class, 'force_pro' ) && Utils::has_pro() ) {
				$this->markTestSkipped( 'Applies only when Pro is inactive.' );
			}

			$node = [ 'settings' => [] ];

			$warning = V3_Node_Bridge::apply_custom_css( $node, 'color: red;', 'heading' );

			$this->assertIsString( $warning );
			$this->assertStringContainsString( '`heading`', $warning );
		}

		public function test_apply_custom_css__warning_falls_back_to_generic_label() {
			if ( ! property_exists( Utils::class, 'force_pro' ) && Utils::has_pro() ) {
				$this->markTestSkipped( 'Applies only when Pro is inactive.' );
			}

			$node = [ 'settings' => [] ];

			$warning = V3_Node_Bridge::apply_custom_css( $node, 'color: red;', '' );

			$this->assertIsString( $warning );
			$this->assertStringContainsString( 'this V3 widget', $warning );
		}

		public function test_apply_custom_css__wraps_plain_declarations_when_pro_active() {
			if ( ! property_exists( Utils::class, 'force_pro' ) && ! Utils::has_pro() ) {
				$this->markTestSkipped( 'Requires Elementor Pro for custom_css bridge.' );
			}

			if ( property_exists( Utils::class, 'force_pro' ) ) {
				Utils::$force_pro = true;
			}

			// Arrange.
			$node = [ 'settings' => [] ];

			// Act.
			$warning = V3_Node_Bridge::apply_custom_css( $node, 'font-size: 2rem;' );

			// Assert.
			$this->assertNull( $warning );
			$this->assertSame(
				'selector { font-size: 2rem; }',
				$node['settings'][ V3_Node_Bridge::V3_CUSTOM_CSS_SETTING ]
			);
		}

		public function test_wrap_with_selector__does_not_double_wrap_selector_block() {
			// Arrange.
			$method = new \ReflectionMethod( V3_Node_Bridge::class, 'wrap_with_selector' );
			$method->setAccessible( true );

			// Act.
			$result = $method->invoke( null, 'selector { color: blue; }' );

			// Assert.
			$this->assertSame( 'selector { color: blue; }', $result );
		}

		public function test_wrap_with_selector__wraps_declarations_that_contain_brace_in_value() {
			// Arrange.
			$method = new \ReflectionMethod( V3_Node_Bridge::class, 'wrap_with_selector' );
			$method->setAccessible( true );

			// Act.
			$result = $method->invoke( null, 'content: "{";' );

			// Assert.
			$this->assertSame( 'selector { content: "{"; }', $result );
		}

		public function test_wrap_with_selector__wraps_plain_declaration_list() {
			// Arrange.
			$method = new \ReflectionMethod( V3_Node_Bridge::class, 'wrap_with_selector' );
			$method->setAccessible( true );

			// Act.
			$result = $method->invoke( null, 'color: red; font-size: 16px' );

			// Assert.
			$this->assertSame( 'selector { color: red; font-size: 16px; }', $result );
		}
	}
}
