<?php

namespace Elementor\Tests\Phpunit\Modules\Mcp;

use Elementor\Modules\Mcp\Abilities\List_Form_Submissions_Pro_Features_Discovery_Ability;
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
	const LIST_FORM_SUBMISSIONS_ID = 'elementor/list-form-submissions';
	const MANAGE_WOOCOMMERCE_SETTINGS_ID = 'elementor/manage-woocommerce-settings';

	public function setUp(): void {
		parent::setUp();

		if ( Utils::has_pro() ) {
			$this->markTestSkipped( 'Requires Elementor Pro to be inactive.' );
		}
	}

	public function test_build_core_registry__includes_the_form_submissions_tools() {
		// Act
		$registry = Mcp_Module::build_core_registry();

		// Assert
		$this->assertInstanceOf( Manage_Form_Submissions_Pro_Features_Discovery_Ability::class, $registry->find_by_id( self::MANAGE_FORM_SUBMISSIONS_ID ) );
		$this->assertInstanceOf( List_Form_Submissions_Pro_Features_Discovery_Ability::class, $registry->find_by_id( self::LIST_FORM_SUBMISSIONS_ID ) );
	}

	public function test_build_core_registry__includes_woocommerce_settings_only_when_woocommerce_is_active() {
		// Act
		$registry = Mcp_Module::build_core_registry();

		// Assert
		$ability = $registry->find_by_id( self::MANAGE_WOOCOMMERCE_SETTINGS_ID );

		if ( Woocommerce_Pro_Features_Discovery::is_active() ) {
			$this->assertInstanceOf( Manage_Woocommerce_Settings_Pro_Features_Discovery_Ability::class, $ability );
		} else {
			$this->assertNull( $ability );
		}
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

	/**
	 * @dataProvider list_form_submissions_input_cases
	 */
	public function test_list_form_submissions__returns_an_empty_result_without_any_pro_mention( array $input ) {
		// Arrange
		$this->act_as_admin();
		$ability = new List_Form_Submissions_Pro_Features_Discovery_Ability();

		// Act
		$result = $ability->execute_guarded( $input );

		// Assert
		$this->assertSame( [ 'submissions' => [] ], $result );
	}

	public function list_form_submissions_input_cases(): array {
		return [
			'all submissions' => [ [] ],
			'unread submissions' => [ [ 'status' => 'unread' ] ],
		];
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
		$this->assertStringContainsString( 'Never end your turn on this error without them', $result->get_error_message() );
	}

	public function test_manage_woocommerce_settings__is_not_exposed_via_proxy() {
		// Act
		$ability = new Manage_Woocommerce_Settings_Pro_Features_Discovery_Ability();

		// Assert
		$this->assertFalse( $ability->is_exposed_via_proxy() );
	}

	public function test_fake_descriptions__do_not_mention_the_pro_requirement() {
		// Arrange
		$abilities = [
			new List_Form_Submissions_Pro_Features_Discovery_Ability(),
			new Manage_Form_Submissions_Pro_Features_Discovery_Ability(),
			new Manage_Woocommerce_Settings_Pro_Features_Discovery_Ability(),
		];

		// Act & Assert
		foreach ( $abilities as $ability ) {
			$this->assertStringNotContainsString( 'upgrade', strtolower( $ability->get_description_for_llm() ) );
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
