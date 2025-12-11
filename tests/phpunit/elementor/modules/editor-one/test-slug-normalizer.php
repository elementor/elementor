<?php

namespace Elementor\Tests\Phpunit\Elementor\Modules\EditorOne;

use Elementor\Modules\EditorOne\Classes\Slug_Normalizer;
use PHPUnit\Framework\TestCase as PHPUnit_TestCase;

class Test_Slug_Normalizer extends PHPUnit_TestCase {

	private Slug_Normalizer $normalizer;

	public function setUp(): void {
		parent::setUp();
		$this->normalizer = new Slug_Normalizer();
	}

	public function test_normalize__returns_non_url_slug_unchanged() {
		// Arrange
		$slug = 'elementor-settings';

		// Act
		$result = $this->normalizer->normalize( $slug );

		// Assert
		$this->assertEquals( 'elementor-settings', $result );
	}

	public function test_normalize__returns_path_prefixed_slug_unchanged() {
		// Arrange
		$slug = 'edit.php?post_type=elementor_library';

		// Act
		$result = $this->normalizer->normalize( $slug );

		// Assert
		$this->assertEquals( 'edit.php?post_type=elementor_library', $result );
	}

	public function test_normalize__extracts_basename_from_http_url() {
		// Arrange
		$slug = 'https://example.com/wp-admin/admin.php';

		// Act
		$result = $this->normalizer->normalize( $slug );

		// Assert
		$this->assertEquals( 'admin.php', $result );
	}

	public function test_normalize__preserves_query_string_from_http_url() {
		// Arrange
		$slug = 'https://example.com/wp-admin/admin.php?page=elementor';

		// Act
		$result = $this->normalizer->normalize( $slug );

		// Assert
		$this->assertEquals( 'admin.php?page=elementor', $result );
	}

	public function test_normalize__preserves_fragment_from_http_url() {
		// Arrange
		$slug = 'https://example.com/wp-admin/admin.php#section';

		// Act
		$result = $this->normalizer->normalize( $slug );

		// Assert
		$this->assertEquals( 'admin.php#section', $result );
	}

	public function test_normalize__preserves_query_and_fragment_from_http_url() {
		// Arrange
		$slug = 'https://example.com/wp-admin/admin.php?page=elementor#section';

		// Act
		$result = $this->normalizer->normalize( $slug );

		// Assert
		$this->assertEquals( 'admin.php?page=elementor#section', $result );
	}

	public function test_normalize__handles_http_url_without_path() {
		// Arrange
		$slug = 'http://example.com';

		// Act
		$result = $this->normalizer->normalize( $slug );

		// Assert
		$this->assertEquals( '', $result );
	}

	public function test_normalize__handles_empty_string() {
		// Arrange
		$slug = '';

		// Act
		$result = $this->normalizer->normalize( $slug );

		// Assert
		$this->assertEquals( '', $result );
	}

	public function test_normalize__handles_https_url() {
		// Arrange
		$slug = 'https://secure.example.com/wp-admin/edit.php?post_type=page';

		// Act
		$result = $this->normalizer->normalize( $slug );

		// Assert
		$this->assertEquals( 'edit.php?post_type=page', $result );
	}

	public function test_is_excluded__returns_true_for_exact_match() {
		// Arrange
		$item_slug = 'elementor-settings';
		$excluded_slugs = [ 'elementor-settings', 'elementor-tools' ];

		// Act
		$result = $this->normalizer->is_excluded( $item_slug, $excluded_slugs );

		// Assert
		$this->assertTrue( $result );
	}

	public function test_is_excluded__returns_false_when_not_in_list() {
		// Arrange
		$item_slug = 'elementor-other';
		$excluded_slugs = [ 'elementor-settings', 'elementor-tools' ];

		// Act
		$result = $this->normalizer->is_excluded( $item_slug, $excluded_slugs );

		// Assert
		$this->assertFalse( $result );
	}

	public function test_is_excluded__returns_true_for_normalized_match() {
		// Arrange
		$item_slug = 'https://example.com/wp-admin/admin.php?page=elementor';
		$excluded_slugs = [ 'admin.php?page=elementor' ];

		// Act
		$result = $this->normalizer->is_excluded( $item_slug, $excluded_slugs );

		// Assert
		$this->assertTrue( $result );
	}

	public function test_is_excluded__returns_false_for_empty_excluded_list() {
		// Arrange
		$item_slug = 'elementor-settings';
		$excluded_slugs = [];

		// Act
		$result = $this->normalizer->is_excluded( $item_slug, $excluded_slugs );

		// Assert
		$this->assertFalse( $result );
	}

	public function test_is_excluded__checks_exact_before_normalized() {
		// Arrange
		$item_slug = 'edit.php?post_type=elementor_library';
		$excluded_slugs = [ 'edit.php?post_type=elementor_library' ];

		// Act
		$result = $this->normalizer->is_excluded( $item_slug, $excluded_slugs );

		// Assert
		$this->assertTrue( $result );
	}

	public function test_is_excluded__handles_special_characters() {
		// Arrange
		$item_slug = 'edit-tags.php?taxonomy=elementor_library_category&post_type=elementor_library';
		$excluded_slugs = [ 'edit-tags.php?taxonomy=elementor_library_category&post_type=elementor_library' ];

		// Act
		$result = $this->normalizer->is_excluded( $item_slug, $excluded_slugs );

		// Assert
		$this->assertTrue( $result );
	}

	public function test_is_excluded__handles_html_encoded_characters() {
		// Arrange
		$item_slug = 'edit-tags.php?taxonomy=elementor_library_category&amp;post_type=elementor_library';
		$excluded_slugs = [ 'edit-tags.php?taxonomy=elementor_library_category&amp;post_type=elementor_library' ];

		// Act
		$result = $this->normalizer->is_excluded( $item_slug, $excluded_slugs );

		// Assert
		$this->assertTrue( $result );
	}

	public function test_is_excluded__returns_false_for_partial_match() {
		// Arrange
		$item_slug = 'elementor-settings-advanced';
		$excluded_slugs = [ 'elementor-settings' ];

		// Act
		$result = $this->normalizer->is_excluded( $item_slug, $excluded_slugs );

		// Assert
		$this->assertFalse( $result );
	}
}

