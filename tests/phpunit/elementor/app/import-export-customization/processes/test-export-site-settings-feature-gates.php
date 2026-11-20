<?php

namespace Elementor\Tests\Phpunit\Elementor\App\ImportExportCustomization\Processes;

use Elementor\App\Modules\ImportExportCustomization\Processes\Export;
use Elementor\App\Modules\ImportExportCustomization\Runners\Export\Site_Settings;
use Elementor\Core\Experiments\Manager as Experiments_Manager;
use Elementor\Modules\AtomicWidgets\Module as Atomic_Widgets_Module;
use Elementor\Modules\Variables\Module as Variables_Module;
use Elementor\Plugin;
use ElementorEditorTesting\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * @group Elementor
 * @group Elementor/ImportExportCustomization
 * @group Elementor/ImportExportCustomization/Processes
 *
 * @group kit-import-export-customization
 */
class Test_Export_Site_Settings_Feature_Gates extends Elementor_Test_Base {
	private string $original_atomic_widgets_experiment_state;
	private string $original_variables_experiment_state;

	public function setUp(): void {
		parent::setUp();

		$this->original_atomic_widgets_experiment_state = Plugin::$instance->experiments
			->get_features( Atomic_Widgets_Module::EXPERIMENT_NAME )['default'];
		$this->original_variables_experiment_state = Plugin::$instance->experiments
			->get_features( Variables_Module::EXPERIMENT_NAME )['default'];

		Plugin::$instance->experiments->set_feature_default_state(
			Atomic_Widgets_Module::EXPERIMENT_NAME,
			Experiments_Manager::STATE_ACTIVE
		);
		Plugin::$instance->experiments->set_feature_default_state(
			Variables_Module::EXPERIMENT_NAME,
			Experiments_Manager::STATE_ACTIVE
		);
	}

	public function tearDown(): void {
		Plugin::$instance->experiments->set_feature_default_state(
			Atomic_Widgets_Module::EXPERIMENT_NAME,
			$this->original_atomic_widgets_experiment_state
		);
		Plugin::$instance->experiments->set_feature_default_state(
			Variables_Module::EXPERIMENT_NAME,
			$this->original_variables_experiment_state
		);

		parent::tearDown();
	}

	public function test_run__export_site_settings__includes_feature_gated_manifest_keys() {
		// Arrange
		$this->act_as_admin();

		$site_settings['custom_colors'] = [
			'_id' => '0fba91c',
			'title' => 'Light Orange',
			'color' => '#FAB89F',
		];

		$mocked_theme = [
			'name'      => 'My Custom Theme',
			'theme_uri' => 'https://example.com/my-custom-theme',
			'version'   => '1.2.3',
			'slug'      => 'my-custom-theme',
		];

		Plugin::$instance->kits_manager->create_new_kit( 'a', $site_settings );

		$site_settings_runner = $this->getMockBuilder( Site_Settings::class )
			->onlyMethods( [ 'export_theme' ] )
			->getMock();

		$site_settings_runner->method( 'export_theme' )
			->willReturn( $mocked_theme );

		$export = new Export();
		$export->register( $site_settings_runner );

		// Act
		$result = $export->run();

		// Assert
		$expected_feature_gated_manifest_keys = [
			'classes',
			'defaultStyles',
			'variables',
			'classesCount',
			'defaultStylesCount',
			'variablesCount',
		];

		$this->assert_array_have_keys( $expected_feature_gated_manifest_keys, $result['manifest']['site-settings'] );
		$this->assertTrue( $result['manifest']['site-settings']['classes'] );
		$this->assertTrue( $result['manifest']['site-settings']['defaultStyles'] );
		$this->assertTrue( $result['manifest']['site-settings']['variables'] );
		$this->assertSame( 0, $result['manifest']['site-settings']['classesCount'] );
		$this->assertSame( 0, $result['manifest']['site-settings']['defaultStylesCount'] );
		$this->assertSame( 0, $result['manifest']['site-settings']['variablesCount'] );
	}
}
