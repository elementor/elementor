<?php

namespace Elementor\Tests\Phpunit\Elementor\Modules\Variables\Abilities;

use Elementor\Core\Kits\Documents\Kit;
use Elementor\Core\Kits\Manager as Kits_Manager;
use Elementor\Modules\Variables\Abilities\Variables_Ability;
use Elementor\Modules\Variables\Storage\Constants;
use PHPUnit\Framework\TestCase;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * @group Elementor\Modules
 * @group Elementor\Modules\Variables
 */
class Test_Variables_Ability extends TestCase {

	private Kit $kit;
	private Kits_Manager $kits_manager;
	private Variables_Ability $ability;

	protected function setUp(): void {
		parent::setUp();

		$this->kit          = $this->createMock( Kit::class );
		$this->kits_manager = $this->createMock( Kits_Manager::class );
		$this->kits_manager->method( 'get_active_kit' )->willReturn( $this->kit );
		$this->ability = new Variables_Ability( $this->kits_manager );
	}

	public function test_execute__returns_all_expected_keys(): void {
		// Arrange
		$this->kit->method( 'get_json_meta' )->willReturn( [ 'format_version' => 2, 'data' => [] ] );

		// Act
		$result = $this->ability->execute( [] );

		// Assert
		$this->assertArrayHasKey( 'data', $result );
		$this->assertArrayHasKey( 'count', $result );
		$this->assertArrayHasKey( 'supported_types', $result );
		$this->assertArrayHasKey( 'max_per_site', $result );
	}

	public function test_execute__returns_raw_variable_data_from_kit(): void {
		// Arrange
		$variables = [
			'format_version' => 2,
			'data' => [
				'e-gv-abc' => [ 'type' => 'color', 'label' => 'Primary', 'value' => '#FF0000' ],
				'e-gv-def' => [ 'type' => 'font',  'label' => 'Body',    'value' => 'Arial' ],
			],
		];

		$this->kit->method( 'get_json_meta' )
			->with( Constants::VARIABLES_META_KEY )
			->willReturn( $variables );

		// Act
		$result = $this->ability->execute( [] );

		// Assert
		$this->assertSame( $variables, $result['data'] );
	}

	public function test_execute__counts_entries_in_data_key(): void {
		// Arrange
		$this->kit->method( 'get_json_meta' )->willReturn( [
			'format_version' => 2,
			'data' => [
				'e-gv-1' => [ 'type' => 'color', 'label' => 'One',   'value' => '#111' ],
				'e-gv-2' => [ 'type' => 'color', 'label' => 'Two',   'value' => '#222' ],
				'e-gv-3' => [ 'type' => 'color', 'label' => 'Three', 'value' => '#333' ],
			],
		] );

		// Act
		$result = $this->ability->execute( [] );

		// Assert
		$this->assertSame( 3, $result['count'] );
	}

	public function test_execute__normalizes_non_array_variables_to_default_structure(): void {
		// Arrange
		$this->kit->method( 'get_json_meta' )->willReturn( false );

		// Act
		$result = $this->ability->execute( [] );

		// Assert
		$this->assertSame( Constants::FORMAT_VERSION_V2, $result['data']['format_version'] );
		$this->assertSame( [], $result['data']['data'] );
		$this->assertSame( 0, $result['count'] );
	}

	public function test_execute__supported_types_contains_color_font_size(): void {
		// Arrange
		$this->kit->method( 'get_json_meta' )->willReturn( [ 'format_version' => 2, 'data' => [] ] );

		// Act
		$result = $this->ability->execute( [] );

		// Assert
		$this->assertContains( 'color', $result['supported_types'] );
		$this->assertContains( 'font',  $result['supported_types'] );
		$this->assertContains( 'size',  $result['supported_types'] );
	}

	public function test_execute__max_per_site_matches_constants(): void {
		// Arrange
		$this->kit->method( 'get_json_meta' )->willReturn( [ 'format_version' => 2, 'data' => [] ] );

		// Act
		$result = $this->ability->execute( [] );

		// Assert
		$this->assertSame( Constants::TOTAL_VARIABLES_COUNT, $result['max_per_site'] );
	}
}
