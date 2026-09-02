<?php

namespace Elementor {
	if ( ! class_exists( 'Elementor\Utils' ) ) {
		class Utils {
			public static function generate_random_string(): string {
				return dechex( rand() );
			}
			public static function has_pro(): bool {
				return true;
			}
		}
	}
	if ( ! class_exists( 'Elementor\Plugin' ) ) {
		class Plugin {
			public static $instance = null;
		}
	}
}

namespace {
	if ( ! defined( 'ABSPATH' ) ) {
		exit;
	}

	if ( ! function_exists( 'apply_filters' ) ) {
		function apply_filters( $tag, $value ) {
			$callback = $GLOBALS['__mcp_test_filters'][ $tag ] ?? null;
			if ( is_callable( $callback ) ) {
				return $callback( $value );
			}
			return $value;
		}
	}

	use Elementor\Modules\Mcp\Abilities\Appliers\Style_Applier;
	use Elementor\Plugin;
	use PHPUnit\Framework\TestCase;

	class Test_V3_Style_Applier_Render_Probe extends TestCase {

		private $original_plugin_instance;

		protected function setUp(): void {
			$this->original_plugin_instance = Plugin::$instance ?? null;
		}

		protected function tearDown(): void {
			Plugin::$instance = $this->original_plugin_instance;
		}

		public function test_guard__drops_offending_keys_and_appends_warning() {
			// Arrange.
			$widget = $this->make_widget_that_fatals_on( 'line_height' );
			$this->install_widgets_manager( [ 'v3-heading' => $widget ] );

			$base = [ 'title' => 'Hello' ];
			$patch = [
				'color' => '#ff0000',
				'line_height' => '1.5',
				'align' => 'center',
			];
			$warnings = [];

			// Act.
			$safe = $this->invoke_guard( 'v3-heading', $base, $patch, [], $warnings );

			// Assert.
			$this->assertArrayNotHasKey( 'line_height', $safe );
			$this->assertArrayHasKey( 'color', $safe );
			$this->assertArrayHasKey( 'align', $safe );
			$this->assertCount( 1, $warnings );
			$this->assertStringContainsString( 'V3 render fatal on v3-heading', $warnings[0] );
			$this->assertStringContainsString( 'line_height', $warnings[0] );
			$this->assertStringContainsString( 'Props dropped', $warnings[0] );
		}

		public function test_guard__returns_patch_unchanged_when_render_succeeds() {
			// Arrange.
			$widget = $this->make_widget_that_fatals_on( '__never_present__' );
			$this->install_widgets_manager( [ 'v3-clean' => $widget ] );
			$patch = [ 'color' => '#111', 'font_size' => 16 ];
			$warnings = [];

			// Act.
			$safe = $this->invoke_guard( 'v3-clean', [], $patch, [], $warnings );

			// Assert.
			$this->assertSame( $patch, $safe );
			$this->assertSame( [], $warnings );
		}

		public function test_guard__returns_patch_unchanged_when_widget_is_unknown() {
			// Arrange.
			$this->install_widgets_manager( [] );
			$patch = [ 'anything' => 1 ];
			$warnings = [];

			// Act.
			$safe = $this->invoke_guard( 'missing-widget', [], $patch, [], $warnings );

			// Assert.
			$this->assertSame( $patch, $safe );
			$this->assertSame( [], $warnings );
		}

		public function test_guard__is_disabled_when_filter_returns_false() {
			// Arrange.
			$widget = $this->make_widget_that_fatals_on( 'line_height' );
			$this->install_widgets_manager( [ 'v3-heading' => $widget ] );
			add_test_filter( 'elementor/mcp/v3_render_probe', static fn() => false );

			$patch = [ 'line_height' => '1.5', 'color' => '#000' ];
			$warnings = [];

			// Act.
			$safe = $this->invoke_guard( 'v3-heading', [], $patch, [], $warnings );

			// Assert.
			$this->assertSame( $patch, $safe );
			$this->assertSame( [], $warnings );

			clear_test_filters();
		}

		/**
		 * @param array<string, mixed> $base
		 * @param array<string, mixed> $patch
		 * @param array<string, mixed> $controls
		 * @param string[]             $warnings
		 * @return array<string, mixed>
		 */
		private function invoke_guard( string $widget_type, array $base, array $patch, array $controls, array &$warnings ): array {
			$reflection = new \ReflectionClass( Style_Applier::class );
			$method = $reflection->getMethod( 'guard_v3_render' );
			$method->setAccessible( true );
			return $method->invokeArgs( null, [ $widget_type, $base, $patch, $controls, &$warnings ] );
		}

		private function make_widget_that_fatals_on( string $fatal_key ): object {
			return new class( $fatal_key ) {
				private $data = [];
				private string $fatal_key;

				public function __construct( string $fatal_key ) {
					$this->fatal_key = $fatal_key;
				}

				public function render_content(): void {
					$settings = $this->data['settings'] ?? [];
					if ( array_key_exists( $this->fatal_key, $settings ) ) {
						throw new \RuntimeException( 'fatal on ' . $this->fatal_key );
					}
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

	function add_test_filter( string $tag, callable $callback ): void {
		$GLOBALS['__mcp_test_filters'][ $tag ] = $callback;
	}

	function clear_test_filters(): void {
		$GLOBALS['__mcp_test_filters'] = [];
	}
}
