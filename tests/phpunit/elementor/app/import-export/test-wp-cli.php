<?php
namespace Elementor\Tests\Phpunit\Elementor\App\ImportExport;

use Elementor\Core\App\App;
use Elementor\App\Modules\ImportExport\Module;
use Elementor\App\Modules\ImportExport\Processes\Import;
use Elementor\App\Modules\ImportExport\Wp_Cli;
use Elementor\Plugin;
use ElementorEditorTesting\Elementor_Test_Base;

// Mock WP_CLI classes because they are not available in the test environment.
require_once __DIR__ . '/../../mock/wp-cli-command.php';
require_once __DIR__ . '/../../mock/wp-cli.php';

class Test_Wp_Cli extends Elementor_Test_Base {
	const MOCK_KIT_ZIP_PATH = __DIR__ . '/mock/sample-kit.zip';

	private $mock_import_export_module;

	public static function tearDownAfterClass(): void {
		// TODO: find a better way.
		Plugin::$instance->app->add_component( 'import-export', new Module() );
	}

	public function setUp(): void {
		parent::setUp();

		$this->mock_import_export_module = $this->getMockBuilder( Module::class )
			->setMethods( [ 'import_kit', 'export_kit', 'revert_last_imported_kit' ] )
			->getMock();

		Plugin::$instance->app->add_component( 'import-export', $this->mock_import_export_module );
	}

	public function test_import() {
		// Arrange
		$this->act_as_admin();

		$wp_cli = new Wp_Cli();

		$args = [
			static::MOCK_KIT_ZIP_PATH,
		];

		$assoc_args = [
			'unfilteredFilesUpload' => 'enable',
		];

		// Assert
		$this->mock_import_export_module
			->expects( $this->once() )
			->method( 'import_kit' );

		$mock_import_process = $this->getMockBuilder( Import::class )
			->disableOriginalConstructor()
			->setMethods( [ 'get_manifest' ] )
			->getMock();

		$this->mock_import_export_module->import = $mock_import_process;

		// Act
		$wp_cli->import( $args, $assoc_args );

		// Cleanups
		$this->mock_import_export_module->import = null;
	}

	public function test_export() {
		// Arrange
		$this->act_as_admin();

		$temp_export_path =  Plugin::$instance->uploads_manager->get_temp_dir() . 'tests';
		$kit_mock = Plugin::$instance->uploads_manager->create_temp_file( 'test', 'mock-exported-kit.zip' );

		$wp_cli = new Wp_Cli();

		$args = [
			$temp_export_path,
		];

		// Assert
		$this->mock_import_export_module
			->expects( $this->once() )
			->method( 'export_kit' )
			->willReturn( [
				'manifest' => [],
				'file_name' => $kit_mock,
			] );

		// Act
		$wp_cli->export( $args, [] );

		// Cleanups
		Plugin::$instance->uploads_manager->remove_temp_file_or_dir( $temp_export_path );
		Plugin::$instance->uploads_manager->remove_temp_file_or_dir( dirname( $kit_mock ) );
	}

	public function test_revert() {
		// Arrange
		$this->act_as_admin();

		$wp_cli = new Wp_Cli();

		// Assert
		$this->mock_import_export_module
			->expects( $this->once() )
			->method( 'revert_last_imported_kit' );

		// Act
		$wp_cli->revert();
	}
}
