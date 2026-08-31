<?php
namespace Elementor\Testing\Modules\AtomicWidgets\Styles;

use Elementor\Modules\AtomicWidgets\Styles\CacheValidity\Cache_Validity;
use Elementor\Modules\AtomicWidgets\Styles\CSS_Files_Manager;
use ElementorEditorTesting\Elementor_Test_Base;
use WP_Filesystem_Base;

class Test_Css_Files_Manager extends Elementor_Test_Base {
	private $filesystemMock;
	private Cache_Validity $cache_validity;

	public function setUp(): void {
		parent::setUp();

		require_once ABSPATH . 'wp-admin/includes/class-wp-filesystem-base.php';

		$this->filesystemMock = $this->getMockBuilder( WP_Filesystem_Base::class )
			->disableOriginalConstructor()
			->onlyMethods( [ 'exists', 'delete', 'put_contents', 'get_contents', 'abspath', 'size', 'move' ] )
			->getMock();
		$this->filesystemMock->method( 'abspath' )->willReturn( ABSPATH );

		global $wp_filesystem;
		$wp_filesystem = $this->filesystemMock;

		$this->cache_validity = new Cache_Validity();
	}

	public function tearDown(): void {
		parent::tearDown();

		global $wp_filesystem;
		$wp_filesystem = null;
	}

	private function make_manager(): CSS_Files_Manager {
		return new CSS_Files_Manager( $this->cache_validity );
	}

	public function test_get__renders_and_writes_atomically_when_cache_is_invalid() {
		// Arrange.
		$get_css = fn() => 'body { margin: 0; }';

		$put_contents_paths = [];

		$this->filesystemMock->method( 'put_contents' )
			->willReturnCallback( function ( $path, $content ) use ( &$put_contents_paths ) {
				$put_contents_paths[] = $path;
				$this->assertEquals( 'body { margin: 0; }', $content );
				return true;
			} );

		$this->filesystemMock->expects( $this->once() )
			->method( 'move' )
			->willReturnCallback( function ( $src, $dst, $overwrite ) {
				$this->assertStringContainsString( CSS_Files_Manager::DEFAULT_CSS_DIR . 'test-style.css.tmp-', $src );
				$this->assertStringEndsWith( CSS_Files_Manager::DEFAULT_CSS_DIR . 'test-style.css', $dst );
				$this->assertTrue( $overwrite );
				return true;
			} );

		// Act.
		$file = $this->make_manager()->get( 'test-style', 'all', $get_css, [ 'atomic-test', 'render' ] );

		// Assert.
		$this->assertNotNull( $file, 'A style file is returned on a successful write' );
		$this->assertEquals( 'test-style', $file->get_handle() );
		$this->assertCount( 1, $put_contents_paths, 'Only one write happens, to the temp path' );
		$this->assertStringContainsString( CSS_Files_Manager::DEFAULT_CSS_DIR . 'test-style.css.tmp-', $put_contents_paths[0] );

		// Cache should be validated with `should_exist = true` on success.
		$this->assertTrue(
			$this->cache_validity->is_valid( [ 'atomic-test', 'render' ] ),
			'Successful write must validate the cache leaf'
		);
		$this->assertEquals(
			[ 'should_exist' => true ],
			$this->cache_validity->get_meta( [ 'atomic-test', 'render' ] ),
			'Leaf meta must record should_exist = true'
		);
	}

	public function test_get__with_empty_css_deletes_stale_file_and_records_should_exist_false() {
		// Arrange.
		$get_css = fn() => '';

		$this->filesystemMock->method( 'exists' )->willReturn( true );

		$this->filesystemMock->expects( $this->once() )
			->method( 'delete' )
			->with( $this->stringContains( CSS_Files_Manager::DEFAULT_CSS_DIR . 'empty-style.css' ) );

		$this->filesystemMock->expects( $this->never() )->method( 'put_contents' );
		$this->filesystemMock->expects( $this->never() )->method( 'move' );

		// Act.
		$file = $this->make_manager()->get( 'empty-style', 'all', $get_css, [ 'atomic-test', 'empty' ] );

		// Assert.
		$this->assertNull( $file, 'No file is returned when CSS is empty' );

		$this->assertTrue(
			$this->cache_validity->is_valid( [ 'atomic-test', 'empty' ] ),
			'Empty-CSS state is a legit cached outcome and must validate the leaf'
		);
		$this->assertEquals(
			[ 'should_exist' => false ],
			$this->cache_validity->get_meta( [ 'atomic-test', 'empty' ] ),
			'Leaf meta must record should_exist = false so subsequent requests skip the render'
		);
	}

