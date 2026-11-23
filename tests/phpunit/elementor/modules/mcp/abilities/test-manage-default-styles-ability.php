<?php

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

use Elementor\Modules\AtomicWidgets\CssConverter\Css_Converter;
use Elementor\Modules\DefaultStyles\Default_Styles_Repository;
use Elementor\Modules\Mcp\Abilities\Manage_Default_Styles_Ability;
use Elementor\Modules\Mcp\Events\Mcp_Event_Dispatcher;
use PHPUnit\Framework\TestCase;

// Elementor\Utils is not resolved by the unit-bootstrap autoloader because its file lives under
// includes/utils.php; Default_Styles_Repository::is_allowed_tag depends on it transitively.
require_once dirname( __DIR__, 6 ) . '/includes/utils.php';

// MCP Composer classes are loaded via Versions::autoloader in WordPress; unit-bootstrap does not
// register it, so require the shared bases that Abstract_Ability / Ability_Definition extend.
$mcp_composer_src = dirname( __DIR__, 6 ) . '/vendor/elementor/elementor-mcp-composer/src';
require_once $mcp_composer_src . '/Mcp/Ability_Definition.php';
require_once $mcp_composer_src . '/Mcp/Abstract_Ability.php';

class Stub_Manage_Default_Styles_Repository extends Default_Styles_Repository {

	public array $stub_data;
	public array $puts = [];
	public array $deletes = [];

	public function __construct( array $stub_data = [] ) {
		parent::__construct();
		$this->stub_data = $stub_data;
	}

	public function get( string $tag ): ?array {
		return $this->stub_data[ $tag ] ?? null;
	}

	public function put( string $tag, array $data ): bool {
		$this->puts[] = [ 'tag' => $tag, 'data' => $data ];
		$this->stub_data[ $tag ] = $data;
		return true;
	}

	public function delete( string $tag ): void {
		$this->deletes[] = $tag;
		unset( $this->stub_data[ $tag ] );
	}
}

/**
 * Test double so we can bypass Plugin::$instance->breakpoints in a unit test.
 */
class Testable_Manage_Default_Styles_Ability extends Manage_Default_Styles_Ability {

	protected function get_active_breakpoint_keys(): array {
		return [ 'desktop', 'tablet', 'mobile' ];
	}
}

class Test_Manage_Default_Styles_Ability extends TestCase {

	private array $emitted_events = [];

	public function setUp(): void {
		parent::setUp();

		$this->emitted_events = [];

		Mcp_Event_Dispatcher::set_interceptor( function ( string $name, array $payload ) {
			$this->emitted_events[ $name ][] = $payload;
		} );
	}

	public function tearDown(): void {
		Mcp_Event_Dispatcher::set_interceptor( null );

		parent::tearDown();
	}

	private function make_ability( ?Default_Styles_Repository $repo = null ): Testable_Manage_Default_Styles_Ability {
		$css_converter = $this->createMock( Css_Converter::class );

		return new Testable_Manage_Default_Styles_Ability(
			$repo ?? new Stub_Manage_Default_Styles_Repository(),
			$css_converter
		);
	}

	public function test_execute_rejects_missing_operations() {
		// Arrange.
		$ability = $this->make_ability();

		// Act.
		$result = $ability->execute( [] );

		// Assert.
		$this->assertInstanceOf( WP_Error::class, $result );
		$this->assertSame( 'invalid_input', $result->get_error_code() );
	}

	public function test_execute_rejects_empty_operations() {
		// Arrange.
		$ability = $this->make_ability();

		// Act.
		$result = $ability->execute( [ 'operations' => [] ] );

		// Assert.
		$this->assertInstanceOf( WP_Error::class, $result );
		$this->assertSame( 'invalid_input', $result->get_error_code() );
	}

	public function test_execute_rejects_batch_over_max_size() {
		// Arrange.
		$ability = $this->make_ability();
		$operations = array_fill( 0, Manage_Default_Styles_Ability::MAX_BATCH_SIZE + 1, [ 'action' => 'delete', 'tag' => 'h1' ] );

		// Act.
		$result = $ability->execute( [ 'operations' => $operations ] );

		// Assert.
		$this->assertInstanceOf( WP_Error::class, $result );
		$this->assertSame( 'batch_size_exceeded', $result->get_error_code() );
	}

	public function test_rejects_operation_with_missing_tag() {
		// Arrange.
		$ability = $this->make_ability();

		// Act.
		$result = $ability->execute( [
			'operations' => [ [ 'action' => 'delete' ] ],
		] );

		// Assert.
		$this->assertSame( 'error', $result['status'] );
		$this->assertSame( 'invalid_input', $result['results'][0]['code'] );
	}

