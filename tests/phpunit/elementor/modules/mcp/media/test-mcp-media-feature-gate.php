<?php

namespace Elementor\Tests\Phpunit\Modules\Mcp\Media;

use Elementor\Modules\Mcp\Abilities\Request_Media_Upload_Ability;
use Elementor\Modules\Mcp\Abilities\Update_Media_Attachment_Ability;
use Elementor\Modules\Mcp\Abilities\Upload_Media_Ability;
use Elementor\Modules\Mcp\Media\Mcp_Media_Feature_Gate;
use Elementor\Modules\Mcp\Media\Media_Upload_Token_Store;
use Elementor\Modules\Mcp\Module;
use Elementor\Modules\Mcp\RestApi\Mcp_Media_Upload_REST_API;
use ElementorEditorTesting\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * @group Elementor\Modules\Mcp
 */
class Test_Mcp_Media_Feature_Gate extends Elementor_Test_Base {

	private const ROUTE = '/elementor/v1/mcp-media-upload';

	private const MEDIA_PROXY_SLUGS = [
		'upload-media',
		'request-media-upload',
		'update-media-attachment',
	];

	public function tearDown(): void {
		remove_all_filters( Mcp_Media_Feature_Gate::ENABLED_FILTER );

		parent::tearDown();
	}

	private function boot_rest_server(): void {
		global $wp_rest_server;

		$wp_rest_server = new \WP_REST_Server();

		( new Mcp_Media_Upload_REST_API() )->register_hooks();

		do_action( 'rest_api_init' );
	}

	public function test_is_enabled__defaults_to_true() {
		// Assert
		$this->assertTrue( Mcp_Media_Feature_Gate::is_enabled() );
	}

	public function test_registry__includes_media_abilities_by_default() {
		// Act
		$registry = Module::build_core_registry();

		// Assert
		foreach ( self::MEDIA_PROXY_SLUGS as $slug ) {
			$this->assertNotNull( $registry->find_by_proxy_slug( $slug ) );
		}
	}

	public function test_rest_route__is_registered_by_default() {
		// Act
		$this->boot_rest_server();

		// Assert
		$this->assertArrayHasKey( self::ROUTE, rest_get_server()->get_routes() );
	}

	public function test_registry__excludes_media_abilities_when_disabled() {
		// Arrange
		add_filter( Mcp_Media_Feature_Gate::ENABLED_FILTER, '__return_false' );

		// Act
		$registry = Module::build_core_registry();

		// Assert
		foreach ( self::MEDIA_PROXY_SLUGS as $slug ) {
			$this->assertNull( $registry->find_by_proxy_slug( $slug ) );
		}
	}

	public function test_rest_route__is_not_registered_when_disabled() {
		// Arrange
		add_filter( Mcp_Media_Feature_Gate::ENABLED_FILTER, '__return_false' );

		// Act
		$this->boot_rest_server();

		// Assert
		$this->assertArrayNotHasKey( self::ROUTE, rest_get_server()->get_routes() );
	}

	public function test_abilities__return_error_when_disabled() {
		// Arrange
		$this->act_as_admin();
		add_filter( Mcp_Media_Feature_Gate::ENABLED_FILTER, '__return_false' );

		$abilities = [
			new Upload_Media_Ability(),
			new Request_Media_Upload_Ability(),
			new Update_Media_Attachment_Ability(),
		];

		foreach ( $abilities as $ability ) {
			// Act
			$result = $ability->execute( [
				'consent' => true,
				'source_url' => 'https://example.com/image.png',
				'attachment_id' => 1,
			] );

			// Assert
			$this->assertWPError( $result );
			$this->assertSame( 'mcp_media_disabled', $result->get_error_code() );
		}
	}

	public function test_token__is_not_accepted_when_disabled_after_issue() {
		// Arrange
		$this->act_as_admin();
		$issued = ( new Request_Media_Upload_Ability() )->execute( [ 'consent' => true ] );
		$token = $issued['upload_token'];
		$this->assertTrue( Media_Upload_Token_Store::is_valid_for_request( $token ) );

		// Act
		add_filter( Mcp_Media_Feature_Gate::ENABLED_FILTER, '__return_false' );

		// Assert
		$this->assertFalse( Media_Upload_Token_Store::is_valid_for_request( $token ) );
		$this->assertWPError( Media_Upload_Token_Store::consume( $token ) );
	}

	public function test_request_media_upload__returns_disabled_error_for_any_count() {
		// Arrange
		$this->act_as_admin();
		add_filter( Mcp_Media_Feature_Gate::ENABLED_FILTER, '__return_false' );
		$ability = new Request_Media_Upload_Ability();

		// Act
		$result = $ability->execute( [
			'consent' => true,
			'count' => 3,
		] );

		// Assert
		$this->assertWPError( $result );
		$this->assertSame( 'mcp_media_disabled', $result->get_error_code() );
	}
}
