<?php

namespace Elementor\Testing\Modules\Components\Utils;

use Elementor\Modules\Components\Documents\Component as Component_Document;
use Elementor\Modules\Components\Utils\Component_Title_Duplicator;
use ElementorEditorTesting\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * @group Elementor\Modules\Components
 */
class Test_Component_Title_Duplicator extends Elementor_Test_Base {
	const MULTIBYTE_CHAR = 'ש';

	public function setUp(): void {
		parent::setUp();

		register_post_type( Component_Document::TYPE, [
			'public' => false,
		] );

		Component_Title_Duplicator::reset();
	}

	public function tearDown(): void {
		Component_Title_Duplicator::reset();

		parent::tearDown();
	}

	public function test_get_unique_title__returns_free_title_unchanged() {
		// Arrange
		$this->create_component( 'Other' );

		// Act
		$result = Component_Title_Duplicator::get_unique_title( 'Header' );

		// Assert
		$this->assertSame( 'Header', $result );
	}

	public function test_get_unique_title__suffixes_taken_title() {
		// Arrange
		$this->create_component( 'Header' );

		// Act
		$result = Component_Title_Duplicator::get_unique_title( 'Header' );

		// Assert
		$this->assertSame( 'Header' . Component_Title_Duplicator::SUFFIX, $result );
	}

	public function test_get_unique_title__numbers_suffix_for_claimed_titles() {
		// Arrange
		$this->create_component( 'Header' );
		Component_Title_Duplicator::get_unique_title( 'Header' );

		// Act
		$result = Component_Title_Duplicator::get_unique_title( 'Header' );

		// Assert
		$this->assertSame( 'Header' . Component_Title_Duplicator::SUFFIX . '_2', $result );
	}

	public function test_get_unique_title__matches_case_insensitively() {
		// Arrange
		$this->create_component( 'header' );

		// Act
		$result = Component_Title_Duplicator::get_unique_title( 'Header' );

		// Assert
		$this->assertSame( 'Header' . Component_Title_Duplicator::SUFFIX, $result );
	}

	public function test_get_unique_title__ignores_archived_components() {
		// Arrange
		$archived_id = $this->create_component( 'Header' );
		update_post_meta( $archived_id, Component_Document::ARCHIVED_META_KEY, wp_json_encode( [ 'is_archived' => true ] ) );

		// Act
		$result = Component_Title_Duplicator::get_unique_title( 'Header' );

		// Assert
		$this->assertSame( 'Header', $result );
	}

	public function test_get_unique_title__ignores_excluded_component() {
		// Arrange
		$self_id = $this->create_component( 'Header' );

		// Act
		$result = Component_Title_Duplicator::get_unique_title( 'Header', $self_id );

		// Assert
		$this->assertSame( 'Header', $result );
	}

	public function test_get_unique_title__sanitizes_title() {
		// Arrange
		$this->create_component( 'Header' );

		// Act
		$result = Component_Title_Duplicator::get_unique_title( '<b>Header</b>' );

		// Assert
		$this->assertSame( 'Header' . Component_Title_Duplicator::SUFFIX, $result );
	}

	public function test_get_unique_title__caps_length_without_breaking_multibyte_characters() {
		// Arrange
		$long_title = str_repeat( self::MULTIBYTE_CHAR, Component_Title_Duplicator::TITLE_MAX_LENGTH );
		$this->create_component( $long_title );

		// Act
		$result = Component_Title_Duplicator::get_unique_title( $long_title );

		// Assert
		$this->assertSame( Component_Title_Duplicator::TITLE_MAX_LENGTH, mb_strlen( $result ) );
		$this->assertStringEndsWith( Component_Title_Duplicator::SUFFIX, $result );
		$this->assertTrue( mb_check_encoding( $result, 'UTF-8' ) );
	}

	public function test_get_unique_title__stops_after_max_attempts() {
		// Arrange
		for ( $i = 0; $i <= Component_Title_Duplicator::MAX_ATTEMPTS; $i++ ) {
			Component_Title_Duplicator::get_unique_title( 'Header' );
		}

		// Act
		$result = Component_Title_Duplicator::get_unique_title( 'Header' );

		// Assert
		$this->assertSame( 'Header' . Component_Title_Duplicator::SUFFIX . '_' . Component_Title_Duplicator::MAX_ATTEMPTS, $result );
	}

	public function test_get_unique_title__loads_titles_from_database_once() {
		// Arrange
		Component_Title_Duplicator::get_unique_title( 'First' );
		$this->create_component( 'Late' );

		// Act
		$result = Component_Title_Duplicator::get_unique_title( 'Late' );

		// Assert
		$this->assertSame( 'Late', $result );
	}

	public function test_reset__forces_reload_from_database() {
		// Arrange
		Component_Title_Duplicator::get_unique_title( 'First' );
		$this->create_component( 'Late' );
		Component_Title_Duplicator::reset();

		// Act
		$result = Component_Title_Duplicator::get_unique_title( 'Late' );

		// Assert
		$this->assertSame( 'Late' . Component_Title_Duplicator::SUFFIX, $result );
	}

	private function create_component( string $title ): int {
		return $this->factory()->post->create( [
			'post_type' => Component_Document::TYPE,
			'post_status' => 'publish',
			'post_title' => $title,
		] );
	}
}
