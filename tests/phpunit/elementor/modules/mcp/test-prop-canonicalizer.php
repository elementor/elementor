<?php

namespace Elementor\Tests\Phpunit\Modules\Mcp;

use Elementor\Modules\AtomicWidgets\PropTypes\Html_V3_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Primitives\String_Prop_Type;
use Elementor\Modules\Mcp\Abilities\Prop_Canonicalizer;
use ElementorEditorTesting\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * @group Elementor\Modules\Mcp
 */
class Test_Prop_Canonicalizer extends Elementor_Test_Base {

	public function test_resolve_canonical_key__returns_key_when_canonical() {
		// Arrange
		$schema = [
			'title' => String_Prop_Type::make(),
			'tag' => String_Prop_Type::make(),
		];

		// Act
		$result = Prop_Canonicalizer::resolve_canonical_key( $schema, 'title' );

		// Assert
		$this->assertSame( 'title', $result );
	}

	public function test_resolve_canonical_key__resolves_alias_to_canonical() {
		// Arrange
		$schema = [
			'title' => String_Prop_Type::make()->alias( 'content', 'text' ),
			'tag' => String_Prop_Type::make(),
		];

		// Act
		$result_content = Prop_Canonicalizer::resolve_canonical_key( $schema, 'content' );
		$result_text = Prop_Canonicalizer::resolve_canonical_key( $schema, 'text' );

		// Assert
		$this->assertSame( 'title', $result_content );
		$this->assertSame( 'title', $result_text );
	}

	public function test_resolve_canonical_key__returns_null_for_unknown() {
		// Arrange
		$schema = [
			'title' => String_Prop_Type::make(),
		];

		// Act
		$result = Prop_Canonicalizer::resolve_canonical_key( $schema, 'nonexistent' );

		// Assert
		$this->assertNull( $result );
	}

	public function test_resolve_canonical_prop_keys__transforms_all_keys() {
		// Arrange
		$schema = [
			'title' => String_Prop_Type::make()->alias( 'content' ),
			'tag' => String_Prop_Type::make(),
		];
		$props = [
			'content' => 'Hello',
			'tag' => 'h1',
		];

		// Act
		$result = Prop_Canonicalizer::resolve_canonical_prop_keys( $schema, $props );

		// Assert
		$this->assertArrayHasKey( 'title', $result );
		$this->assertArrayHasKey( 'tag', $result );
		$this->assertArrayNotHasKey( 'content', $result );
		$this->assertSame( 'Hello', $result['title'] );
		$this->assertSame( 'h1', $result['tag'] );
	}

	public function test_resolve_canonical_prop_keys__preserves_unknown_keys() {
		// Arrange
		$schema = [
			'title' => String_Prop_Type::make(),
		];
		$props = [
			'title' => 'Hello',
			'unknown' => 'value',
		];

		// Act
		$result = Prop_Canonicalizer::resolve_canonical_prop_keys( $schema, $props );

		// Assert
		$this->assertArrayHasKey( 'title', $result );
		$this->assertArrayHasKey( 'unknown', $result );
	}

	public function test_resolve_canonical_prop_keys__does_not_overwrite_existing_canonical() {
		// Arrange
		$schema = [
			'title' => String_Prop_Type::make()->alias( 'content' ),
		];
		$props = [
			'title' => 'Original',
			'content' => 'From alias',
		];

		// Act
		$result = Prop_Canonicalizer::resolve_canonical_prop_keys( $schema, $props );

		// Assert
		$this->assertSame( 'Original', $result['title'] );
	}

	public function test_available_prop_names__returns_canonical_keys() {
		// Arrange
		$schema = [
			'title' => String_Prop_Type::make()->alias( 'content' ),
			'tag' => String_Prop_Type::make(),
			'link' => String_Prop_Type::make(),
		];

		// Act
		$result = Prop_Canonicalizer::available_prop_names( $schema );

		// Assert
		$this->assertSame( [ 'title', 'tag', 'link' ], $result );
	}
}
