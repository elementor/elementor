<?php
namespace Elementor\Testing\Modules\AtomicWidgets\Styles;

use Elementor\Modules\AtomicWidgets\Styles\CSS_Files_Manager;
use ElementorEditorTesting\Elementor_Test_Base;
use Elementor\Modules\AtomicWidgets\Styles\Style_File;
use WP_Filesystem_Base;

class Test_Css_Files_Manager extends Elementor_Test_Base {
	private $filesystemMock;

	public function setUp(): void {
		parent::setUp();

		require_once ABSPATH . 'wp-admin/includes/class-wp-filesystem-base.php';

		// Mock the filesystem
		$this->filesystemMock = $this->createMock(WP_Filesystem_Base::class);
		$this->filesystemMock->method('abspath')->willReturn(ABSPATH);

		global $wp_filesystem;
		$wp_filesystem = $this->filesystemMock;
	}

	public function tearDown(): void {
		parent::tearDown();

		global $wp_filesystem;
		$wp_filesystem = null;
	}

	public function test_enqueue__returns_false_when_no_css() {
		// Arrange.
		$get_css = function() {
			return [];
		};

		// Act.
		$result = CSS_Files_Manager::enqueue( 'test-style', $get_css );

		// Assert.
		$this->assertFalse( $result );
	}

	public function test_enqueue__returns_false_when_write_fails() {
		// Arrange.
		$get_css = function() {
			return [
				'content' => 'body { margin: 0; }',
				'media' => 'all',
			];
		};

		$this->filesystemMock->method('put_contents')->willReturn(false);

		// Act.
		$result = CSS_Files_Manager::enqueue( 'test-style', $get_css );

		// Assert.
		$this->assertFalse( $result );
	}

	public function test_enqueue__returns_true() {
		// Arrange.
		$get_css = function() {
			return [
				'content' => 'body { margin: 0; }',
				'media' => 'all',
			];
		};

		$this->filesystemMock->method('put_contents')->willReturn(true);

		$this->filesystemMock->expects($this->once())
			->method('put_contents')
			->with(
				$this->callback(function($path) {
					return str_contains($path, Style_File::DEFAULT_CSS_DIR . 'test-style.css');
				}),
				'body { margin: 0; }',
				0644
			);

		// Act.
		$result = CSS_Files_Manager::enqueue( 'test-style', $get_css );

		// Assert.
		$this->assertTrue( $result );

		global $wp_styles;
		$this->assertArrayHasKey( 'test-style', $wp_styles->registered );
	}
}
