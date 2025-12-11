<?php

namespace Elementor\Tests\Phpunit\Elementor\Modules\EditorOne;

use Elementor\Modules\EditorOne\Classes\Url_Matcher;
use PHPUnit\Framework\TestCase as PHPUnit_TestCase;

class Test_Url_Matcher extends PHPUnit_TestCase {

	private Url_Matcher $url_matcher;

	public function setUp(): void {
		parent::setUp();
		$this->url_matcher = new Url_Matcher();
	}

	public function test_get_match_score__returns_negative_when_menu_url_has_no_path() {
		// Arrange
		$menu_url = '';
		$current_uri = '/wp-admin/admin.php?page=elementor';

		// Act
		$score = $this->url_matcher->get_match_score( $menu_url, $current_uri );

		// Assert
		$this->assertEquals( -1, $score );
	}

	public function test_get_match_score__returns_negative_when_current_uri_has_no_path() {
		// Arrange
		$menu_url = '/wp-admin/admin.php?page=elementor';
		$current_uri = '';

		// Act
		$score = $this->url_matcher->get_match_score( $menu_url, $current_uri );

		// Assert
		$this->assertEquals( -1, $score );
	}

	public function test_get_match_score__returns_negative_when_basenames_differ() {
		// Arrange
		$menu_url = '/wp-admin/admin.php?page=elementor';
		$current_uri = '/wp-admin/edit.php?post_type=page';

		// Act
		$score = $this->url_matcher->get_match_score( $menu_url, $current_uri );

		// Assert
		$this->assertEquals( -1, $score );
	}

	public function test_get_match_score__returns_zero_when_paths_match_with_no_query() {
		// Arrange
		$menu_url = '/wp-admin/admin.php';
		$current_uri = '/wp-admin/admin.php';

		// Act
		$score = $this->url_matcher->get_match_score( $menu_url, $current_uri );

		// Assert
		$this->assertEquals( 0, $score );
	}

	public function test_get_match_score__returns_query_param_count_when_all_match() {
		// Arrange
		$menu_url = '/wp-admin/admin.php?page=elementor&tab=settings';
		$current_uri = '/wp-admin/admin.php?page=elementor&tab=settings&extra=value';

		// Act
		$score = $this->url_matcher->get_match_score( $menu_url, $current_uri );

		// Assert
		$this->assertEquals( 2, $score );
	}

	public function test_get_match_score__returns_negative_when_required_param_missing() {
		// Arrange
		$menu_url = '/wp-admin/admin.php?page=elementor&tab=settings';
		$current_uri = '/wp-admin/admin.php?page=elementor';

		// Act
		$score = $this->url_matcher->get_match_score( $menu_url, $current_uri );

		// Assert
		$this->assertEquals( -1, $score );
	}

	public function test_get_match_score__returns_negative_when_param_value_differs() {
		// Arrange
		$menu_url = '/wp-admin/admin.php?page=elementor';
		$current_uri = '/wp-admin/admin.php?page=other-plugin';

		// Act
		$score = $this->url_matcher->get_match_score( $menu_url, $current_uri );

		// Assert
		$this->assertEquals( -1, $score );
	}

	public function test_get_match_score__handles_full_urls() {
		// Arrange
		$menu_url = 'https://example.com/wp-admin/admin.php?page=elementor';
		$current_uri = '/wp-admin/admin.php?page=elementor';

		// Act
		$score = $this->url_matcher->get_match_score( $menu_url, $current_uri );

		// Assert
		$this->assertEquals( 1, $score );
	}

	public function test_parse_query_string__returns_empty_array_for_empty_string() {
		// Arrange
		$query = '';

		// Act
		$result = $this->url_matcher->parse_query_string( $query );

		// Assert
		$this->assertEquals( [], $result );
	}

	public function test_parse_query_string__parses_single_param() {
		// Arrange
		$query = 'page=elementor';

		// Act
		$result = $this->url_matcher->parse_query_string( $query );

		// Assert
		$this->assertEquals( [ 'page' => 'elementor' ], $result );
	}

	public function test_parse_query_string__parses_multiple_params() {
		// Arrange
		$query = 'page=elementor&tab=settings&action=edit';

		// Act
		$result = $this->url_matcher->parse_query_string( $query );

		// Assert
		$expected = [
			'page' => 'elementor',
			'tab' => 'settings',
			'action' => 'edit',
		];
		$this->assertEquals( $expected, $result );
	}

	public function test_parse_query_string__handles_encoded_characters() {
		// Arrange
		$query = 'post_type=elementor_library&taxonomy=elementor_library_category';

		// Act
		$result = $this->url_matcher->parse_query_string( $query );

		// Assert
		$expected = [
			'post_type' => 'elementor_library',
			'taxonomy' => 'elementor_library_category',
		];
		$this->assertEquals( $expected, $result );
	}

	public function test_query_params_match__returns_true_when_all_required_present() {
		// Arrange
		$required = [ 'page' => 'elementor', 'tab' => 'settings' ];
		$actual = [ 'page' => 'elementor', 'tab' => 'settings', 'extra' => 'value' ];

		// Act
		$result = $this->url_matcher->query_params_match( $required, $actual );

		// Assert
		$this->assertTrue( $result );
	}

	public function test_query_params_match__returns_false_when_required_param_missing() {
		// Arrange
		$required = [ 'page' => 'elementor', 'tab' => 'settings' ];
		$actual = [ 'page' => 'elementor' ];

		// Act
		$result = $this->url_matcher->query_params_match( $required, $actual );

		// Assert
		$this->assertFalse( $result );
	}

	public function test_query_params_match__returns_false_when_values_differ() {
		// Arrange
		$required = [ 'page' => 'elementor' ];
		$actual = [ 'page' => 'other-plugin' ];

		// Act
		$result = $this->url_matcher->query_params_match( $required, $actual );

		// Assert
		$this->assertFalse( $result );
	}

	public function test_query_params_match__returns_true_for_empty_required() {
		// Arrange
		$required = [];
		$actual = [ 'page' => 'elementor' ];

		// Act
		$result = $this->url_matcher->query_params_match( $required, $actual );

		// Assert
		$this->assertTrue( $result );
	}

	public function test_query_params_match__returns_true_for_both_empty() {
		// Arrange
		$required = [];
		$actual = [];

		// Act
		$result = $this->url_matcher->query_params_match( $required, $actual );

		// Assert
		$this->assertTrue( $result );
	}
}

