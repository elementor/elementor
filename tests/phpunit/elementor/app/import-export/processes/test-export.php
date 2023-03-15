<?php
namespace Elementor\Tests\Phpunit\Elementor\App\ImportExport\Processes;

use Elementor\App\Modules\ImportExport\Runners\Export\Elementor_Content;
use Elementor\App\Modules\ImportExport\Runners\Export\Plugins;
use Elementor\App\Modules\ImportExport\Runners\Export\Site_Settings;
use Elementor\App\Modules\ImportExport\Runners\Export\Taxonomies;
use Elementor\App\Modules\ImportExport\Runners\Export\Templates;
use Elementor\App\Modules\ImportExport\Runners\Export\Wp_Content;
use Elementor\App\Modules\ImportExport\Processes\Export;
use Elementor\App\Modules\ImportExport\Utils as ImportExportUtils;
use Elementor\Core\Utils\Collection;
use Elementor\Plugin;
use ElementorEditorTesting\Elementor_Test_Base;

class Test_Export extends Elementor_Test_Base {
	public function test_run__export_all() {
		// Arrange
		$this->factory()->create_and_get_custom_post( [ 'post_type' => 'page' ] );
		$this->factory()->create_and_get_custom_post( [ 'post_type' => 'post' ] );

		$this->register_post_type( 'tests', 'Tests' );
		register_taxonomy( 'tests_tax', [ 'tests' ], [] );
		$this->factory()->create_and_get_custom_post( [ 'post_type' => 'tests' ] );
		$this->factory()->term->create_and_get( [ 'taxonomy' => 'tests_tax' ] );

		$this->factory()->documents->publish_and_get();

		$export = new Export();
		$export->register_default_runners();

		// Act
		$result = $export->run();

		// Assert
		$expected_manifest_base_keys = [ 'name', 'title', 'description', 'author', 'version', 'elementor_version', 'created', 'thumbnail', 'site' ];
		$this->assert_array_have_keys( $expected_manifest_base_keys, $result['manifest'] );

		$expected_manifest_registered_keys = [ 'site-settings', 'plugins', 'taxonomies', 'content', 'wp-content', 'custom-post-type-title' ];
		$this->assert_array_have_keys( $expected_manifest_registered_keys, $result['manifest'] );

		$extracted_zip_path = Plugin::$instance->uploads_manager->extract_and_validate_zip( $result['file_name'], [ 'json', 'xml' ] )['extraction_directory'];
		$manifest_file = ImportExportUtils::read_json_file( $extracted_zip_path . 'manifest' );
		$this->assertEquals( $result['manifest'], $manifest_file );

		// Cleanups
		unregister_taxonomy_for_object_type( 'tests_tax', 'tests' );
		unregister_post_type( 'tests' );

		Plugin::$instance->uploads_manager->remove_file_or_dir( $extracted_zip_path );
	}

	public function test_run__fails_when_no_runners_are_registered() {
		// Expect
		$this->expectException( \Exception::class );
		$this->expectExceptionMessage( 'Couldn’t execute the export process because no export runners have been specified. Try again by specifying export runners.' );

		// Arrange
		$export = new Export();

		// Act
		$export->run();
	}

	public function test_run__export_plugins() {
		// Arrange
		$export = new Export();
		$export->register( new Plugins() );

		// Act
		$result = $export->run();

		// Assert
		$this->assertCount( 2, $result['manifest']['plugins'] );

		foreach ( $result['manifest']['plugins'] as $plugin ) {
			$this->assert_array_have_keys( ['name', 'plugin', 'pluginUri', 'version'], $plugin );
		}
	}

	public function test_run__export_site_settings() {
		// Arrange
		$this->act_as_admin();

		$custom_colors = [
			'_id' => '0fba91c',
			'title' => 'Light Orange',
			'color' => '#FAB89F',
		];
		$site_settings['custom_colors'] = $custom_colors;
		Plugin::$instance->kits_manager->create_new_kit( 'a', $site_settings );

		$export = new Export();
		$export->register( new Site_Settings() );

		// Act
		$result = $export->run();

		// Assert
		$kit = Plugin::$instance->kits_manager->get_active_kit();
		$kit_tabs = $kit->get_tabs();
		unset( $kit_tabs['settings-site-identity'] );
		$expected_manifest_site_settings = array_keys( $kit_tabs );

		$this->assertEqualSets( $expected_manifest_site_settings, $result['manifest']['site-settings'] );

		$kit_data = $kit->get_export_data();
		$extracted_zip_path = Plugin::$instance->uploads_manager->extract_and_validate_zip( $result['file_name'], [ 'json', 'xml' ] )['extraction_directory'];
		$site_settings_file = ImportExportUtils::read_json_file( $extracted_zip_path . 'site-settings' );

		$this->assertEquals( $kit_data, $site_settings_file );

		// Cleanups
		Plugin::$instance->uploads_manager->remove_file_or_dir( $extracted_zip_path );
	}

