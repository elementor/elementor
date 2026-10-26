<?php

namespace Elementor\Modules\Components\ImportExport\ImportStrategies;

use Elementor\Modules\Components\Components_Repository;
use PHPUnit\Framework\TestCase;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

function wp_generate_uuid4() {
	return 'generated-uid';
}

class Stub_Components_Repository extends Components_Repository {
	public ?int $existing_component_id = null;
	public array $existing_titles = [];

	public function find_by_uid( string $uid ): ?int {
		return $this->existing_component_id;
	}

	public function title_exists( string $title, int $exclude_id = 0 ): bool {
		return in_array( $title, $this->existing_titles, true );
	}
}

/**
 * @group components-import-export
 */
class Test_Duplicate_Strategy extends TestCase {
	public function test_resolve__keeps_original_uid_when_no_duplicate_exists() {
		// Arrange
		$repository = new Stub_Components_Repository();
		$strategy = new Duplicate_Strategy( $repository );

		// Act
		$result = $strategy->resolve( [
			'id' => 10,
			'uid' => 'source-uid',
			'title' => 'Hero',
		] );

		// Assert
		$this->assertSame( 'source-uid', $result->get_uid() );
		$this->assertSame( 'Hero', $result->get_title() );
		$this->assertSame( Duplicate_Strategy::NAME, $result->get_strategy() );
	}

	public function test_resolve__generates_new_uid_when_duplicate_exists() {
		// Arrange
		$repository = new Stub_Components_Repository();
		$repository->existing_component_id = 99;
		$strategy = new Duplicate_Strategy( $repository );

		// Act
		$result = $strategy->resolve( [
			'id' => 10,
			'uid' => 'source-uid',
			'title' => 'Hero',
		] );

		// Assert
		$this->assertSame( 'generated-uid', $result->get_uid() );
	}

	public function test_resolve__generates_new_uid_when_record_has_no_uid() {
		// Arrange
		$repository = new Stub_Components_Repository();
		$strategy = new Duplicate_Strategy( $repository );

		// Act
		$result = $strategy->resolve( [
			'id' => 10,
			'title' => 'Hero',
		] );

		// Assert
		$this->assertSame( 'generated-uid', $result->get_uid() );
	}

	public function test_resolve__adds_duplicate_suffix_until_title_is_unique() {
		// Arrange
		$repository = new Stub_Components_Repository();
		$repository->existing_titles = [ 'Hero', 'Hero_DUP' ];
		$strategy = new Duplicate_Strategy( $repository );

		// Act
		$result = $strategy->resolve( [
			'id' => 10,
			'uid' => 'source-uid',
			'title' => 'Hero',
		] );

		// Assert
		$this->assertSame( 'Hero_DUP_DUP', $result->get_title() );
	}

	public function test_factory__falls_back_to_duplicate_strategy_for_unknown_values() {
		// Act
		$strategy = Import_Strategy_Factory::make( 'replace' );

		// Assert
		$this->assertInstanceOf( Duplicate_Strategy::class, $strategy );
	}
}
