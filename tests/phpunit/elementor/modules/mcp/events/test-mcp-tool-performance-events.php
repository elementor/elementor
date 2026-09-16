<?php

namespace Elementor\Tests\Phpunit\Modules\Mcp\Events;

use Elementor\Modules\AtomicWidgets\CssConverter\Css_Converter;
use Elementor\Modules\GlobalClasses\Global_Classes_Repository;
use Elementor\Modules\Mcp\Abilities\Manage_Classes_Ability;
use Elementor\Modules\Mcp\Abilities\Manage_Variable_Ability;
use Elementor\Modules\Mcp\Events\Mcp_Event_Dispatcher;
use Elementor\Modules\Variables\Services\Variables_Service;
use PHPUnit\Framework\TestCase;

require_once __DIR__ . '/../test-manage-classes-ability-base.php';

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * @group Elementor\Modules\Mcp
 */
class Test_Mcp_Tool_Performance_Events extends TestCase {

	private array $captured_events = [];

	public function setUp(): void {
		parent::setUp();

		$this->captured_events = [];

		Mcp_Event_Dispatcher::set_interceptor( function ( string $name, array $payload ) {
			$this->captured_events[] = [ 'name' => $name, 'payload' => $payload ];
		} );
	}

	public function tearDown(): void {
		Mcp_Event_Dispatcher::set_interceptor( null );
		parent::tearDown();
	}

	// ── Helpers ──────────────────────────────────────────────────────────────

	private function perf_events_named( string $event_name ): array {
		return array_values( array_filter(
			$this->captured_events,
			fn( $e ) => $e['name'] === $event_name
		) );
	}

	private function first_payload( string $event_name ): ?array {
		$events = $this->perf_events_named( $event_name );
		return $events[0]['payload'] ?? null;
	}

	private function make_stub_converter(): Css_Converter {
		$converter = $this->createMock( Css_Converter::class );
		$converter->method( 'parse_nested' )->willReturn( [ 'blocks' => [ [ 'selector' => null, 'css' => '' ] ] ] );
		$converter->method( 'convert' )->willReturn( [ 'props' => [], 'customCss' => '', 'rejected' => [] ] );
		return $converter;
	}

	private function make_classes_ability( ?Global_Classes_Repository $repository = null ): Manage_Classes_Ability {
		if ( null === $repository ) {
			$repository = $this->createMock( Global_Classes_Repository::class );
			$repository->method( 'all_labels' )->willReturn( [] );
			$repository->method( 'get_order' )->willReturn( [] );
		}

		return new class( $repository, $this->make_stub_converter() ) extends Manage_Classes_Ability {
			public function __construct( ?Global_Classes_Repository $repository = null, ?Css_Converter $css_converter = null ) {
				parent::__construct( $repository, $css_converter );
			}

			protected function get_active_breakpoint_keys(): array {
				return [ self::DESKTOP_BREAKPOINT ];
			}

			protected function build_class_item( string $id, string $label, array $css ): array {
				return [
					'id'       => $id,
					'label'    => $label,
					'type'     => self::CLASS_TYPE,
					'variants' => [
						[
							'meta'       => [ 'breakpoint' => self::DESKTOP_BREAKPOINT, 'state' => null ],
							'props'      => $css,
							'custom_css' => null,
						],
					],
				];
			}
		};
	}

	private function make_variable_ability( ?Variables_Service $service = null ): Manage_Variable_Ability {
		if ( null === $service ) {
			$service = $this->createMock( Variables_Service::class );
			$service->method( 'process_batch' )->willReturn( [
				'results'   => [],
				'watermark' => null,
			] );
		}

		return new Manage_Variable_Ability( $service );
	}

	// ── manage-classes: emits exactly once per execute() ─────────────────────

	public function test_manage_classes_emits_mcp_manage_classes_executed_on_success() {
		// Arrange
		$repo = $this->createMock( Global_Classes_Repository::class );
		$repo->method( 'all_labels' )->willReturn( [] );
		$repo->method( 'get_order' )->willReturn( [] );
		$ability = $this->make_classes_ability( $repo );

		// Act
		$ability->execute( [
			'operations' => [
				[ 'action' => 'create', 'label' => 'hero', 'css' => 'color: red;' ],
			],
		] );

		// Assert
		$perf = $this->perf_events_named( 'mcp_manage_classes_executed' );
		$this->assertCount( 1, $perf, 'exactly one perf event emitted' );

		$payload = $perf[0]['payload'];
		$this->assertSame( 'elementor/manage-classes', $payload['tool_name'] );
		$this->assertSame( 'success', $payload['status'] );
		$this->assertSame( 1, $payload['operations_count'] );
		$this->assertSame( [ 'create' => 1 ], $payload['operations_by_type'] );
		$this->assertIsInt( $payload['duration_ms'] );
	}

