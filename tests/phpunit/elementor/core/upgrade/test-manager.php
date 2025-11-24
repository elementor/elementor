<?php
namespace Elementor\Tests\Phpunit\Elementor\Core\Upgrade;

use Elementor\Core\Upgrade\Manager;
use Elementor\Plugin;
use ElementorEditorTesting\Elementor_Test_Base;

class Test_Manager extends Elementor_Test_Base {

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

	public function test_had_install_prior_to_returns_false_for_empty_history() {
		delete_option( Manager::get_install_history_meta() );

		$this->assertFalse( Manager::had_install_prior_to( '3.33.2' ) );
	}

	public function test_had_install_prior_to_returns_false_when_first_install_matches_target() {
		update_option( Manager::get_install_history_meta(), [
			'3.33.2' => time(),
			'3.35.0' => time() + 10,
		] );

		$this->assertFalse( Manager::had_install_prior_to( '3.33.2' ) );
	}

	public function test_had_install_prior_to_returns_true_when_history_contains_older_version() {
		update_option( Manager::get_install_history_meta(), [
			'3.35.0' => time() + 10,
			'3.30.0' => time(),
		] );

		$this->assertTrue( Manager::had_install_prior_to( '3.33.2' ) );
	}
}