	public function test_get__leaves_cache_invalid_when_write_fails() {
		// Arrange.
		$get_css = fn() => 'body { color: red; }';

		$this->filesystemMock->method( 'put_contents' )->willReturn( false );
		$this->filesystemMock->expects( $this->never() )->method( 'move' );

		// Act.
		$file = $this->make_manager()->get( 'failing-style', 'all', $get_css, [ 'atomic-test', 'fail' ] );

		// Assert.
		$this->assertNull( $file );
		$this->assertFalse(
			$this->cache_validity->is_valid( [ 'atomic-test', 'fail' ] ),
			'A hard write failure must leave the leaf invalid so the next request retries'
		);
	}

	public function test_get__returns_existing_file_on_cache_hit_when_should_exist_is_true() {
		// Arrange - seed the cache: previous render succeeded, file is present on disk.
		$this->cache_validity->validate( [ 'atomic-test', 'hit' ], [ 'should_exist' => true ] );

		$this->filesystemMock->method( 'exists' )->willReturn( true );
		$this->filesystemMock->method( 'size' )->willReturn( 1024 );

		// Act.
		$file = $this->make_manager()->get(
			'cached-style',
			'all',
			function () {
				$this->fail( 'CSS should not be rendered when the cache is valid and the file is healthy.' );
			},
			[ 'atomic-test', 'hit' ]
		);

		// Assert.
		$this->assertNotNull( $file );
		$this->assertEquals( 'cached-style', $file->get_handle() );
	}

	public function test_get__returns_null_without_rendering_when_should_exist_is_false() {
		// Arrange - cached state where a prior render produced no CSS.
		$this->cache_validity->validate( [ 'atomic-test', 'skip' ], [ 'should_exist' => false ] );

		$this->filesystemMock->expects( $this->never() )->method( 'exists' );
		$this->filesystemMock->expects( $this->never() )->method( 'put_contents' );

		// Act.
		$file = $this->make_manager()->get(
			'skipped-style',
			'all',
			function () {
				$this->fail( 'CSS must not be rendered when the cache says should_exist = false.' );
			},
			[ 'atomic-test', 'skip' ]
		);

		// Assert.
		$this->assertNull( $file );
	}

	public function test_get__self_heals_and_regenerates_when_should_exist_but_file_missing() {
		// Arrange - the cache says the file should be present, but the filesystem disagrees.
		$this->cache_validity->validate( [ 'atomic-test', 'heal' ], [ 'should_exist' => true ] );

		$call_count = 0;
		$get_css = function () use ( &$call_count ) {
			++$call_count;
			return 'body { color: blue; }';
		};

		$this->filesystemMock->method( 'exists' )->willReturn( false );
		$this->filesystemMock->method( 'put_contents' )->willReturn( true );
		$this->filesystemMock->method( 'move' )->willReturn( true );

		// Act.
		$file = $this->make_manager()->get( 'ghost-style', 'all', $get_css, [ 'atomic-test', 'heal' ] );

		// Assert.
		$this->assertNotNull( $file, 'Manager must self-heal by regenerating when the file went missing' );
		$this->assertEquals( 1, $call_count, 'The CSS callback must be invoked exactly once during self-heal' );
	}

	public function test_get__self_heals_when_should_exist_but_file_is_zero_bytes() {
		// Arrange - file is present but truncated to zero bytes (partial write, external cleanup, ...).
		$this->cache_validity->validate( [ 'atomic-test', 'zero' ], [ 'should_exist' => true ] );

		$this->filesystemMock->method( 'exists' )->willReturn( true );
		$this->filesystemMock->method( 'size' )->willReturn( 0 );
		$this->filesystemMock->method( 'put_contents' )->willReturn( true );
		$this->filesystemMock->method( 'move' )->willReturn( true );

		$get_css_called = false;
		$get_css = function () use ( &$get_css_called ) {
			$get_css_called = true;
			return '.non-empty { }';
		};

		// Act.
		$file = $this->make_manager()->get( 'zero-byte-style', 'all', $get_css, [ 'atomic-test', 'zero' ] );

		// Assert.
		$this->assertNotNull( $file );
		$this->assertTrue( $get_css_called, 'A zero-byte file must trigger regeneration' );
	}

	public function test_get__legacy_leaf_without_should_exist_meta_falls_back_to_file_existence() {
		// Arrange - simulate a pre-existing leaf (predates the should_exist meta).
		$this->cache_validity->validate( [ 'atomic-test', 'legacy' ] );

		$this->filesystemMock->method( 'exists' )->willReturn( true );
		$this->filesystemMock->method( 'size' )->willReturn( 512 );

		// Act.
		$file = $this->make_manager()->get(
			'legacy-style',
			'all',
			function () {
				$this->fail( 'Legacy leaf with an existing file must not force a regen.' );
			},
			[ 'atomic-test', 'legacy' ]
		);

		// Assert.
		$this->assertNotNull( $file );
	}
}
