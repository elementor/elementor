<?php
namespace Elementor\Tests\Phpunit\Elementor\Core\Utils\ImportExport;

use Elementor\Core\Utils\ImportExport\Url;
use ElementorEditorTesting\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Test_Url extends Elementor_Test_Base {

	const PERMALINK_STRUCTURE_PLAIN = '';
	const PERMALINK_STRUCTURE_POST_NAME = '/%postname%/';

	private $page;

	private $wp_rewrite;

	public function setUp(): void {
		parent::setUp();
		global $wp_rewrite;

		$this->wp_rewrite = $wp_rewrite;
		$this->page = $this->factory()->post->create_and_get( [ 'post_type' => 'page' ] );
	}

	public function tearDown(): void {
		parent::tearDown();

		$this->wp_rewrite->set_permalink_structure( static::PERMALINK_STRUCTURE_PLAIN );
	}

	/**
	 * Plain permalink structure
	 */

	public function test_migrate__plain_to_post_name_permalink() {
		// Arrange
		$this->wp_rewrite->set_permalink_structure( static::PERMALINK_STRUCTURE_PLAIN );

		$base_url = 'https://test.local';
		$url = $base_url . '/' . $this->page->post_name;

		// Act
		$modified_url = Url::migrate( $url, $base_url );

		// Assert
		$this->assertEquals( '/?page_id=' . $this->page->ID, $modified_url );
	}

	public function test_migrate__plain_to_post_name_permalink_with_query_args_and_anchor() {
		// Arrange
		$this->wp_rewrite->set_permalink_structure( static::PERMALINK_STRUCTURE_PLAIN );

		$base_url = 'https://test.local';
		$query_args= 'a=aa&b=bb';
		$query_args_that_should_be_removed = '&p=12&page_id=13';

		$url = $base_url . '/' . $this->page->post_name .'?' . $query_args . $query_args_that_should_be_removed . '#anchor';

		// Act
		$modified_url = Url::migrate( $url, $base_url );

		// Assert
		$this->assertEquals( '/?page_id=' . $this->page->ID . '&' . $query_args . '#anchor', $modified_url );
	}

	/**
	 * Post name permalink structure
	 */

	public function test_migrate__post_name_to_post_name_permalink() {
		// Arrange
		$this->wp_rewrite->set_permalink_structure( static::PERMALINK_STRUCTURE_POST_NAME );

		$base_url = 'https://test.local';
		$url = $base_url . '/' . $this->page->post_name;

		// Act
		$modified_url = Url::migrate( $url, $base_url );

		// Assert
		$this->assertEquals( '/' . $this->page->post_name . '/', $modified_url );
	}

	public function test_migrate__post_name_to_post_name_permalink_with_different_base_url() {
		// Arrange
		$this->wp_rewrite->set_permalink_structure( static::PERMALINK_STRUCTURE_POST_NAME );

		$base_url = 'https://test.local';
		$url = 'test.local/' . $this->page->post_name;

		// Act
		$modified_url = Url::migrate( $url, $base_url );

		// Assert
		$this->assertEquals( $url, $modified_url );
	}

	public function test_migrate__post_name_permalink_with_query_args_and_anchor() {
		// Arrange
		$this->wp_rewrite->set_permalink_structure( static::PERMALINK_STRUCTURE_POST_NAME );

		$base_url = 'https://test.local';
		$query_args= 'a=aa&b=bb';

		$url = $base_url . '/' . $this->page->post_name .'?' . $query_args . '#anchor';

		// Act
		$modified_url = Url::migrate( $url, $base_url );

		// Assert
		$this->assertEquals( '/' . $this->page->post_name . '/?' . $query_args . '#anchor', $modified_url );
	}

	/**
	 * General tests regardless the permalink structure
	 */

	public function test_migrate__plain_permalink_will_do_noting() {
		// Arrange
		$base_url = 'https://test.local';
		$query_args = '&a=aa&b=bb';

		$url = $base_url . '/?p=' . $this->page->ID . $query_args;

		// Act
		$modified_url = Url::migrate( $url, $base_url );

		// Assert
		$this->assertEquals( $url, $modified_url );
	}

	public function test_migrate__full_dynamic_url() {
		// Arrange
		$url = 'https://www.test.local';

		// Act
		$modified_url = Url::migrate( $url );

		// Assert
		$this->assertEquals( $url, $modified_url );
	}

	public function test_migrate__dynamic_url() {
		// Arrange
		$url = 'test.local';

		// Act
		$modified_url = Url::migrate( $url );

		// Assert
		$this->assertEquals( $url, $modified_url );
	}

	public function test_migrate__dynamic_url_with_path() {
		// Arrange
		$base_url = 'https://test.local/';
		$url = $base_url .$this->page->post_name;

		// Act
		$modified_url = Url::migrate( $url );

		// Assert
		$this->assertEquals( $url, $modified_url );
	}

	public function test_migrate__url_without_actual_reference() {
		// Arrange
		$url = 'https://www.test.local/not-refer-to-any-post/';
		$base_url = 'https://www.test.local';

		// Act
		$modified_url = Url::migrate( $url, $base_url );

		// Assert
		$this->assertEquals( $url, $modified_url );
	}

	public function test_migrate__relative_url_without_actual_reference() {
		// Arrange
		$url = '/not-refer-to-any-post/';

		// Act
		$modified_url = Url::migrate( $url );

		// Assert
		$this->assertEquals( $url, $modified_url );
	}
}
