<?php

namespace Elementor\Testing\Modules\Components;

use Elementor\Modules\AtomicWidgets\Parsers\Props_Parser;
use Elementor\Modules\AtomicWidgets\PropTypes\Video_Src_Prop_Type;
use Elementor\Modules\Components\Overridable_Schema_Extender;
use ElementorEditorTesting\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Covers the full save chain for an exposed prop that has no value:
 * Props_Parser -> Union_Prop_Type -> Overridable_Prop_Type -> Video_Src_Prop_Type.
 *
 * `source` on Background Video is the reproduction case from ED-25333 — it declares no
 * top-level default, so exposing it while empty is what produced an unsavable document.
 */
class Test_Overridable_Props_Parsing extends Elementor_Test_Base {

	private function get_schema(): array {
		return Overridable_Schema_Extender::make()->get_extended_schema( [
			'source' => Video_Src_Prop_Type::make()->alias( 'video', 'src' ),
		] );
	}

	private function make_exposed_source( $origin_value ): array {
		return [
			'source' => [
				'$$type' => 'overridable',
				'value' => [
					'override_key' => 'source',
					'origin_value' => $origin_value,
				],
			],
		];
	}

	public function test_parse__normalizes_legacy_empty_origin_value_to_null() {
		// Arrange — an editor version that wrote `{}` instead of `null` for a valueless prop.
		$parser = Props_Parser::make( $this->get_schema() );

		// Act
		$result = $parser->parse( $this->make_exposed_source( [] ) );

		// Assert
		$this->assertTrue( $result->is_valid(), $result->errors()->to_string() );
		$this->assertNull( $result->unwrap()['source']['value']['origin_value'] );
	}

	public function test_parse__accepts_null_origin_value() {
		// Arrange
		$parser = Props_Parser::make( $this->get_schema() );

		// Act
		$result = $parser->parse( $this->make_exposed_source( null ) );

		// Assert
		$this->assertTrue( $result->is_valid(), $result->errors()->to_string() );
		$this->assertNull( $result->unwrap()['source']['value']['origin_value'] );
	}

	public function test_parse__preserves_a_populated_origin_value() {
		// Arrange
		$origin_value = [
			'$$type' => 'video-src',
			'value' => [
				'id' => null,
				'url' => [ '$$type' => 'url', 'value' => 'https://example.com/video.mp4' ],
			],
		];

		$parser = Props_Parser::make( $this->get_schema() );

		// Act
		$result = $parser->parse( $this->make_exposed_source( $origin_value ) );

		// Assert
		$this->assertTrue( $result->is_valid(), $result->errors()->to_string() );
		$this->assertEquals( $origin_value, $result->unwrap()['source']['value']['origin_value'] );
	}
}
