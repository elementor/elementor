<?php

namespace Elementor\Testing\Modules\CompositeWidgets;

use Elementor\Modules\CompositeWidgets\Definitions\Site_Definitions_Registrar;
use Elementor\Modules\CompositeWidgets\Definitions\Widgets_Definitions_Registry;
use Elementor\Modules\CompositeWidgets\Module;
use Elementor\Testing\Modules\CompositeWidgets\Fixtures\Site_Definition_Fixture;
use ElementorEditorTesting\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

require_once __DIR__ . '/fixtures/site-definition-fixture.php';

class Test_Definitions_REST_API extends Elementor_Test_Base {
	const ROUTE = '/elementor/v1/composite-widgets';

	public function setUp(): void {
		parent::setUp();

		$this->drop_routes_registered_by_the_loaded_module();

		add_action( Module::REGISTER_SITE_HOOK, function ( Site_Definitions_Registrar $registrar ) {
			$registrar->register( Site_Definition_Fixture::definition(), true );
		} );

		new Module();

		global $wp_rest_server;
		$wp_rest_server = new \WP_REST_Server();

		do_action( 'rest_api_init' );
	}

	/**
	 * With the experiment active, the module loaded at boot registers the same route, and the first
	 * handler wins: its registry may already be built, without this test's definition.
	 */
	private function drop_routes_registered_by_the_loaded_module(): void {
		remove_all_actions( 'rest_api_init' );
	}

	public function test_get__returns_definitions_in_the_editor_shape() {
		// Arrange.
		$this->act_as_admin();

		// Act.
		$response = rest_do_request( new \WP_REST_Request( 'GET', self::ROUTE ) );

		// Assert.
		$definition = $response->get_data()['data'][ Site_Definition_Fixture::WIDGET_ID ];

		$this->assertSame( \WP_Http::OK, $response->get_status() );
		$this->assertEqualsCanonicalizing(
			[ 'id', 'version', 'title', 'template', 'general', Widgets_Definitions_Registry::ARCHIVED_KEY ],
			array_keys( $definition )
		);
		$this->assertTrue( $definition[ Widgets_Definitions_Registry::ARCHIVED_KEY ] );
	}

	public function test_get__requires_edit_posts() {
		// Arrange.
		$this->act_as_subscriber();

		// Act.
		$response = rest_do_request( new \WP_REST_Request( 'GET', self::ROUTE ) );

		// Assert.
		$this->assertSame( \WP_Http::FORBIDDEN, $response->get_status() );
	}
}