	public function test_rejects_operation_with_invalid_tag() {
		// Arrange.
		$ability = $this->make_ability();

		// Act.
		$result = $ability->execute( [
			'operations' => [ [ 'action' => 'update', 'tag' => 'script', 'css' => 'color: red;' ] ],
		] );

		// Assert.
		$this->assertSame( 'error', $result['status'] );
		$this->assertSame( 'invalid_tag', $result['results'][0]['code'] );
	}

	public function test_rejects_unknown_action() {
		// Arrange.
		$ability = $this->make_ability();

		// Act.
		$result = $ability->execute( [
			'operations' => [ [ 'action' => 'create', 'tag' => 'h1' ] ],
		] );

		// Assert.
		$this->assertSame( 'error', $result['status'] );
		$this->assertSame( 'invalid_input', $result['results'][0]['code'] );
	}

	public function test_rejects_update_without_css() {
		// Arrange.
		$ability = $this->make_ability();

		// Act.
		$result = $ability->execute( [
			'operations' => [ [ 'action' => 'update', 'tag' => 'h1' ] ],
		] );

		// Assert.
		$this->assertSame( 'error', $result['status'] );
		$this->assertSame( 'invalid_input', $result['results'][0]['code'] );
	}

	public function test_delete_on_missing_tag_reports_not_found() {
		// Arrange.
		$repo = new Stub_Manage_Default_Styles_Repository();
		$ability = $this->make_ability( $repo );

		// Act.
		$result = $ability->execute( [
			'operations' => [ [ 'action' => 'delete', 'tag' => 'h1' ] ],
		] );

		// Assert.
		$this->assertSame( 'error', $result['status'] );
		$this->assertSame( 'not_found', $result['results'][0]['code'] );
		$this->assertSame( [], $repo->deletes );
	}

	public function test_delete_removes_existing_tag() {
		// Arrange.
		$repo = new Stub_Manage_Default_Styles_Repository( [
			'h1' => [ 'variants' => [ [ 'props' => [ 'color' => 'red' ] ] ] ],
		] );
		$ability = $this->make_ability( $repo );

		// Act.
		$result = $ability->execute( [
			'operations' => [ [ 'action' => 'delete', 'tag' => 'h1' ] ],
		] );

		// Assert.
		$this->assertSame( 'ok', $result['status'] );
		$this->assertSame( [ 'h1' ], $repo->deletes );
		$this->assertSame( 'h1', $result['results'][0]['tag'] );
	}

	public function test_dry_run_update_returns_planned_variants_without_persisting() {
		// Arrange.
		$css_converter = $this->createMock( Css_Converter::class );
		$css_converter->method( 'parse_nested' )->willReturn( [
			'blocks' => [ [ 'selector' => null, 'css' => 'font-size: 20px;' ] ],
		] );
		$css_converter->method( 'convert' )->willReturn( [
			'props' => [ 'font-size' => [ '$$type' => 'size' ] ],
			'customCss' => '',
		] );
		$repo = new Stub_Manage_Default_Styles_Repository();
		$ability = new Testable_Manage_Default_Styles_Ability( $repo, $css_converter );

		// Act.
		$result = $ability->execute( [
			'dry_run' => true,
			'operations' => [ [ 'action' => 'update', 'tag' => 'h1', 'css' => 'font-size: 20px;' ] ],
		] );

		// Assert.
		$this->assertTrue( $result['dry_run'] );
		$this->assertSame( 'ok', $result['status'] );
		$this->assertSame( 'h1', $result['results'][0]['tag'] );
		$this->assertSame( 'class', $result['results'][0]['type'] );
		$this->assertNotEmpty( $result['results'][0]['variants'] );
		$this->assertSame( [], $repo->puts );
		$this->assertArrayNotHasKey( 'default_styles_tag_saved', $this->emitted_events );
	}

