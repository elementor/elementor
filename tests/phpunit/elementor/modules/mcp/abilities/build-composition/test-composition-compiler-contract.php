<?php

namespace Elementor\Testing\Modules\Mcp\Abilities\Build_Composition;

use Elementor\Modules\Mcp\Abilities\Build_Composition\Subtree_Builder;
use Elementor\Modules\Mcp\Abilities\Build_Composition\Xml_Parser;
use Elementor\Modules\Mcp\Abilities\Utils\Composition_Compiler;
use Elementor\Modules\Mcp\Abilities\Utils\Warnings_Bag;
use ElementorEditorTesting\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Pins what Elementor Pro's `elementor/manage-widget` uses from the composition compiler: a compile with
 * `COMPONENT_PARENT_ID`, the keys it reads from the result, and part markers written through the
 * configuration-id index. A failure here means Pro breaks too.
 *
 * @group Elementor\Modules\Mcp
 */
class Test_Composition_Compiler_Contract extends Elementor_Test_Base {
	const XML = '<e-flexbox configuration-id="root"><e-heading configuration-id="title"/><e-paragraph configuration-id="text"/></e-flexbox>';
	const PART_KEY = 'part';

	public function test_compile__returns_the_keys_pro_reads() {
		// Act.
		$compiled = $this->compile( self::XML );

		// Assert.
		$this->assertIsArray( $compiled );
		$this->assertCount( 1, $compiled['elements'] );
		$this->assertInstanceOf( Warnings_Bag::class, $compiled['warnings'] );
		$this->assertInstanceOf( \DOMDocument::class, $compiled['dom'] );
		$this->assertInstanceOf( Xml_Parser::class, $compiled['xml_parser'] );
		$this->assertSame( [], $compiled['pro_features_discovery'] );
	}

	public function test_compile__with_the_component_parent_keeps_a_widget_root_unwrapped() {
		// Act.
		$compiled = $this->compile( '<e-heading configuration-id="title"/>' );

		// Assert.
		$this->assertCount( 1, $compiled['elements'] );
		$this->assertSame( 'e-heading', $compiled['elements'][0]['widgetType'] );
	}

	public function test_index_by_config_id__writes_through_to_the_compiled_elements() {
		// Arrange.
		$compiled = $this->compile( self::XML );
		$elements = $compiled['elements'];

		// Act.
		$index = ( new Subtree_Builder( $compiled['xml_parser'] ) )->index_by_config_id( $elements, $compiled['dom'] );
		$index['root'][ self::PART_KEY ] = 'root';
		$index['text'][ self::PART_KEY ] = 'body';

		// Assert.
		$this->assertSame( [ 'root', 'title', 'text' ], array_keys( $index ) );
		$this->assertSame( 'root', $elements[0][ self::PART_KEY ] );
		$this->assertSame( 'e-paragraph', $elements[0]['elements'][1]['widgetType'] );
		$this->assertSame( 'body', $elements[0]['elements'][1][ self::PART_KEY ] );
		$this->assertArrayNotHasKey( self::PART_KEY, $elements[0]['elements'][0] );
	}

	private function compile( string $xml ) {
		return Composition_Compiler::make()->compile(
			[ 'xml_structure' => $xml ],
			null,
			[],
			Composition_Compiler::COMPONENT_PARENT_ID
		);
	}
}
