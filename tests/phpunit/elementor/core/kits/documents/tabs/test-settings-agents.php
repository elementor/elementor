<?php

namespace Elementor\Tests\Phpunit\Elementor\Core\Kits\Documents\Tabs;

use Elementor\Core\Experiments\Manager as Experiments_Manager;
use Elementor\Core\Kits\Documents\Tabs\Settings_Agents;
use Elementor\Modules\Agents\Module as Agents_Module;
use Elementor\Plugin;
use ElementorEditorTesting\Elementor_Test_Base;

class Test_Settings_Agents extends Elementor_Test_Base {

	private $kit;

	private $original_experiment_default_state;

	public function setUp(): void {
		parent::setUp();

		wp_set_current_user( $this->factory()->get_administrator_user()->ID );

		$this->original_experiment_default_state = Plugin::$instance->experiments
			->get_features( Agents_Module::EXPERIMENT_NAME )['default'];

		Plugin::$instance->experiments->set_feature_default_state(
			Agents_Module::EXPERIMENT_NAME,
			Experiments_Manager::STATE_ACTIVE
		);

		$kit_id = Plugin::$instance->kits_manager->get_active_id();
		$this->flush_documents_cache();
		$this->kit = Plugin::$instance->documents->get( $kit_id );

		add_post_meta( $kit_id, '_elementor_data', '[]' );
	}

	public function tearDown(): void {
		Plugin::$instance->experiments->set_feature_default_state(
			Agents_Module::EXPERIMENT_NAME,
			$this->original_experiment_default_state
		);

		$this->flush_documents_cache();

		parent::tearDown();
	}

	public function test_kit_registers_agents_tab_when_experiment_is_active() {
		// Assert
		$this->assertArrayHasKey( 'settings-agents', $this->kit->get_tabs() );
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

	public function test_before_save__sanitizes_nested_agents_llms() {
		// Arrange
		$tab = new Settings_Agents( $this->kit );
		$unsafe_content = "<script>alert('xss')</script>\n# llms.txt";

		// Act
		$result = $tab->before_save( [
			'settings' => [
				'agents' => [
					'llms' => $unsafe_content,
				],
			],
		] );

		// Assert
		$this->assertSame( sanitize_textarea_field( $unsafe_content ), $result['settings']['agents']['llms'] );
	}

	public function test_before_save__preserves_existing_agents_keys() {
		// Arrange
		$tab = new Settings_Agents( $this->kit );
		$llms_content = '# Example llms.txt';

		// Act
		$result = $tab->before_save( [
			'settings' => [
				'agents_llms' => $llms_content,
				'agents' => [
					'future_setting' => 'keep-me',
				],
			],
		] );

		// Assert
		$this->assertSame( $llms_content, $result['settings']['agents']['llms'] );
		$this->assertSame( 'keep-me', $result['settings']['agents']['future_setting'] );
	}

	public function test_before_save__clears_only_llms_when_other_agents_keys_exist() {
		// Arrange
		$tab = new Settings_Agents( $this->kit );

		// Act
		$result = $tab->before_save( [
			'settings' => [
				'agents' => [
					'llms' => '',
					'future_setting' => 'keep-me',
				],
			],
		] );

		// Assert
		$this->assertArrayNotHasKey( 'llms', $result['settings']['agents'] );
		$this->assertSame( 'keep-me', $result['settings']['agents']['future_setting'] );
	}

	public function test_save__persists_agents_llms_to_database() {
		// Arrange
		$llms_content = 'User-agent: *';
		$tab = new Settings_Agents( $this->kit );
		$settings = $this->kit->get_settings();
		$settings['agents_llms'] = $llms_content;
		$data = $tab->before_save( [
			'settings' => $settings,
		] );

		// Act
		$this->kit->save( [
			'settings' => $data['settings'],
		] );

		$kit_id = $this->kit->get_id();
		$this->flush_documents_cache();
		$meta = get_post_meta( $kit_id, '_elementor_page_settings', true );

		// Assert
		$this->assertSame( $llms_content, $meta['agents']['llms'] );
		$this->assertArrayNotHasKey( 'agents_llms', $meta );
	}

	private function flush_documents_cache(): void {
		$reflection = new \ReflectionProperty( Plugin::$instance->documents, 'documents' );
		$reflection->setAccessible( true );
		$reflection->setValue( Plugin::$instance->documents, [] );
	}
}
