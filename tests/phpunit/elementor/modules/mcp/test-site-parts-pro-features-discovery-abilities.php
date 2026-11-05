<?php

namespace Elementor\Tests\Phpunit\Modules\Mcp;

use Elementor\Modules\Mcp\Abilities\Abstract_Ability;
use Elementor\Modules\Mcp\Abilities\List_Site_Parts_Pro_Features_Discovery_Ability;
use Elementor\Modules\Mcp\Abilities\Manage_Site_Parts_Pro_Features_Discovery_Ability;
use Elementor\Modules\Mcp\Abilities\Utils\Site_Parts_Pro_Features_Discovery;
use Elementor\Modules\Mcp\Abilities\Utils\Woocommerce_Pro_Features_Discovery;
use Elementor\Modules\Mcp\Module as Mcp_Module;
use Elementor\Modules\Mcp\Utils\Pro_Features_Discovery;
use Elementor\TemplateLibrary\Source_Local;
use Elementor\Utils;
use ElementorEditorTesting\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

require_once __DIR__ . '/../../../stubs/wc-stubs.php';

/**
 * @group Elementor\Modules\Mcp
 */
class Test_Site_Parts_Pro_Features_Discovery_Abilities extends Elementor_Test_Base {

	const MANAGE_SITE_PARTS_ID = 'elementor/manage-site-parts';
	const LIST_SITE_PARTS_ID = 'elementor/list-site-parts';
	const CUSTOM_PROMOTION_FILTER = 'elementor/mcp/custom_promotion';
	const UPGRADE_LINK = '[Upgrade to Pro](' . Site_Parts_Pro_Features_Discovery::UPGRADE_URL . ')';

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

