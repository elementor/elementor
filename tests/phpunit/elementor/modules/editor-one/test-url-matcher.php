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

	/**
	 * @dataProvider data_get_match_score
	 */
	public function test_get_match_score( $menu_url, $current_uri, $expected ) {
		$score = $this->url_matcher->get_match_score( $menu_url, $current_uri );
		$this->assertEquals( $expected, $score );
	}

	public function data_get_match_score() {
		return [
			'no_path_menu' => [ '', '/wp-admin/admin.php?page=elementor', -1 ],
			'no_path_current' => [ '/wp-admin/admin.php?page=elementor', '', -1 ],
			'basename_differs' => [ '/wp-admin/admin.php?page=elementor', '/wp-admin/edit.php?post_type=page', -1 ],
			'paths_match_no_query' => [ '/wp-admin/admin.php', '/wp-admin/admin.php', 0 ],
			'all_match' => [ '/wp-admin/admin.php?page=elementor&tab=settings', '/wp-admin/admin.php?page=elementor&tab=settings&extra=value', 2 ],
			'required_param_missing' => [ '/wp-admin/admin.php?page=elementor&tab=settings', '/wp-admin/admin.php?page=elementor', -1 ],
			'param_value_differs' => [ '/wp-admin/admin.php?page=elementor', '/wp-admin/admin.php?page=other-plugin', -1 ],
			'full_urls' => [ 'https://example.com/wp-admin/admin.php?page=elementor', '/wp-admin/admin.php?page=elementor', 1 ],
		];
	}

	/**
	 * @dataProvider data_parse_query_string
	 */
	public function test_parse_query_string( $query, $expected ) {
		$result = $this->url_matcher->parse_query_string( $query );
		$this->assertEquals( $expected, $result );
	}

	public function data_parse_query_string() {
		return [
			'empty' => [ '', [] ],
			'single' => [ 'page=elementor', [ 'page' => 'elementor' ] ],
			'multiple' => [
				'page=elementor&tab=settings&action=edit',
				[ 'page' => 'elementor', 'tab' => 'settings', 'action' => 'edit' ],
			],
			'encoded' => [
				'post_type=elementor_library&taxonomy=elementor_library_category',
				[ 'post_type' => 'elementor_library', 'taxonomy' => 'elementor_library_category' ],
			],
		];
	}

	/**
	 * @dataProvider data_query_params_match
	 */
	public function test_query_params_match( $required, $actual, $expected ) {
		$result = $this->url_matcher->query_params_match( $required, $actual );
		$this->assertEquals( $expected, $result );
	}

	public function data_query_params_match() {
		return [
			'all_present' => [
				[ 'page' => 'elementor', 'tab' => 'settings' ],
				[ 'page' => 'elementor', 'tab' => 'settings', 'extra' => 'value' ],
				true,
			],
			'missing_param' => [
				[ 'page' => 'elementor', 'tab' => 'settings' ],
				[ 'page' => 'elementor' ],
				false,
			],
			'value_differs' => [
				[ 'page' => 'elementor' ],
				[ 'page' => 'other-plugin' ],
				false,
			],
			'empty_required' => [
				[],
				[ 'page' => 'elementor' ],
				true,
			],
			'both_empty' => [
				[],
				[],
				true,
			],
		];
	}
}
