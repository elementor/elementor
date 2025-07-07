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

	public function test_get__creates_file() {
		// Arrange.
		$get_css = function() {
			return 'body { margin: 0; }';
		};

		$this->filesystemMock->method('put_contents')->willReturn(true);

		// Assert.
		$this->filesystemMock->expects($this->once())
			->method('put_contents')
			->with(
				$this->callback(function($path) {
					return str_contains($path, CSS_Files_Manager::DEFAULT_CSS_DIR . 'test-style.css');
				}),
				'body { margin: 0; }',
				0644
			);

		// Act.
		$result = ( new CSS_Files_Manager() )->get( 'test-style(/../..$', 'all', $get_css, false );

		// Assert.
		$this->assertEquals(
			'test-style',
			$result->get_handle()
		);
	}
}
