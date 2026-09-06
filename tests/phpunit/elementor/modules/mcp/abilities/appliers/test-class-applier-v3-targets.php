<?php

namespace Elementor {
	if ( ! class_exists( 'Elementor\\Utils', false ) ) {
		class Utils {
			public static function has_pro(): bool {
				return true;
			}
		}
	}
}

namespace Elementor\Modules\Mcp\Abilities\Appliers\V3 {
	if ( ! class_exists( __NAMESPACE__ . '\\V3_Widget_Map_Loader_Test_Stub', false ) ) {
		class V3_Widget_Map_Loader_Test_Stub {}
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

	if ( ! function_exists( 'esc_html__' ) ) {
		function esc_html__( $text, $domain = null ) {
			return $text;
		}
	}

	use Elementor\Modules\GlobalClasses\Global_Classes_Repository;
	use Elementor\Modules\Mcp\Abilities\Appliers\Class_Applier;
	use PHPUnit\Framework\TestCase;

	class Test_Class_Applier_V3_Targets extends TestCase {

		private function make_repository( array $label_by_id ): Global_Classes_Repository {
			$repo = $this->createMock( Global_Classes_Repository::class );
			$repo->method( 'all_labels' )->willReturn( $label_by_id );
			return $repo;
		}

		private function v3_wrapper_node(): array {
			return [
				'elType' => 'widget',
				'widgetType' => 'nav-menu',
				'settings' => [],
			];
		}

		public function test_apply__legacy_array_shape_writes_wrapper_classes(): void {
			$repo = $this->make_repository( [ 'id-1' => 'primary' ] );
			$applier = new Class_Applier( $repo );

			$node = $this->v3_wrapper_node();
			$index = [ 'cfg' => &$node ];

			$result = $applier->apply( $index, [ 'cfg' => [ 'primary' ] ] );

			$this->assertNull( $result['error'] );
			$this->assertSame( [], $result['warnings'] );
			$this->assertSame( 'primary', $node['settings']['_css_classes'] );
		}

		public function test_apply__targeted_wrapper_shape_writes_wrapper_classes(): void {
			$repo = $this->make_repository( [ 'id-1' => 'primary' ] );
			$applier = new Class_Applier( $repo );

			$node = $this->v3_wrapper_node();
			$index = [ 'cfg' => &$node ];

			$result = $applier->apply( $index, [ 'cfg' => [ 'wrapper' => [ 'primary' ] ] ] );

			$this->assertNull( $result['error'] );
			$this->assertSame( [], $result['warnings'] );
			$this->assertSame( 'primary', $node['settings']['_css_classes'] );
		}

		public function test_apply__unknown_target_emits_warning_and_does_not_write(): void {
			$repo = $this->make_repository( [ 'id-1' => 'primary' ] );
			$applier = new Class_Applier( $repo );

			$node = $this->v3_wrapper_node();
			$index = [ 'cfg' => &$node ];

			$result = $applier->apply( $index, [ 'cfg' => [ 'not-a-real-alias' => [ 'primary' ] ] ] );

			$this->assertNull( $result['error'] );
			$this->assertNotEmpty( $result['warnings'] );
			$this->assertStringContainsString( "not-a-real-alias", $result['warnings'][0] );
			$this->assertStringContainsString( 'nav-menu', $result['warnings'][0] );
			$this->assertArrayNotHasKey( '_css_classes', $node['settings'] );
		}

		public function test_apply__non_array_input_returns_error(): void {
			$repo = $this->make_repository( [ 'id-1' => 'primary' ] );
			$applier = new Class_Applier( $repo );

			$node = $this->v3_wrapper_node();
			$index = [ 'cfg' => &$node ];

			$result = $applier->apply( $index, [ 'cfg' => 'not-an-array' ] );

			$this->assertNotNull( $result['error'] );
			$this->assertSame( 'elementor_unknown_global_class', $result['error']->get_error_code() );
		}

		public function test_apply__unknown_label_returns_error(): void {
			$repo = $this->make_repository( [ 'id-1' => 'primary' ] );
			$applier = new Class_Applier( $repo );

			$node = $this->v3_wrapper_node();
			$index = [ 'cfg' => &$node ];

			$result = $applier->apply( $index, [ 'cfg' => [ 'wrapper' => [ 'not-defined' ] ] ] );

			$this->assertNotNull( $result['error'] );
			$this->assertStringContainsString( 'not-defined', $result['error']->get_error_message() );
		}

		public function test_apply__empty_wrapper_array_clears_v3_wrapper_classes(): void {
			$repo = $this->make_repository( [ 'id-1' => 'primary' ] );
			$applier = new Class_Applier( $repo );

			$node = [
				'elType' => 'widget',
				'widgetType' => 'nav-menu',
				'settings' => [ '_css_classes' => 'existing' ],
			];
			$index = [ 'cfg' => &$node ];

			$result = $applier->apply( $index, [ 'cfg' => [] ] );

			$this->assertNull( $result['error'] );
			$this->assertArrayNotHasKey( '_css_classes', $node['settings'] );
		}
	}
}
