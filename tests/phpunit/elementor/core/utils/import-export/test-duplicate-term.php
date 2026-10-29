<?php
namespace Elementor\Tests\Phpunit\Elementor\Core\Utils\ImportExport;

use Elementor\Core\Utils\ImportExport\Duplicate_Term;
use ElementorEditorTesting\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Test_Duplicate_Term extends Elementor_Test_Base {

	const TAXONOMY = 'nav_menu';

	const LEGACY_CHAIN_LENGTH = 19;

	public function test_generate__returns_first_duplicate() {
		// Arrange
		$this->create_menu( 'main-menu', 'Main Menu' );

		// Act
		$duplicate = Duplicate_Term::generate( 'main-menu', 'Main Menu', self::TAXONOMY );

		// Assert
		$this->assertSame( [
			'slug' => 'main-menu-duplicate',
			'name' => 'Main Menu duplicate',
		], $duplicate );
	}

	public function test_generate__increments_counter_when_duplicate_exists() {
		// Arrange
		$this->create_menu( 'main-menu', 'Main Menu' );
		$this->create_menu( 'main-menu-duplicate', 'Main Menu duplicate' );
		$this->create_menu( 'main-menu-duplicate-2', 'Main Menu duplicate 2' );

		// Act
		$duplicate = Duplicate_Term::generate( 'main-menu', 'Main Menu', self::TAXONOMY );

		// Assert
		$this->assertSame( [
			'slug' => 'main-menu-duplicate-3',
			'name' => 'Main Menu duplicate 3',
		], $duplicate );
	}

	public function test_generate__collapses_legacy_duplicate_chain() {
		// Arrange
		$this->create_menu( 'main-menu-duplicate-duplicate', 'Main Menu duplicate duplicate' );

		// Act
		$duplicate = Duplicate_Term::generate( 'main-menu-duplicate-duplicate', 'Main Menu duplicate duplicate', self::TAXONOMY );

		// Assert
		$this->assertSame( [
			'slug' => 'main-menu-duplicate',
			'name' => 'Main Menu duplicate',
		], $duplicate );
	}

	public function test_generate__terminates_when_legacy_chain_reaches_slug_limit() {
		// Arrange
		$slug = 'main-menu' . str_repeat( '-duplicate', self::LEGACY_CHAIN_LENGTH );
		$name = 'Main Menu' . str_repeat( ' duplicate', self::LEGACY_CHAIN_LENGTH );

		$this->create_menu( 'main-menu-duplicate', 'Main Menu duplicate' );
		$this->create_menu( $slug, $name );

		// Act
		$duplicate = Duplicate_Term::generate( $slug, $name, self::TAXONOMY );

		// Assert
		$this->assertSame( 'main-menu-duplicate-2', $duplicate['slug'] );
		$this->assertSame( 'Main Menu duplicate 2', $duplicate['name'] );
	}

	public function test_generate__keeps_slug_and_name_within_max_length() {
		// Arrange
		$slug = str_repeat( 'a', Duplicate_Term::MAX_LENGTH );
		$name = str_repeat( 'א', Duplicate_Term::MAX_LENGTH );

		$this->create_menu( $slug, $name );

		// Act
		$duplicate = Duplicate_Term::generate( $slug, $name, self::TAXONOMY );
		$inserted = wp_insert_term( $duplicate['name'], self::TAXONOMY, [ 'slug' => $duplicate['slug'] ] );

		// Assert
		$this->assertLessThanOrEqual( Duplicate_Term::MAX_LENGTH, strlen( $duplicate['slug'] ) );
		$this->assertLessThanOrEqual( Duplicate_Term::MAX_LENGTH, mb_strlen( $duplicate['name'] ) );
		$this->assertStringEndsWith( '-duplicate', $duplicate['slug'] );
		$this->assertNotWPError( $inserted );
	}

	private function create_menu( string $slug, string $name ) {
		return $this->factory()->term->create( [
			'taxonomy' => self::TAXONOMY,
			'slug' => $slug,
			'name' => $name,
		] );
	}
}
