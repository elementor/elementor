<?php

namespace Elementor\Testing\Modules\AtomicWidgets\DynamicTags;

use Elementor\Core\DynamicTags\Manager as Dynamic_Tags_Manager;
use Elementor\Modules\AtomicWidgets\DynamicTags\Dynamic_Prop_Type;
use Elementor\Modules\AtomicWidgets\DynamicTags\Dynamic_Tags_Module;
use Elementor\Modules\AtomicWidgets\DynamicTags\Dynamic_Tags_Schemas;
use Elementor\Modules\AtomicWidgets\DynamicTags\Dynamic_Transformer;
use Elementor\Modules\AtomicWidgets\PropsResolver\Props_Resolver_Context;
use Elementor\Modules\AtomicWidgets\PropsResolver\Render_Props_Resolver;
use Elementor\Modules\AtomicWidgets\PropTypes\Image_Src_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Svg_Src_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Union_Prop_Type;
use Elementor\Plugin;
use Elementor\Testing\Modules\AtomicWidgets\DynamicTags\Mocks\Mock_Image_Dynamic_Tag;
use ElementorEditorTesting\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

require_once __DIR__ . '/mocks/mock-image-dynamic-tag.php';

/**
 * @group props-resolver
 */
class Test_Dynamic_Transformer extends Elementor_Test_Base {

	private Dynamic_Transformer $transformer;

	private Dynamic_Tags_Manager $original_dynamic_tags;

	public function setUp(): void {
		parent::setUp();

		$this->original_dynamic_tags = Plugin::$instance->dynamic_tags;

		Plugin::$instance->dynamic_tags = new Dynamic_Tags_Manager();

		remove_all_actions( 'elementor/dynamic_tags/register_tags' );
		remove_all_actions( 'elementor/dynamic_tags/register' );

		Mock_Image_Dynamic_Tag::reset();

		Plugin::$instance->dynamic_tags->register( new Mock_Image_Dynamic_Tag() );

		Dynamic_Tags_Module::fresh();

		$this->transformer = new Dynamic_Transformer(
			Plugin::$instance->dynamic_tags,
			new Dynamic_Tags_Schemas(),
			Render_Props_Resolver::for_settings()
		);
	}

	public function tearDown(): void {
		parent::tearDown();

		Mock_Image_Dynamic_Tag::reset();

		Plugin::$instance->dynamic_tags = $this->original_dynamic_tags;
	}

	public function test_transform__wraps_image_tag_value_as_svg_src() {
		// Act.
		$result = $this->transformer->transform(
			[ 'name' => 'mock-image-dynamic-tag', 'settings' => [] ],
			$this->make_context( Svg_Src_Prop_Type::make() )
		);

		// Assert.
		$this->assertSame( [
			'$$type' => 'svg-src',
			'value' => [
				'id' => [ '$$type' => 'image-attachment-id', 'value' => Mock_Image_Dynamic_Tag::ATTACHMENT_ID ],
				'url' => [ '$$type' => 'url', 'value' => Mock_Image_Dynamic_Tag::ATTACHMENT_URL ],
			],
		], $result );
	}

	public function test_transform__wraps_image_tag_value_as_svg_src_when_only_a_url_is_returned() {
		// Arrange.
		Mock_Image_Dynamic_Tag::$value = [
			'id' => null,
			'url' => Mock_Image_Dynamic_Tag::ATTACHMENT_URL,
		];

		// Act.
		$result = $this->transformer->transform(
			[ 'name' => 'mock-image-dynamic-tag', 'settings' => [] ],
			$this->make_context( Svg_Src_Prop_Type::make() )
		);

		// Assert.
		$this->assertSame( [
			'$$type' => 'svg-src',
			'value' => [
				'id' => null,
				'url' => [ '$$type' => 'url', 'value' => Mock_Image_Dynamic_Tag::ATTACHMENT_URL ],
			],
		], $result );
	}

	public function test_transform__returns_null_when_the_image_tag_has_no_value() {
		// Arrange.
		Mock_Image_Dynamic_Tag::$value = [
			'id' => null,
			'url' => null,
		];

		// Act.
		$result = $this->transformer->transform(
			[ 'name' => 'mock-image-dynamic-tag', 'settings' => [] ],
			$this->make_context( Svg_Src_Prop_Type::make() )
		);

		// Assert.
		$this->assertNull( $result );
	}

	public function test_transform__does_not_wrap_non_array_values() {
		// Arrange.
		Mock_Image_Dynamic_Tag::$value = 'https://example.com/icon.svg';

		// Act.
		$result = $this->transformer->transform(
			[ 'name' => 'mock-image-dynamic-tag', 'settings' => [] ],
			$this->make_context( Svg_Src_Prop_Type::make() )
		);

		// Assert.
		$this->assertSame( 'https://example.com/icon.svg', $result );
	}

	public function test_transform__does_not_wrap_when_the_prop_is_not_an_svg_prop() {
		// Act.
		$result = $this->transformer->transform(
			[ 'name' => 'mock-image-dynamic-tag', 'settings' => [] ],
			$this->make_context( Image_Src_Prop_Type::make() )
		);

		// Assert.
		$this->assertSame( [
			'id' => Mock_Image_Dynamic_Tag::ATTACHMENT_ID,
			'url' => Mock_Image_Dynamic_Tag::ATTACHMENT_URL,
		], $result );
	}

	public function test_transform__does_not_wrap_when_there_is_no_schema_prop_type() {
		// Act.
		$result = $this->transformer->transform(
			[ 'name' => 'mock-image-dynamic-tag', 'settings' => [] ],
			Props_Resolver_Context::make()
		);

		// Assert.
		$this->assertSame( [
			'id' => Mock_Image_Dynamic_Tag::ATTACHMENT_ID,
			'url' => Mock_Image_Dynamic_Tag::ATTACHMENT_URL,
		], $result );
	}

	private function make_context( $prop_type ): Props_Resolver_Context {
		$union = Union_Prop_Type::create_from( $prop_type )
			->add_prop_type( Dynamic_Prop_Type::make() );

		return Props_Resolver_Context::make()->set_schema_prop_type( $union );
	}
}
