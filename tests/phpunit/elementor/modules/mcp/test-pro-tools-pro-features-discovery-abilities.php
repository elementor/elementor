<?php

namespace Elementor\Tests\Phpunit\Modules\Mcp;

use Elementor\Modules\Mcp\Abilities\Manage_Form_Submissions_Pro_Features_Discovery_Ability;
use Elementor\Modules\Mcp\Abilities\Manage_Woocommerce_Settings_Pro_Features_Discovery_Ability;
use Elementor\Modules\Mcp\Abilities\Utils\Forms_Pro_Features_Discovery;
use Elementor\Modules\Mcp\Abilities\Utils\Woocommerce_Pro_Features_Discovery;
use Elementor\Modules\Mcp\Module as Mcp_Module;
use Elementor\Modules\Mcp\Utils\Pro_Features_Discovery;
use Elementor\Utils;
use ElementorEditorTesting\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

require_once __DIR__ . '/../../../stubs/wc-stubs.php';

/**
 * @group Elementor\Modules\Mcp
 */
class Test_Pro_Tools_Pro_Features_Discovery_Abilities extends Elementor_Test_Base {

	const MANAGE_FORM_SUBMISSIONS_ID = 'elementor/manage-form-submissions';
	const MANAGE_WOOCOMMERCE_SETTINGS_ID = 'elementor/manage-woocommerce-settings';

	public function setUp(): void {
		parent::setUp();

		if ( Utils::has_pro() ) {
			$this->markTestSkipped( 'Requires Elementor Pro to be inactive.' );
		}
	}

	public function test_build_core_registry__includes_the_manage_form_submissions_tool() {
		// Act
		$registry = Mcp_Module::build_core_registry();

		// Assert
		$this->assertInstanceOf( Manage_Form_Submissions_Pro_Features_Discovery_Ability::class, $registry->find_by_id( self::MANAGE_FORM_SUBMISSIONS_ID ) );
	}

	public function test_build_core_registry__includes_woocommerce_settings_when_woocommerce_is_active() {
		// Arrange
		$this->assertTrue( Woocommerce_Pro_Features_Discovery::is_active() );

		// Act
		$registry = Mcp_Module::build_core_registry();

		// Assert
		$this->assertInstanceOf( Manage_Woocommerce_Settings_Pro_Features_Discovery_Ability::class, $registry->find_by_id( self::MANAGE_WOOCOMMERCE_SETTINGS_ID ) );
	}

	public function test_get_woocommerce_pro_features_discovery_abilities__returns_the_settings_tool_when_woocommerce_is_active() {
		// Act
		$abilities = Mcp_Module::get_woocommerce_pro_features_discovery_abilities( true );

		// Assert
		$this->assertCount( 1, $abilities );
		$this->assertInstanceOf( Manage_Woocommerce_Settings_Pro_Features_Discovery_Ability::class, $abilities[0] );
	}

	public function test_get_woocommerce_pro_features_discovery_abilities__returns_nothing_when_woocommerce_is_inactive() {
		// Act
		$abilities = Mcp_Module::get_woocommerce_pro_features_discovery_abilities( false );

		// Assert
		$this->assertSame( [], $abilities );
	}

	public function test_manage_form_submissions__returns_value_link_and_free_path_in_order() {
		// Arrange
		$this->act_as_admin();
		$ability = new Manage_Form_Submissions_Pro_Features_Discovery_Ability();

		// Act
		$result = $ability->execute_guarded( [ 'operations' => [ [ 'action' => 'mark_read', 'submission_id' => 5 ] ] ] );

		// Assert
		$this->assertWPError( $result );
		$this->assertSame( Pro_Features_Discovery::ERROR_CODE, $result->get_error_code() );
		$this->assertSame( Forms_Pro_Features_Discovery::UPGRADE_URL, $result->get_error_data()['upgrade_url'] );
		$this->assert_value_link_free_path_order(
			$result->get_error_message(),
			'What Pro gives the user: forms that save every message',
			'[Upgrade to Pro](' . Forms_Pro_Features_Discovery::UPGRADE_URL . ')',
			'Free path: none for stored messages'
		);
	}

	public function test_manage_woocommerce_settings__points_to_the_free_page_setup_screen() {
		// Arrange
		$ability = new Manage_Woocommerce_Settings_Pro_Features_Discovery_Ability();

		// Act
		$result = $ability->execute_guarded( [ 'action' => 'get' ] );

		// Assert
		$this->assertStringContainsString( 'WooCommerce → Settings → Advanced → Page setup', $result->get_error_message() );
		$this->assertStringNotContainsString( 'Don\'t try another way into WooCommerce pages or settings', $result->get_error_message() );
	}

	public function test_manage_woocommerce_settings__returns_the_woocommerce_error() {
		// Arrange
		$ability = new Manage_Woocommerce_Settings_Pro_Features_Discovery_Ability();

		// Act
		$result = $ability->execute_guarded( [ 'action' => 'get' ] );

		// Assert
		$this->assertWPError( $result );
		$this->assertSame( Woocommerce_Pro_Features_Discovery::PRO_FEATURE, $result->get_error_data()['pro_feature'] );
		$this->assertSame( Woocommerce_Pro_Features_Discovery::UPGRADE_URL, $result->get_error_data()['upgrade_url'] );
	}

	public function test_manage_woocommerce_settings__is_not_exposed_via_proxy() {
		// Act
		$ability = new Manage_Woocommerce_Settings_Pro_Features_Discovery_Ability();

		// Assert
		$this->assertFalse( $ability->is_exposed_via_proxy() );
	}

	public function test_discovery_descriptions__do_not_mention_elementor_pro_or_an_upgrade() {
		// Arrange
		$abilities = [
			new Manage_Form_Submissions_Pro_Features_Discovery_Ability(),
			new Manage_Woocommerce_Settings_Pro_Features_Discovery_Ability(),
		];

		// Act & Assert
		foreach ( $abilities as $ability ) {
			$description = $ability->get_description_for_llm();

			$this->assertDoesNotMatchRegularExpression( '/\bPro\b/', $description, $ability->get_id() );
			$this->assertStringNotContainsString( 'upgrade', strtolower( $description ), $ability->get_id() );
		}
	}

	private function assert_value_link_free_path_order( string $message, string $value, string $link, string $free_path ): void {
		$value_position = strpos( $message, $value );
		$link_position = strpos( $message, $link );
		$free_path_position = strpos( $message, $free_path );

		$this->assertNotFalse( $value_position );
		$this->assertNotFalse( $link_position );
		$this->assertNotFalse( $free_path_position );
		$this->assertLessThan( $link_position, $value_position );
		$this->assertLessThan( $free_path_position, $link_position );
	}
}
