<?php
namespace Elementor\Tests\Phpunit\Elementor\App\Modules\Onboarding;

use Elementor\App\Modules\Onboarding\Module;
use Elementor\App\Modules\Onboarding\Onboarding_Entry;
use Elementor\Core\Upgrade\Manager as Upgrade_Manager;
use ElementorEditorTesting\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Test_Onboarding_Entry extends Elementor_Test_Base {

	public function setUp(): void {
		parent::setUp();

		$this->reset_entry_state();
		unset( $_GET['page'], $_GET['activate-multi'] );
	}

	public function tearDown(): void {
		$this->reset_entry_state();
		remove_filter( 'wp_doing_ajax', '__return_true' );
		unset( $_GET['page'], $_GET['activate-multi'] );

		parent::tearDown();
	}

	public function test_mark_activation__sets_pending_when_no_logged_in_user() {
		// Arrange
		wp_set_current_user( 0 );

		// Act
		Onboarding_Entry::mark_activation();

		// Assert
		$this->assertTrue( Onboarding_Entry::is_pending() );
		$this->assertGreaterThan( 0, (int) get_option( Onboarding_Entry::ACTIVATED_AT_OPTION ) );
	}

	public function test_mark_activation__skips_pending_when_logged_in_with_install_history() {
		// Arrange
		$this->act_as_admin();
		update_option( Upgrade_Manager::get_install_history_meta(), [ '3.20.0' => time() ] );

		// Act
		Onboarding_Entry::mark_activation();

		// Assert
		$this->assertFalse( Onboarding_Entry::is_pending() );
		$this->assertSame(
			[ [ 'reason' => Onboarding_Entry::REASON_ALREADY_LOGGED_IN ] ],
			get_option( Onboarding_Entry::EVENT_QUEUE_OPTION )
		);
	}

	public function test_mark_activation__skips_pending_when_logged_in_and_already_onboarded() {
		// Arrange
		$this->act_as_admin();
		update_option( Module::ONBOARDING_OPTION, true );

		// Act
		Onboarding_Entry::mark_activation();

		// Assert
		$this->assertFalse( Onboarding_Entry::is_pending() );
		$this->assertTrue( (bool) get_option( Module::ONBOARDING_OPTION ) );
	}

	public function test_mark_activation__sets_pending_for_first_ui_install() {
		// Arrange
		$this->act_as_admin();

		// Act
		Onboarding_Entry::mark_activation();

		// Assert
		$this->assertTrue( Onboarding_Entry::is_pending() );
	}

	public function test_decide__redirects_admin_within_window() {
		// Arrange
		$this->act_as_admin();
		$this->prime_pending_window();

		// Act
		$decision = Onboarding_Entry::decide();

		// Assert
		$this->assertSame( Onboarding_Entry::DECISION_REDIRECT, $decision['type'] );
		$this->assertSame( Onboarding_Entry::REASON_REDIRECTED, $decision['reason'] );
		$this->assertFalse( Onboarding_Entry::is_pending() );
	}

	public function test_decide__keeps_pending_on_ajax() {
		// Arrange
		$this->act_as_admin();
		$this->prime_pending_window();
		add_filter( 'wp_doing_ajax', '__return_true' );

		// Act
		$decision = Onboarding_Entry::decide();

		// Assert
		$this->assertSame( Onboarding_Entry::DECISION_SKIP, $decision['type'] );
		$this->assertSame( Onboarding_Entry::REASON_AJAX, $decision['reason'] );
		$this->assertTrue( Onboarding_Entry::is_pending() );
	}

	public function test_decide__expires_after_fourteen_days() {
		// Arrange
		$this->act_as_admin();
		update_option( Onboarding_Entry::PENDING_OPTION, true );
		update_option( Onboarding_Entry::ACTIVATED_AT_OPTION, time() - ( 15 * DAY_IN_SECONDS ) );

		// Act
		$decision = Onboarding_Entry::decide();

		// Assert
		$this->assertSame( Onboarding_Entry::DECISION_SKIP, $decision['type'] );
		$this->assertSame( Onboarding_Entry::REASON_EXPIRED, $decision['reason'] );
		$this->assertFalse( Onboarding_Entry::is_pending() );
	}

	public function test_decide__returns_notice_when_third_party_onboarded() {
		// Arrange
		$this->act_as_admin();
		$this->prime_pending_window();
		update_option( Module::ONBOARDING_OPTION, true );

		// Act
		$decision = Onboarding_Entry::decide();

		// Assert
		$this->assertSame( Onboarding_Entry::DECISION_NOTICE, $decision['type'] );
		$this->assertSame( Onboarding_Entry::REASON_THIRD_PARTY_SKIP, $decision['reason'] );
		$this->assertTrue( Onboarding_Entry::is_pending() );
	}

	public function test_decide__skips_old_installs() {
		// Arrange
		$this->act_as_admin();
		$this->prime_pending_window();
		update_option( Upgrade_Manager::get_install_history_meta(), [ '3.5.0' => time() ] );

		// Act
		$decision = Onboarding_Entry::decide();

		// Assert
		$this->assertSame( Onboarding_Entry::DECISION_SKIP, $decision['type'] );
		$this->assertSame( Onboarding_Entry::REASON_ALREADY_ONBOARDED, $decision['reason'] );
		$this->assertFalse( Onboarding_Entry::is_pending() );
	}

	public function test_decide__skips_when_not_pending() {
		// Arrange
		$this->act_as_admin();

		// Act
		$decision = Onboarding_Entry::decide();

		// Assert
		$this->assertSame( Onboarding_Entry::DECISION_SKIP, $decision['type'] );
	}

	public function test_should_show_partner_notice__false_when_not_pending() {
		// Arrange
		$this->act_as_admin();
		update_option( Module::ONBOARDING_OPTION, true );

		// Act
		$result = Onboarding_Entry::should_show_partner_notice();

		// Assert
		$this->assertFalse( $result );
	}

	private function prime_pending_window(): void {
		update_option( Onboarding_Entry::PENDING_OPTION, true );
		update_option( Onboarding_Entry::ACTIVATED_AT_OPTION, time() );
	}

	private function reset_entry_state(): void {
		delete_option( Onboarding_Entry::PENDING_OPTION );
		delete_option( Onboarding_Entry::ACTIVATED_AT_OPTION );
		delete_option( Onboarding_Entry::EVENT_QUEUE_OPTION );
		delete_option( Module::ONBOARDING_OPTION );
		delete_option( Upgrade_Manager::get_install_history_meta() );
	}
}
