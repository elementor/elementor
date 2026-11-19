<?php
namespace Elementor\Tests\Phpunit\Elementor\App\Modules\Onboarding;

use Elementor\App\Modules\Onboarding\Module;
use Elementor\App\Modules\Onboarding\Notices\Finish_Setup_Notice;
use Elementor\App\Modules\Onboarding\Onboarding_Entry;
use Elementor\User;
use ElementorEditorTesting\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Test_Finish_Setup_Notice extends Elementor_Test_Base {

	public function setUp(): void {
		parent::setUp();

		$this->reset_notice_state();
	}

	public function tearDown(): void {
		$this->reset_notice_state();

		parent::tearDown();
	}

	public function test_should_print__true_for_admin_partner_skip() {
		// Arrange
		$this->act_as_admin();
		$this->prime_partner_skip();
		$notice = new Finish_Setup_Notice();

		// Act
		$result = $notice->should_print();

		// Assert
		$this->assertTrue( $result );
	}

	public function test_should_print__false_for_non_admin() {
		// Arrange
		$this->act_as_editor();
		$this->prime_partner_skip();
		$notice = new Finish_Setup_Notice();

		// Act
		$result = $notice->should_print();

		// Assert
		$this->assertFalse( $result );
	}

	public function test_should_print__false_after_dismiss() {
		// Arrange
		$this->act_as_admin();
		$this->prime_partner_skip();
		User::set_user_notice( Finish_Setup_Notice::NOTICE_ID );
		$notice = new Finish_Setup_Notice();

		// Act
		$result = $notice->should_print();

		// Assert
		$this->assertFalse( $result );
	}

	public function test_get_config__includes_setup_cta() {
		// Arrange
		$notice = new Finish_Setup_Notice();

		// Act
		$config = $notice->get_config();

		// Assert
		$this->assertSame( Finish_Setup_Notice::NOTICE_ID, $config['id'] );
		$this->assertSame( 'info', $config['type'] );
		$this->assertSame( 'Finish setting up Elementor', $config['title'] );
		$this->assertSame( 'Run setup', $config['button']['text'] );
		$this->assertSame( Onboarding_Entry::get_url(), $config['button']['url'] );
	}

	private function prime_partner_skip(): void {
		update_option( Onboarding_Entry::PENDING_OPTION, true );
		update_option( Onboarding_Entry::ACTIVATED_AT_OPTION, time() );
		update_option( Module::ONBOARDING_OPTION, true );
	}

	private function reset_notice_state(): void {
		delete_option( Onboarding_Entry::PENDING_OPTION );
		delete_option( Onboarding_Entry::ACTIVATED_AT_OPTION );
		delete_option( Module::ONBOARDING_OPTION );
	}
}
