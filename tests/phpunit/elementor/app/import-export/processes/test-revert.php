<?php
namespace Elementor\Tests\Phpunit\Elementor\App\ImportExport\Processes;

use Elementor\App\Modules\ImportExport\Module;
use Elementor\App\Modules\ImportExport\Processes\Revert;
use Elementor\App\Modules\ImportExport\Processes\Import;
use Elementor\App\Modules\ImportExport\Runners\Revert\Elementor_Content as Revert_Elementor_Content;
use Elementor\App\Modules\ImportExport\Runners\Revert\Site_Settings as Revert_Site_Settings;
use Elementor\App\Modules\ImportExport\Runners\Import\Elementor_Content as Import_Elementor_Content;
use Elementor\App\Modules\ImportExport\Runners\Import\Site_Settings as Import_Site_Settings;
use Elementor\App\Modules\ImportExport\Runners\Import\Plugins as Import_Plugins;
use Elementor\App\Modules\ImportExport\Runners\Import\Taxonomies as Import_Taxonomies;
use Elementor\App\Modules\ImportExport\Runners\Import\Templates as Import_Templates;
use Elementor\App\Modules\ImportExport\Runners\Import\Wp_Content as Import_Wp_Content;
use Elementor\Core\Utils\Plugins_Manager;
use Elementor\Plugin;
use ElementorEditorTesting\Elementor_Test_Base;

class Test_Revert extends Elementor_Test_Base {
	const MOCK_KIT_ZIP_PATH = __DIR__ . '/../mock/sample-kit.zip';

	public function test_run__revert_all_one_imported_only() {
		// Arrange
		register_post_type( 'tests' );
		register_post_type( 'sectests' );
		register_taxonomy( 'tests_tax', [ 'tests' ], [] );

		$taxonomies = get_taxonomies();

		$base_terms = get_terms( [ 'taxonomy' => $taxonomies, 'hide_empty' => false ] );
		$base_posts = get_posts( [ 'post_type' =>  'any', 'numberposts' => -1 ] );

		$plugins_manager_mock = $this->getMockBuilder( Plugins_Manager::class )
			->setMethods( [ 'install', 'activate' ] )
			->getMock();

		$plugins_manager_mock->method( 'install' )
			->willReturn( [
				'succeeded' => []
			] );

		$plugins_manager_mock->method( 'activate' )
			->willReturn( [
				'succeeded' => []
			] );

		$import = new Import( static::MOCK_KIT_ZIP_PATH );

		$import->register( new Import_Plugins( $plugins_manager_mock ) );
		$import->register( new Import_Site_Settings() );
		$import->register( new Import_Taxonomies() );
		$import->register( new Import_Templates() );
		$import->register( new Import_Elementor_Content() );
		$import->register( new Import_Wp_Content() );

		$import->run();

		$after_import__terms = get_terms( [ 'taxonomy' => $taxonomies, 'hide_empty' => false ] );
		$after_import__posts = get_posts( [ 'post_type' =>  'any', 'numberposts' => -1 ] );

		// Act
		$revert = new Revert();
		$revert->register_default_runners();
		$revert->run();

		// Assert
		$after_revert__terms = get_terms( [ 'taxonomy' => $taxonomies, 'hide_empty' => false ] );
		$after_revert__posts = get_posts( [ 'post_type' =>  'any', 'numberposts' => -1 ] );

		$this->assertEquals( $base_terms, $after_revert__terms );
		$this->assertNotEquals( $after_import__terms, $after_revert__terms );

		$this->assertEquals( $base_posts, $after_revert__posts );
		$this->assertNotEquals( $after_import__posts, $after_revert__posts );

		$revert_sessions_option = get_option( Module::OPTION_KEY_ELEMENTOR_REVERT_SESSIONS );

		$this->assert_valid_revert_sessions_option( $revert_sessions_option );

		// Cleanups
		unregister_taxonomy_for_object_type( 'tests_tax', 'tests' );
		unregister_post_type( 'tests' );
		unregister_post_type( 'sectests' );
	}

	public function test_run__fail_when_not_registered_runners() {
		// Expect
		$this->expectException( \Exception::class );
		$this->expectExceptionMessage( 'Couldn’t execute the revert process because no revert runners have been specified. Try again by specifying revert runners.' );

		// Arrange
		$import = new Revert();

		// Act
		$import->run();
	}

