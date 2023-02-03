<?php
namespace Elementor\Tests\Phpunit\Schemas;

use Elementor\Core\Common\Modules\Connect\Apps\Base_App;
use Elementor\Core\Common\Modules\Connect\Apps\Common_App;
use Elementor\Core\Utils\Collection;
use Elementor\Plugin;
use Elementor\Tests\Phpunit\Elementor\Modules\Usage\DynamicTags\Link;
use Elementor\Tests\Phpunit\Elementor\Modules\Usage\DynamicTags\Title;
use Elementor\Tracker;
use ElementorEditorTesting\Base_Schema;
use ElementorEditorTesting\Factories\Documents;
use JsonSchema\Exception\ValidationException;

class Test_Usage extends Base_Schema {
	/**
	 * @var string
	 */
	private $schema_file = __DIR__  . '/../../schemas/usage.json';

	public function test__ensure_clean_is_valid() {
		// Arrange.
		$this->generate_plugins_mock();

		// Act + Assert.
		$this->assertTrue( $this->validate_current_tracking_data_against_schema( $this->schema_file ) );
	}

	public function test__ensure_invalid_exception() {
		// Arrange.
		$this->expectException( ValidationException::class );

		// Assert.
		$this->validate_against_schema( [], $this->schema_file );
	}

	public function test__ensure_all_objects_have_no_additional_properties() {
		// Assert.
		$this->assert_schema_has_no_additional_properties( $this->schema_file );
	}

	// The aim of the test is to fill all the possible tracking 'usage' data.
	// TODO: When the method reach incomprehensible size, part it.
	public function test__ensure_tracking_data_with_usage_full_mock() {
		$this->generate_plugins_mock();

		// Arrange - Posts
		$this->factory()->create_post();

		// Library
		$this->factory()->documents->create_and_get_template( 'not-supported' );

		// Elements
		$this->factory()->documents->publish_and_get();

		// Elements with dynamic
		Plugin::$instance->dynamic_tags->register( new Title() );
		Plugin::$instance->dynamic_tags->register( new Link() );

		$this->factory()->documents->publish_and_get( [
			'meta_input' => [
				'_elementor_data' => Documents::DOCUMENT_DATA_MOCK_WITH_DYNAMIC_WIDGET,
			]
		] );

		// Add missing tabs to page settings.
		Plugin::$instance->icons_manager->register_admin_settings( Plugin::$instance->settings );
		Plugin::$instance->modules_manager->get_modules( 'safe-mode' )->add_admin_button(
			Plugin::$instance->tools
		);
		Plugin::$instance->maintenance_mode->register_settings_fields( Plugin::$instance->tools );

		// Add fake connect data.
		update_option( Base_App::OPTION_CONNECT_SITE_KEY, 'test' );
		update_user_option( get_current_user_id(), Common_App::OPTION_CONNECT_COMMON_DATA_KEY, [
			'user' => (object) [
				'email' => 'user@localhost',
			],
		] );

		// Act.
		$tracking_data = Tracker::get_tracking_data();
		$usage = $tracking_data[ 'usages' ];

		// Assert - Ensure tracking data have arranged data.
		$this->assert_array_have_keys( ['publish'], $usage['posts']['post'] );
		$this->assert_array_have_keys( ['not-supported'], $usage['library'] );
		$this->assert_array_have_keys( ['wp-post'], $usage['elements'] );
		$this->assertCount( 4, $usage['elements']['wp-post'] );
		$this->assert_array_have_keys( ['__dynamic__'], $usage['elements']['wp-post']['heading']['controls']['general'] );

		// Assert - Validate schema.
		$this->assertTrue( $this->validate_against_schema( $tracking_data, $this->schema_file ) );
	}

	private function generate_plugins_mock() {
		// Arrange
		$plugins = new Collection( [
			'elementor/elementor.php' => [
				'Elementor tested up to' => '',
				'Name' => 'Elementor',
				'PluginURI' => 'https:\/\/elementor.com\/?utm_source=wp-plugins&utm_campaign=plugin-uri&utm_medium=wp-dash',
				'Version' => ELEMENTOR_VERSION,
				'Description' => 'The Elementor Website Builder has it all: drag and drop page builder, pixel perfect design, mobile responsive editing, and more. Get started now!',
				'Author' => "Elementor.com",
				'AuthorURI' => 'https:\/\/elementor.com\/?utm_source=wp-plugins&utm_campaign=author-uri&utm_medium=wp-dash',
				'TextDomain' => 'elementor',
				'DomainPath' => '',
				'Network' => false,
				'RequiresWP' => '',
				'RequiresPHP' => '',
				'Title' => 'Elementor',
				'AuthorName' => 'Elementor.com',
			],
		] );

		$this->mock_wp_api( [
			'get_plugins' => $plugins,
		] );
	}
}
