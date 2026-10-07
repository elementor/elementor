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
		$this->assertSame( [ 'compositions' ], Site_Flag::parse_tokens( '1' ) );
	}

	public function test_mark__appends_unique_capabilities() {
		Site_Flag::mark( 'compositions' );
		Site_Flag::mark( 'compositions' );
		Site_Flag::mark( 'elements' );

		$this->assertSame( 'compositions,elements', get_option( Site_Flag::OPTION_NAME ) );
		$this->assertTrue( Site_Flag::is_set() );
	}

	public function test_filter_generator_tag_capabilities__lists_used_tokens() {
		Site_Flag::mark( 'compositions' );
		Site_Flag::mark( 'variables' );

		wp_cache_delete( 'alloptions', 'options' );

		$this->assertSame(
			[ 'compositions', 'variables' ],
			Site_Flag::filter_generator_tag_capabilities( [] )
		);
	}

	public function test_filter_notifications_request__stays_mcp_one() {
		Site_Flag::mark( 'compositions' );
		Site_Flag::mark( 'elements' );

		$args = Site_Flag::filter_notifications_request(
			[ 'body' => [] ],
			'https://my.elementor.com/api/v1/notifications'
		);

		$this->assertSame( [ 'mcp' => '1' ], $args['body'] );
		$this->assertArrayNotHasKey( 'capabilities', $args['body'] );
	}

	public function test_capability_for_ability__meaningful_tools_only() {
		$this->assertSame( 'compositions', Site_Flag::capability_for_ability( 'elementor/build-composition' ) );
		$this->assertNull( Site_Flag::capability_for_ability( 'elementor/get-structure' ) );
		$this->assertNull( Site_Flag::capability_for_ability( 'elementor/create-preview-link' ) );
		$this->assertNull( Site_Flag::capability_for_ability( 'elementor/list-posts' ) );
	}
}