	public function test_run__export_taxonomies() {
		$this->register_post_type( 'tests', 'Tests' );
		register_taxonomy( 'tests_tax', [ 'tests' ], [] );

		$this->factory()->create_and_get_custom_post( [ 'post_type' => 'tests' ] );
		$this->factory()->term->create_and_get( [ 'taxonomy' => 'tests_tax' ] );

		// Arrange
		$export = new Export();
		$export->register( new Taxonomies() );

		// Act
		$result = $export->run();

		// Assert
		$expected_taxonomies = [
			'post' => [
				'category'
			],
			'tests' => [
				'tests_tax'
			],
		];
		$this->assertEquals(  $expected_taxonomies, $result['manifest']['taxonomies'] );

		$extracted_zip_path = Plugin::$instance->uploads_manager->extract_and_validate_zip( $result['file_name'], [ 'json', 'xml' ] )['extraction_directory'];

		foreach ( $result['manifest']['taxonomies'] as $post_type ) {
			foreach ( $post_type as $taxonomy ) {
				$terms = ImportExportUtils::read_json_file( $extracted_zip_path . 'taxonomies/' . $taxonomy );

				$expected_terms = get_terms( [
					'taxonomy' => $taxonomy,
					'hide_empty' => false,
				] );

				foreach ( $terms as $term ) {
					$expected_term = array_shift( $expected_terms );

					$this->assertEquals( $expected_term->term_id, $term['term_id'] );
					$this->assertEquals( $expected_term->name, $term['name'] );
					$this->assertEquals( $expected_term->slug, $term['slug'] );
					$this->assertEquals( $expected_term->taxonomy, $term['taxonomy'] );
					$this->assertEquals( $expected_term->description, $term['description'] );
					$this->assertEquals( $expected_term->parent, $term['parent'] );
				}
			}
		}

		// Cleanups
		unregister_post_type( 'tests' );
		unregister_taxonomy( 'tests_tax' );

		Plugin::$instance->uploads_manager->remove_file_or_dir( $extracted_zip_path );
	}

	public function test_run__export_templates() {
		// Arrange
		$export = new Export();
		$export->register( new Templates() );

		// Act
		$result = $export->run();

		// Assert
		$this->assertFalse( isset( $result['manifest']['templates'] ) );

		$extracted_zip_path = Plugin::$instance->uploads_manager->extract_and_validate_zip( $result['file_name'], [ 'json', 'xml' ] )['extraction_directory'];

		$this->assertFalse( is_dir( $extracted_zip_path . 'templates' ) );

		// Cleanups
		Plugin::$instance->uploads_manager->remove_file_or_dir( $extracted_zip_path );
	}

	public function test_run__export_elementor_content() {
		// Arrange
		$elementor_page = $this->factory()->documents->publish_and_get( [ 'post_type' => 'page', ] );

		update_option( 'page_on_front', $elementor_page->get_id() );
		update_option( 'show_on_front', 'page' );

		$documents = ( new Collection( [
			$elementor_page,
			$this->factory()->documents->publish_and_get( [ 'post_type' => 'e-landing-page', ] ),
			$this->factory()->documents->publish_and_get(),
		] ) )
			->map_with_keys( function( $document ) {
				return [ $document->get_main_id() => $document ];
			} )
			->all();

		// Add a draft document to make sure that it's not getting exported.
		$this->factory()->documents->create();

		$export = new Export();
		$export->register( new Elementor_Content() );

		// Act
		$result = $export->run();

		// Assert
		$this->assert_valid_elementor_content( $result, $documents );

		$this->assertTrue( $result['manifest']['content']['page'][ $elementor_page->get_id() ]['show_on_front'] );
	}

	public function test_run__export_wp_content() {
		// Arrange
		$this->register_post_type( 'tests', 'Tests' );

		$this->factory()->create_and_get_custom_post( [ 'post_type' => 'page' ] );
		$this->factory()->create_and_get_custom_post( [ 'post_type' => 'tests' ] );

		$export = new Export();
		$export->register( new Wp_Content() );

		// Act
		$result = $export->run();
		$selected_custom_post_types = $export->get_settings_selected_custom_post_types();

		// Assert
		$this->assertEquals( [ 'tests' ], $selected_custom_post_types );
		$this->assertArrayHasKey( 'tests', $result['manifest']['wp-content'] );
		$this->assertEquals( 'Tests', $result['manifest']['custom-post-type-title']['tests']['label'] );
		$this->assertEmpty( $result['manifest']['wp-content']['nav_menu_item'] );

		$this->assert_valid_wp_content( $result );

		// Cleanups
		unregister_post_type( 'tests' );
	}

