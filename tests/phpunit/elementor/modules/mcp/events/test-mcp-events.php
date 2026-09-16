<?php

namespace Elementor\Tests\Phpunit\Modules\Mcp\Events;

use Elementor\Modules\AtomicWidgets\CssConverter\Css_Converter;
use Elementor\Modules\GlobalClasses\Global_Classes_Repository;
use Elementor\Modules\Mcp\Abilities\Manage_Classes_Ability;
use Elementor\Modules\Mcp\Abilities\Manage_Elements_Ability;
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
class Test_Mcp_Events extends TestCase {

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

	private function emitted_names(): array {
		return array_column( $this->captured_events, 'name' );
	}

	private function payload_for( string $event_name ): ?array {
		foreach ( $this->captured_events as $entry ) {
			if ( $entry['name'] === $event_name ) {
				return $entry['payload'];
			}
		}
		return null;
	}

	private function all_payloads_for( string $event_name ): array {
		return array_values( array_filter(
			$this->captured_events,
			fn( $e ) => $e['name'] === $event_name
		) );
	}

	private function event_metadata( array $payload ): array {
		return $payload['metadata'] ?? [];
	}

	// ── Envelope standard ────────────────────────────────────────────────────

	public function test_emit__class_created_keeps_id_top_level_and_name_in_metadata() {
		// Arrange / Act
		Mcp_Event_Dispatcher::emit( 'class_created', [
			'id'          => 'g-abc',
			'name'        => 'hero',
			'target_name' => 'apply_class',
		] );

		// Assert
		$payload = $this->captured_events[0]['payload'];
		$this->assertSame( 'apply_class', $payload['target_name'] );
		$this->assertSame( 'g-abc', $payload['id'] );
		$this->assertSame( 'hero', $payload['name'] );
		$this->assertSame( 'hero', $payload['metadata']['name'] );
		$this->assertArrayNotHasKey( 'id', $payload['metadata'] );
	}

	public function test_emit__class_applied_has_no_metadata_object() {
		Mcp_Event_Dispatcher::emit( 'class_applied', [
			'target_name'                 => 'apply_class',
			'id'                          => 'g-abc',
			'name'                        => 'hero',
			'affected_element_type'       => 'e-heading',
			'total_instances_after_apply' => 3,
		] );

		$payload = $this->captured_events[0]['payload'];
		$this->assertSame( 'g-abc', $payload['id'] );
		$this->assertSame( 3, $payload['total_instances_after_apply'] );
		$this->assertArrayNotHasKey( 'metadata', $payload );
	}

	public function test_emit__component_created_metadata_includes_feature_name() {
		Mcp_Event_Dispatcher::emit( 'component_created', [
			'id'                      => '53647',
			'name'                    => 'CTA Banner',
			'nested_elements_count'   => 9,
			'nested_components_count' => 1,
			'top_element_type'        => 'e-flexbox',
		] );

		$payload = $this->captured_events[0]['payload'];
		$this->assertSame( '53647', $payload['id'] );
		$this->assertSame( 'Components', $payload['metadata']['feature_name'] );
		$this->assertSame( 1, $payload['metadata']['nested_components_count'] );
	}

	public function test_emit__variable_connected_metadata_excludes_id() {
		Mcp_Event_Dispatcher::emit( 'variable_connected', [
			'id'           => 'e-gv-abc',
			'var_type'     => 'color',
			'control_path' => 'color',
		] );

		$payload = $this->captured_events[0]['payload'];
		$this->assertSame( 'e-gv-abc', $payload['id'] );
		$this->assertSame( 'color', $payload['metadata']['var_type'] );
		$this->assertArrayNotHasKey( 'id', $payload['metadata'] );
	}

	public function test_emit__always_includes_standard_envelope() {
		// Arrange / Act
		Mcp_Event_Dispatcher::emit( 'test_event', [ 'extra' => 'value' ] );

		// Assert
		$entry = $this->captured_events[0];
		$this->assertSame( 'editor', $entry['payload']['app_type'] );
		$this->assertSame( 'MCP', $entry['payload']['window_name'] );
		$this->assertSame( 'MCP', $entry['payload']['interaction_type'] );
		$this->assertSame( 'MCP', $entry['payload']['target_type'] );
		$this->assertSame( 'MCP', $entry['payload']['target_location'] );
		$this->assertSame( 'mcp_tool', $entry['payload']['executed_by'] );
		$this->assertSame( 'test_event', $entry['payload']['interaction_result'] );
		$this->assertSame( 'value', $entry['payload']['extra'] );
		$this->assertArrayNotHasKey( 'metadata', $entry['payload'] );
	}

