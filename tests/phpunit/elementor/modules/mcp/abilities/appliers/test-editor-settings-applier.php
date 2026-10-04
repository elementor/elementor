<?php

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

use Elementor\Modules\Mcp\Abilities\Appliers\Editor_Settings_Applier;
use PHPUnit\Framework\TestCase;

class Test_Editor_Settings_Applier extends TestCase {

	public function test_apply__merges_decorative_into_existing_editor_settings() {
		// Arrange.
		$index = [
			'blob' => [
				'elType' => 'e-div-block',
				'editor_settings' => [ 'title' => 'blob' ],
			],
		];

		// Act.
		$result = ( new Editor_Settings_Applier() )->apply( $index, [ 'blob' => [ 'decorative' => true ] ] );

		// Assert.
		$this->assertSame( [ 'title' => 'blob', 'decorative' => true ], $index['blob']['editor_settings'] );
		$this->assertTrue( $result['warnings']->is_empty() );
	}

	public function test_apply__accepts_object_shaped_settings() {
		// Arrange.
		$index = [ 'blob' => [ 'elType' => 'e-div-block' ] ];

		// Act.
		( new Editor_Settings_Applier() )->apply( $index, [ 'blob' => (object) [ 'decorative' => false ] ] );

		// Assert.
		$this->assertSame( [ 'decorative' => false ], $index['blob']['editor_settings'] );
	}

	public function test_apply__skips_unknown_key_with_warning_and_keeps_known_keys() {
		// Arrange.
		$index = [ 'blob' => [ 'elType' => 'e-div-block', 'editor_settings' => [] ] ];

		// Act.
		$result = ( new Editor_Settings_Applier() )->apply( $index, [
			'blob' => [
				'title' => 'renamed',
				'decorative' => true,
			],
		] );

		// Assert.
		$this->assertSame( [ 'decorative' => true ], $index['blob']['editor_settings'] );
		$this->assertSame( [ 'editor_setting_unknown' ], $result['warnings']->codes() );
		$this->assertSame( 'blob', $result['warnings']->all()[0]['config_id'] );
	}

	public function test_apply__skips_non_boolean_decorative_with_warning() {
		// Arrange.
		$index = [ 'blob' => [ 'elType' => 'e-div-block', 'editor_settings' => [] ] ];

		// Act.
		$result = ( new Editor_Settings_Applier() )->apply( $index, [ 'blob' => [ 'decorative' => 'true' ] ] );

		// Assert.
		$this->assertSame( [], $index['blob']['editor_settings'] );
		$this->assertSame( [ 'editor_setting_invalid' ], $result['warnings']->codes() );
	}

	public function test_apply__warns_when_settings_are_not_an_object() {
		// Arrange.
		$index = [ 'blob' => [ 'elType' => 'e-div-block', 'editor_settings' => [] ] ];

		// Act.
		$result = ( new Editor_Settings_Applier() )->apply( $index, [ 'blob' => true ] );

		// Assert.
		$this->assertSame( [], $index['blob']['editor_settings'] );
		$this->assertSame( [ 'editor_settings_invalid' ], $result['warnings']->codes() );
	}

	public function test_apply__ignores_config_ids_missing_from_index() {
		// Arrange.
		$index = [ 'blob' => [ 'elType' => 'e-div-block', 'editor_settings' => [] ] ];

		// Act.
		$result = ( new Editor_Settings_Applier() )->apply( $index, [ 'ghost' => [ 'decorative' => true ] ] );

		// Assert.
		$this->assertArrayNotHasKey( 'ghost', $index );
		$this->assertTrue( $result['warnings']->is_empty() );
	}
}
