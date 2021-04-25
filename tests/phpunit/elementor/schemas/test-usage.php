<?php
namespace Elementor\Tests\Phpunit\Schemas;

use Elementor\Plugin;
use Elementor\Testing\Base_Schema;
use Elementor\Testing\Factories\Documents;
use Elementor\Tests\Phpunit\Elementor\Modules\Usage\DynamicTags\Link;
use Elementor\Tests\Phpunit\Elementor\Modules\Usage\DynamicTags\Title;
use JsonSchema\Exception\ValidationException;

class Test_Usage extends Base_Schema {

	public function test__ensure_clean_is_valid() {
		// Arrange.
		$this->generate_plugins_mock();

		// Act + Assert.
		$this->assertTrue( $this->validate_current_tracking_data_against_schema() );
	}

	public function test__ensure_invalid_exception() {
		// Arrange.
		$this->expectException( ValidationException::class );

		// Assert.
		$this->validate_against_schema( [] );
	}

	public function test__ensure_all_objects_have_no_additional_properties() {
		// Assert.
		$this->assert_schema_has_no_additional_properties( ELEMENTOR_PATH . 'schemas/usage.json' );
	}

	// The aim of the test is to fill all the possible tracking 'usage' data.
	public function test__ensure_tracking_data_with_usage_full_mock() {
		$this->generate_plugins_mock();

		// Arrange - Posts
		$this->factory()->create_post();

		// Library
		$this->factory()->documents->create_and_get_template( 'not-supported' );

		// Elements
		$this->factory()->documents->publish_and_get();

		// Elements with dynamic
		Plugin::$instance->dynamic_tags->register_tag( new Title() );
		Plugin::$instance->dynamic_tags->register_tag( new Link() );

		$this->factory()->documents->publish_and_get( [
			'meta_input' => [
				'_elementor_data' => Documents::DOCUMENT_DATA_MOCK_WITH_DYNAMIC_WIDGET,
			]
		] );

		// Act + Assert.
		$this->assertTrue( $this->validate_current_tracking_data_against_schema() );
	}
}
