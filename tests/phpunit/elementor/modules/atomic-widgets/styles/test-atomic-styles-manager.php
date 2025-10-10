<?php

namespace Elementor\Testing\Modules\AtomicWidgets\Styles;

use Elementor\Modules\AtomicWidgets\Parsers\Style_Parser;
use Elementor\Modules\AtomicWidgets\Styles\Atomic_Styles_Manager;
use Elementor\Modules\AtomicWidgets\Cache_Validity;
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
					$this->assertEquals( '.elementor .test-style{font-family:Poppins;color:red;}.elementor .test-style:hover{color:yellow;}', $content );
					return;
				}

				// Enqueues more specific breakpoint last.
				$this->assertEquals( '@media(max-width:767px){.elementor .test-style{color:blue;}}', $content );
			} );

		add_action( 'elementor/atomic-widgets/styles/register', function ( $styles_manager ) use ( $get_style_defs ) {
			$styles_manager->register( $this->test_style_key, $get_style_defs, [ $this->test_style_key ] );
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
						$this->assertEquals( '.elementor .test-style{font-family:Poppins;color:red;}.elementor .test-style:hover{color:yellow;}', $content );
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
			$styles_manager->register( $this->test_additional_style_key, $get_additional_style_defs, [ $this->test_additional_style_key ] );
		}, 10, 1 );

		add_action( 'elementor/atomic-widgets/styles/register', function ( $styles_manager ) use ( $get_style_defs ) {
			$styles_manager->register( $this->test_style_key, $get_style_defs, [ $this->test_style_key ] );
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
			$styles_manager->register( $this->test_style_key, $get_style_defs, [ $this->test_style_key ] );
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
				$this->test_style_key,
				fn () => $this->get_test_style_defs(),
				[ $this->test_style_key ]
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
			$styles_manager->register( $this->test_style_key, $get_style_defs, [ $this->test_style_key ] );
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
}
