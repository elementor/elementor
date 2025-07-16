<?php

namespace Elementor\Testing\Modules\AtomicWidgets\Styles;

use Elementor\Core\Utils\Collection;
use Elementor\Modules\AtomicWidgets\Styles\Atomic_Styles_Manager;
use Elementor\Plugin;
use ElementorEditorTesting\Elementor_Test_Base;
use WP_Filesystem_Base;
use function ElementorDeps\DI\add;

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

		$get_style_defs = function() {
			return $this->get_test_style_defs();
		};

		$this->filesystemMock->method( 'put_contents' )->willReturn( true );

		$invoked_count = $this->exactly( 2 );
		$this->filesystemMock->expects( $invoked_count )
			->method( 'put_contents' )
			->willReturnCallback( function( $file, $content ) use ( $invoked_count ) {
				if ( $invoked_count->getInvocationCount() === 1 ) {
					$this->assertEquals( '.elementor .test-style{font-family:Poppins;color:red;}.elementor .test-style:hover{color:yellow;}', $content );
					return;
				}

				// Enqueues more specific breakpoint last.
				$this->assertEquals( '@media(max-width:767px){.elementor .test-style{color:blue;}}', $content );
			} );

		add_action( 'elementor/atomic-widgets/styles/register', function( $styles_manager ) use ( $get_style_defs ) {
			$styles_manager->register( $this->test_style_key, $get_style_defs, [ $this->test_style_key ] );
		}, 100, 1 );

		do_action( 'elementor/post/render', 1 );

		// Act
		do_action( 'elementor/frontend/after_enqueue_post_styles' );

		// Assert
		global $wp_styles;
		$this->assertArrayHasKey( $this->test_style_key . '-desktop', $wp_styles->registered );
		$this->assertArrayHasKey( $this->test_style_key . '-mobile', $wp_styles->registered );
		$this->assertContains( 'Poppins', Plugin::$instance->frontend->fonts_to_enqueue );
	}

	public function test_enqueue__with_multiple_styles_from_multiple_keys() {
		// Arrange.
		$styles_manager = new Atomic_Styles_Manager();
		$styles_manager->register_hooks();

		$get_style_defs = function() {
			return $this->get_test_style_defs();
		};

		$get_additional_style_defs = function() {
			return $this->get_additional_test_style_defs();
		};

		$this->filesystemMock->method( 'put_contents' )->willReturn( true );

		$invoked_count = $this->exactly( 4 );
		$this->filesystemMock->expects( $invoked_count )
			->method( 'put_contents' )
			->willReturnCallback( function( $file, $content ) use ( $invoked_count ) {
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

		add_action( 'elementor/atomic-widgets/styles/register', function( $styles_manager ) use ( $get_additional_style_defs ) {
			$styles_manager->register( $this->test_additional_style_key, $get_additional_style_defs, [ $this->test_additional_style_key ] );
		}, 10, 1 );

		add_action( 'elementor/atomic-widgets/styles/register', function( $styles_manager ) use ( $get_style_defs ) {
			$styles_manager->register( $this->test_style_key, $get_style_defs, [ $this->test_style_key ] );
		}, 20, 1 );

		do_action( 'elementor/post/render', 1 );

		// Act
		do_action( 'elementor/frontend/after_enqueue_post_styles' );

		// Assert
		global $wp_styles;

		$this->assertArrayHasKey( $this->test_style_key . '-desktop', $wp_styles->registered );
		$this->assertArrayHasKey( $this->test_style_key . '-mobile', $wp_styles->registered );
		$this->assertArrayHasKey( $this->test_additional_style_key . '-tablet', $wp_styles->registered );
		$this->assertArrayHasKey( $this->test_additional_style_key . '-desktop', $wp_styles->registered );
	}

	public function test_enqueue__calls_get_styles_once_for_each_key_with_multiple_breakpoints() {
		// Arrange.
		$styles_manager = new Atomic_Styles_Manager();
		$styles_manager->register_hooks();

		$call_count = 0;
		$get_style_defs = function() use ( &$call_count ) {
			++$call_count;
			return $this->get_test_style_defs();
		};

		$this->filesystemMock->method( 'put_contents' )->willReturn( true );

		add_action( 'elementor/atomic-widgets/styles/register', function( $styles_manager ) use ( $get_style_defs ) {
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

		add_action( 'elementor/atomic-widgets/styles/register', function( $styles_manager ) {
			$styles_manager->register(
				$this->test_style_key,
				fn() => $this->get_test_style_defs(),
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

		$get_style_defs = function() use ( &$call_count ) {
			++$call_count;

			return $this->get_test_style_defs();
		};

		add_action( 'elementor/atomic-widgets/styles/register', function( $styles_manager ) use ( $get_style_defs ) {
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
}
