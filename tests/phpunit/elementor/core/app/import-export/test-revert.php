<?php
namespace Elementor\Tests\Phpunit\Elementor\Core\App\ImportExport;

use Elementor\Core\App\Modules\ImportExport\Module;
use Elementor\Core\App\Modules\ImportExport\Processes\Revert;
use Elementor\Core\App\Modules\ImportExport\Processes\Import;
use Elementor\Core\App\Modules\ImportExport\Runners\Elementor_Content;
use Elementor\Core\App\Modules\ImportExport\Runners\Site_Settings;
use Elementor\Plugin;
use ElementorEditorTesting\Elementor_Test_Base;

class Test_Revert extends Elementor_Test_Base {
	const ZIP_PATH = __DIR__ . '/mock/sample-kit.zip';

	public function test_run__revert_all_one_imported_only() {
		// Arrange
		register_post_type( 'tests' );
		register_post_type( 'sectests' );
		register_taxonomy( 'tests_tax', [ 'tests' ], [] );

		$taxonomies = get_taxonomies();

		$base_terms = get_terms( [ 'taxonomy' => $taxonomies, 'hide_empty' => false ] );
		$base_posts = get_posts( [ 'numberposts' => -1 ] );

		$import = new Import( static::ZIP_PATH );
		$import->register_default_runners();
		$import->run();

		$post_import_terms = get_terms( [ 'taxonomy' => $taxonomies, 'hide_empty' => false ] );
		$post_import_posts = get_posts( [ 'numberposts' => -1 ] );

		// Act
		$revert = new Revert();
		$revert->register_default_runners();
		$revert->run();

		// Assert
		$post_revert_terms = get_terms( [ 'taxonomy' => $taxonomies, 'hide_empty' => false ] );
		$post_revert_posts = get_posts( [ 'numberposts' => -1 ] );

		$this->assertEquals( $base_terms, $post_revert_terms );
		$this->assertNotEquals( $post_import_terms, $post_revert_terms );

		$this->assertEquals( $base_posts, $post_revert_posts );
		$this->assertNotEquals( $post_import_posts, $post_revert_posts );

		// Cleanups
		unregister_taxonomy_for_object_type( 'tests_tax', 'tests' );
		unregister_post_type( 'tests' );
		unregister_post_type( 'sectests' );
	}

	public function test_run__fail_when_not_registered_runners() {
		// Expect
		$this->expectException( \Exception::class );
		$this->expectExceptionMessage( 'Please specify revert runners.' );

		// Arrange
		$import = new Revert();

		// Act
		$import->run();
	}

	public function test_run__revert_site_settings() {
		// Arrange
		$original_kit = Plugin::$instance->kits_manager->get_active_kit();

		$import = new Import( static::ZIP_PATH );
		$import->register( new Site_Settings() );
		$import->run();

		// TODO: is it redundant?
		$post_import_kit = Plugin::$instance->kits_manager->get_active_kit();

		$revert = new Revert();
		$revert->register( new Site_Settings() );

		// Act
		$revert->run();

		// Assert
		$post_revert_kit = Plugin::$instance->kits_manager->get_active_kit();

		$this->assertEquals( $original_kit, $post_revert_kit );
		$this->assertNotEquals( $post_revert_kit, $post_import_kit );
	}

	public function test_run__revert_elementor_content_only() {
		// Arrange
		$old_option_page_on_front = get_option( 'page_on_front' );
		$old_option_show_on_front = get_option( 'show_on_front' );

		$post = $this->factory()->post->create_and_get();

		update_option( 'page_on_front', $post->ID );
		update_option( 'show_on_front', 'post' );

		$import = new Import( static::ZIP_PATH );
		$import->register( new Elementor_Content() );
		$import->run();

		$post_import_option_page_on_front = get_option( 'page_on_front' );
		$post_import_option_show_on_front = get_option( 'show_on_front' );

		$revert = new Revert();
		$revert->register( new Elementor_Content() );

		// Act
		$revert->run();

		// Arrange
		$post_revert_option_page_on_front = get_option( 'page_on_front' );
		$post_revert_option_show_on_front = get_option( 'show_on_front' );

		$this->assertEquals( $old_option_page_on_front, $post_revert_option_page_on_front );
		$this->assertEquals( $old_option_show_on_front, $post_revert_option_show_on_front );

		$this->assertNotEquals( $post_import_option_page_on_front, $post_revert_option_page_on_front );
		$this->assertNotEquals( $post_import_option_show_on_front, $post_revert_option_show_on_front );

		// Cleanups
		update_option( 'page_on_front', $old_option_page_on_front );
		update_option( 'show_on_front', $old_option_show_on_front );
	}

	public function test_get_last_session_data() {
		// Arrange
		$import_sessions = [
			1 => [ 1 ],
		];

		update_option(Module::OPTION_KEY_ELEMENTOR_IMPORT_SESSIONS, $import_sessions );

		// Act
		$last_import_session = (new Revert())->get_last_import_session();

		// Assert
		$this->assertEquals( $import_sessions[ 1 ], $last_import_session );
	}

	public function test_get_last_session_data__data_not_exist() {
		// Arrange
		$import_sessions = [];

		update_option(Module::OPTION_KEY_ELEMENTOR_IMPORT_SESSIONS, $import_sessions );

		// Act
		$last_import_session = (new Revert())->get_last_import_session();

		// Assert
		$this->assertEquals( [], $last_import_session );
	}

	public function test_get_penultimate_session_data() {
		// Arrange
		$import_sessions = [
			1 => [ 1 ],
			3 => [ 3 ],
			2 => [ 2 ],
		];

		update_option(Module::OPTION_KEY_ELEMENTOR_IMPORT_SESSIONS, $import_sessions );

		// Act
		$last_import_session = (new Revert())->get_penultimate_import_session();

		// Assert
		$this->assertEquals( $import_sessions[2], $last_import_session );
	}

	public function test_get_penultimate_session_data__only_one_session_exits() {
		// Arrange
		$import_sessions = [
			2 => [ 2 ],
		];

		update_option(Module::OPTION_KEY_ELEMENTOR_IMPORT_SESSIONS, $import_sessions );

		// Act
		$last_import_session = (new Revert())->get_penultimate_import_session();

		// Assert
		$this->assertEquals( [], $last_import_session );
	}
}