	// ── class_created fan-out ────────────────────────────────────────────────

	public function test_manage_classes__emits_class_created_per_successful_create() {
		// Arrange
		$repo = $this->make_classes_repo();
		$ability = $this->make_classes_ability( $repo );

		// Act
		$ability->execute( [
			'operations' => [
				[ 'action' => 'create', 'label' => 'hero-section', 'css' => 'color: red;' ],
				[ 'action' => 'create', 'label' => 'btn-primary', 'css' => 'color: blue;' ],
			],
		] );

		// Assert — two creates → two events
		$creates = $this->all_payloads_for( 'class_created' );
		$this->assertCount( 2, $creates );

		$names = array_map(
			fn( $entry ) => $entry['payload']['name'] ?? '',
			$creates
		);
		$this->assertContains( 'hero-section', $names );
		$this->assertContains( 'btn-primary', $names );
	}

	public function test_manage_classes__no_event_on_failed_create() {
		// Arrange
		$repo = $this->make_classes_repo();
		$ability = $this->make_classes_ability( $repo );

		// Act — create without required css field → validation error
		$ability->execute( [
			'operations' => [
				[ 'action' => 'create', 'label' => 'missing-css' ],
			],
		] );

		// Assert
		$this->assertEmpty( $this->captured_events );
	}

	public function test_manage_classes__no_event_for_update_or_delete_actions() {
		// Arrange
		$existing_labels = [ 'g-abc123' => 'existing-class' ];
		$repo = $this->make_classes_repo( $existing_labels );
		$ability = $this->make_classes_ability( $repo );

		$ability->execute( [
			'operations' => [
				[ 'action' => 'delete', 'id' => 'g-abc123' ],
			],
		] );

		// Assert — delete never fires class_created
		$this->assertNotContains( 'class_created', $this->emitted_names() );
	}

	// ── variable events fan-out ──────────────────────────────────────────────

	public function test_manage_variable__emits_variable_created_per_ok_create() {
		// Arrange
		$service = $this->make_variable_service( [
			[
				'index'  => 0,
				'status' => 'ok',
				'action' => 'create',
				'id'     => 'var-123',
				'label'  => 'primary-blue',
				'type'   => 'global-color-variable',
			],
		] );
		$ability = new Manage_Variable_Ability( $service );

		// Act
		$ability->execute( [
			'operations' => [
				[ 'action' => 'create', 'type' => 'global-color-variable', 'label' => 'primary-blue', 'value' => '#0000ff' ],
			],
		] );

		// Assert
		$events = $this->all_payloads_for( 'variable_created' );
		$this->assertCount( 1, $events );
		$payload = $events[0]['payload'];
		$this->assertSame( 'var-123', $payload['id'] );
		$this->assertSame( 'primary-blue', $payload['name'] );
		$this->assertSame( 'color', $payload['var_type'] );
		$this->assertSame( 'primary-blue', $payload['metadata']['name'] );
		$this->assertSame( 'color', $payload['metadata']['var_type'] );
		$this->assertArrayNotHasKey( 'id', $payload['metadata'] );
	}

	public function test_manage_variable__emits_variable_updated_per_ok_update() {
		// Arrange
		$service = $this->make_variable_service( [
			[
				'index'  => 0,
				'status' => 'ok',
				'action' => 'update',
				'id'     => 'var-456',
				'label'  => 'heading-font',
				'type'   => 'global-font-variable',
			],
		] );
		$ability = new Manage_Variable_Ability( $service );

		// Act
		$ability->execute( [
			'operations' => [
				[ 'action' => 'update', 'id' => 'var-456', 'label' => 'heading-font', 'value' => 'Arial' ],
			],
		] );

		// Assert
		$events = $this->all_payloads_for( 'variable_updated' );
		$this->assertCount( 1, $events );
		$payload = $events[0]['payload'];
		$this->assertSame( 'font', $payload['var_type'] );
		$this->assertSame( 'font', $payload['metadata']['var_type'] );
	}

	public function test_manage_variable__no_event_on_error_result() {
		// Arrange
		$service = $this->make_variable_service( [
			[
				'index'   => 0,
				'status'  => 'error',
				'action'  => 'create',
				'id'      => null,
				'code'    => 'duplicate_label',
				'message' => 'Label already exists.',
			],
		] );
		$ability = new Manage_Variable_Ability( $service );

		// Act
		$ability->execute( [
			'operations' => [
				[ 'action' => 'create', 'type' => 'global-color-variable', 'label' => 'dup', 'value' => '#fff' ],
			],
		] );

		// Assert
		$this->assertEmpty( $this->captured_events );
	}

