<?php

namespace Elementor\Tests\Phpunit\Elementor\Core\Utils;

use Elementor\Core\Utils\Template_Library_Element_Iterator;
use Elementor\Core\Utils\Template_Library_Import_Export_Utils;
use ElementorEditorTesting\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Test_Template_Library_Utils extends Elementor_Test_Base {

	public function test_filter_items_by_ids_returns_matching_items() {
		$items = [
			'a' => [ 'id' => 'a' ],
			'b' => [ 'id' => 'b' ],
		];

		$result = Template_Library_Import_Export_Utils::filter_items_by_ids( $items, [ 'b', 'missing' ] );

		$this->assertSame( [ 'b' => [ 'id' => 'b' ] ], $result );
	}

	public function test_build_filtered_order_appends_missing_ids() {
		$order = [ 'b' ];
		$items = [
			'a' => [ 'id' => 'a' ],
			'b' => [ 'id' => 'b' ],
		];

		$result = Template_Library_Import_Export_Utils::build_filtered_order( $order, $items );

		$this->assertSame( [ 'b', 'a' ], $result );
	}

	public function test_iterate_applies_callback() {
		$elements = [
			[
				'id' => 'el-1',
				'elType' => 'widget',
				'settings' => [],
				'elements' => [],
			],
		];

		$result = Template_Library_Element_Iterator::iterate(
			$elements,
			function ( $element_data ) {
				$element_data['settings']['flag'] = 'ok';
				return $element_data;
			}
		);

		$this->assertSame( 'ok', $result[0]['settings']['flag'] );
	}

	public function test_items_equal_returns_true_for_identical_arrays() {
		$a = [ 'x' => 1, 'y' => [ 'z' => 2 ] ];
		$b = [ 'y' => [ 'z' => 2 ], 'x' => 1 ];

		$this->assertTrue( Template_Library_Import_Export_Utils::items_equal( $a, $b ) );
	}

	public function test_items_equal_returns_false_for_different_arrays() {
		$a = [ 'x' => 1 ];
		$b = [ 'x' => 2 ];

		$this->assertFalse( Template_Library_Import_Export_Utils::items_equal( $a, $b ) );
	}

	public function test_items_equal_ignoring_keys_excludes_specified_keys() {
		$a = [ 'id' => 'aaa', 'label' => 'Same', 'value' => '#000' ];
		$b = [ 'id' => 'bbb', 'label' => 'Same', 'value' => '#000' ];

		$this->assertTrue(
			Template_Library_Import_Export_Utils::items_equal_ignoring_keys( $a, $b, [ 'id' ] )
		);
	}

	public function test_generate_unique_id_returns_string_with_prefix() {
		$id = Template_Library_Import_Export_Utils::generate_unique_id( [], 'g-' );

		$this->assertStringStartsWith( 'g-', $id );
		$this->assertSame( 9, strlen( $id ) );
	}

	public function test_generate_unique_id_avoids_collisions() {
		$existing = [ 'g-0000000', 'g-1111111' ];

		$id = Template_Library_Import_Export_Utils::generate_unique_id( $existing, 'g-' );

		$this->assertNotContains( $id, $existing );
	}

	public function test_sanitize_import_mode_returns_valid_mode() {
		$this->assertSame( 'match_site', Template_Library_Import_Export_Utils::sanitize_import_mode( 'match_site' ) );
		$this->assertSame( 'keep_create', Template_Library_Import_Export_Utils::sanitize_import_mode( 'keep_create' ) );
		$this->assertSame( 'keep_flatten', Template_Library_Import_Export_Utils::sanitize_import_mode( 'keep_flatten' ) );
	}

	public function test_sanitize_import_mode_defaults_for_invalid_input() {
		$this->assertSame( 'match_site', Template_Library_Import_Export_Utils::sanitize_import_mode( 'invalid' ) );
		$this->assertSame( 'match_site', Template_Library_Import_Export_Utils::sanitize_import_mode( null ) );
		$this->assertSame( 'match_site', Template_Library_Import_Export_Utils::sanitize_import_mode( 42 ) );
		$this->assertSame( 'match_site', Template_Library_Import_Export_Utils::sanitize_import_mode( '' ) );
	}

	public function test_generate_unique_label_prefixes_with_dup() {
		$label = Template_Library_Import_Export_Utils::generate_unique_label( 'Primary', [] );

		$this->assertSame( 'DUP_Primary', $label );
	}

	public function test_generate_unique_label_appends_counter_on_collision() {
		$existing = [ 'DUP_Primary' ];
		$label = Template_Library_Import_Export_Utils::generate_unique_label( 'Primary', $existing );

		$this->assertSame( 'DUP_Primary1', $label );
	}

	public function test_generate_unique_label_increments_counter_for_already_prefixed() {
		$existing = [ 'DUP_Btn' ];
		$label = Template_Library_Import_Export_Utils::generate_unique_label( 'DUP_Btn', $existing );

		$this->assertSame( 'DUP_Btn1', $label );
	}

	public function test_generate_unique_label_truncates_long_labels() {
		$long_label = str_repeat( 'a', 60 );
		$label = Template_Library_Import_Export_Utils::generate_unique_label( $long_label, [] );

		$this->assertLessThanOrEqual( 50, strlen( $label ) );
		$this->assertStringStartsWith( 'DUP_', $label );
	}

	public function test_normalize_string_ids_filters_non_strings() {
		$result = Template_Library_Import_Export_Utils::normalize_string_ids( [ 'a', '', null, 42, 'b', 'a' ] );

		$this->assertSame( [ 'a', 'b' ], $result );
	}

	public function test_extract_labels_returns_string_labels() {
		$items = [
			'a' => [ 'label' => 'Alpha' ],
			'b' => [ 'label' => 'Beta' ],
			'c' => [ 'other' => 'val' ],
		];

		$result = Template_Library_Import_Export_Utils::extract_labels( $items );

		$this->assertSame( [ 'Alpha', 'Beta' ], $result );
	}

	public function test_apply_unique_label_appends_to_existing_labels() {
		$existing = [ 'Alpha' ];
		$item = [ 'label' => 'Alpha' ];

		$result = Template_Library_Import_Export_Utils::apply_unique_label( $item, $existing );

		$this->assertSame( 'DUP_Alpha', $result['label'] );
		$this->assertContains( 'DUP_Alpha', $existing );
	}

	public function test_apply_unique_label_passes_through_unique() {
		$existing = [ 'Alpha' ];
		$item = [ 'label' => 'Beta' ];

		$result = Template_Library_Import_Export_Utils::apply_unique_label( $item, $existing );

		$this->assertSame( 'Beta', $result['label'] );
	}

	public function test_build_label_to_id_index_maps_first_occurrence() {
		$items = [
			'id-1' => [ 'label' => 'Primary' ],
			'id-2' => [ 'label' => 'Secondary' ],
			'id-3' => [ 'label' => 'Primary' ],
		];

		$result = Template_Library_Import_Export_Utils::build_label_to_id_index( $items );

		$this->assertSame( 'id-1', $result['Primary'] );
		$this->assertSame( 'id-2', $result['Secondary'] );
		$this->assertCount( 2, $result );
	}

	public function test_process_import_by_mode_keep_flatten_calls_flatten() {
		$content = [ 'elements' => [] ];
		$snapshot = [ 'data' => [ 'v1' => [] ] ];

		$processed = Template_Library_Import_Export_Utils::process_import_by_mode(
			'keep_flatten',
			$content,
			$snapshot,
			fn() => [],
			fn() => [],
			fn() => [],
			fn( $c, $s ) => array_merge( $c, [ 'flattened' => true ] )
		);

		$this->assertTrue( $processed['content']['flattened'] );
		$this->assertEmpty( $processed['id_map'] );
		$this->assertEmpty( $processed['ids_to_flatten'] );
	}

	public function test_process_import_by_mode_match_site_calls_merge_then_rewrite() {
		$content = [ 'elements' => [] ];
		$snapshot = [ 'data' => [] ];

		$processed = Template_Library_Import_Export_Utils::process_import_by_mode(
			'match_site',
			$content,
			$snapshot,
			fn() => [ 'id_map' => [ 'old' => 'new' ], 'ids_to_flatten' => [] ],
			fn() => [],
			fn( $c, $map ) => array_merge( $c, [ 'rewritten' => $map ] ),
			fn( $c, $s, $ids ) => $c
		);

		$this->assertSame( [ 'old' => 'new' ], $processed['content']['rewritten'] );
		$this->assertSame( [ 'old' => 'new' ], $processed['id_map'] );
	}

	public function test_process_import_by_mode_keep_create_calls_create_and_flatten_overflow() {
		$content = [ 'elements' => [] ];
		$snapshot = [ 'data' => [] ];

		$processed = Template_Library_Import_Export_Utils::process_import_by_mode(
			'keep_create',
			$content,
			$snapshot,
			fn() => [],
			fn() => [ 'id_map' => [ 'a' => 'b' ], 'ids_to_flatten' => [ 'overflow-1' ] ],
			fn( $c, $map ) => array_merge( $c, [ 'rewritten' => true ] ),
			fn( $c, $s, $ids ) => array_merge( $c, [ 'flat_ids' => $ids ] )
		);

		$this->assertTrue( $processed['content']['rewritten'] );
		$this->assertSame( [ 'overflow-1' ], $processed['content']['flat_ids'] );
		$this->assertSame( [ 'a' => 'b' ], $processed['id_map'] );
		$this->assertSame( [ 'overflow-1' ], $processed['ids_to_flatten'] );
	}

	public function test_generate_random_string_returns_correct_length() {
		$result = Template_Library_Import_Export_Utils::generate_random_string( 12 );

		$this->assertSame( 12, strlen( $result ) );
		$this->assertMatchesRegularExpression( '/^[0-9a-f]+$/', $result );
	}

	public function test_recursive_ksort_sorts_nested_arrays() {
		$input = [ 'b' => [ 'y' => 2, 'x' => 1 ], 'a' => 3 ];
		$result = Template_Library_Import_Export_Utils::recursive_ksort( $input );

		$keys = array_keys( $result );
		$this->assertSame( [ 'a', 'b' ], $keys );
		$this->assertSame( [ 'x', 'y' ], array_keys( $result['b'] ) );
	}
}
