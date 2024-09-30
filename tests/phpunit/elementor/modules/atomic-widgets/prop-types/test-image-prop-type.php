<?php

namespace Elementor\Testing\Modules\AtomicWidgets\PropTypes;

use Elementor\Core\Wp_Api;
use Elementor\Modules\AtomicWidgets\PropTypes\Image_Prop_Type;
use Elementor\Plugin;
use ElementorEditorTesting\Elementor_Test_Base;
use Elementor\Core\Utils\Collection;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Test_Image_Prop_Type extends Elementor_Test_Base {

	private Wp_Api $original_wp_api;

	public function setUp(): void {
		parent::setUp();

		$this->original_wp_api = Plugin::$instance->wp;

		Plugin::$instance->wp = $this->createMock( Wp_Api::class );

		Plugin::$instance->wp
			->method( 'wp_attachment_is_image' )
			->willReturnCallback( fn( $id ) => $id === 123 );
	}

	public function tear_down() {
		parent::tear_down();

		Plugin::$instance->wp = $this->original_wp_api;
	}

	public function test_validate__throws_when_passing_non_src() {
		// Arrange.
		$prop_type = Image_Prop_Type::make();

		// Expect.
		$this->expectException( \Exception::class );

		// Act.
		$prop_type->validate( [
			'$$type' => 'image',
			'value' => [
				'src' => [
					'$$type' => 'not-an-src',
					'value' => [],
				],
			],
		] );
	}

	public function test_validate__throws_when_passing_src_without_id_and_url() {
		// Arrange.
		$prop_type = Image_Prop_Type::make();

		// Expect.
		$this->expectException( \Exception::class );

		// Act.
		$prop_type->validate( [
			'$$type' => 'image',
			'value' => [
				'src' => [
					'$$type' => 'image-src',
					'value' => [],
				],
			],
		] );
	}

	public function test_validate__throws_when_passing_src_with_null_id_and_url() {
		// Arrange.
		$prop_type = Image_Prop_Type::make();

		// Expect.
		$this->expectException( \Exception::class );

		// Act.
		$prop_type->validate( [
			'$$type' => 'image',
			'value' => [
				'src' => [
					'$$type' => 'image-src',
					'value' => [
						'id' => null,
						'url' => null,
					],
				],
			],
		] );
	}

	public function test_validate__throws_when_passing_src_with_non_numeric_attachment_id() {
		// Arrange.
		$prop_type = Image_Prop_Type::make();

		// Expect.
		$this->expectException( \Exception::class );

		// Act.
		$prop_type->validate( [
			'$$type' => 'image',
			'value' => [
				'src' => [
					'$$type' => 'image-src',
					'value' => [
						'id' => 'not-a-number',
						'url' => 'https://example.com/image.jpg',
					],
				],
			],
		] );
	}

	public function test_validate__throws_when_passing_src_with_non_existing_attachment_id() {
		// Arrange.
		$prop_type = Image_Prop_Type::make();

		// Expect.
		$this->expectException( \Exception::class );

		// Act.
		$prop_type->validate( [
			'$$type' => 'image',
			'value' => [
				'src' => [
					'$$type' => 'image-src',
					'value' => [
						'id' => -1,
						'url' => 'https://example.com/image.jpg',
					],
				],
			],
		] );
	}

	public function test_validate__throws_when_passing_src_with_non_string_url() {
		// Arrange.
		$prop_type = Image_Prop_Type::make();

		// Expect.
		$this->expectException( \Exception::class );

		// Act.
		$prop_type->validate( [
			'$$type' => 'image',
			'value' => [
				'src' => [
					'$$type' => 'image-src',
					'value' => [
						'id' => 123,
						'url' => 123
					],
				],
			],
		] );
	}

	public function test_validate__throws_when_passing_src_with_invalid_url() {
		// Arrange.
		$prop_type = Image_Prop_Type::make();

		// Expect.
		$this->expectException( \Exception::class );

		// Act.
		$prop_type->validate( [
			'$$type' => 'image',
			'value' => [
				'src' => [
					'$$type' => 'image-src',
					'value' => [
						'id' => 123,
						'url' => 'not-a-url'
					],
				],
			],
		] );
	}

	public function test_validate__throws_when_passing_non_string_size() {
		// Arrange.
		$prop_type = Image_Prop_Type::make();

		// Expect.
		$this->expectException( \Exception::class );

		// Act.
		$prop_type->validate( [
			'$$type' => 'image',
			'value' => [
				'size' => 123,
			],
		] );
	}

	public function test_validate__throws_when_passing_size_that_is_not_in_the_allowed_sizes() {
		// Arrange.
		$prop_type = Image_Prop_Type::make();

		$wp_sizes = Collection::make ( [
			'thumbnail',
			'medium',
			'medium_large',
			'large',
			'1536x1536',
			'2048x2048',
			'post-thumbnail',
		] )->map( fn( $size ) => "`$size`" )->implode( ', ' );

		// Expect.
		$this->expectException( \Exception::class );

		// Act.
		$prop_type->validate( [
			'$$type' => 'image',
			'value' => [
				'size' => 'unknown-size',
			],
		] );
	}
}
