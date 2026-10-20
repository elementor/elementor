<?php

namespace Elementor\Tests\Phpunit\Modules\Mcp;

use Elementor\Modules\Mcp\Abilities\Pro_Upsell_Ability;
use Elementor\Modules\Mcp\Module as Mcp_Module;
use Elementor\Modules\Mcp\Registry\Pro_Upsell_Abilities;
use ElementorEditorTesting\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * @group Elementor\Modules\Mcp
 */
class Test_Pro_Upsell_Ability extends Elementor_Test_Base {

	const MANAGE_SITE_PARTS_ID = 'elementor/manage-site-parts';
	const LIST_SITE_PARTS_ID = 'elementor/list-site-parts';
	const CUSTOM_PROMOTION_FILTER = 'elementor/mcp/custom_promotion';

	public function tearDown(): void {
		remove_all_filters( self::CUSTOM_PROMOTION_FILTER );

		parent::tearDown();
	}

	public function test_create__returns_site_part_stubs_when_pro_is_missing() {
		// Act
		$abilities = Pro_Upsell_Abilities::create( false );

		// Assert
		$this->assertSame(
			[ self::MANAGE_SITE_PARTS_ID, self::LIST_SITE_PARTS_ID ],
			array_map( fn( Pro_Upsell_Ability $ability ) => $ability->get_id(), $abilities )
		);
	}

	public function test_create__returns_nothing_when_pro_is_present() {
		// Act
		$abilities = Pro_Upsell_Abilities::create( true );

		// Assert
		$this->assertSame( [], $abilities );
	}

	public function test_build_core_registry__includes_stubs_without_pro() {
		// Act
		$registry = Mcp_Module::build_core_registry();

		// Assert
		$this->assertInstanceOf( Pro_Upsell_Ability::class, $registry->find_by_id( self::MANAGE_SITE_PARTS_ID ) );
		$this->assertInstanceOf( Pro_Upsell_Ability::class, $registry->find_by_id( self::LIST_SITE_PARTS_ID ) );
	}

	public function test_execute_guarded__returns_pro_license_required_error() {
		// Arrange
		$ability = $this->create_manage_site_parts_stub();

		// Act
		$result = $ability->execute_guarded( [] );

		// Assert
		$this->assertWPError( $result );
		$this->assertSame( Pro_Upsell_Ability::ERROR_CODE, $result->get_error_code() );
		$this->assertSame( \WP_Http::FORBIDDEN, $result->get_error_data()['status'] );
		$this->assertSame( $this->get_manage_site_parts_url(), $result->get_error_data()['upgrade_url'] );
		$this->assertStringContainsString( 'Do not retry', $result->get_error_message() );
		$this->assertStringContainsString( $this->get_manage_site_parts_url(), $result->get_error_message() );
	}

	public function test_get_description_for_llm__appends_pro_notice() {
		// Arrange
		$ability = $this->create_manage_site_parts_stub();

		// Act
		$description = $ability->get_description_for_llm();

		// Assert
		$this->assertStringEndsWith( 'Calling it only returns upgrade instructions.', $description );
	}

	public function test_create__falls_back_to_tool_url_when_filter_returns_foreign_domain() {
		// Arrange
		add_filter( self::CUSTOM_PROMOTION_FILTER, fn( $data ) => [ 'upgrade_url' => 'https://example.com/upgrade' ] );

		// Act
		$ability = $this->create_manage_site_parts_stub();
		$result = $ability->execute_guarded( [] );

		// Assert
		$this->assertSame( $this->get_manage_site_parts_url(), $result->get_error_data()['upgrade_url'] );
	}

	public function test_create__mirrors_real_tool_input_schema() {
		// Arrange
		$abilities = Pro_Upsell_Abilities::create( false );

		// Act
		$manage_schema = $this->get_input_schema( $abilities[0] );
		$list_schema = $this->get_input_schema( $abilities[1] );

		// Assert
		$this->assertSame( [ 'operations' ], $manage_schema['required'] );
		$this->assertSame( [ 'create', 'update', 'delete' ], $manage_schema['properties']['operations']['items']['properties']['action']['enum'] );
		$this->assertArrayHasKey( 'active', $list_schema['properties'] );
	}

	private function get_input_schema( Pro_Upsell_Ability $ability ): array {
		$method = new \ReflectionMethod( $ability, 'definition' );
		$method->setAccessible( true );

		return $method->invoke( $ability )->to_array()['input_schema'];
	}

	private function create_manage_site_parts_stub(): Pro_Upsell_Ability {
		return Pro_Upsell_Abilities::create( false )[0];
	}

	private function get_manage_site_parts_url(): string {
		return Pro_Upsell_Abilities::MANAGE_SITE_PARTS_UPGRADE_URL;
	}
}