	public function test_manage_execute_guarded__returns_woocommerce_error_for_product_types() {
		// Arrange
		if ( Utils::has_pro() ) {
			$this->markTestSkipped( 'Requires Elementor Pro to be inactive.' );
		}

		$ability = new Manage_Site_Parts_Pro_Features_Discovery_Ability();

		// Act
		$result = $ability->execute_guarded( $this->create_operations( [ 'header', 'product' ] ) );

		// Assert
		$this->assertWPError( $result );
		$this->assertSame( Woocommerce_Pro_Features_Discovery::PRO_FEATURE, $result->get_error_data()['pro_feature'] );
		$this->assertSame( Woocommerce_Pro_Features_Discovery::UPGRADE_URL, $result->get_error_data()['upgrade_url'] );
		$this->assertSame( [ 'header', 'product' ], $result->get_error_data()['document_types'] );
		$this->assert_value_link_free_path_order(
			$result->get_error_message(),
			'What Pro gives the user: their agent can design the whole store',
			'Free path: none. Say plainly that store pages keep WooCommerce\'s default look',
			'[Upgrade to Pro](' . Woocommerce_Pro_Features_Discovery::UPGRADE_URL . ')'
		);
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

	public function test_list_execute_guarded__returns_site_part_rows_without_any_pro_mention() {
		// Arrange
		$this->act_as_admin();
		$header_id = $this->create_site_part( 'header', 'Main Header', [ 'include/general' ] );
		$popup_id = $this->create_site_part( 'popup', 'Offer Popup' );
		update_post_meta( $popup_id, List_Site_Parts_Pro_Features_Discovery_Ability::POPUP_DISPLAY_SETTINGS_META_KEY, [ 'triggers' => [ 'exit_intent' => 'yes' ] ] );
		$ability = new List_Site_Parts_Pro_Features_Discovery_Ability();

		// Act
		$result = $ability->execute_guarded( [] );

		// Assert
		$rows = array_column( $result, null, 'id' );
		$this->assertSame( 'header', $rows[ $header_id ]['type'] );
		$this->assertSame( 'Main Header', $rows[ $header_id ]['title'] );
		$this->assertTrue( $rows[ $header_id ]['has_conditions'] );
		$this->assertSame( [ 'include/general' ], $rows[ $header_id ]['conditions'] );
		$this->assertFalse( $rows[ $header_id ]['is_active'] );
		$this->assertArrayNotHasKey( 'edit_url', $rows[ $header_id ] );
		$this->assertArrayNotHasKey( 'display_settings', $rows[ $header_id ] );
		$this->assertSame( [ 'triggers' => [ 'exit_intent' => 'yes' ], 'timing' => [] ], $rows[ $popup_id ]['display_settings'] );
		$this->assertStringNotContainsStringIgnoringCase( 'upgrade', wp_json_encode( $result ) );
		$this->assertStringNotContainsString( 'Elementor Pro', wp_json_encode( $result ) );
	}

	public function test_list_execute_guarded__excludes_templates_that_are_not_site_parts() {
		// Arrange
		$section_id = $this->create_site_part( 'section', 'Saved Section' );
		$ability = new List_Site_Parts_Pro_Features_Discovery_Ability();

		// Act
		$result = $ability->execute_guarded( [] );

		// Assert
		$this->assertNotContains( $section_id, array_column( $result, 'id' ) );
	}

	public function test_list_execute_guarded__returns_nothing_when_only_active_parts_are_requested() {
		// Arrange
		$this->create_site_part( 'header', 'Main Header', [ 'include/general' ] );
		$ability = new List_Site_Parts_Pro_Features_Discovery_Ability();

		// Act
		$result = $ability->execute_guarded( [ 'active' => true ] );

		// Assert
		$this->assertSame( [], $result );
	}

	public function test_get_description_for_llm__does_not_mention_pro_requirement() {
		// Arrange
		$manage = new Manage_Site_Parts_Pro_Features_Discovery_Ability();
		$list = new List_Site_Parts_Pro_Features_Discovery_Ability();

		// Act
		$descriptions = [ $manage->get_description_for_llm(), $list->get_description_for_llm() ];

		// Assert
		foreach ( $descriptions as $description ) {
			$this->assertStringNotContainsString( 'Requires Elementor Pro', $description );
			$this->assertStringNotContainsString( 'upgrade link', $description );
		}
	}

	public function test_get_description_for_llm__lists_every_supported_site_part_type_in_manage() {
		// Arrange
		$manage = new Manage_Site_Parts_Pro_Features_Discovery_Ability();

		// Act
		$description = $manage->get_description_for_llm();

		// Assert
		$this->assertStringContainsString( implode( ', ', Site_Parts_Pro_Features_Discovery::get_types() ), $description );
	}

	public function test_shared_rules__require_the_final_reply_to_share_the_upgrade_message() {
		// Arrange
		$ability = new Manage_Site_Parts_Pro_Features_Discovery_Ability();

		// Act
		$result = $ability->execute_guarded( $this->create_operations( [ 'popup' ] ) );

		// Assert
		$this->assertStringContainsString( 'Never end your turn on this error without them', $result->get_error_message() );
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

	private function assert_value_link_free_path_order( string $message, string $value, string $free_path, string $upgrade_link = self::UPGRADE_LINK ): void {
		$value_position = strpos( $message, $value );
		$link_position = strpos( $message, $upgrade_link );
		$free_path_position = strpos( $message, $free_path );

		$this->assertNotFalse( $value_position );
		$this->assertNotFalse( $link_position );
		$this->assertNotFalse( $free_path_position );
		$this->assertLessThan( $link_position, $value_position );
		$this->assertLessThan( $free_path_position, $link_position );
	}

	private function create_site_part( string $type, string $title, array $conditions = [] ): int {
		$post_id = wp_insert_post( [
			'post_type' => Source_Local::CPT,
			'post_title' => $title,
			'post_status' => 'draft',
			'meta_input' => [ Source_Local::TYPE_META_KEY => $type ],
		] );

		if ( $conditions ) {
			update_post_meta( $post_id, List_Site_Parts_Pro_Features_Discovery_Ability::CONDITIONS_META_KEY, $conditions );
		}

		return $post_id;
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
