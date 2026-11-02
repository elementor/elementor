<?php

namespace Elementor\Tests\Phpunit\Modules\Mcp;

use Elementor\Modules\Mcp\Abilities\Abstract_Ability;
use Elementor\Modules\Mcp\Abilities\List_Site_Parts_Pro_Features_Discovery_Ability;
use Elementor\Modules\Mcp\Abilities\Manage_Site_Parts_Pro_Features_Discovery_Ability;
use Elementor\Modules\Mcp\Abilities\Utils\Site_Parts_Pro_Features_Discovery;
use Elementor\Modules\Mcp\Module as Mcp_Module;
use Elementor\Modules\Mcp\Utils\Pro_Features_Discovery;
use ElementorEditorTesting\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * @group Elementor\Modules\Mcp
 */
class Test_Site_Parts_Pro_Features_Discovery_Abilities extends Elementor_Test_Base {

	const MANAGE_SITE_PARTS_ID = 'elementor/manage-site-parts';
	const LIST_SITE_PARTS_ID = 'elementor/list-site-parts';
	const CUSTOM_PROMOTION_FILTER = 'elementor/mcp/custom_promotion';
	const UPGRADE_LINK = '[Upgrade to Pro](' . Site_Parts_Pro_Features_Discovery::UPGRADE_URL . ')';
	const DESCRIPTION_NOTICE = 'Requires Elementor Pro (not installed on this site). With Pro, site parts cover three things Free can\'t do';

	public function tearDown(): void {
		remove_all_filters( self::CUSTOM_PROMOTION_FILTER );

		parent::tearDown();
	}

	public function test_build_core_registry__includes_site_parts_discovery_abilities_without_pro() {
		// Act
		$registry = Mcp_Module::build_core_registry();

		// Assert
		$this->assertInstanceOf( Manage_Site_Parts_Pro_Features_Discovery_Ability::class, $registry->find_by_id( self::MANAGE_SITE_PARTS_ID ) );
		$this->assertInstanceOf( List_Site_Parts_Pro_Features_Discovery_Ability::class, $registry->find_by_id( self::LIST_SITE_PARTS_ID ) );
	}

	/**
	 * @dataProvider site_part_group_cases
	 */
	public function test_manage_execute_guarded__returns_value_link_and_free_path_for_type_group( string $type, string $expected_value, string $expected_free_path ) {
		// Arrange
		$ability = new Manage_Site_Parts_Pro_Features_Discovery_Ability();

		// Act
		$result = $ability->execute_guarded( $this->create_operations( [ $type ] ) );

		// Assert
		$this->assertWPError( $result );
		$this->assertSame( Pro_Features_Discovery::ERROR_CODE, $result->get_error_code() );
		$this->assertSame( \WP_Http::FORBIDDEN, $result->get_error_data()['status'] );
		$this->assertSame( Site_Parts_Pro_Features_Discovery::UPGRADE_URL, $result->get_error_data()['upgrade_url'] );
		$this->assert_value_link_free_path_order( $result->get_error_message(), $expected_value, $expected_free_path );
	}

	public function site_part_group_cases(): array {
		return [
			'reusable part' => [ 'header', 'this header is built once', 'Free path: build it on the current page' ],
			'dynamic template' => [ 'single-post', 'one single-post design that fills itself', 'Free path: style posts one by one' ],
			'popup' => [ 'popup', 'a popup that opens on the trigger they want', 'Free path: none that matches' ],
			'404' => [ 'error-404', 'a custom 404 page in the site\'s design', 'Free path: none. The theme\'s default 404 page stays.' ],
		];
	}

	public function test_manage_execute_guarded__combines_groups_with_a_single_link() {
		// Arrange
		$ability = new Manage_Site_Parts_Pro_Features_Discovery_Ability();

		// Act
		$result = $ability->execute_guarded( $this->create_operations( [ 'header', 'footer', 'popup' ] ) );

		// Assert
		$message = $result->get_error_message();
		$this->assertStringContainsString( 'this header and footer is built once', $message );
		$this->assertStringContainsString( 'a popup that opens on the trigger they want', $message );
		$this->assertSame( 1, substr_count( $message, self::UPGRADE_LINK ) );
	}

