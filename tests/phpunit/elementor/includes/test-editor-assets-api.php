<?php
namespace Elementor\Tests\Phpunit\Elementor\Includes;

use Elementor\Includes\EditorAssetsAPI;
use PHPUnit\Framework\TestCase as PHPUnit_TestCase;

class Test_Editor_Assets_API extends PHPUnit_TestCase {

	public function test_has_valid_nested_array_returns_true_when_empty_path_and_valid_non_empty_root() {
		$data = [ 'get_started' => [ 'repeater' => [ 'item' ] ] ];

		$this->assertTrue( EditorAssetsAPI::has_valid_nested_array( $data, [] ) );
	}

	public function test_has_valid_nested_array_returns_false_when_empty_path_and_empty_root() {
		$data = [];

		$this->assertFalse( EditorAssetsAPI::has_valid_nested_array( $data, [] ) );
	}

	public function test_has_valid_nested_array_returns_false_when_empty_path_and_non_array_root() {
		$this->assertFalse( EditorAssetsAPI::has_valid_nested_array( null, [] ) );
		$this->assertFalse( EditorAssetsAPI::has_valid_nested_array( 'invalid', [] ) );
	}

	public function test_has_valid_nested_array_returns_true_for_valid_single_key_path() {
		$data = [ 'get_started' => [ 'item1', 'item2' ] ];

		$this->assertTrue( EditorAssetsAPI::has_valid_nested_array( $data, [ 'get_started' ] ) );
	}

	public function test_has_valid_nested_array_returns_true_for_valid_multi_key_path() {
		$data = [
			'get_started' => [
				'repeater' => [
					[ 'title' => 'Site Settings' ],
					[ 'title' => 'Site Logo' ],
				],
			],
		];

		$this->assertTrue( EditorAssetsAPI::has_valid_nested_array( $data, [ 'get_started', 'repeater' ] ) );
	}

	public function test_has_valid_nested_array_returns_false_when_middle_key_missing() {
		$data = [ 'get_started' => [] ];

		$this->assertFalse( EditorAssetsAPI::has_valid_nested_array( $data, [ 'get_started', 'repeater' ] ) );
	}

	public function test_has_valid_nested_array_returns_false_when_first_key_missing() {
		$data = [];

		$this->assertFalse( EditorAssetsAPI::has_valid_nested_array( $data, [ 'get_started' ] ) );
	}

	public function test_has_valid_nested_array_returns_false_when_final_value_not_array() {
		$data = [ 'get_started' => [ 'repeater' => 'not_an_array' ] ];

		$this->assertFalse( EditorAssetsAPI::has_valid_nested_array( $data, [ 'get_started', 'repeater' ] ) );
	}

	public function test_has_valid_nested_array_returns_false_when_empty_array() {
		$data = [ 'get_started' => [ 'repeater' => [] ] ];

		$this->assertFalse( EditorAssetsAPI::has_valid_nested_array( $data, [ 'get_started', 'repeater' ] ) );
	}

	public function test_has_valid_nested_array_returns_false_when_empty_array_single_key() {
		$data = [ 'sidebar_promotion_variants' => [] ];

		$this->assertFalse( EditorAssetsAPI::has_valid_nested_array( $data, [ 'sidebar_promotion_variants' ] ) );
	}

	public function test_has_valid_nested_array_returns_true_when_first_element_is_array() {
		$data = [ [ 'flags' => true ] ];

		$this->assertTrue( EditorAssetsAPI::has_valid_nested_array( $data, [ 0 ] ) );
	}
}