	public function test_dry_run_plans_update_on_top_of_editor_default_styles() {
		// Arrange.
		$css_converter = $this->createMock( Css_Converter::class );
		$css_converter->method( 'parse_nested' )->willReturn( [
			'blocks' => [ [ 'selector' => null, 'css' => 'font-size: 20px;' ] ],
		] );
		$css_converter->method( 'convert' )->willReturn( [
			'props' => [ 'font-size' => [ '$$type' => 'size', 'value' => '20px' ] ],
			'customCss' => '',
		] );
		$repo = new Stub_Manage_Default_Styles_Repository( [
			'h1' => [
				'variants' => [
					[
						'meta' => [ 'breakpoint' => 'desktop', 'state' => null ],
						'props' => [ 'color' => [ '$$type' => 'color', 'value' => 'blue' ] ],
					],
				],
			],
		] );
		$ability = new Testable_Manage_Default_Styles_Ability( $repo, $css_converter );

		// Act.
		$result = $ability->execute( [
			'dry_run' => true,
			'editor_default_styles' => [
				'h1' => [
					'type' => 'class',
					'variants' => [
						[
							'meta' => [ 'breakpoint' => 'desktop', 'state' => null ],
							'props' => [ 'color' => [ '$$type' => 'color', 'value' => 'red' ] ],
						],
					],
				],
			],
			'operations' => [ [ 'action' => 'update', 'tag' => 'h1', 'css' => 'font-size: 20px;' ] ],
		] );

		// Assert.
		$this->assertTrue( $result['dry_run'] );
		$this->assertSame( 'ok', $result['status'] );
		$this->assertArrayHasKey( 'color', $result['results'][0]['variants'][0]['props'] );
		$this->assertSame( 'red', $result['results'][0]['variants'][0]['props']['color']['value'] );
		$this->assertArrayHasKey( 'font-size', $result['results'][0]['variants'][0]['props'] );
		$this->assertSame( [], $repo->puts );
	}

	public function test_dry_run_applies_sequential_updates_on_same_tag_in_one_request() {
		// Arrange.
		$css_converter = $this->createMock( Css_Converter::class );
		$css_converter->method( 'parse_nested' )->willReturn( [
			'blocks' => [ [ 'selector' => null, 'css' => 'font-size: 20px;' ] ],
		] );
		$css_converter->method( 'convert' )->willReturnOnConsecutiveCalls(
			[
				'props' => [ 'font-size' => [ '$$type' => 'size', 'value' => '20px' ] ],
				'customCss' => '',
			],
			[
				'props' => [ 'color' => [ '$$type' => 'color', 'value' => 'red' ] ],
				'customCss' => '',
			]
		);
		$repo = new Stub_Manage_Default_Styles_Repository();
		$ability = new Testable_Manage_Default_Styles_Ability( $repo, $css_converter );

		// Act.
		$result = $ability->execute( [
			'dry_run' => true,
			'operations' => [
				[ 'action' => 'update', 'tag' => 'h1', 'css' => 'font-size: 20px;' ],
				[ 'action' => 'update', 'tag' => 'h1', 'css' => 'color: red;' ],
			],
		] );

		// Assert.
		$this->assertTrue( $result['dry_run'] );
		$this->assertSame( 'ok', $result['status'] );
		$this->assertArrayHasKey( 'font-size', $result['results'][1]['variants'][0]['props'] );
		$this->assertArrayHasKey( 'color', $result['results'][1]['variants'][0]['props'] );
		$this->assertSame( [], $repo->puts );
	}

	public function test_dry_run_delete_after_pending_update_in_same_request() {
		// Arrange.
		$css_converter = $this->createMock( Css_Converter::class );
		$css_converter->method( 'parse_nested' )->willReturn( [
			'blocks' => [ [ 'selector' => null, 'css' => 'font-size: 20px;' ] ],
		] );
		$css_converter->method( 'convert' )->willReturn( [
			'props' => [ 'font-size' => [ '$$type' => 'size' ] ],
			'customCss' => '',
		] );
		$repo = new Stub_Manage_Default_Styles_Repository();
		$ability = new Testable_Manage_Default_Styles_Ability( $repo, $css_converter );

		// Act.
		$result = $ability->execute( [
			'dry_run' => true,
			'operations' => [
				[ 'action' => 'update', 'tag' => 'h1', 'css' => 'font-size: 20px;' ],
				[ 'action' => 'delete', 'tag' => 'h1' ],
			],
		] );

		// Assert.
		$this->assertTrue( $result['dry_run'] );
		$this->assertSame( 'ok', $result['status'] );
		$this->assertSame( 'ok', $result['results'][1]['status'] );
		$this->assertSame( [], $repo->deletes );
	}

	public function test_dry_run_delete_validates_without_removing() {
		// Arrange.
		$repo = new Stub_Manage_Default_Styles_Repository( [
			'h1' => [ 'variants' => [ [ 'props' => [ 'color' => 'red' ] ] ] ],
		] );
		$ability = $this->make_ability( $repo );

		// Act.
		$result = $ability->execute( [
			'dry_run' => true,
			'operations' => [ [ 'action' => 'delete', 'tag' => 'h1' ] ],
		] );

		// Assert.
		$this->assertTrue( $result['dry_run'] );
		$this->assertSame( 'ok', $result['status'] );
		$this->assertSame( 'h1', $result['results'][0]['tag'] );
		$this->assertSame( [], $repo->deletes );
		$this->assertArrayNotHasKey( 'default_styles_tag_saved', $this->emitted_events );
		$this->assertArrayNotHasKey( 'default_styles_save_failed', $this->emitted_events );
	}