	public function test_manage_execute_guarded__falls_back_to_overview_without_create_type() {
		// Arrange
		$ability = new Manage_Site_Parts_Pro_Features_Discovery_Ability();

		// Act
		$result = $ability->execute_guarded( [
			'operations' => [
				[
					'action' => 'delete',
					'post_id' => 1,
				],
			],
		] );

		// Assert
		$this->assertWPError( $result );
		$this->assert_value_link_free_path_order(
			$result->get_error_message(),
			'site parts cover three things Free can\'t do',
			'Free path: build it on the current page'
		);
	}

	public function test_list_execute_guarded__returns_non_error_result_without_link() {
		// Arrange
		$ability = new List_Site_Parts_Pro_Features_Discovery_Ability();

		// Act
		$result = $ability->execute_guarded( [] );

		// Assert
		$this->assertIsArray( $result );
		$this->assertStringContainsString( 'no site parts were checked', $result['llm_instructions'] );
		$this->assertStringNotContainsString( Site_Parts_Pro_Features_Discovery::UPGRADE_URL, $result['llm_instructions'] );
	}

	public function test_get_description_for_llm__includes_site_parts_notice() {
		// Arrange
		$manage = new Manage_Site_Parts_Pro_Features_Discovery_Ability();
		$list = new List_Site_Parts_Pro_Features_Discovery_Ability();

		// Act
		$manage_description = $manage->get_description_for_llm();
		$list_description = $list->get_description_for_llm();

		// Assert
		$this->assertStringContainsString( self::DESCRIPTION_NOTICE, $manage_description );
		$this->assertStringContainsString( self::DESCRIPTION_NOTICE, $list_description );
	}

	public function test_execute_guarded__falls_back_to_tool_url_when_filter_returns_foreign_domain() {
		// Arrange
		add_filter( self::CUSTOM_PROMOTION_FILTER, fn( $data ) => [ 'upgrade_url' => 'https://example.com/upgrade' ] );
		$ability = new Manage_Site_Parts_Pro_Features_Discovery_Ability();

		// Act
		$result = $ability->execute_guarded( $this->create_operations( [ 'header' ] ) );

		// Assert
		$this->assertSame( Site_Parts_Pro_Features_Discovery::UPGRADE_URL, $result->get_error_data()['upgrade_url'] );
	}

	public function test_discovery_abilities__mirror_real_tool_input_schema() {
		// Act
		$manage_schema = $this->get_input_schema( new Manage_Site_Parts_Pro_Features_Discovery_Ability() );
		$list_schema = $this->get_input_schema( new List_Site_Parts_Pro_Features_Discovery_Ability() );

		// Assert
		$operation_properties = $manage_schema['properties']['operations']['items']['properties'];
		$this->assertSame( [ 'operations' ], $manage_schema['required'] );
		$this->assertSame( [ 'create', 'update', 'delete' ], $operation_properties['action']['enum'] );
		$this->assertSame( Site_Parts_Pro_Features_Discovery::get_types(), $operation_properties['type']['enum'] );
		$this->assertArrayHasKey( 'active', $list_schema['properties'] );
	}

	private function assert_value_link_free_path_order( string $message, string $value, string $free_path ): void {
		$value_position = strpos( $message, $value );
		$link_position = strpos( $message, self::UPGRADE_LINK );
		$free_path_position = strpos( $message, $free_path );

		$this->assertNotFalse( $value_position );
		$this->assertNotFalse( $link_position );
		$this->assertNotFalse( $free_path_position );
		$this->assertLessThan( $link_position, $value_position );
		$this->assertLessThan( $free_path_position, $link_position );
	}

	private function create_operations( array $types ): array {
		return [
			'operations' => array_map(
				fn( string $type ) => [
					'action' => 'create',
					'type' => $type,
				],
				$types
			),
		];
	}

	private function get_input_schema( Abstract_Ability $ability ): array {
		$method = new \ReflectionMethod( $ability, 'definition' );
		$method->setAccessible( true );

		return $method->invoke( $ability )->to_array()['input_schema'];
	}
}
