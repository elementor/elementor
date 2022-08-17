<?php
namespace Elementor\Tests\Phpunit\Elementor\Core\App\ImportExport;

use Elementor\Core\App\Modules\ImportExport\Processes\Revert;
use Elementor\Core\App\Modules\ImportExport\Processes\Import;
use Elementor\Core\Utils\Plugins_Manager;
use Elementor\Plugin;
use ElementorEditorTesting\Elementor_Test_Base;

class Test_Revert extends Elementor_Test_Base {
	public function test_run__revert_all() {
		// Arrange
		register_post_type( 'tests' );
		register_post_type( 'sectests' );
		register_taxonomy( 'tests_tax', [ 'tests' ], [] );

		$taxonomies = get_taxonomies();

		$base_terms = get_terms( [ 'taxonomy' => $taxonomies, 'hide_empty' => false ] );
		$base_posts = get_posts( [ 'numberposts' => -1 ] );

		$zip_path = __DIR__ . '/mock/sample-kit.zip';
		$import = new Import( $zip_path );
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

	public function test_get_last_session_data() {
		// Arrange
		$import_sessions = [
			1 => [ 1 ],
		];

		update_option('elementor_import_sessions', $import_sessions );

		// Act
		$last_import_session = (new Revert())->get_last_session_data();

		// Assert
		$this->assertEquals( $import_sessions[ 1 ], $last_import_session );
	}

	public function test_get_last_session_data__data_not_exist() {
		// Arrange
		$import_sessions = [];

		update_option('elementor_import_sessions', $import_sessions );

		// Act
		$last_import_session = (new Revert())->get_last_session_data();

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

		update_option('elementor_import_sessions', $import_sessions );

		// Act
		$last_import_session = (new Revert())->get_penultimate_session_data();

		// Assert
		$this->assertEquals( $import_sessions[2], $last_import_session );
	}

	public function test_get_penultimate_session_data__only_one_session_exits() {
		// Arrange
		$import_sessions = [
			2 => [ 2 ],
		];

		update_option('elementor_import_sessions', $import_sessions );

		// Act
		$last_import_session = (new Revert())->get_penultimate_session_data();

		// Assert
		$this->assertEquals( [], $last_import_session );
	}
}