	public function test_mixed_ops_return_partial_error_status() {
		// Arrange.
		$repo = new Stub_Manage_Default_Styles_Repository( [
			'h1' => [ 'variants' => [] ],
		] );
		$ability = $this->make_ability( $repo );

		// Act.
		$result = $ability->execute( [
			'operations' => [
				[ 'action' => 'delete', 'tag' => 'h1' ],
				[ 'action' => 'delete', 'tag' => 'script' ],
			],
		] );

		// Assert.
		$this->assertSame( 'partial_error', $result['status'] );
		$this->assertCount( 2, $result['results'] );
		$this->assertSame( 'ok', $result['results'][0]['status'] );
		$this->assertSame( 'error', $result['results'][1]['status'] );
	}

	public function test_update_emits_tag_saved_with_modified_sections() {
		// Arrange.
		$css_converter = $this->createMock( Css_Converter::class );
		$css_converter->method( 'parse_nested' )->willReturn( [
			'blocks' => [ [ 'selector' => null, 'css' => 'font-size: 20px;' ] ],
		] );
		$css_converter->method( 'convert' )->willReturn( [
			'props' => [ 'font-size' => [ '$$type' => 'size' ], 'margin' => [ '$$type' => 'dimensions' ] ],
			'customCss' => '',
		] );
		$ability = new Testable_Manage_Default_Styles_Ability( new Stub_Manage_Default_Styles_Repository(), $css_converter );

		// Act.
		$ability->execute( [
			'operations' => [ [ 'action' => 'update', 'tag' => 'h1', 'css' => 'font-size: 20px;' ] ],
		] );

		// Assert.
		$payload = $this->emitted_events['default_styles_tag_saved'][0];

		$this->assertSame( 'h1', $payload['tag'] );
		$this->assertSame( 'set', $payload['action'] );
		$this->assertSame( [ 'spacing', 'typography' ], $payload['sections_modified'] );
		$this->assertSame( 'mcp_tool', $payload['executed_by'] );
	}

	public function test_delete_emits_tag_saved_as_unset() {
		// Arrange.
		$ability = $this->make_ability( new Stub_Manage_Default_Styles_Repository( [ 'h1' => [ 'variants' => [] ] ] ) );

		// Act.
		$ability->execute( [ 'operations' => [ [ 'action' => 'delete', 'tag' => 'h1' ] ] ] );

		// Assert.
		$payload = $this->emitted_events['default_styles_tag_saved'][0];

		$this->assertSame( 'unset', $payload['action'] );
		$this->assertSame( [], $payload['sections_modified'] );
	}

	public function test_failed_operation_emits_save_failed() {
		// Arrange.
		$ability = $this->make_ability();

		// Act.
		$ability->execute( [ 'operations' => [ [ 'action' => 'delete', 'tag' => 'h1' ] ] ] );

		// Assert.
		$this->assertArrayNotHasKey( 'default_styles_tag_saved', $this->emitted_events );
		$this->assertSame( 1, $this->emitted_events['default_styles_save_failed'][0]['tags_changed_count'] );
	}

	public function test_partial_error_emits_save_failed_counting_only_failed_operations() {
		// Arrange.
		$ability = $this->make_ability( new Stub_Manage_Default_Styles_Repository( [
			'h1' => [ 'variants' => [] ],
			'h2' => [ 'variants' => [] ],
		] ) );

		// Act.
		$result = $ability->execute( [
			'operations' => [
				[ 'action' => 'delete', 'tag' => 'h1' ],
				[ 'action' => 'delete', 'tag' => 'h2' ],
				[ 'action' => 'delete', 'tag' => 'script' ],
			],
		] );

		// Assert.
		$this->assertSame( 'partial_error', $result['status'] );
		$this->assertCount( 2, $this->emitted_events['default_styles_tag_saved'] );
		$this->assertCount( 1, $this->emitted_events['default_styles_save_failed'] );
		$this->assertSame( 1, $this->emitted_events['default_styles_save_failed'][0]['tags_changed_count'] );
	}

	public function test_successful_operations_do_not_emit_save_failed() {
		// Arrange.
		$ability = $this->make_ability( new Stub_Manage_Default_Styles_Repository( [ 'h1' => [ 'variants' => [] ] ] ) );

		// Act.
		$result = $ability->execute( [ 'operations' => [ [ 'action' => 'delete', 'tag' => 'h1' ] ] ] );

		// Assert.
		$this->assertSame( 'ok', $result['status'] );
		$this->assertArrayNotHasKey( 'default_styles_save_failed', $this->emitted_events );
	}

	public function test_supports_dry_run() {
		// Arrange.
		$ability = $this->make_ability();

		// Act & Assert.
		$this->assertTrue( $ability->supports_dry_run() );
	}
}