	public function test_run__export_elementor_content_with_taxonomy() {
		register_taxonomy( 'custom_post_tax', [ 'post' ], [] );
		$post_term = $this->factory()->term->create_and_get( [ 'taxonomy' => 'custom_post_tax' ] );
		$elementor_post = $this->factory()->documents->publish_and_get();

		wp_set_post_terms( $elementor_post->get_id(), [ $post_term->term_id ] , 'custom_post_tax' );

		$export = new Export();
		$export->register( new Taxonomies() );
		$export->register( new Elementor_Content() );

		// Act
		$result = $export->run();

		// Assert
		$found_the_created_term = false;
		foreach ( $result['manifest']['content']['post'][ $elementor_post->get_id() ]['terms'] as $term ) {
			if ( $post_term->term_id === $term['term_id'] ) {
				$found_the_created_term = true;
				$this->assertEquals( $post_term->taxonomy, $term['taxonomy'] );
				$this->assertEquals( $post_term->slug, $term['slug'] );
				break;
			}
		}
		$this->assertTrue( $found_the_created_term );

		unregister_taxonomy( 'custom_post_tax' );
	}

	private function recursive_unset( &$elements, $unwanted_key ) {
		foreach ( $elements as &$element ) {
			unset( $element[ $unwanted_key ] );
			$this->recursive_unset( $element['elements'], $unwanted_key );
		}
	}

	private function assert_valid_wp_content( $result ) {
		$extracted_zip_path = Plugin::$instance->uploads_manager->extract_and_validate_zip( $result['file_name'], [ 'json', 'xml' ] )['extraction_directory'];

		foreach ( $result['manifest']['wp-content'] as $post_type => $posts_ids ) {
			$xml_file = \Elementor\Utils::file_get_contents( $extracted_zip_path . 'wp-content/' . $post_type . '/' . $post_type . '.xml', true );
			$this->assertNotEmpty( $xml_file );

			$query_args = [
				'post_type' => $post_type,
				'post_status' => 'publish',
				'posts_per_page' => 20,
				'meta_query' => [
					[
						'key' => '_elementor_edit_mode',
						'compare' => 'NOT EXISTS',
					],
				],
			];

			$query = new \WP_Query( $query_args );

			$this->assertCount( count( $query->posts ), $posts_ids ) ;
		}

		// Cleanups
		Plugin::$instance->uploads_manager->remove_file_or_dir( $extracted_zip_path );
	}

	private function register_post_type( $key, $plural_label ) {
		register_post_type( $key, [
			'can_export' => true,
			'public' => true,
			'labels' => [
				'name' => $plural_label,
			],
		] );
	}

	private function assert_valid_elementor_content( $result,  $documents )	{
		$extracted_zip_path = Plugin::$instance->uploads_manager->extract_and_validate_zip( $result['file_name'], [ 'json', 'xml' ] )['extraction_directory'];

		foreach ( $result['manifest']['content'] as $post_type_key => $post_type_posts ) {
			foreach ($result['manifest']['content'][ $post_type_key ] as $post_id => $post_settings ) {
				$expected_document = $documents[ $post_id ];
				$expected_post = $expected_document->get_post();

				$this->assertEquals( $expected_post->post_title, $post_settings['title'] );
				$this->assertEquals( $expected_post->post_excerpt, $post_settings['excerpt'] );
				$this->assertEquals( $expected_document->get_name(), $post_settings['doc_type'] );
				$this->assertEquals( get_the_post_thumbnail_url($expected_post), $post_settings['thumbnail'] );
				$this->assertEquals( get_permalink($expected_post), $post_settings['url'] );
				$this->assertTrue( isset($post_settings['terms']) );

				// Unsetting the IDs since the export function change them.
				$post_file = ImportExportUtils::read_json_file( $extracted_zip_path . 'content/' . $post_type_key . '/' . $post_id );
				$post_content = $post_file['content'];
				$this->recursive_unset( $post_content, 'id' );

				$expected_post_content = $expected_document->get_json_meta('_elementor_data');
				$this->recursive_unset( $expected_post_content, 'id');

				$this->assertEquals( $expected_post_content, $post_content );
			}
		}

		// Cleanups
		Plugin::$instance->uploads_manager->remove_file_or_dir( $extracted_zip_path );
	}
}
