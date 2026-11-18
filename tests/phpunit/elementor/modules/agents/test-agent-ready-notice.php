<?php

namespace Elementor\Tests\Phpunit\Elementor\Modules\Agents;

use Elementor\Modules\Agents\AdminNotices\Agent_Ready_Notice;
use Elementor\Modules\Agents\Agent_Ready_Settings;
use Elementor\Modules\Agents\Classes\Scanner_Report_Store;
use Elementor\Modules\Agents\Content_Generator;
use Elementor\Modules\Agents\Module;
use Elementor\Modules\Agents\Prompt_Injection_Sanitizer;
use Elementor\User;
use ElementorEditorTesting\Elementor_Test_Base;

class Test_Agent_Ready_Notice extends Elementor_Test_Base {

	private Agent_Ready_Settings $settings;

	private Scanner_Report_Store $scanner_store;

	private Agent_Ready_Notice $notice;

	public function setUp(): void {
		parent::setUp();

		delete_option( Agent_Ready_Settings::OPTION );
		delete_option( Scanner_Report_Store::OPTION_LAST_REPORT );

		$this->settings = new Agent_Ready_Settings( new Content_Generator( new Prompt_Injection_Sanitizer() ) );
		$this->scanner_store = new Scanner_Report_Store();
		$this->notice = new Agent_Ready_Notice( $this->settings, $this->scanner_store );

		$this->act_as_admin();
	}

	public function tearDown(): void {
		delete_option( Agent_Ready_Settings::OPTION );
		delete_option( Scanner_Report_Store::OPTION_LAST_REPORT );

		parent::tearDown();
	}

	public function test_should_print__for_admin_before_scan_and_activation() {
		// Act
		$result = $this->notice->should_print();

		// Assert
		$this->assertTrue( $result );
	}

	public function test_should_print__false_for_non_admin() {
		// Arrange
		$this->act_as_editor();

		// Act
		$result = $this->notice->should_print();

		// Assert
		$this->assertFalse( $result );
	}

	public function test_should_print__false_after_activation() {
		// Arrange
		$this->settings->ensure_option_exists();
		$this->settings->activate();

		// Act
		$result = $this->notice->should_print();

		// Assert
		$this->assertFalse( $result );
	}

	public function test_should_print__false_after_scan() {
		// Arrange
		$this->scanner_store->save_report( [ 'score' => 30 ] );

		// Act
		$result = $this->notice->should_print();

		// Assert
		$this->assertFalse( $result );
	}

	public function test_should_print__false_after_dismissal() {
		// Arrange
		User::set_user_notice( Agent_Ready_Notice::NOTICE_ID );

		// Act
		$result = $this->notice->should_print();

		// Assert
		$this->assertFalse( $result );
	}

	public function test_get_config__links_to_agent_ready_page() {
		// Act
		$config = $this->notice->get_config();

		// Assert
		$this->assertSame( Agent_Ready_Notice::NOTICE_ID, $config['id'] );
		$this->assertStringContainsString( 'page=' . Module::PAGE_ID, $config['description'] );
	}
}
