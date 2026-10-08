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

	public function test_filters_silent_when_flag_unset() {
		// Act / Assert
		$this->assertSame( '', Site_Flag::get_value() );
		$this->assertSame( [ 'foo' ], Site_Flag::filter_body_class( [ 'foo' ] ) );
		$this->assertSame(
			[ 'body' => [] ],
			Site_Flag::filter_notifications_request(
				[ 'body' => [] ],
				'https://my.elementor.com/api/v1/notifications'
			)
		);
		$this->assertSame( '', Site_Flag::filter_generator_tag_capabilities( '' ) );
	}

	public function test_filters_fire_after_mark() {
		// Arrange
		Site_Flag::mark( 'compositions' );
		Site_Flag::mark( 'variables' );

		// Act / Assert
		$this->assertSame( 'compositions,variables', Site_Flag::get_value() );
		$this->assertSame(
			[ 'foo', Site_Flag::BODY_CLASS ],
			Site_Flag::filter_body_class( [ 'foo' ] )
		);
		$args = Site_Flag::filter_notifications_request(
			[ 'body' => [] ],
			'https://my.elementor.com/api/v1/notifications'
		);
		$this->assertSame( [ 'mcp' => '1' ], $args['body'] );
		$this->assertSame(
			'compositions,variables',
			Site_Flag::filter_generator_tag_capabilities( '' )
		);
	}

	public function test_mark__dedupes_and_skips_write_when_present() {
		// Act
		Site_Flag::mark( 'compositions' );
		Site_Flag::mark( 'compositions' );
		Site_Flag::mark( 'elements' );
		Site_Flag::mark( 'compositions' );

		// Assert
		$this->assertSame( 'compositions,elements', get_option( Site_Flag::OPTION_NAME ) );
		$this->assertSame( 'compositions,elements', Site_Flag::get_value() );
	}

	public function test_option_name_is_elementor_m_exists() {
		// Act / Assert
		$this->assertSame( 'elementor_m_exists', Site_Flag::OPTION_NAME );
	}

	public function test_register__always_adds_hooks_without_mcp_gate() {
		// Arrange
		$source = file_get_contents(
			dirname( __DIR__, 5 ) . '/modules/mcp/site-flag.php'
		);

		// Act / Assert
		$this->assertStringNotContainsString(
			'is_site_mcp_exposure_enabled',
			$source
		);
		$this->assertStringContainsString(
			"add_filter( 'body_class', [ self::class, 'filter_body_class' ] );",
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
		$this->assertStringNotContainsString( 'parse_tokens', $source );
		$this->assertStringNotContainsString( 'get_tokens', $source );
		$this->assertStringNotContainsString( 'foreach', $source );
	}

	public function test_capability_for_ability__meaningful_tools_only() {
		// Act / Assert
		$this->assertSame( 'compositions', Site_Flag::capability_for_ability( 'elementor/build-composition' ) );
		$this->assertSame( 'page-settings', Site_Flag::capability_for_ability( 'elementor/update-page-settings' ) );
		$this->assertNull( Site_Flag::capability_for_ability( 'elementor/get-structure' ) );
		$this->assertNull( Site_Flag::capability_for_ability( 'elementor/create-preview-link' ) );
		$this->assertNull( Site_Flag::capability_for_ability( 'elementor/list-posts' ) );
	}
}
