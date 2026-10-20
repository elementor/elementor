<?php

namespace Elementor\Tests\Phpunit\Modules\Mcp;

use Elementor\Modules\Mcp\Abilities\Abstract_Ability;
use Elementor\Modules\Mcp\Abilities\List_Site_Parts_Upsell_Ability;
use Elementor\Modules\Mcp\Abilities\Manage_Site_Parts_Upsell_Ability;
use Elementor\Modules\Mcp\Abilities\Utils\Site_Parts_Pro_Upsell;
use Elementor\Modules\Mcp\Module as Mcp_Module;
use Elementor\Modules\Mcp\Utils\Pro_Upsell;
use ElementorEditorTesting\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * @group Elementor\Modules\Mcp
 */
class Test_Site_Parts_Upsell_Abilities extends Elementor_Test_Base {

	const MANAGE_SITE_PARTS_ID = 'elementor/manage-site-parts';
	const LIST_SITE_PARTS_ID = 'elementor/list-site-parts';
	const CUSTOM_PROMOTION_FILTER = 'elementor/mcp/custom_promotion';

	public function tearDown(): void {
		remove_all_filters( self::CUSTOM_PROMOTION_FILTER );

		parent::tearDown();
	}

	public function test_build_core_registry__includes_site_parts_stubs_without_pro() {
		// Act
		$registry = Mcp_Module::build_core_registry();

		// Assert
		$this->assertInstanceOf( Manage_Site_Parts_Upsell_Ability::class, $registry->find_by_id( self::MANAGE_SITE_PARTS_ID ) );
		$this->assertInstanceOf( List_Site_Parts_Upsell_Ability::class, $registry->find_by_id( self::LIST_SITE_PARTS_ID ) );
	}

	public function test_manage_execute_guarded__returns_pro_license_required_error() {
		// Arrange
		$ability = new Manage_Site_Parts_Upsell_Ability();

		// Act
		$result = $ability->execute_guarded( [] );

		// Assert
		$this->assertWPError( $result );
		$this->assertSame( Pro_Upsell::ERROR_CODE, $result->get_error_code() );
		$this->assertSame( \WP_Http::FORBIDDEN, $result->get_error_data()['status'] );
		$this->assertSame( Site_Parts_Pro_Upsell::UPGRADE_URL, $result->get_error_data()['upgrade_url'] );
		$this->assertStringContainsString( 'Creating, updating, or deleting', $result->get_error_message() );
		$this->assertStringContainsString( 'Do not retry', $result->get_error_message() );
		$this->assertStringContainsString( Site_Parts_Pro_Upsell::UPGRADE_URL, $result->get_error_message() );
	}

	public function test_list_execute_guarded__returns_pro_license_required_error() {
		// Arrange
		$ability = new List_Site_Parts_Upsell_Ability();

		// Act
		$result = $ability->execute_guarded( [] );

		// Assert
		$this->assertWPError( $result );
		$this->assertSame( Pro_Upsell::ERROR_CODE, $result->get_error_code() );
		$this->assertSame( \WP_Http::FORBIDDEN, $result->get_error_data()['status'] );
		$this->assertSame( Site_Parts_Pro_Upsell::UPGRADE_URL, $result->get_error_data()['upgrade_url'] );
		$this->assertStringContainsString( 'no site parts were checked', $result->get_error_message() );
		$this->assertStringContainsString( Site_Parts_Pro_Upsell::UPGRADE_URL, $result->get_error_message() );
	}

	public function test_get_description_for_llm__appends_tool_specific_notice() {
		// Arrange
		$manage = new Manage_Site_Parts_Upsell_Ability();
		$list = new List_Site_Parts_Upsell_Ability();

		// Act
		$manage_description = $manage->get_description_for_llm();
		$list_description = $list->get_description_for_llm();

		// Assert
		$this->assertStringEndsWith( 'cannot be created, updated, or deleted without it; calling this tool only returns upgrade instructions.', $manage_description );
		$this->assertStringEndsWith( 'cannot be listed without it; calling this tool only returns upgrade instructions.', $list_description );
	}

	public function test_execute_guarded__falls_back_to_tool_url_when_filter_returns_foreign_domain() {
		// Arrange
		add_filter( self::CUSTOM_PROMOTION_FILTER, fn( $data ) => [ 'upgrade_url' => 'https://example.com/upgrade' ] );
		$ability = new Manage_Site_Parts_Upsell_Ability();

		// Act
		$result = $ability->execute_guarded( [] );

		// Assert
		$this->assertSame( Site_Parts_Pro_Upsell::UPGRADE_URL, $result->get_error_data()['upgrade_url'] );
	}

	public function test_stubs__mirror_real_tool_input_schema() {
		// Act
		$manage_schema = $this->get_input_schema( new Manage_Site_Parts_Upsell_Ability() );
		$list_schema = $this->get_input_schema( new List_Site_Parts_Upsell_Ability() );

		// Assert
		$this->assertSame( [ 'operations' ], $manage_schema['required'] );
		$this->assertSame( [ 'create', 'update', 'delete' ], $manage_schema['properties']['operations']['items']['properties']['action']['enum'] );
		$this->assertArrayHasKey( 'active', $list_schema['properties'] );
	}

	private function get_input_schema( Abstract_Ability $ability ): array {
		$method = new \ReflectionMethod( $ability, 'definition' );
		$method->setAccessible( true );

		return $method->invoke( $ability )->to_array()['input_schema'];
	}
}
