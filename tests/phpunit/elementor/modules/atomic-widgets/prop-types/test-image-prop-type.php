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

	public function test_validate() {
		// Arrange.
		$prop_type = Image_Prop_Type::make();

		// Act.
		$result = $prop_type->validate( [
			'$$type' => 'image',
			'value' => [
				'src' => [
					'$$type' => 'image-src',
					'value' => [
						'id' => null,
						'url' => [
							'$$type' => 'url',
							'value' => 'https://example.com/image.jpg'
						],
					],
				],
				'size' => 'full',
			],
		] );

		// Assert.
		$this->assertTrue( $result );
	}

	public function test_validate__fail_when_passing_non_src() {
		// Arrange.
		$prop_type = Image_Prop_Type::make();

		// Act.
		$result = $prop_type->validate( [
			'$$type' => 'image',
			'value' => [
				'src' => [
					'$$type' => 'not-an-src',
					'value' => [],
				],
				'size' => 'full',
			],
		] );

		// Assert.
		$this->assertFalse( $result );
	}

	public function test_validate__fail_when_passing_src_without_id_and_url() {
		// Arrange.
		$prop_type = Image_Prop_Type::make();

		// Act.
		$result = $prop_type->validate( [
			'$$type' => 'image',
			'value' => [
				'src' => [
					'$$type' => 'image-src',
					'value' => [],
				],
				'size' => 'full',
			],
		] );

		// Assert.
		$this->assertFalse( $result );
	}

	public function test_validate__fail_when_passing_src_with_null_id_and_url() {
		// Arrange.
		$prop_type = Image_Prop_Type::make();

		// Act.
		$result = $prop_type->validate( [
			'$$type' => 'image',
			'value' => [
				'src' => [
					'$$type' => 'image-src',
					'value' => [
						'id' => null,
						'url' => null,
					],
				],
				'size' => 'full',
			],
		] );

		// Assert.
		$this->assertFalse( $result );
	}

	public function test_validate__fail_when_passing_src_with_non_numeric_attachment_id() {
		// Arrange.
		$prop_type = Image_Prop_Type::make();

		// Act.
		$result = $prop_type->validate( [
			'$$type' => 'image',
			'value' => [
				'src' => [
					'$$type' => 'image-src',
					'value' => [
						'id' => [
							'$$type' => 'image-attachment-id',
							'value' => 'not-a-number'
						],
						'url' => null,
					],
				],
				'size' => 'full',
			],
		] );

		// Assert.
		$this->assertFalse( $result );
	}

	public function test_validate__fail_when_passing_src_with_non_existing_attachment_id() {
		// Arrange.
		$prop_type = Image_Prop_Type::make();

		// Act.
		$result = $prop_type->validate( [
			'$$type' => 'image',
			'value' => [
				'src' => [
					'$$type' => 'image-src',
					'value' => [
						'id' => [
							'$$type' => 'image-attachment-id',
							'value' => -1
						],
						'url' => null,
					],
				],
				'size' => 'full',
			],
		] );

		// Assert.
		$this->assertFalse( $result );
	}

	public function test_validate__fail_when_passing_src_with_non_string_url() {
		// Arrange.
		$prop_type = Image_Prop_Type::make();

		// Act.
		$result = $prop_type->validate( [
			'$$type' => 'image',
			'value' => [
				'src' => [
					'$$type' => 'image-src',
					'value' => [
						'id' => null,
						'url' => [
							'$$type' => 'url',
							'value' => 123
						],
					],
				],
				'size' => 'full',
			],
		] );

		// Assert.
		$this->assertFalse( $result );
	}

	public function test_validate__fail_when_passing_src_with_invalid_url() {
		// Arrange.
		$prop_type = Image_Prop_Type::make();

		// Act.
		$result = $prop_type->validate( [
			'$$type' => 'image',
			'value' => [
				'src' => [
					'$$type' => 'image-src',
					'value' => [
						'id' => null,
						'url' => [
							'$$type' => 'url',
							'value' => 'invalid-url'
						]
					],
				],
				'size' => 'full',
			],
		] );

		// Assert.
		$this->assertFalse( $result );
	}

	public function test_validate__fail_when_passing_non_string_size() {
		// Arrange.
		$prop_type = Image_Prop_Type::make();

		// Act.
		$result = $prop_type->validate( [
			'$$type' => 'image',
			'value' => [
				'src' => [
					'$$type' => 'image-src',
					'value' => [
						'id' => [
							'$$type' => 'image-attachment-id',
							'value' => 123
						],
						'url' => null,
					]
				],
				'size' => 123,
			],
		] );

		// Assert.
		$this->assertFalse( $result );
	}

	public function test_validate__fails_when_passing_size_that_is_not_in_the_allowed_sizes() {
		// Arrange.
		$prop_type = Image_Prop_Type::make();

		// Act.
		$result = $prop_type->validate( [
			'$$type' => 'image',
			'value' => [
				'src' => [
					'$$type' => 'image-src',
					'value' => [
						'id' => [
							'$$type' => 'image-attachment-id',
							'value' => 123
						],
						'url' => null,
					]
				],
				'size' => 'unknown-size',
			],
		] );

		// Assert.
		$this->assertFalse( $result );
	}

	public function test_validate__fails_when_passing_size_and_url() {
		// Arrange.
		$prop_type = Image_Prop_Type::make();

		// Act.
		$result = $prop_type->validate( [
			'$$type' => 'image',
			'value' => [
				'src' => [
					'$$type' => 'image-src',
					'value' => [
						'id' => [
							'$$type' => 'image-attachment-id',
							'value' => 123
						],
						'url' => [
							'$$type' => 'url',
							'value' => 'https://example.com/image.jpg'
						],
					]
				],
				'size' => 'full',
			],
		] );

		// Assert.
		$this->assertFalse( $result );
	}
}
