<?php

namespace Elementor\Tests\Phpunit\Modules\Mcp;

use Elementor\Modules\Mcp\Site_Flag;
use ElementorEditorTesting\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * @group Elementor\Modules\Mcp
 */
class Test_Mcp_Site_Flag extends Elementor_Test_Base {

	public function setUp(): void {
		parent::setUp();
		delete_option( Site_Flag::OPTION_NAME );
	}

	public function tearDown(): void {
		delete_option( Site_Flag::OPTION_NAME );
		parent::tearDown();
	}

	public function test_parse_tokens__legacy_one_is_compositions() {
		// Act / Assert
		$this->assertSame( [ 'compositions' ], Site_Flag::parse_tokens( '1' ) );
	}

	public function test_mark__appends_unique_capabilities() {
		// Act
		Site_Flag::mark( 'compositions' );
		Site_Flag::mark( 'compositions' );
		Site_Flag::mark( 'elements' );

		// Assert
		$this->assertSame( 'compositions,elements', get_option( Site_Flag::OPTION_NAME ) );
		$this->assertTrue( Site_Flag::is_set() );
	}

	public function test_filter_generator_tag_capabilities__lists_used_tokens() {
		// Arrange
		Site_Flag::mark( 'compositions' );
		Site_Flag::mark( 'variables' );
		wp_cache_delete( 'alloptions', 'options' );

		// Act / Assert
		$this->assertSame(
			[ 'compositions', 'variables' ],
			Site_Flag::filter_generator_tag_capabilities( [] )
		);
	}

	public function test_filter_notifications_request__stays_mcp_one() {
		// Arrange
		Site_Flag::mark( 'compositions' );
		Site_Flag::mark( 'elements' );

		// Act
		$args = Site_Flag::filter_notifications_request(
			[ 'body' => [] ],
			'https://my.elementor.com/api/v1/notifications'
		);

		// Assert
		$this->assertSame( [ 'mcp' => '1' ], $args['body'] );
		$this->assertArrayNotHasKey( 'capabilities', $args['body'] );
	}

	public function test_register__noops_when_mcp_disabled() {
		// Arrange
		$source = file_get_contents(
			dirname( __DIR__, 5 ) . '/modules/mcp/site-flag.php'
		);

		// Act / Assert
		$this->assertStringContainsString(
			'if ( ! Module::is_site_mcp_exposure_enabled() ) {',
			$source
		);
		$this->assertStringContainsString(
			"add_filter( 'http_request_args', [ self::class, 'filter_notifications_request' ], 10, 2 );",
			$source
		);
		$this->assertStringContainsString(
			"add_filter( 'elementor/generator_tag/capabilities', [ self::class, 'filter_generator_tag_capabilities' ] );",
			$source
		);
		$this->assertStringContainsString(
			"add_action( 'template_redirect', [ self::class, 'maybe_refresh_notifications' ] );",
			$source
		);
	}

	public function test_maybe_refresh_notifications__skips_admin() {
		// Arrange
		$source = file_get_contents(
			dirname( __DIR__, 5 ) . '/modules/mcp/site-flag.php'
		);

		// Act / Assert
		$this->assertStringContainsString(
			'if ( is_admin() || wp_doing_ajax() || wp_doing_cron() ) {',
			$source
		);
		$this->assertStringContainsString(
			'Elementor\\WPNotificationsPackage\\V120\\Notifications',
			$source
		);
		$this->assertStringContainsString(
			'$notifications->refresh_notifications();',
			$source
		);
	}

	public function test_capability_for_ability__meaningful_tools_only() {
		// Act / Assert
		$this->assertSame( 'compositions', Site_Flag::capability_for_ability( 'elementor/build-composition' ) );
		$this->assertNull( Site_Flag::capability_for_ability( 'elementor/get-structure' ) );
		$this->assertNull( Site_Flag::capability_for_ability( 'elementor/create-preview-link' ) );
		$this->assertNull( Site_Flag::capability_for_ability( 'elementor/list-posts' ) );
	}
}
