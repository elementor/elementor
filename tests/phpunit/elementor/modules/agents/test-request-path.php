<?php

namespace Elementor\Tests\Phpunit\Elementor\Modules\Agents;

use Elementor\Modules\Agents\Classes\Request_Path;
use ElementorEditorTesting\Elementor_Test_Base;

class Test_Request_Path extends Elementor_Test_Base {

	private string $original_request_uri;

	public function setUp(): void {
		parent::setUp();

		$this->original_request_uri = $_SERVER['REQUEST_URI'] ?? '/';
	}

	public function tearDown(): void {
		$_SERVER['REQUEST_URI'] = $this->original_request_uri;

		remove_all_filters( 'home_url' );

		parent::tearDown();
	}

	public function test_matches__root_install_matches_llms_txt() {
		// Arrange
		$_SERVER['REQUEST_URI'] = '/llms.txt';

		// Act & Assert
		$this->assertTrue( Request_Path::matches( 'llms.txt' ) );
	}

	public function test_matches__root_install_does_not_match_unrelated_path() {
		// Arrange
		$_SERVER['REQUEST_URI'] = '/not-llms.txt';

		// Act & Assert
		$this->assertFalse( Request_Path::matches( 'llms.txt' ) );
	}

	/**
	 * @dataProvider subdirectory_home_provider
	 */
	public function test_matches__subdirectory_install( string $request_uri, string $filename, bool $expected ) {
		// Arrange
		add_filter( 'home_url', static function () {
			return 'http://example.com/blog';
		} );

		$_SERVER['REQUEST_URI'] = $request_uri;

		// Act
		$result = Request_Path::matches( $filename );

		// Assert
		$this->assertSame( $expected, $result );
	}

	public function subdirectory_home_provider(): array {
		return [
			'matches llms.txt under home path'            => [ '/blog/llms.txt', 'llms.txt', true ],
			'matches llms-full.txt under home path'       => [ '/blog/llms-full.txt', 'llms-full.txt', true ],
			'matches with trailing slash'                 => [ '/blog/llms.txt/', 'llms.txt', true ],
			'matches with query string'                   => [ '/blog/llms.txt?foo=bar', 'llms.txt', true ],
			'rejects prefix without segment boundary'      => [ '/blogllms.txt', 'llms.txt', false ],
			'rejects prefix without segment boundary, full' => [ '/blogllms-full.txt', 'llms-full.txt', false ],
			'rejects sibling segment sharing the prefix'   => [ '/blogging/llms.txt', 'llms.txt', false ],
			'rejects nested path under home path'          => [ '/blog/nested/llms.txt', 'llms.txt', false ],
			'rejects root path while home is a subdirectory' => [ '/llms.txt', 'llms.txt', false ],
			'rejects the home path itself'                 => [ '/blog', 'llms.txt', false ],
		];
	}
}