	public function test_manage_classes_emits_on_validation_failure() {
		// Arrange
		$ability = $this->make_classes_ability();

		// Act
		$ability->execute( [] );

		// Assert
		$perf = $this->perf_events_named( 'mcp_manage_classes_executed' );
		$this->assertCount( 1, $perf );

		$payload = $perf[0]['payload'];
		$this->assertSame( 'error', $payload['status'] );
		$this->assertSame( 'invalid_input', $payload['error_code'] );
		$this->assertSame( 0, $payload['operations_count'] );
	}

	public function test_manage_classes_partial_status_when_some_ops_fail() {
		// Arrange
		$repo = $this->createMock( Global_Classes_Repository::class );
		$repo->method( 'all_labels' )->willReturn( [ 'g-existing' => 'existing' ] );
		$repo->method( 'get_order' )->willReturn( [] );
		$ability = $this->make_classes_ability( $repo );

		// Act — one valid create, one invalid (no label)
		$ability->execute( [
			'operations' => [
				[ 'action' => 'create', 'label' => 'new-class', 'css' => 'color:blue;' ],
				[ 'action' => 'create', 'label' => '', 'css' => 'color:red;' ],
			],
		] );

		// Assert
		$payload = $this->first_payload( 'mcp_manage_classes_executed' );
		$this->assertNotNull( $payload );
		$this->assertSame( 'partial', $payload['status'] );
		$this->assertGreaterThan( 0, $payload['failed_operations_count'] );
	}

	public function test_manage_classes_variables_referenced_count_from_css_input() {
		// Arrange
		$repo = $this->createMock( Global_Classes_Repository::class );
		$repo->method( 'all_labels' )->willReturn( [] );
		$repo->method( 'get_order' )->willReturn( [] );
		$ability = $this->make_classes_ability( $repo );

		// Act — CSS with two var() references
		$ability->execute( [
			'operations' => [
				[ 'action' => 'create', 'label' => 'accent', 'css' => 'color: var(--primary); background: var(--secondary);' ],
			],
		] );

		// Assert
		$payload = $this->first_payload( 'mcp_manage_classes_executed' );
		$this->assertSame( 2, $payload['variables_referenced_count'] );
		$this->assertContains( 'primary', $payload['variable_labels'] );
		$this->assertContains( 'secondary', $payload['variable_labels'] );
	}

	// ── manage-global-variable: emits exactly once per execute() ─────────────

	public function test_manage_variable_emits_mcp_manage_global_variable_executed_on_success() {
		// Arrange
		$service = $this->createMock( Variables_Service::class );
		$service->method( 'process_batch' )->willReturn( [
			'results'   => [
				[ 'status' => 'ok', 'action' => 'create', 'id' => 'v1', 'label' => 'accent', 'type' => 'global-color-variable' ],
			],
			'watermark' => 'w1',
		] );
		$ability = $this->make_variable_ability( $service );

		// Act
		$ability->execute( [
			'operations' => [
				[ 'action' => 'create', 'type' => 'global-color-variable', 'label' => 'accent', 'value' => '#f00' ],
			],
		] );

		// Assert
		$perf = $this->perf_events_named( 'mcp_manage_global_variable_executed' );
		$this->assertCount( 1, $perf, 'exactly one perf event emitted' );

		$payload = $perf[0]['payload'];
		$this->assertSame( 'elementor/manage-global-variable', $payload['tool_name'] );
		$this->assertSame( 'success', $payload['status'] );
		$this->assertSame( 1, $payload['operations_count'] );
		$this->assertSame( [ 'create' => 1 ], $payload['operations_by_type'] );
		$this->assertSame( [ 'global-color-variable' => 1 ], $payload['variable_types'] );
		$this->assertIsInt( $payload['duration_ms'] );
	}

	public function test_manage_variable_emits_on_validation_failure() {
		// Arrange
		$ability = $this->make_variable_ability();

		// Act
		$ability->execute( [] );

		// Assert
		$perf = $this->perf_events_named( 'mcp_manage_global_variable_executed' );
		$this->assertCount( 1, $perf );

		$payload = $perf[0]['payload'];
		$this->assertSame( 'error', $payload['status'] );
		$this->assertSame( 'invalid_input', $payload['error_code'] );
	}

