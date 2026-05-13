<?php

namespace Elementor\Testing\Modules\AtomicWidgets\Styles;

use Elementor\Modules\AtomicWidgets\Parsers\Style_Parser;
use Elementor\Modules\AtomicWidgets\Styles\Atomic_Styles_Manager;
use Elementor\Modules\AtomicWidgets\Styles\CacheValidity\Cache_Validity;
use Elementor\Plugin;
use Elementor\Utils;
use ElementorEditorTesting\Elementor_Test_Base;
use WP_Filesystem_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Test_Atomic_Styles_Manager extends Elementor_Test_Base {
	private $test_style_key = 'test-style';
	private $test_additional_style_key = 'another-style';
	private $filesystemMock;

	public function setUp(): void {
		parent::setUp();

		require_once ABSPATH . 'wp-admin/includes/class-wp-filesystem-base.php';

		// Mock the filesystem
		$this->filesystemMock = $this->createMock( WP_Filesystem_Base::class );
		$this->filesystemMock->method( 'abspath' )->willReturn( ABSPATH );

		global $wp_filesystem;
		$wp_filesystem = $this->filesystemMock;

		remove_all_actions( 'elementor/atomic-widgets/styles/register' );
		remove_all_actions( 'elementor/frontend/after_enqueue_post_styles' );
	}

	public function tearDown(): void {
		parent::tearDown();

		global $wp_filesystem;
		$wp_filesystem = null;

		global $wp_styles;
		$wp_styles = new \WP_Styles();
	}

	private function get_test_style_defs() {
		return [
			'test-style' => [
				'id' => 'test-style',
				'type' => 'class',
				'variants' => [
					[
						'meta' => [
							'breakpoint' => 'desktop',
						],
						'props' => [
							'color' => 'red',
							'font-family' => 'Poppins',
						],
					],
					[
						'meta' => [
							'breakpoint' => 'desktop',
							'state' => 'hover',
						],
						'props' => [
							'color' => 'yellow',
						],
					],
					[
						'meta' => [
							'breakpoint' => 'mobile',
						],
						'props' => [
							'color' => 'blue',
						],
					],
				],
			],
		];
	}

	private function get_additional_test_style_defs() {
		return [
			'another-style' => [
				'id' => 'another-style',
				'type' => 'class',
				'variants' => [
					[
						'meta' => [
							'breakpoint' => 'desktop',
						],
						'props' => [
							'color' => 'green',
						],
					],
					[
						'meta' => [
							'breakpoint' => 'tablet',
						],
						'props' => [
							'color' => 'yellow',
						],
					],
				],
			],
		];
	}

	public function test_enqueue__enqueues_styles() {
		// Arrange.
		$styles_manager = new Atomic_Styles_Manager();
		$styles_manager->register_hooks();

		$get_style_defs = function () {
			return $this->get_test_style_defs();
		};

		$this->filesystemMock->method( 'put_contents' )->willReturn( true );

		$invoked_count = $this->exactly( 2 );
		$this->filesystemMock->expects( $invoked_count )
			->method( 'put_contents' )
			->willReturnCallback( function ( $file, $content ) use ( $invoked_count ) {
				if ( $invoked_count->getInvocationCount() === 1 ) {
					$this->assertEquals( '.elementor .test-style{font-family:Poppins;color:red;}.elementor .test-style:hover,.elementor .test-style:focus-visible{color:yellow;}', $content );
					return;
				}

				// Enqueues more specific breakpoint last.
				$this->assertEquals( '@media(max-width:767px){.elementor .test-style{color:blue;}}', $content );
			} );

		add_action( 'elementor/atomic-widgets/styles/register', function ( $styles_manager ) use ( $get_style_defs ) {
			$styles_manager->register( [ $this->test_style_key ], $get_style_defs );
		}, 100, 1 );

		do_action( 'elementor/post/render', 1 );

		// Act
		do_action( 'elementor/frontend/after_enqueue_post_styles' );

		// Assert
		global $wp_styles;

		$desktop_style = $wp_styles->registered[ $this->test_style_key . '-desktop' ];
		$mobile_style = $wp_styles->registered[ $this->test_style_key . '-mobile' ];

		$cache_validity = new Cache_Validity();
		$version = $cache_validity->get_meta( [ $this->test_style_key ] );

		$this->assertNotEmpty( $desktop_style );
		$this->assertNotEmpty( $mobile_style );
		$this->assertEquals( 'all', $desktop_style->args );
		$this->assertEquals( '(max-width:767px)', $mobile_style->args );
		$this->assertEquals( $version, $desktop_style->ver );
		$this->assertEquals( $version, $mobile_style->ver );

		$this->assertContains( 'Poppins', Plugin::$instance->frontend->fonts_to_enqueue );
	}

	public function test_enqueue__with_multiple_styles_from_multiple_keys() {
		// Arrange.
		$styles_manager = new Atomic_Styles_Manager();
		$styles_manager->register_hooks();

		$get_style_defs = function () {
			return $this->get_test_style_defs();
		};

		$get_additional_style_defs = function () {
			return $this->get_additional_test_style_defs();
		};

		$this->filesystemMock->method( 'put_contents' )->willReturn( true );

		$invoked_count = $this->exactly( 4 );
		$this->filesystemMock->expects( $invoked_count )
			->method( 'put_contents' )
			->willReturnCallback( function ( $file, $content ) use ( $invoked_count ) {
				switch ( $invoked_count->getInvocationCount() ) {
					case 1:
						$this->assertEquals( '.elementor .another-style{color:green;}', $content );
						break;
					case 2:
						$this->assertEquals( '.elementor .test-style{font-family:Poppins;color:red;}.elementor .test-style:hover,.elementor .test-style:focus-visible{color:yellow;}', $content );
						break;
					case 3:
						$this->assertEquals( '@media(max-width:1024px){.elementor .another-style{color:yellow;}}', $content );
						break;
					case 4:
						$this->assertEquals( '@media(max-width:767px){.elementor .test-style{color:blue;}}', $content );
						break;
				}
			} );

		add_action( 'elementor/atomic-widgets/styles/register', function ( $styles_manager ) use ( $get_additional_style_defs ) {
			$styles_manager->register( [ $this->test_additional_style_key ], $get_additional_style_defs );
		}, 10, 1 );

		add_action( 'elementor/atomic-widgets/styles/register', function ( $styles_manager ) use ( $get_style_defs ) {
			$styles_manager->register( [ $this->test_style_key ], $get_style_defs );
		}, 20, 1 );

		do_action( 'elementor/post/render', 1 );

		// Act
		do_action( 'elementor/frontend/after_enqueue_post_styles' );

		// Assert
		global $wp_styles;

		$style_desktop = $wp_styles->registered[ $this->test_style_key . '-desktop' ];
		$style_mobile = $wp_styles->registered[ $this->test_style_key . '-mobile' ];
		$additional_style_tablet = $wp_styles->registered[ $this->test_additional_style_key . '-tablet' ];
		$additional_style_desktop = $wp_styles->registered[ $this->test_additional_style_key . '-desktop' ];

		$cache_validity = new Cache_Validity();
		$style_version = $cache_validity->get_meta( [ $this->test_style_key ] );
		$additional_style_version = $cache_validity->get_meta( [ $this->test_additional_style_key ] );

		$this->assertNotEmpty( $style_desktop );
		$this->assertNotEmpty( $style_mobile );
		$this->assertNotEmpty( $additional_style_tablet );
		$this->assertNotEmpty( $additional_style_desktop );

		$this->assertEquals( 'all', $style_desktop->args );
		$this->assertEquals( '(max-width:767px)', $style_mobile->args );
		$this->assertEquals( 'all', $additional_style_desktop->args );
		$this->assertEquals( '(max-width:1024px)', $additional_style_tablet->args );
		$this->assertEquals( $style_version, $style_desktop->ver );
		$this->assertEquals( $style_version, $style_mobile->ver );
		$this->assertEquals( $additional_style_version, $additional_style_desktop->ver );
		$this->assertEquals( $additional_style_version, $additional_style_tablet->ver );
	}

	public function test_enqueue__calls_get_styles_once_for_each_key_with_multiple_breakpoints() {
		// Arrange.
		$styles_manager = new Atomic_Styles_Manager();
		$styles_manager->register_hooks();

		$call_count = 0;
		$get_style_defs = function () use ( &$call_count ) {
			++$call_count;
			return $this->get_test_style_defs();
		};

		$this->filesystemMock->method( 'put_contents' )->willReturn( true );

		add_action( 'elementor/atomic-widgets/styles/register', function ( $styles_manager ) use ( $get_style_defs ) {
			$styles_manager->register( [ $this->test_style_key ], $get_style_defs );
		}, 20, 1 );

		do_action( 'elementor/post/render', 1 );

		// Act.
		do_action( 'elementor/frontend/after_enqueue_post_styles' );

		// Assert.
		$this->assertEquals( 1, $call_count );
	}

	public function test_enqueue__not_enqueues_styles_when_no_post_ids() {
		// Arrange.
		$styles_manager = new Atomic_Styles_Manager();
		$styles_manager->register_hooks();

		add_action( 'elementor/atomic-widgets/styles/register', function ( $styles_manager ) {
			$styles_manager->register(
				[ $this->test_style_key ],
				fn () => $this->get_test_style_defs(),
			);
		}, 10, 1 );

		// Act
		do_action( 'elementor/frontend/after_enqueue_post_styles' );

		// Assert
		global $wp_styles;
		$this->assertArrayNotHasKey( $this->test_style_key . '-desktop', $wp_styles->registered );
	}

	public function test_enqueue__not_executing_get_styles_more_than_once() {
		// Arrange.
		$styles_manager = new Atomic_Styles_Manager();
		$styles_manager->register_hooks();
		$call_count = 0;

		$get_style_defs = function () use ( &$call_count ) {
			++$call_count;

			return $this->get_test_style_defs();
		};

		add_action( 'elementor/atomic-widgets/styles/register', function ( $styles_manager ) use ( $get_style_defs ) {
			$styles_manager->register( [ $this->test_style_key ], $get_style_defs );
		}, 10, 1 );

		do_action( 'elementor/post/render', 1 );

		// Act
		do_action( 'elementor/frontend/after_enqueue_post_styles' );

		// Assert
		global $wp_styles;
		$this->assertArrayHasKey( $this->test_style_key . '-desktop', $wp_styles->registered );

		// Ensure get_styles was called only once
		$this->assertEquals( 1, $call_count );

		// Act
		do_action( 'elementor/frontend/after_enqueue_post_styles' );

		// Assert again to ensure no additional calls
		$this->assertArrayHasKey( $this->test_style_key . '-desktop', $wp_styles->registered );

		$this->assertEquals( 1, $call_count, 'get_styles should not be called again' );
	}

	public function test_parse_style_with_custom_css() {
		// Arrange
		$style = [
			'id' => 'test-style',
			'type' => 'class',
			'label' => 'Test Style',
			'variants' => [
				[
					'props' => [ 'color' => 'red' ],
					'meta' => [ 'breakpoint' => 'desktop', 'state' => null ],
					'custom_css' => [ 'raw' => Utils::encode_string( 'background: yellow;' ) ],
				],
			],
		];
		$schema = [ 'color' => [ 'type' => 'string' ] ];
		$parser = new Style_Parser( $schema );

		// Act
		$result = $parser->parse( $style );
		$parsed = $result->unwrap();

		// Assert
		$this->assertArrayHasKey( 'custom_css', $parsed['variants'][0] );
		$this->assertEquals( 'background: yellow;', Utils::decode_string( $parsed['variants'][0]['custom_css']['raw'] ) );
	}

	public function test_parse_style_with_custom_css_multiple_rules() {
		// Arrange
		$style = [
			'id' => 'test-style',
			'type' => 'class',
			'label' => 'Test Style',
			'variants' => [
				[
					'props' => [ 'color' => 'red' ],
					'meta' => [ 'breakpoint' => 'desktop', 'state' => null ],
					'custom_css' => [ 'raw' => Utils::encode_string( 'background: yellow; color: red;' ) ],
				],
			],
		];
		$schema = [ 'color' => [ 'type' => 'string' ] ];
		$parser = new Style_Parser( $schema );

		// Act
		$result = $parser->parse( $style );
		$parsed = $result->unwrap();

		// Assert
		$this->assertArrayHasKey( 'custom_css', $parsed['variants'][0] );
		$this->assertStringContainsString( 'background: yellow;', Utils::decode_string( $parsed['variants'][0]['custom_css']['raw'] ) );
		$this->assertStringContainsString( 'color: red;', Utils::decode_string( $parsed['variants'][0]['custom_css']['raw'] ) );
	}

	private function get_dynamic_test_style_defs( string $breakpoint = 'desktop' ) {
		return [
			'dynamic-style' => [
				'id' => 'dynamic-style',
				'type' => 'class',
				'variants' => [
					[
						'meta' => [
							'breakpoint' => $breakpoint,
						],
						'props' => [
							'color' => 'red',
							'background-image' => [
								'$$type' => 'dynamic',
								'value' => [
									'name' => 'fake-tag',
									'settings' => [],
								],
							],
						],
					],
				],
			],
		];
	}

	public function test_enqueue__bypasses_file_cache_for_dynamic_styles() {
		// Arrange.
		$styles_manager = new Atomic_Styles_Manager();
		$styles_manager->register_hooks();

		$get_style_defs = fn () => $this->get_dynamic_test_style_defs();

		$this->filesystemMock->expects( $this->never() )->method( 'put_contents' );

		add_action( 'elementor/atomic-widgets/styles/register', function ( $styles_manager ) use ( $get_style_defs ) {
			$styles_manager->register( [ $this->test_style_key ], $get_style_defs );
		}, 10, 1 );

		do_action( 'elementor/post/render', 1 );

		// Act.
		do_action( 'elementor/frontend/after_enqueue_post_styles' );

		// Assert.
		global $wp_styles;
		$handle = $this->test_style_key . '-desktop';
		$registered = $wp_styles->registered[ $handle ] ?? null;

		$this->assertNotEmpty( $registered, 'Dynamic styles should still be registered.' );
		$this->assertFalse( $registered->src, 'Dynamic styles should be registered with src=false (inline only).' );

		$inline = $registered->extra['after'] ?? [];
		$this->assertNotEmpty( $inline, 'Inline CSS should be added for dynamic styles.' );
		$this->assertStringContainsString( '.elementor .dynamic-style{color:red;}', implode( '', $inline ) );
	}

	public function test_enqueue__wraps_inline_dynamic_styles_with_media_query_for_non_default_breakpoint() {
		// Arrange.
		$styles_manager = new Atomic_Styles_Manager();
		$styles_manager->register_hooks();

		$get_style_defs = fn () => $this->get_dynamic_test_style_defs( 'mobile' );

		$this->filesystemMock->expects( $this->never() )->method( 'put_contents' );

		add_action( 'elementor/atomic-widgets/styles/register', function ( $styles_manager ) use ( $get_style_defs ) {
			$styles_manager->register( [ $this->test_style_key ], $get_style_defs );
		}, 10, 1 );

		do_action( 'elementor/post/render', 1 );

		// Act.
		do_action( 'elementor/frontend/after_enqueue_post_styles' );

		// Assert.
		global $wp_styles;
		$handle = $this->test_style_key . '-mobile';
		$registered = $wp_styles->registered[ $handle ] ?? null;

		$this->assertNotEmpty( $registered );

		$inline = implode( '', $registered->extra['after'] ?? [] );
		$this->assertStringContainsString( '@media(max-width:767px){', $inline );
		$this->assertStringContainsString( '.elementor .dynamic-style{color:blue;}', str_replace( 'red', 'blue', $inline ) );
	}

	public function test_enqueue__preserves_class_source_order_when_mixing_dynamic_and_static_definitions() {
		// Arrange - two class definitions in the same style entry, in a specific order.
		// `lower-priority` is emitted first, `higher-priority` second (so it wins on equal specificity).
		// The higher-priority class has a dynamic value, which forces the entry through the inline path;
		// the cascade order between the two classes must still be preserved.
		$styles_manager = new Atomic_Styles_Manager();
		$styles_manager->register_hooks();

		$get_style_defs = fn () => [
			'lower-priority' => [
				'id' => 'lower-priority',
				'type' => 'class',
				'variants' => [
					[
						'meta' => [ 'breakpoint' => 'desktop' ],
						'props' => [ 'color' => 'red' ],
					],
				],
			],
			'higher-priority' => [
				'id' => 'higher-priority',
				'type' => 'class',
				'variants' => [
					[
						'meta' => [ 'breakpoint' => 'desktop' ],
						'props' => [
							'color' => 'green',
							'background-image' => [
								'$$type' => 'dynamic',
								'value' => [ 'name' => 'fake-tag', 'settings' => [] ],
							],
						],
					],
				],
			],
		];

		add_action( 'elementor/atomic-widgets/styles/register', function ( $styles_manager ) use ( $get_style_defs ) {
			$styles_manager->register( [ $this->test_style_key ], $get_style_defs );
		}, 10, 1 );

		do_action( 'elementor/post/render', 1 );

		// Act.
		do_action( 'elementor/frontend/after_enqueue_post_styles' );

		// Assert.
		global $wp_styles;
		$inline = implode( '', $wp_styles->registered[ $this->test_style_key . '-desktop' ]->extra['after'] ?? [] );

		$lower_pos = strpos( $inline, '.lower-priority' );
		$higher_pos = strpos( $inline, '.higher-priority' );

		$this->assertNotFalse( $lower_pos, 'Lower-priority rule must be present.' );
		$this->assertNotFalse( $higher_pos, 'Higher-priority rule must be present.' );
		$this->assertLessThan( $higher_pos, $lower_pos, 'Higher-priority class must be emitted AFTER lower-priority class so the cascade still resolves it last.' );
	}

	public function test_enqueue__preserves_enqueue_order_when_mixing_static_file_and_dynamic_inline_entries() {
		// Arrange - two separate style entries (mimics e.g. globals + local), the first static
		// (goes through the file cache) and the second dynamic (goes inline). The global enqueue
		// order must match registration order so the document-level cascade is preserved.
		$styles_manager = new Atomic_Styles_Manager();
		$styles_manager->register_hooks();

		$static_style_defs = fn () => $this->get_test_style_defs();
		$dynamic_style_defs = fn () => $this->get_dynamic_test_style_defs();

		$this->filesystemMock->method( 'put_contents' )->willReturn( true );

		add_action( 'elementor/atomic-widgets/styles/register', function ( $styles_manager ) use ( $static_style_defs ) {
			$styles_manager->register( [ $this->test_additional_style_key ], $static_style_defs );
		}, 10, 1 );

		add_action( 'elementor/atomic-widgets/styles/register', function ( $styles_manager ) use ( $dynamic_style_defs ) {
			$styles_manager->register( [ $this->test_style_key ], $dynamic_style_defs );
		}, 20, 1 );

		do_action( 'elementor/post/render', 1 );

		// Act.
		do_action( 'elementor/frontend/after_enqueue_post_styles' );

		// Assert.
		global $wp_styles;
		$queue = $wp_styles->queue;

		$static_handle = $this->test_additional_style_key . '-desktop';
		$dynamic_handle = $this->test_style_key . '-desktop';

		$static_pos = array_search( $static_handle, $queue, true );
		$dynamic_pos = array_search( $dynamic_handle, $queue, true );

		$this->assertNotFalse( $static_pos, 'Static (file-cached) handle must be enqueued.' );
		$this->assertNotFalse( $dynamic_pos, 'Dynamic (inline) handle must be enqueued.' );
		$this->assertLessThan( $dynamic_pos, $static_pos, 'Static handle (registered earlier) must be enqueued before the dynamic handle so cascade order is preserved.' );
	}

	public function test_enqueue__re_resolves_dynamic_styles_on_every_request() {
		// Arrange.
		$styles_manager = new Atomic_Styles_Manager();
		$styles_manager->register_hooks();

		$call_count = 0;
		$get_style_defs = function () use ( &$call_count ) {
			++$call_count;
			return $this->get_dynamic_test_style_defs();
		};

		$this->filesystemMock->expects( $this->never() )->method( 'put_contents' );

		add_action( 'elementor/atomic-widgets/styles/register', function ( $styles_manager ) use ( $get_style_defs ) {
			$styles_manager->register( [ $this->test_style_key ], $get_style_defs );
		}, 10, 1 );

		do_action( 'elementor/post/render', 1 );

		// Act - simulate two consecutive page renders within the same request lifecycle.
		do_action( 'elementor/frontend/after_enqueue_post_styles' );
		$first_call_count = $call_count;

		// Re-register and re-enqueue (mimics a second request resolving styles fresh).
		remove_all_actions( 'elementor/atomic-widgets/styles/register' );
		add_action( 'elementor/atomic-widgets/styles/register', function ( $styles_manager ) use ( $get_style_defs ) {
			$styles_manager->register( [ $this->test_style_key ], $get_style_defs );
		}, 10, 1 );
		do_action( 'elementor/post/render', 1 );
		do_action( 'elementor/frontend/after_enqueue_post_styles' );

		// Assert - dynamic styles never short-circuit through the file cache, so the styles
		// callback must run again on the second enqueue cycle (otherwise we'd serve stale values).
		$this->assertGreaterThan( $first_call_count, $call_count, 'Dynamic styles must be re-evaluated, not served from cache.' );
	}

	public function test_clear_files__invalidates_cache_for_path() {
		// Arrange
		$styles_manager = new Atomic_Styles_Manager();
		$styles_manager->register_hooks();

		$get_style_defs = function () {
			return $this->get_test_style_defs();
		};

		$this->filesystemMock->method( 'put_contents' )->willReturn( true );
		$this->filesystemMock->method( 'exists' )->willReturn( true );
		$this->filesystemMock->method( 'delete' )->willReturn( true );

		add_action( 'elementor/atomic-widgets/styles/register', function ( $styles_manager ) use ( $get_style_defs ) {
			$styles_manager->register( [ $this->test_style_key ], $get_style_defs );
		}, 10, 1 );

		do_action( 'elementor/post/render', 1 );
		do_action( 'elementor/frontend/after_enqueue_post_styles' );

		$cache_validity = new Cache_Validity();
		$version_before = $cache_validity->get_meta( [ $this->test_style_key ] );
		$this->assertNotNull( $version_before, 'Cache should have version before clear' );

		// Act
		do_action( 'elementor/atomic-widgets/styles/clear', [ $this->test_style_key ] );

		// Assert
		$is_valid = $cache_validity->is_valid( [ $this->test_style_key ] );
		$this->assertFalse( $is_valid, 'Cache should be invalidated after clear' );
	}

	public function test_clear_files__does_not_fail_when_files_do_not_exist() {
		// Arrange
		$styles_manager = new Atomic_Styles_Manager();
		$styles_manager->register_hooks();

		$get_style_defs = function () {
			return $this->get_test_style_defs();
		};

		$this->filesystemMock->method( 'put_contents' )->willReturn( true );
		$this->filesystemMock->method( 'exists' )->willReturn( false );

		add_action( 'elementor/atomic-widgets/styles/register', function ( $styles_manager ) use ( $get_style_defs ) {
			$styles_manager->register( [ $this->test_style_key ], $get_style_defs );
		}, 10, 1 );

		do_action( 'elementor/post/render', 1 );
		do_action( 'elementor/frontend/after_enqueue_post_styles' );

		$this->filesystemMock->expects( $this->never() )->method( 'delete' );

		// Act
		do_action( 'elementor/atomic-widgets/styles/clear', [ $this->test_style_key ] );

		// Assert - no exception thrown
		$this->assertTrue( true, 'Clear should not fail when files do not exist' );
	}

	public function test_clear_files__with_nested_path_deletes_all_descendant_files() {
		// Arrange
		$styles_manager = new Atomic_Styles_Manager();
		$styles_manager->register_hooks();

		$nested_cache_key_1 = [ $this->test_style_key, '123', 'frontend' ];
		$nested_cache_key_2 = [ $this->test_style_key, '456', 'preview' ];

		$get_style_defs_1 = function () {
			return $this->get_test_style_defs();
		};

		$get_style_defs_2 = function () {
			return $this->get_additional_test_style_defs();
		};

		$this->filesystemMock->method( 'put_contents' )->willReturn( true );
		$this->filesystemMock->method( 'exists' )->willReturn( true );

		add_action( 'elementor/atomic-widgets/styles/register', function ( $styles_manager ) use ( $get_style_defs_1, $nested_cache_key_1 ) {
			$styles_manager->register( $nested_cache_key_1, $get_style_defs_1 );
		}, 10, 1 );

		add_action( 'elementor/atomic-widgets/styles/register', function ( $styles_manager ) use ( $get_style_defs_2, $nested_cache_key_2 ) {
			$styles_manager->register( $nested_cache_key_2, $get_style_defs_2 );
		}, 20, 1 );

		do_action( 'elementor/post/render', 1 );
		do_action( 'elementor/frontend/after_enqueue_post_styles' );

		$deleted_files = [];
		$this->filesystemMock->method( 'delete' )
			->willReturnCallback( function ( $path ) use ( &$deleted_files ) {
				$deleted_files[] = $path;
				return true;
			} );

		// Act
		do_action( 'elementor/atomic-widgets/styles/clear', [ $this->test_style_key ] );

		// Assert
		$this->assertGreaterThan( 0, count( $deleted_files ), 'Expected descendant files to be deleted' );

		$deleted_handles = array_map( function ( $path ) {
			return basename( $path, '.css' );
		}, $deleted_files );

		$this->assertContains( implode( '-', $nested_cache_key_1 ) . '-desktop', $deleted_handles );
		$this->assertContains( implode( '-', $nested_cache_key_1 ) . '-mobile', $deleted_handles );
		$this->assertContains( implode( '-', $nested_cache_key_2 ) . '-desktop', $deleted_handles );
		$this->assertContains( implode( '-', $nested_cache_key_2 ) . '-tablet', $deleted_handles );
	}

	public function test_clear_files__should_not_clear_files_not_under_the_given_path() {
		// Arrange
		$styles_manager = new Atomic_Styles_Manager();
		$styles_manager->register_hooks();

		$nested_cache_key_1 = [ $this->test_style_key, '123', 'frontend' ];
		$nested_cache_key_2 = [ $this->test_style_key, '456', 'preview' ];

		$get_style_defs_1 = function () {
			return $this->get_test_style_defs();
		};

		$get_style_defs_2 = function () {
			return $this->get_additional_test_style_defs();
		};

		$upload_dir = wp_upload_dir();
		$base_path = trailingslashit( $upload_dir['basedir'] ) . 'elementor/css/';
		$existing_files = [
			$base_path . implode( '-', $nested_cache_key_1 ) . '-desktop.css',
			$base_path . implode( '-', $nested_cache_key_1 ) . '-mobile.css',
			$base_path . implode( '-', $nested_cache_key_2 ) . '-desktop.css',
			$base_path . implode( '-', $nested_cache_key_2 ) . '-tablet.css',
		];

		$this->filesystemMock->method( 'put_contents' )->willReturn( true );

		$this->filesystemMock->method( 'exists' )
			->willReturnCallback( function ( $path ) use ( &$existing_files ) {
				return in_array( $path, $existing_files, true );
			} );

		$this->filesystemMock->method( 'delete' )
			->willReturnCallback( function ( $path ) use ( &$existing_files ) {
				$key = array_search( $path, $existing_files, true );
				if ( false !== $key ) {
					unset( $existing_files[ $key ] );
				}
				return true;
			} );

		add_action( 'elementor/atomic-widgets/styles/register', function ( $styles_manager ) use ( $get_style_defs_1, $nested_cache_key_1 ) {
			$styles_manager->register( $nested_cache_key_1, $get_style_defs_1 );
		}, 10, 1 );

		add_action( 'elementor/atomic-widgets/styles/register', function ( $styles_manager ) use ( $get_style_defs_2, $nested_cache_key_2 ) {
			$styles_manager->register( $nested_cache_key_2, $get_style_defs_2 );
		}, 20, 1 );

		do_action( 'elementor/post/render', 1 );

		do_action( 'elementor/frontend/after_enqueue_post_styles' );

		$this->assertCount( 4, $existing_files, 'All nested files should exist before clear' );

		// Act
		do_action( 'elementor/atomic-widgets/styles/clear', $nested_cache_key_1 );

		// Assert
		$this->assertCount( 2, $existing_files, 'No nested breakpoint files should remain after clear' );

		$remaining_files_with_key = array_filter( $existing_files, function ( $file ) use ( $nested_cache_key_2 ) {
			return strpos( $file, implode( '-', $nested_cache_key_2 ) ) !== false;
		} );

		$this->assertCount( 2, $remaining_files_with_key, 'All files not nested under the provided keys should remain' );
	}
}
