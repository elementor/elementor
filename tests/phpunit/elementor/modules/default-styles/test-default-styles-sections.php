<?php

namespace Elementor\Testing\Modules\DefaultStyles;

use Elementor\Modules\DefaultStyles\Default_Styles_Sections;
use PHPUnit\Framework\TestCase;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Test_Default_Styles_Sections extends TestCase {

	private const STYLE_SECTIONS_SOURCE = 'packages/packages/core/editor-editing-panel/src/components/style-sections-definition.ts';

	public function test_section_props_match_the_editor_style_sections_definition() {
		// Arrange.
		$source = file_get_contents( dirname( __DIR__, 5 ) . '/' . self::STYLE_SECTIONS_SOURCE );

		preg_match_all( "/name: '(\w+)',.*?fields: \[(.*?)\]/s", $source, $matches, PREG_SET_ORDER );

		$editor_sections = [];

		foreach ( $matches as $match ) {
			preg_match_all( "/'([\w-]+)'/", $match[2], $fields );

			$editor_sections[ strtolower( $match[1] ) ] = $fields[1];
		}

		// Assert.
		$this->assertSame( $editor_sections, Default_Styles_Sections::SECTION_PROPS );
	}

	public function test_for_variants_returns_touched_sections_including_removed_props_and_custom_css() {
		// Arrange.
		$variants = [
			[ 'props' => [ 'font-size' => [], 'unknown-prop' => [] ], 'custom_css' => [ 'raw' => 'YQ==' ] ],
			[ 'props' => [], 'null_props' => [ 'border-radius' ] ],
		];

		// Act.
		$sections = Default_Styles_Sections::for_variants( $variants );

		// Assert.
		$this->assertSame( [ 'typography', 'border', 'custom_css' ], $sections );
	}
}