	// ── perf events do not interfere with per-entity events ──────────────────

	public function test_manage_classes_perf_event_emitted_alongside_class_created_entity_event() {
		// Arrange
		$repo = $this->createMock( Global_Classes_Repository::class );
		$repo->method( 'all_labels' )->willReturn( [] );
		$repo->method( 'get_order' )->willReturn( [] );
		$ability = $this->make_classes_ability( $repo );

		// Act
		$ability->execute( [
			'operations' => [
				[ 'action' => 'create', 'label' => 'hero', 'css' => 'color: red;' ],
			],
		] );

		// Assert — both entity and perf event present
		$all_names = array_column( $this->captured_events, 'name' );
		$this->assertContains( 'class_created', $all_names );
		$this->assertContains( 'mcp_manage_classes_executed', $all_names );
	}

	public function test_manage_variable_perf_event_emitted_alongside_variable_entity_event() {
		// Arrange
		$service = $this->createMock( Variables_Service::class );
		$service->method( 'process_batch' )->willReturn( [
			'results'   => [
				[ 'status' => 'ok', 'action' => 'create', 'id' => 'v1', 'label' => 'accent', 'type' => 'global-color-variable' ],
			],
			'watermark' => null,
		] );
		$ability = $this->make_variable_ability( $service );

		// Act
		$ability->execute( [
			'operations' => [
				[ 'action' => 'create', 'type' => 'global-color-variable', 'label' => 'accent', 'value' => '#f00' ],
			],
		] );

		// Assert
		$all_names = array_column( $this->captured_events, 'name' );
		$this->assertContains( 'variable_created', $all_names );
		$this->assertContains( 'mcp_manage_global_variable_executed', $all_names );
	}

	// ── warning_codes: stable codes emitted on warning paths ─────────────────

	public function test_mcp_event_dispatcher_emit_passes_warning_types_as_top_level() {
		// Arrange / Act — directly test dispatch shape
		Mcp_Event_Dispatcher::emit( 'mcp_manage_classes_executed', [
			'tool_name'    => 'elementor/manage-classes',
			'status'       => 'success',
			'warning_count' => 1,
			'warning_types' => [ 'prop_not_supported' ],
		] );

		// Assert
		$payload = $this->first_payload( 'mcp_manage_classes_executed' );
		$this->assertSame( [ 'prop_not_supported' ], $payload['warning_types'] );
	}

	// ── emit once per execute() regardless of outcome ────────────────────────

	public function test_manage_classes_emits_exactly_once_for_batch_exceeded() {
		// Arrange
		$ability = $this->make_classes_ability();
		$ops     = array_fill( 0, 51, [ 'action' => 'create', 'label' => 'x', 'css' => 'color:red;' ] );

		// Act
		$ability->execute( [ 'operations' => $ops ] );

		// Assert
		$this->assertCount( 1, $this->perf_events_named( 'mcp_manage_classes_executed' ) );
	}

	public function test_manage_variable_emits_exactly_once_for_batch_exceeded() {
		// Arrange
		$ability = $this->make_variable_ability();
		$ops     = array_fill( 0, 51, [ 'action' => 'create', 'type' => 'global-color-variable', 'label' => 'x', 'value' => '#f' ] );

		// Act
		$ability->execute( [ 'operations' => $ops ] );

		// Assert
		$this->assertCount( 1, $this->perf_events_named( 'mcp_manage_global_variable_executed' ) );
	}

	// ── dispatch failure must not affect ability return value ─────────────────

	public function test_dispatch_failure_does_not_affect_manage_classes_response() {
		// Arrange — make interceptor throw
		Mcp_Event_Dispatcher::set_interceptor( function () {
			throw new \RuntimeException( 'dispatch failed' );
		} );

		$repo = $this->createMock( Global_Classes_Repository::class );
		$repo->method( 'all_labels' )->willReturn( [] );
		$repo->method( 'get_order' )->willReturn( [] );
		$ability = $this->make_classes_ability( $repo );

		// Act
		$result = $ability->execute( [
			'operations' => [
				[ 'action' => 'create', 'label' => 'safe', 'css' => 'color:red;' ],
			],
		] );

		// Assert — response is unaffected
		$this->assertIsArray( $result );
		$this->assertArrayHasKey( 'status', $result );
	}
}