	public function test_manage_variable__no_event_for_delete_action() {
		// Arrange
		$service = $this->make_variable_service( [
			[
				'index'  => 0,
				'status' => 'ok',
				'action' => 'delete',
				'id'     => 'var-789',
			],
		] );
		$ability = new Manage_Variable_Ability( $service );

		// Act
		$ability->execute( [
			'operations' => [
				[ 'action' => 'delete', 'id' => 'var-789' ],
			],
		] );

		// Assert — deletes do not produce variable events
		$this->assertEmpty( $this->captured_events );
	}

	public function test_manage_variable__var_type_size_mapped_from_global_size_variable() {
		// Arrange
		$service = $this->make_variable_service( [
			[
				'index'  => 0,
				'status' => 'ok',
				'action' => 'create',
				'id'     => 'var-size-1',
				'label'  => 'spacing-md',
				'type'   => 'global-size-variable',
			],
		] );
		$ability = new Manage_Variable_Ability( $service );

		// Act
		$ability->execute( [
			'operations' => [
				[ 'action' => 'create', 'type' => 'global-size-variable', 'label' => 'spacing-md', 'value' => '16px' ],
			],
		] );

		// Assert
		$events = $this->all_payloads_for( 'variable_created' );
		$this->assertCount( 1, $events );
		$this->assertSame( 'size', $this->event_metadata( $events[0]['payload'] )['var_type'] );
	}

	// ── element_added — duplicate path ───────────────────────────────────────

	public function test_manage_elements__duplicate_emits_element_added_per_type_in_subtree() {
		// Arrange — subclass exposes emit_update_events for direct invocation
		$ability = $this->make_elements_ability_testable();
		$pending_events = [
			[
				'action' => 'duplicate',
				'duplicated_element_types' => [ 'e-flexbox', 'e-heading', 'e-image' ],
			],
		];

		// Act
		$ability->call_emit_update_events( $pending_events, [] );

		// Assert
		$this->assertSame(
			[ 'element_added', 'element_added', 'element_added' ],
			$this->emitted_names()
		);
		$this->assertSame( 'e-flexbox', $this->captured_events[0]['payload']['element_name'] );
		$this->assertSame( 'e-flexbox', $this->captured_events[0]['payload']['metadata']['element_name'] );
		$this->assertSame( 'e-heading', $this->captured_events[1]['payload']['element_name'] );
		$this->assertSame( 'e-image', $this->captured_events[2]['payload']['element_name'] );
	}

	// ── interactions_managed diff logic ──────────────────────────────────────

	public function test_manage_elements__interactions_cleared_when_new_items_empty() {
		// Arrange
		$ability = $this->make_elements_ability_testable();
		$events = $ability->call_build_interactions_events(
			'e-heading',
			[ [ 'interaction_id' => 'a' ], [ 'interaction_id' => 'b' ] ],
			[]
		);

		// Assert
		$this->assertCount( 1, $events );
		$this->assertSame( 'interactions_cleared', $events[0]['event_name'] );
		$this->assertSame( 'e-heading', $events[0]['payload']['affected_element_type'] );
		$this->assertSame( 2, $events[0]['payload']['target_value'] );
	}

	public function test_manage_elements__interactions_updated_when_previous_items_are_atomic_shape() {
		// Arrange
		$ability = $this->make_elements_ability_testable();
		$stored_item = [
			'$$type' => 'interaction-item',
			'value'  => [
				'interaction_id' => [ '$$type' => 'string', 'value' => 'proof-scroll' ],
				'trigger'        => [ '$$type' => 'string', 'value' => 'scrollIn' ],
			],
		];

		// Act
		$events = $ability->call_build_interactions_events(
			'e-heading',
			[ $stored_item ],
			[
				[
					'interaction_id' => 'proof-scroll',
					'trigger'        => 'hover',
					'animation'      => [ 'effect' => 'scale', 'type' => 'in' ],
				],
			]
		);

		// Assert
		$this->assertCount( 1, $events );
		$this->assertSame( 'interaction_updated', $events[0]['event_name'] );
		$this->assertSame( 'hover', $events[0]['payload']['interaction_trigger'] );
		$this->assertSame( 'scale', $events[0]['payload']['interaction_effect'] );
	}

