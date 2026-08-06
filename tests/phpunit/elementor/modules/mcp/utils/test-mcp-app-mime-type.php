<?php

namespace Elementor\Tests\Phpunit\Modules\Mcp\Utils;

use Elementor\Modules\Mcp\Utils\Mcp_App_Mime_Type;
use PHPUnit\Framework\TestCase;
use WP\MCP\Domain\Utils\McpValidator;
use WP\McpSchema\Server\Resources\DTO\Resource as Resource_Dto;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * @group Elementor\Modules\Mcp
 */
class Test_Mcp_App_Mime_Type extends TestCase {

	const APP_URI = 'ui://elementor/suggested-actions';
	const APP_MIME_TYPE = 'text/html;profile=mcp-app';

	public function test_adapter_still_rejects_the_mcp_app_mime_type() {
		// Assert
		// When this starts failing the adapter accepts RFC 2045 parameters and Mcp_App_Mime_Type can be removed.
		$this->assertFalse( McpValidator::validate_mime_type( self::APP_MIME_TYPE ) );
	}

	public function test_restores_the_profile_mime_type_on_a_mapped_resource() {
		// Arrange
		$resource = Resource_Dto::fromArray( [
			'name' => 'suggested-actions-ui',
			'uri' => self::APP_URI,
		] );

		// Act
		$restored = $this->make()->restore( [ $resource ] );

		// Assert
		$this->assertSame( self::APP_MIME_TYPE, $restored[0]->getMimeType() );
		$this->assertSame( self::APP_URI, $restored[0]->getUri() );
	}

	public function test_preserves_other_resource_fields() {
		// Arrange
		$resource = Resource_Dto::fromArray( [
			'name' => 'suggested-actions-ui',
			'uri' => self::APP_URI,
			'title' => 'Suggested Actions UI',
			'description' => 'Interactive chips.',
		] );

		// Act
		$restored = $this->make()->restore( [ $resource ] );

		// Assert
		$this->assertSame( 'Suggested Actions UI', $restored[0]->getTitle() );
		$this->assertSame( 'Interactive chips.', $restored[0]->getDescription() );
	}

	public function test_leaves_unmapped_resources_untouched() {
		// Arrange
		$resource = Resource_Dto::fromArray( [
			'name' => 'style-best-practices',
			'uri' => 'elementor://style/best-practices',
			'mimeType' => 'text/markdown',
		] );

		// Act
		$restored = $this->make()->restore( [ $resource ] );

		// Assert
		$this->assertSame( $resource, $restored[0] );
	}

	public function test_leaves_non_resource_entries_untouched() {
		// Arrange
		$entry = new \stdClass();

		// Act
		$restored = $this->make()->restore( [ $entry ] );

		// Assert
		$this->assertSame( $entry, $restored[0] );
	}

	private function make(): Mcp_App_Mime_Type {
		return new Mcp_App_Mime_Type( [ self::APP_URI => self::APP_MIME_TYPE ] );
	}
}
