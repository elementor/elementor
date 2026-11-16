<?php

namespace Elementor\Testing\Modules\AtomicWidgets\PropTypeMigrations;

use Elementor\Modules\AtomicWidgets\PropTypeMigrations\Migration_Interpreter;
use Elementor\Modules\AtomicWidgets\PropTypeMigrations\Migrations_Loader;
use Elementor\Modules\AtomicWidgets\PropTypes\Icon_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Primitives\String_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Svg_Src_Prop_Type;
use ElementorEditorTesting\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * @group prop-type-migrations
 */
class Test_Svg_Src_To_Icon_Migration extends Elementor_Test_Base {

	private array $migration;

	public function setUp(): void {
		parent::setUp();

		$path = ELEMENTOR_PATH . 'migrations/operations/svg-src-to-icon.json';
		$this->migration = json_decode( file_get_contents( $path ), true );
	}

	public function tearDown(): void {
		Migrations_Loader::destroy();
		parent::tearDown();
	}

	public function test_up__does_not_convert_svg_src_to_icon() {
		// Arrange
		$data = $this->make_svg_src_data();

		// Act
		$result = Migration_Interpreter::run( $this->migration, $data, 'up' );

		// Assert
		$this->assertSame( $data, $result );
	}

	public function test_down__converts_icon_to_valid_svg_src() {
		// Arrange
		$data = $this->make_icon_data();

		// Act
		$result = Migration_Interpreter::run( $this->migration, $data, 'down' );

		// Assert
		$this->assertSame( 'svg-src', $result['$$type'] );
		$this->assertArrayNotHasKey( 'library', $result['value'] );
		$this->assertTrue( Svg_Src_Prop_Type::make()->validate( $result ) );
	}

	public function test_find_migration_path__icon_to_svg_src_is_down() {
		// Arrange
		$loader = Migrations_Loader::make( ELEMENTOR_PATH . 'migrations/' );

		// Act
		$result = $loader->find_migration_path( 'icon', 'svg-src' );

		// Assert
		$this->assertNotNull( $result );
		$this->assertSame( 'down', $result['direction'] );
		$this->assertCount( 1, $result['migrations'] );
		$this->assertSame( 'svg-src-to-icon', $result['migrations'][0]['id'] );
	}

	private function make_icon_data(): array {
		return Icon_Prop_Type::generate( [
			'value' => String_Prop_Type::generate( 'fas fa-star' ),
			'library' => String_Prop_Type::generate( 'fa-solid' ),
		] );
	}

	private function make_svg_src_data(): array {
		return Svg_Src_Prop_Type::generate( [
			'id' => null,
			'url' => [
				'$$type' => 'url',
				'value' => 'https://example.com/uploaded.svg',
			],
		] );
	}
}
