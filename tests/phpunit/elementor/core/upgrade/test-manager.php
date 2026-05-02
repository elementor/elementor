<?php
namespace Elementor\Tests\Phpunit\Elementor\Core\Upgrade;

use Elementor\Core\Upgrade\Manager as CoreUpgradeManager;
use Elementor\Plugin;
use ElementorEditorTesting\Elementor_Test_Base;

class Test_Manager extends Elementor_Test_Base {

	public function tearDown(): void {
		delete_option( CoreUpgradeManager::get_install_history_meta() );

		parent::tearDown();
	}

	public function test_start_run() {
		$manager = new Manager();

		// Prepare the upgrades manager
		$manager->public_start_run();

		// Trigger the run.
		$manager->get_task_runner()->handle_cron_healthcheck();

		// Assert via extract the created log entries.
		$raw_log_rows = Plugin::$instance->logger->get_logger()->get_log();
		$messages = [];

		foreach ( $raw_log_rows as $row ) {
			$messages[] = $row->message;
		}

		$this->assertContains( 'Elementor data updater process has been queued.', $messages );
		$this->assertContains( 'Elementor/Upgrades - upgrade_callback Start ', $messages );
		$this->assertContains( 'Elementor/Upgrades - upgrade_callback Finished', $messages );
		$this->assertContains( 'Elementor data updater process has been completed.', $messages );
	}

	public function test_had_install_prior_to_returns_true_for_legacy_installs() {
		update_option( CoreUpgradeManager::get_install_history_meta(), [
			'3.30.0' => strtotime( '-2 days' ),
			'3.35.0' => strtotime( '-1 day' ),
		] );

		$this->assertTrue( CoreUpgradeManager::had_install_prior_to( '3.33.3' ) );
	}

	public function test_had_install_prior_to_returns_false_for_recent_installs() {
		update_option( CoreUpgradeManager::get_install_history_meta(), [
			'3.33.3' => strtotime( '-1 day' ),
			'3.34.0' => time(),
		] );

		$this->assertFalse( CoreUpgradeManager::had_install_prior_to( '3.33.3' ) );
	}
}
