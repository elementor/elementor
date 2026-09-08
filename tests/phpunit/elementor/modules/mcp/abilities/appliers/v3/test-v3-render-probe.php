<?php

namespace Elementor {
	if ( ! class_exists( 'Elementor\Plugin' ) ) {
		class Plugin {
			public static $instance = null;
		}
	}
}

namespace Elementor\Testing\Modules\Mcp\Abilities\Appliers\V3 {

	use Elementor\Modules\Mcp\Abilities\Appliers\V3\V3_Render_Probe;
	use Elementor\Plugin;
	use PHPUnit\Framework\TestCase;

	if ( ! defined( 'ABSPATH' ) ) {
		exit;
	}

	class Test_V3_Render_Probe extends TestCase {

		private $original_plugin_instance;

		protected function setUp(): void {
			$this->original_plugin_instance = Plugin::$instance;
		}

		protected function tearDown(): void {
			Plugin::$instance = $this->original_plugin_instance;
		}

		public function test_probe__returns_ok_when_widgets_manager_missing() {
			// Arrange.
			Plugin::$instance = null;

			// Act.
			$result = V3_Render_Probe::probe( 'anything', [] );

			// Assert.
			$this->assertTrue( $result['ok'] );
			$this->assertFalse( $result['timed_out'] );
			$this->assertNull( $result['error'] );
		}

		public function test_probe__returns_ok_when_widget_type_is_unknown() {
			// Arrange.
			$this->install_widgets_manager( [] );

			// Act.
			$result = V3_Render_Probe::probe( 'unknown', [] );

			// Assert.
			$this->assertTrue( $result['ok'] );
		}

		public function test_probe__returns_ok_for_atomic_widget_stub() {
			// Arrange.
			$stub = new class {
				public static function get_props_schema(): array {
					return [];
				}
				public function render_content(): void {
					throw new \RuntimeException( 'should never be reached' );
				}
			};
			$this->install_widgets_manager( [ 'atomic' => $stub ] );

			// Act.
			$result = V3_Render_Probe::probe( 'atomic', [ 'foo' => 'bar' ] );

			// Assert.
			$this->assertTrue( $result['ok'] );
			$this->assertNull( $result['error'] );
		}

		public function test_probe__returns_ok_for_widget_that_renders_cleanly() {
			// Arrange.
			$widget = $this->make_probe_widget( static function ( array $settings ) {
				return;
			} );
			$this->install_widgets_manager( [ 'ok-widget' => $widget ] );

			// Act.
			$result = V3_Render_Probe::probe( 'ok-widget', [ 'title' => 'Hello' ] );

			// Assert.
			$this->assertTrue( $result['ok'] );
			$this->assertNull( $result['error'] );
			$this->assertFalse( $result['timed_out'] );
		}

		public function test_probe__catches_throwable_from_render() {
			// Arrange.
			$widget = $this->make_probe_widget( static function ( array $settings ) {
				throw new \RuntimeException( 'boom: ' . ( $settings['line_height'] ?? 'n/a' ) );
			} );
			$this->install_widgets_manager( [ 'fatal-widget' => $widget ] );

			// Act.
			$result = V3_Render_Probe::probe( 'fatal-widget', [ 'line_height' => '1.5' ] );

			// Assert.
			$this->assertFalse( $result['ok'] );
			$this->assertSame( \RuntimeException::class, $result['error_class'] );
			$this->assertStringContainsString( 'boom: 1.5', (string) $result['error'] );
		}

		public function test_probe__promotes_php_error_to_exception() {
			// Arrange.
			$widget = $this->make_probe_widget( static function () {
				trigger_error( 'promoted', E_USER_ERROR );
			} );
			$this->install_widgets_manager( [ 'error-widget' => $widget ] );

			// Act.
			$result = V3_Render_Probe::probe( 'error-widget', [] );

			// Assert.
			$this->assertFalse( $result['ok'] );
			$this->assertNotNull( $result['error'] );
		}

		public function test_probe__returns_timed_out_when_render_exceeds_budget() {
			// Arrange.
			$widget = $this->make_probe_widget( static function () {
				usleep( ( V3_Render_Probe::TIMEOUT_MS + 50 ) * 1000 );
			} );
			$this->install_widgets_manager( [ 'slow-widget' => $widget ] );

			// Act.
			$result = V3_Render_Probe::probe( 'slow-widget', [] );

			// Assert.
			$this->assertTrue( $result['ok'] );
			$this->assertTrue( $result['timed_out'] );
		}

		public function test_probe__catches_error_subclass_from_render() {
			// A PHP TypeError is a `\Error` (7+), not an `\Exception`. Verify the outer
			// `catch ( \Throwable )` catches it and surfaces the class name.
			$widget = $this->make_probe_widget( static function () {
				throw new \TypeError( 'shape mismatch' );
			} );
			$this->install_widgets_manager( [ 'type-error-widget' => $widget ] );

			$result = V3_Render_Probe::probe( 'type-error-widget', [] );

			$this->assertFalse( $result['ok'] );
			$this->assertSame( \TypeError::class, $result['error_class'] );
			$this->assertStringContainsString( 'shape mismatch', (string) $result['error'] );
		}

		public function test_probe__injects_settings_via_data_property() {
			// Arrange.
			$captured = null;
			$widget = $this->make_probe_widget( static function ( array $settings ) use ( &$captured ) {
				$captured = $settings;
			} );
			$this->install_widgets_manager( [ 'capture-widget' => $widget ] );

			// Act.
			V3_Render_Probe::probe( 'capture-widget', [ 'a' => 1, 'b' => 2 ] );

			// Assert.
			$this->assertSame( [ 'a' => 1, 'b' => 2 ], $captured );
		}

		/**
		 * @param callable(array):void $on_render
		 */
		private function make_probe_widget( callable $on_render ): object {
			return new class( $on_render ) {
				private $data = [];
				private $on_render;

				public function __construct( callable $on_render ) {
					$this->on_render = $on_render;
				}

				public function render_content(): void {
					( $this->on_render )( $this->data['settings'] ?? [] );
				}
			};
		}

		/**
		 * @param array<string, object> $widgets_by_type
		 */
		private function install_widgets_manager( array $widgets_by_type ): void {
			$manager = new class( $widgets_by_type ) {
				private array $widgets;

				public function __construct( array $widgets ) {
					$this->widgets = $widgets;
				}

				public function get_widget_types( $type ) {
					return $this->widgets[ $type ] ?? null;
				}
			};

			$plugin_stub = new class {
				public $widgets_manager;
			};
			$plugin_stub->widgets_manager = $manager;

			Plugin::$instance = $plugin_stub;
		}
	}
}
