<?php
namespace Elementor\Tests\Phpunit\Schemas;

use Elementor\Core\Utils\Collection;
use Elementor\Core\Utils\ImportExport\WP_Import;
use Elementor\Modules\CompatibilityTag\Module;
use Elementor\Testing\Elementor_Test_Base;
use Elementor\Tracker;
use JsonSchema\Exception\ValidationException;
use JsonSchema\SchemaStorage;
use JsonSchema\Validator;


class Test_Usage extends Elementor_Test_Base {
	const HTTP_USER_AGENT = 'test-agent';

	public function setUp() {
		parent::setUp();

		// Required by `Tracker::get_tracking_data`.
		$_SERVER['HTTP_USER_AGENT'] = self::HTTP_USER_AGENT;
	}

	protected function run_validation_against_schema( $data ) {
		// Since the usage system represents objects as array instead of stdClass.
		$data = json_decode( json_encode( $data ) );

		// Validate
		$validator = new Validator;
		$validator->validate($data, (object) ['$ref' => 'file://' . ELEMENTOR_PATH . 'schemas/usage.json'] );

		if ( ! $validator->isValid() ) {
			$error_message = 'JSON does not validate. Violations:' . PHP_EOL;
			foreach ( $validator->getErrors() as $error ) {
				$error_message .= sprintf( '[%s] %s' . PHP_EOL, $error['property'], $error['message'] );
			}

			throw new ValidationException( $error_message );
		}

		return true;
	}

	protected function validation_current_tracking_data_against_schema() {
		return $this->run_validation_against_schema( Tracker::get_tracking_data() );
	}

	protected function generate_plugins_mock() {
		// Arrange
		$plugins = new Collection( [
			'elementor/elementor.php' => [
				Module::PLUGIN_VERSION_TESTED_HEADER => '',
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

	public function test__ensure_clean_is_valid() {
		// Arrange.
		$this->generate_plugins_mock();

		// Act + Assert.
		$this->assertTrue( $this->validation_current_tracking_data_against_schema() );
	}

	public function test__ensure_invalid_exception() {
		// Arrange.
		$this->expectException( ValidationException::class );

		// Assert.
		$this->run_validation_against_schema( [] );
	}

	public function test__ensure_all_objects_have_no_additional_properties() {
		// Arrange.
		$json_schema_object = json_decode( file_get_contents( ELEMENTOR_PATH . 'schemas/usage.json' ) );

		$schema_storage = new SchemaStorage();
		$schema_storage->addSchema('usage', $json_schema_object);

		$properties_all_objects_recursive = function( $node, callable $callback ) use ( &$properties_all_objects_recursive ) {
			if ( ! ( $node instanceof \stdClass ) ) {
				return;
			}

			if ( isset( $node->properties ) || isset( $node->patternProperties ) ) {
				$callback( $node );
			}

			foreach ( $node as $part ) {
				$properties_all_objects_recursive( $part, $callback );
			}
		};

		// Act.
		$usage_schema = $schema_storage->getSchema( 'usage' );

		// Assert.
		$properties_all_objects_recursive( $usage_schema, function ( $node ) {
			$id = $node->{'$id'};
			$this->assertTrue( isset( $node->additionalProperties ),
				"Ensure node: '$id' 'additionalProperties' exists" );
			$this->assertFalse( $node->additionalProperties,
				"Ensure node: '$id' 'additionalProperties' is false" );
		} );
	}

	public function test__ensure_tracking_data_with_fresh_wordpress_is_valid() {
		// Arrange.
		$importer = new WP_Import( ELEMENTOR_PATH . 'tests/phpunit/elementor/core/utils/mock/fresh-wordpress-database.xml' );

		$this->assertEquals( 'success', $importer->run()['status'] );

		$this->generate_plugins_mock();

		// Act + Assert.
		$this->assertTrue( $this->validation_current_tracking_data_against_schema() );
	}

	// The aim of the test is to fill all the possible tracking 'usage' data.
	public function test__ensure_tracking_data_with_usage_full_mock() {
		// TODO
		$this->markTestSkipped();
	}
}
