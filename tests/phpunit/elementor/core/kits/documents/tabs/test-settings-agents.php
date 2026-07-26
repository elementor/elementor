<?php

namespace Elementor\Tests\Phpunit\Elementor\Core\Kits\Documents\Tabs;

use Elementor\Core\Kits\Documents\Tabs\Settings_Agents;
use Elementor\Modules\Agents\Module as Agents_Module;
use Elementor\Plugin;
use ElementorEditorTesting\Elementor_Test_Base;

class Test_Settings_Agents extends Elementor_Test_Base {

	private $kit;

	public function setUp(): void {
		parent::setUp();

		wp_set_current_user( $this->factory()->get_administrator_user()->ID );

		update_option( 'elementor_experiment-' . Agents_Module::EXPERIMENT_NAME, 'active' );

		$active_kit = Plugin::$instance->kits_manager->get_active_kit();
		$this->kit = Plugin::$instance->documents->get( $active_kit->get_id(), false );

		add_post_meta( $active_kit->get_main_id(), '_elementor_data', '[]' );
	}

	public function test_before_save__stores_llms_under_agents_key() {
		// Arrange
		$tab = new Settings_Agents( $this->kit );
		$llms_content = '# Example llms.txt';

		// Act
		$result = $tab->before_save( [
			'settings' => [
				'agents_llms' => $llms_content,
			],
		] );

		// Assert
		$this->assertSame( $llms_content, $result['settings']['agents']['llms'] );
		$this->assertArrayNotHasKey( 'agents_llms', $result['settings'] );
	}

	public function test_before_save__removes_agents_when_llms_is_empty() {
		// Arrange
		$tab = new Settings_Agents( $this->kit );

		// Act
		$result = $tab->before_save( [
			'settings' => [
				'agents_llms' => '',
				'agents' => [
					'llms' => 'old content',
				],
			],
		] );

		// Assert
		$this->assertArrayNotHasKey( 'agents', $result['settings'] );
		$this->assertArrayNotHasKey( 'agents_llms', $result['settings'] );
	}

	public function test_save__persists_agents_llms_to_database() {
		// Arrange
		$llms_content = 'User-agent: *';
		$settings = $this->kit->get_settings();
		$settings['agents_llms'] = $llms_content;

		// Act
		$this->kit->save( [
			'settings' => $settings,
		] );

		$kit_id = $this->kit->get_id();
		$this->kit = Plugin::$instance->documents->get( $kit_id, false );
		$settings = $this->kit->get_settings();

		// Assert
		$this->assertSame( $llms_content, $settings['agents']['llms'] );
		$this->assertArrayNotHasKey( 'agents_llms', $settings );
	}
}
