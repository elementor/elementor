<?php

namespace Elementor\Modules\Components\ImportExportCustomization\ImportStrategies;

use Elementor\Modules\Components\Components_Repository;
use Elementor\Modules\Components\Documents\Component as Component_Document;
use PHPUnit\Framework\TestCase;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

function wp_generate_uuid4() {
	return 'generated-uid';
}

class Stub_Components_Repository extends Components_Repository {
	public ?Component_Document $existing_component = null;

	public function find_by_uid( string $uid, bool $include_autosave = false ): ?Component_Document {
		return $this->existing_component;
	}
}

class Test_Duplicate_Strategy extends TestCase {
	public function test_resolve_keeps_original_uid_when_no_duplicate_exists() {
		// Arrange.
		$repository = new Stub_Components_Repository();
		$strategy = new Duplicate_Strategy( $repository );

		// Act.
		$result = $strategy->resolve( [ 'uid' => 'source-uid' ] );

		// Assert.
		$this->assertTrue( $result->should_create_document() );
		$this->assertSame( 'source-uid', $result->get_uid() );
	}

	public function test_resolve_generates_new_uid_when_duplicate_exists() {
		// Arrange.
		$repository = new Stub_Components_Repository();
		$repository->existing_component = $this->createMock( Component_Document::class );
		$strategy = new Duplicate_Strategy( $repository );

		// Act.
		$result = $strategy->resolve( [ 'uid' => 'source-uid' ] );

		// Assert.
		$this->assertSame( 'generated-uid', $result->get_uid() );
	}

	public function test_resolve_generates_new_uid_when_record_has_no_uid() {
		// Arrange.
		$repository = new Stub_Components_Repository();
		$strategy = new Duplicate_Strategy( $repository );

		// Act.
		$result = $strategy->resolve( [ 'id' => 10 ] );

		// Assert.
		$this->assertTrue( $result->should_create_document() );
		$this->assertSame( 'generated-uid', $result->get_uid() );
	}

	public function test_factory_falls_back_to_duplicate_strategy_for_unknown_values() {
		// Arrange.
		$factory = new Import_Strategy_Factory( new Stub_Components_Repository() );

		// Act.
		$strategy = $factory->create( 'replace' );

		// Assert.
		$this->assertInstanceOf( Duplicate_Strategy::class, $strategy );
	}
}
