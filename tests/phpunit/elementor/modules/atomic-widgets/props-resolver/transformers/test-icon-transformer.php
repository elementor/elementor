<?php

namespace Elementor\Testing\Modules\AtomicWidgets\PropsResolver\Transformers;

use Elementor\Modules\AtomicWidgets\PropsResolver\Font_Awesome_7_Icon_Resolver;
use Elementor\Modules\AtomicWidgets\PropsResolver\Props_Resolver_Context;
use Elementor\Modules\AtomicWidgets\PropsResolver\Transformers\Icon_Transformer;
use ElementorEditorTesting\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Test_Icon_Transformer extends Elementor_Test_Base {
	private const FA7_STAR_PATH_FRAGMENT = 'M309.5-18.9';

	private const FILTERED_ICON_NAME = 'filter-probe';

	private const FILTERED_ICON_PATH = 'M1 1';

	private const FILTERED_ICON_SIZE = 10;

	private const JSON_BASE_PATH_FILTER = 'elementor/atomic-widgets/font-awesome-7/json-base-path';

	private $filtered_json_dir = null;

	public function setUp(): void {
		parent::setUp();

		Font_Awesome_7_Icon_Resolver::reset();
		$this->ensure_font_awesome_7_json_available();
	}

	public function tearDown(): void {
		remove_all_filters( self::JSON_BASE_PATH_FILTER );
		Font_Awesome_7_Icon_Resolver::reset();
		$this->remove_filtered_json_dir();

		parent::tearDown();
	}

	public function test_transform__returns_inline_svg_for_font_awesome_7_icon() {
		// Arrange.
		$transformer = new Icon_Transformer();
		$value = [
			'value' => 'fas fa-star',
			'library' => 'fa-solid',
		];

		// Act.
		$result = $transformer->transform( $value, Props_Resolver_Context::make() );

		// Assert.
		$this->assertIsArray( $result );
		$this->assertNull( $result['url'] );
		$this->assertStringContainsString( '<svg', $result['html'] );
		$this->assertStringContainsString( 'viewBox="0 0 576 512"', $result['html'] );
		$this->assertStringContainsString( 'fill="currentColor"', $result['html'] );
		$this->assertStringContainsString( 'aria-hidden="true"', $result['html'] );
		$this->assertStringContainsString( 'overflow: visible', $result['html'] );
		$this->assertStringContainsString( self::FA7_STAR_PATH_FRAGMENT, $result['html'] );
		$this->assertStringNotContainsString( 'M259.3 17.8', $result['html'] );
	}

	public function test_build_fa7_svg__renders_multiple_paths() {
		// Arrange.
		$transformer = new Icon_Transformer();
		$method = new \ReflectionMethod( Icon_Transformer::class, 'build_fa7_svg' );
		$method->setAccessible( true );

		// Act.
		$html = $method->invoke( $transformer, [
			'width' => 640,
			'height' => 640,
			'paths' => [ 'M0 0', 'M10 10' ],
		] );

		// Assert.
		$this->assertSame( 2, substr_count( $html, '<path' ) );
		$this->assertStringContainsString( 'd="M0 0"', $html );
		$this->assertStringContainsString( 'd="M10 10"', $html );
	}

	public function test_transform__resolves_font_awesome_7_icon_by_alias() {
		// Arrange.
		$transformer = new Icon_Transformer();
		$value = [
			'value' => 'fas fa-headphones-simple',
			'library' => 'fa-solid',
		];

		// Act.
		$result = $transformer->transform( $value, Props_Resolver_Context::make() );

		// Assert.
		$this->assertStringContainsString( '<svg', $result['html'] );
		$this->assertStringContainsString( '<path', $result['html'] );
		$this->assertStringNotContainsString( 'viewBox="0 0 0 0"', $result['html'] );
	}

	public function test_transform__returns_empty_html_for_unknown_font_awesome_icon() {
		// Arrange.
		$transformer = new Icon_Transformer();
		$value = [
			'value' => 'fas fa-not-a-real-icon-name',
			'library' => 'fa-solid',
		];

		// Act.
		$result = $transformer->transform( $value, Props_Resolver_Context::make() );

		// Assert.
		$this->assertSame( [
			'html' => '',
			'url' => null,
		], $result );
	}

	public function test_transform__returns_empty_html_for_path_traversal_library() {
		// Arrange.
		$transformer = new Icon_Transformer();
		$value = [
			'value' => 'fas fa-star',
			'library' => 'fa-../../wp-config',
		];

		// Act.
		$result = $transformer->transform( $value, Props_Resolver_Context::make() );

		// Assert.
		$this->assertSame( [
			'html' => '',
			'url' => null,
		], $result );
	}

	public function test_transform__returns_empty_html_for_unknown_library() {
		// Arrange.
		$transformer = new Icon_Transformer();
		$value = [
			'value' => 'eicon-star',
			'library' => 'not-a-library',
		];

		// Act.
		$result = $transformer->transform( $value, Props_Resolver_Context::make() );

		// Assert.
		$this->assertSame( [
			'html' => '',
			'url' => null,
		], $result );
	}

	public function test_transform__reads_icons_from_filtered_json_base_path() {
		// Arrange.
		$this->filtered_json_dir = $this->create_filtered_json_dir();

		add_filter(
			self::JSON_BASE_PATH_FILTER,
			function () {
				return $this->filtered_json_dir;
			}
		);

		$transformer = new Icon_Transformer();
		$value = [
			'value' => 'fas fa-' . self::FILTERED_ICON_NAME,
			'library' => 'fa-solid',
		];

		// Act.
		$result = $transformer->transform( $value, Props_Resolver_Context::make() );

		// Assert.
		$this->assertStringContainsString( self::FILTERED_ICON_PATH, $result['html'] );
		$this->assertStringContainsString(
			'viewBox="0 0 ' . self::FILTERED_ICON_SIZE . ' ' . self::FILTERED_ICON_SIZE . '"',
			$result['html']
		);
		$this->assertStringNotContainsString( self::FA7_STAR_PATH_FRAGMENT, $result['html'] );
	}

	public function test_transform__returns_inline_svg_for_eicons_library() {
		// Arrange.
		$transformer = new Icon_Transformer();
		$value = [
			'value' => 'eicon-star',
			'library' => 'eicons',
		];

		// Act.
		$result = $transformer->transform( $value, Props_Resolver_Context::make() );

		// Assert.
		$this->assertStringContainsString( '<svg', $result['html'] );
		$this->assertStringContainsString( '<path', $result['html'] );
	}

	private function create_filtered_json_dir(): string {
		$json_dir = sys_get_temp_dir() . '/elementor-fa7-json-' . uniqid( '', true );

		if ( ! mkdir( $json_dir, 0777, true ) && ! is_dir( $json_dir ) ) {
			$this->fail( 'Could not create filtered Font Awesome 7 JSON directory.' );
		}

		file_put_contents(
			$json_dir . '/solid.json',
			wp_json_encode( [
				'icons' => [
					self::FILTERED_ICON_NAME => [
						self::FILTERED_ICON_SIZE,
						self::FILTERED_ICON_SIZE,
						[],
						'f000',
						self::FILTERED_ICON_PATH,
					],
				],
			] )
		);

		return $json_dir;
	}

	private function remove_filtered_json_dir(): void {
		if ( ! is_string( $this->filtered_json_dir ) || ! is_dir( $this->filtered_json_dir ) ) {
			return;
		}

		$json_file = $this->filtered_json_dir . '/solid.json';

		if ( is_file( $json_file ) ) {
			unlink( $json_file );
		}

		rmdir( $this->filtered_json_dir );
		$this->filtered_json_dir = null;
	}

	private function ensure_font_awesome_7_json_available(): void {
		$json_dir = ELEMENTOR_ASSETS_PATH . 'lib/font-awesome-7/json';
		$json_file = $json_dir . '/solid.json';

		if ( is_readable( $json_file ) ) {
			return;
		}

		if ( ! is_dir( $json_dir ) && ! mkdir( $json_dir, 0777, true ) && ! is_dir( $json_dir ) ) {
			$this->fail( 'Could not create Font Awesome 7 test JSON directory.' );
		}

		file_put_contents(
			$json_file,
			wp_json_encode( [
				'icons' => [
					'star' => [ 576, 512, [], 'f005', self::FA7_STAR_PATH_FRAGMENT ],
					'headphones' => [ 448, 512, [ 'headphones-simple' ], 'f025', 'M64 224' ],
				],
			] )
		);
	}
}
