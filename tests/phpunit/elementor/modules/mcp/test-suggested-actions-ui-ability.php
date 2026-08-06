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
}
