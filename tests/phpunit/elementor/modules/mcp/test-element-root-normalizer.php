<?php

namespace Elementor\Tests\Phpunit\Modules\Mcp;

use Elementor\Modules\Mcp\Abilities\Services\Element_Root_Normalizer;
use ElementorEditorTesting\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * @group Elementor\Modules\Mcp
 */
class Test_Element_Root_Normalizer extends Elementor_Test_Base {

	public function test_empty_input__returns_empty_with_no_normalizations() {
		$result = Element_Root_Normalizer::make()->normalize( [] );

		$this->assertSame( [], $result['elements'] );
		$this->assertSame( [], $result['normalizations'] );
	}

	public function test_all_containers__are_unchanged_with_no_normalizations() {
		$input = [
			$this->container( 'a', 'e-div-block' ),
			$this->container( 'b', 'e-flexbox' ),
		];

		$result = Element_Root_Normalizer::make()->normalize( $input );

		$this->assertSame( $input, $result['elements'] );
		$this->assertSame( [], $result['normalizations'] );
	}

	public function test_all_loose_widgets__are_wrapped_in_single_container() {
		$input = [
			$this->widget( 'h1', 'e-heading' ),
			$this->widget( 'p1', 'e-paragraph' ),
			$this->widget( 'b1', 'e-button' ),
		];

		$result = Element_Root_Normalizer::make()->normalize( $input );

		$this->assertCount( 1, $result['elements'] );
		$wrapper = $result['elements'][0];
		$this->assertSame( 'e-div-block', $wrapper['elType'] );
		$this->assertSame( [], $wrapper['settings'] );
		$this->assertArrayHasKey( 'id', $wrapper );
		$this->assertNotEmpty( $wrapper['id'] );
		$this->assertSame( $input, $wrapper['elements'] );

		$this->assertCount( 1, $result['normalizations'] );
		$record = $result['normalizations'][0];
		$this->assertSame( 'root_widget_wrapped', $record['reason'] );
		$this->assertSame( 'e-div-block', $record['wrapper_type'] );
		$this->assertSame( 3, $record['wrapped_count'] );
		$this->assertSame( $wrapper['id'], $record['wrapper_id'] );
	}

	public function test_mixed_root__groups_consecutive_widgets_into_separate_wrappers() {
		$container_mid = $this->container( 'mid', 'e-div-block' );
		$container_late = $this->container( 'late', 'e-flexbox' );

		$input = [
			$this->widget( 'h1', 'e-heading' ),
			$container_mid,
			$this->widget( 'p1', 'e-paragraph' ),
			$this->widget( 'p2', 'e-paragraph' ),
			$container_late,
			$this->widget( 'b1', 'e-button' ),
		];

		$result = Element_Root_Normalizer::make()->normalize( $input );

		$this->assertCount( 5, $result['elements'] );

		// Wrapper 1: one heading
		$this->assertSame( 'e-div-block', $result['elements'][0]['elType'] );
		$this->assertCount( 1, $result['elements'][0]['elements'] );
		$this->assertSame( 'h1', $result['elements'][0]['elements'][0]['id'] );

		// Mid container preserved
		$this->assertSame( $container_mid, $result['elements'][1] );

		// Wrapper 2: two paragraphs
		$this->assertSame( 'e-div-block', $result['elements'][2]['elType'] );
		$this->assertCount( 2, $result['elements'][2]['elements'] );
		$this->assertSame( 'p1', $result['elements'][2]['elements'][0]['id'] );
		$this->assertSame( 'p2', $result['elements'][2]['elements'][1]['id'] );

		// Late container preserved
		$this->assertSame( $container_late, $result['elements'][3] );

		// Wrapper 3: one button
		$this->assertSame( 'e-div-block', $result['elements'][4]['elType'] );
		$this->assertCount( 1, $result['elements'][4]['elements'] );
		$this->assertSame( 'b1', $result['elements'][4]['elements'][0]['id'] );

		$this->assertCount( 3, $result['normalizations'] );
		$this->assertSame( [ 1, 2, 1 ], array_column( $result['normalizations'], 'wrapped_count' ) );
	}

	public function test_widget_nested_inside_root_container__is_not_wrapped() {
		$input = [
			[
				'id' => 'outer',
				'elType' => 'e-div-block',
				'settings' => [],
				'elements' => [
					$this->widget( 'inner', 'e-heading' ),
				],
			],
		];

		$result = Element_Root_Normalizer::make()->normalize( $input );

		$this->assertSame( $input, $result['elements'] );
		$this->assertSame( [], $result['normalizations'] );
	}

	public function test_legacy_section_at_root__is_treated_as_container() {
		$input = [
			[
				'id' => 'legacy',
				'elType' => 'section',
				'settings' => [],
				'elements' => [],
			],
			$this->widget( 'h1', 'e-heading' ),
		];

		$result = Element_Root_Normalizer::make()->normalize( $input );

		$this->assertCount( 2, $result['elements'] );
		$this->assertSame( 'section', $result['elements'][0]['elType'] );
		$this->assertSame( 'e-div-block', $result['elements'][1]['elType'] );
		$this->assertCount( 1, $result['normalizations'] );
	}

	public function test_node_without_eltype__is_treated_as_widget_and_wrapped() {
		$malformed = [ 'widget' => 'unknown-thing', 'text' => 'oops' ];

		$result = Element_Root_Normalizer::make()->normalize( [ $malformed ] );

		$this->assertCount( 1, $result['elements'] );
		$this->assertSame( 'e-div-block', $result['elements'][0]['elType'] );
		$this->assertSame( [ $malformed ], $result['elements'][0]['elements'] );
		$this->assertCount( 1, $result['normalizations'] );
	}

	public function test_non_array_entries__are_skipped() {
		$widget = $this->widget( 'h1', 'e-heading' );

		$result = Element_Root_Normalizer::make()->normalize( [ $widget, 'not-an-array', null, 42 ] );

		$this->assertCount( 1, $result['elements'] );
		$this->assertSame( 'e-div-block', $result['elements'][0]['elType'] );
		$this->assertSame( [ $widget ], $result['elements'][0]['elements'] );
	}

	private function widget( string $id, string $widget_type ): array {
		return [
			'id' => $id,
			'elType' => 'widget',
			'widgetType' => $widget_type,
			'settings' => [],
		];
	}

	private function container( string $id, string $el_type ): array {
		return [
			'id' => $id,
			'elType' => $el_type,
			'settings' => [],
			'elements' => [],
		];
	}
}