	public function test_run__revert_site_settings() {
		// Arrange
		$original_kit = Plugin::$instance->kits_manager->get_active_kit();

		$import = new Import( static::MOCK_KIT_ZIP_PATH );
		$import->register( new Import_Site_Settings() );
		$import->run();

		$after_import__kit = Plugin::$instance->kits_manager->get_active_kit();

		$revert = new Revert();
		$revert->register( new Revert_Site_Settings() );

		// Act
		$revert->run();

		// Assert
		$after_revert__kit = Plugin::$instance->kits_manager->get_active_kit();

		$this->assertEquals( $original_kit, $after_revert__kit );
		$this->assertNotEquals( $after_revert__kit, $after_import__kit );
	}

	public function test_run__revert_elementor_content_only() {
		// Arrange
		$document = $this->factory()->documents->publish_and_get();

		update_option( 'page_on_front', $document->get_id() );
		update_option( 'show_on_front', 'page' );

		$import = new Import( static::MOCK_KIT_ZIP_PATH );
		$import->register( new Import_Elementor_Content() );
		$import->run();

		$after_import__option_page_on_front = get_option( 'page_on_front' );

		$revert = new Revert();
		$revert->register( new Revert_Elementor_Content() );

		// Act
		$revert->run();

		// Arrange
		$after_revert__option_page_on_front = get_option( 'page_on_front' );
		$after_revert__option_show_on_front = get_option( 'show_on_front' );

		$this->assertEquals( $document->get_id(), $after_revert__option_page_on_front );
		$this->assertEquals( 'page', $after_revert__option_show_on_front );

		$this->assertNotEquals( $after_import__option_page_on_front, $after_revert__option_page_on_front );
	}

	public function test_get_last_session_data() {
		// Arrange
		$import_sessions = [
			'last' => [
				'session_id' => 'test',
				'start_timestamp' => 200,
			],
			'penultimate' => [
				'session_id' => 'test2',
				'start_timestamp' => 100,
			],
		];

		update_option( Module::OPTION_KEY_ELEMENTOR_IMPORT_SESSIONS, $import_sessions );

		// Act
		$last_import_session = ( new Revert() )->get_last_import_session();

		// Assert
		$this->assertEquals( $import_sessions['last'], $last_import_session );
	}

	public function test_get_last_session_data__data_not_exist() {
		// Arrange
		$import_sessions = [];

		update_option( Module::OPTION_KEY_ELEMENTOR_IMPORT_SESSIONS, $import_sessions );

		// Act
		$last_import_session = ( new Revert() )->get_last_import_session();

		// Assert
		$this->assertEquals( [], $last_import_session );
	}

	public function test_get_penultimate_session_data() {
		// Arrange
		$import_sessions = [
			'last' => [
				'session_id' => 'test',
				'start_timestamp' => 200,
			],
			'one_more' => [
				'session_id' => 'test2',
				'start_timestamp' => 100,
			],
			'penultimate' => [
				'session_id' => 'test3',
				'start_timestamp' => 150,
			],
		];

		update_option( Module::OPTION_KEY_ELEMENTOR_IMPORT_SESSIONS, $import_sessions );

		// Act
		$last_import_session = ( new Revert() )->get_penultimate_import_session();

		// Assert
		$this->assertEquals( $import_sessions['penultimate'], $last_import_session );
	}

	public function test_get_penultimate_session_data__only_one_session_exits() {
		// Arrange
		$import_sessions = [
			'last' => [
				'session_id' => 'test',
				'start_timestamp' => 200,
			],
		];

		update_option( Module::OPTION_KEY_ELEMENTOR_IMPORT_SESSIONS, $import_sessions );

		// Act
		$last_import_session = ( new Revert() )->get_penultimate_import_session();

		// Assert
		$this->assertEquals( [], $last_import_session );
	}

	private function assert_valid_revert_sessions_option( $revert_sessions_option ) {
		$revert_session_keys = [
			'session_id',
			'kit_name',
			'source',
			'user_id',
			'import_timestamp',
			'revert_timestamp',
		];

		$this->assertCount( 1 ,$revert_sessions_option );

		$this->assert_array_have_keys( $revert_session_keys, $revert_sessions_option[0] );
	}
}
