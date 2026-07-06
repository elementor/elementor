<?php

use Elementor\Core\Settings\Manager as SettingsManager;
use Elementor\Plugin;
use ElementorEditorTesting\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Test_Save_Settings_Shape extends Elementor_Test_Base {

	public function setUp(): void {
		parent::setUp();

		$this->act_as_admin();
	}

	public function test_initial_document_settings_contain_nested_values() {
		$post_id = $this->factory()->post->create( [
			'post_type' => 'page',
			'post_status' => 'draft',
		] );

		$document = Plugin::$instance->documents->get( $post_id );
		$document->set_is_built_with_elementor( true );

		$config = $document->get_config();

		$this->assertArrayHasKey( 'settings', $config );
		$this->assertArrayHasKey( 'settings', $config['settings'] );
		$this->assertIsArray( $config['settings']['settings'] );
		$this->assertArrayNotHasKey( 'controls', $config['settings']['settings'] );
	}

	public function test_save_builder_accepts_page_setting_values() {
		$post_id = $this->factory()->post->create( [
			'post_type' => 'page',
			'post_status' => 'draft',
		] );

		$document = Plugin::$instance->documents->get( $post_id );
		$document->set_is_built_with_elementor( true );

		$page_settings = SettingsManager::get_settings_managers_config()['page']['settings'];

		$elements = [
			[
				'id' => 'abc1234',
				'elType' => 'e-flexbox',
				'settings' => [],
				'elements' => [],
			],
		];

		$page_settings['post_status'] = 'draft';

		$result = Plugin::$instance->documents->ajax_save( [
			'editor_post_id' => $post_id,
			'elements' => $elements,
			'settings' => $page_settings,
			'status' => 'draft',
		] );

		$this->assertIsArray( $result );
		$this->assertSame( 'draft', get_post_status( $post_id ) );

		$saved_elements = $document->get_elements_data();
		$this->assertCount( 1, $saved_elements );
		$this->assertSame( 'e-flexbox', $saved_elements[0]['elType'] );
	}
}
