<?php

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

use Elementor\Modules\AtomicWidgets\CssConverter\Css_Converter;
use Elementor\Modules\DefaultStyles\Default_Styles_Repository;
use Elementor\Modules\Mcp\Abilities\Manage_Default_Styles_Ability;
use PHPUnit\Framework\TestCase;

// Elementor\Utils is not resolved by the unit-bootstrap autoloader because its file lives under
// includes/utils.php; Default_Styles_Repository::is_allowed_tag depends on it transitively.
require_once dirname( __DIR__, 6 ) . '/includes/utils.php';

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
}