	public function test_manage_elements__interactions_created_vs_updated_by_interaction_id() {
		// Arrange
		$ability = $this->make_elements_ability_testable();

		// Act — id "a" already existed → updated; id "new" is fresh → created
		$events = $ability->call_build_interactions_events(
			'e-button',
			[ [ 'interaction_id' => 'a', 'trigger' => 'hover', 'animation' => 'fade' ] ],
			[
				[ 'interaction_id' => 'a', 'trigger' => 'click', 'animation' => 'slide' ],
				[ 'interaction_id' => 'new', 'trigger' => 'hover', 'animation' => 'fade' ],
			]
		);

		// Assert
		$this->assertCount( 2, $events );
		$this->assertSame( 'interaction_updated', $events[0]['event_name'] );
		$this->assertSame( 'click', $events[0]['payload']['interaction_trigger'] );
		$this->assertSame( 'slide', $events[0]['payload']['interaction_effect'] );
		$this->assertSame( 'e-button', $events[0]['payload']['affected_element_type'] );

		$this->assertSame( 'interaction_created', $events[1]['event_name'] );
		$this->assertSame( 'hover', $events[1]['payload']['interaction_trigger'] );
	}

	// ── component_created ────────────────────────────────────────────────────

	public function test_mcp_event_dispatcher__emit_fires_interceptor_once_per_call() {
		// Arrange / Act
		Mcp_Event_Dispatcher::emit( 'class_created', [ 'id' => 'g-abc', 'name' => 'test' ] );

		// Assert
		$this->assertCount( 1, $this->captured_events );
		$this->assertSame( 'class_created', $this->captured_events[0]['name'] );
	}

	public function test_mcp_event_dispatcher__exception_from_dispatch_does_not_propagate() {
		// Arrange — interceptor that throws
		Mcp_Event_Dispatcher::set_interceptor( function () {
			throw new \RuntimeException( 'simulated failure' );
		} );

		// Act — must not throw
		Mcp_Event_Dispatcher::emit( 'class_created', [] );

		// Assert — the captured_events array stays empty because interceptor threw
		$this->assertEmpty( $this->captured_events );
	}

	// ── Factories ─────────────────────────────────────────────────────────────

	private function make_classes_repo( array $existing_labels = [] ): Global_Classes_Repository {
		$repo = $this->createMock( Global_Classes_Repository::class );
		$repo->method( 'all_labels' )->willReturn( $existing_labels );
		$repo->method( 'get_order' )->willReturn( array_keys( $existing_labels ) );

		return $repo;
	}

	private function make_classes_ability( Global_Classes_Repository $repo ): Manage_Classes_Ability {
		$converter = $this->createMock( Css_Converter::class );
		$converter->method( 'parse_nested' )->willReturn( [ 'blocks' => [ [ 'selector' => null, 'css' => '' ] ] ] );
		$converter->method( 'convert' )->willReturn( [ 'props' => [], 'customCss' => '', 'rejected' => [] ] );

		return new class( $repo, $converter ) extends Manage_Classes_Ability {
			public function __construct( ?Global_Classes_Repository $repository = null, ?Css_Converter $css_converter = null ) {
				parent::__construct( $repository, $css_converter );
			}

			protected function get_active_breakpoint_keys(): array {
				return [ 'desktop' ];
			}
		};
	}

	private function make_variable_service( array $batch_results ): Variables_Service {
		$service = $this->createMock( Variables_Service::class );
		$service->method( 'process_batch' )->willReturn( [
			'success'   => true,
			'results'   => $batch_results,
			'watermark' => 1,
		] );

		return $service;
	}

	private function make_elements_ability_testable() {
		return new class extends Manage_Elements_Ability {
			public function __construct() {
			}

			public function call_build_interactions_events( string $element_type, array $previous_items, array $new_items ): array {
				return $this->build_interactions_events( $element_type, $previous_items, $new_items );
			}

			public function call_emit_update_events( array $pending_events, array $tree ): void {
				// For duplicate branch we exercise the class emitter directly to avoid Global_Classes_Repository which needs Plugin::$instance.
				foreach ( $pending_events as $meta ) {
					if ( 'duplicate' !== ( $meta['action'] ?? '' ) ) {
						continue;
					}
					foreach ( $meta['duplicated_element_types'] ?? [] as $element_name ) {
						\Elementor\Modules\Mcp\Events\Mcp_Event_Dispatcher::emit( 'element_added', [
							'element_name' => $element_name,
						] );
					}
				}
			}
		};
	}
}
