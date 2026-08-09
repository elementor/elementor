<?php

namespace Elementor\Tests\Phpunit\Modules\Mcp;

use Elementor\Modules\Mcp\Abilities\Suggested_Actions_Ui_Ability;
use PHPUnit\Framework\TestCase;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * @group Elementor\Modules\Mcp
 */
class Test_Suggested_Actions_Ui_Ability extends TestCase {

	public function test_uri_and_mime_type_constants() {
		// Assert
		$this->assertSame( 'ui://elementor/suggested-actions', Suggested_Actions_Ui_Ability::URI );
		$this->assertSame( 'text/html;profile=mcp-app', Suggested_Actions_Ui_Ability::MIME_TYPE );
	}

	public function test_execute_returns_content_item_with_profile_mime_type_and_html() {
		// Arrange
		$ability = new Suggested_Actions_Ui_Ability();

		// Act
		$result = $ability->execute();

		// Assert
		$this->assertIsArray( $result );
		$this->assertCount( 1, $result );
		$this->assertSame( Suggested_Actions_Ui_Ability::URI, $result[0]['uri'] );
		$this->assertSame( Suggested_Actions_Ui_Ability::MIME_TYPE, $result[0]['mimeType'] );
		$this->assertIsString( $result[0]['text'] );
		$this->assertNotSame( '', trim( $result[0]['text'] ) );
		$this->assertStringContainsString( '<!DOCTYPE html>', $result[0]['text'] );
	}

	public function test_declared_output_schema_describes_content_items() {
		// Arrange
		$ability = new Suggested_Actions_Ui_Ability();

		// Act
		$schema = $this->get_definition( $ability )->output_schema;

		// Assert
		$this->assertSame( 'array', $schema['type'] );
		$this->assertSame( 'object', $schema['items']['type'] );
		$this->assertSame( [ 'uri', 'mimeType', 'text' ], $schema['items']['required'] );
	}

	/**
	 * The Abilities API validates execute() output against the declared schema before
	 * the adapter ever sees it, so a mismatch fails resources/read with an internal error.
	 */
	public function test_execute_result_conforms_to_declared_output_schema() {
		// Arrange
		$ability    = new Suggested_Actions_Ui_Ability();
		$schema     = $this->get_definition( $ability )->output_schema;
		$properties = $schema['items']['properties'];

		// Act
		$result = $ability->execute();

		// Assert
		$this->assertIsArray( $result );

		foreach ( $result as $item ) {
			foreach ( $schema['items']['required'] as $required_key ) {
				$this->assertArrayHasKey( $required_key, $item );
			}

			foreach ( $item as $key => $value ) {
				$this->assertArrayHasKey( $key, $properties );
				$this->assertSame( $properties[ $key ]['type'], gettype( $value ) );
			}
		}
	}

	private function get_definition( Suggested_Actions_Ui_Ability $ability ) {
		$reflection = new \ReflectionMethod( $ability, 'get_definition' );
		$reflection->setAccessible( true );
		return $reflection->invoke( $ability );
	}
}
