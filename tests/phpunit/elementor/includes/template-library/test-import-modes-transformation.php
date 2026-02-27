<?php

namespace Elementor\Testing\Includes\TemplateLibrary;

use Elementor\Modules\GlobalClasses\Global_Classes_Repository;
use ElementorEditorTesting\Elementor_Test_Base;
use Spatie\Snapshots\MatchesSnapshots;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Test_Import_Modes_Transformation extends Elementor_Test_Base {
	use MatchesSnapshots;

	private static string $fixture_path;

	public static function setUpBeforeClass(): void {
		parent::setUpBeforeClass();
		self::$fixture_path = __DIR__ . '/data/fixtures/mixed-template-export.json';
	}

	public function set_up(): void {
		parent::set_up();
		$this->act_as_admin();

		Global_Classes_Repository::make()->put( [], [] );
	}

	private function load_fixture(): array {
		$json = file_get_contents( self::$fixture_path );
		return json_decode( $json, true );
	}

	private function process_import( array $data, string $import_mode ): array {
		$content = $data['content'] ?? [];

		$result = apply_filters(
			'elementor/template_library/import/process_content',
			[ 'content' => $content ],
			$import_mode,
			$data,
			null
		);

		return $result;
	}

	private function normalize_random_ids( array $data ): array {
		$json = json_encode( $data );

		$json = preg_replace( '/e-[a-f0-9]{8}-[a-f0-9]{7}/', 'e-ELEMID00-LOCAL00', $json );

		$json = preg_replace( '/g-[a-f0-9]{7}/', 'g-GLOBALID', $json );

		$json = preg_replace( '/e-gv-[a-f0-9]{7}/', 'e-gv-VARID00', $json );

		return json_decode( $json, true );
	}

	private function extract_transformation_summary( array $result, array $original_data ): array {
		$content = $result['content'] ?? [];

		$summary = [
			'classes_in_content' => $this->extract_all_class_ids( $content ),
			'global_classes_in_content' => [],
			'local_classes_in_content' => [],
			'styles_in_content' => $this->extract_all_styles( $content ),
			'updated_global_classes' => $result['updated_global_classes'] ?? null,
		];

		foreach ( $summary['classes_in_content'] as $class_id ) {
			if ( str_starts_with( $class_id, 'g-' ) ) {
				$summary['global_classes_in_content'][] = $class_id;
			} else {
				$summary['local_classes_in_content'][] = $class_id;
			}
		}

		return $summary;
	}

	private function extract_all_class_ids( array $elements ): array {
		$class_ids = [];

		foreach ( $elements as $element ) {
			$classes = $element['settings']['classes']['value'] ?? [];
			if ( is_array( $classes ) ) {
				$class_ids = array_merge( $class_ids, $classes );
			}

			$children = $element['elements'] ?? [];
			if ( ! empty( $children ) ) {
				$class_ids = array_merge( $class_ids, $this->extract_all_class_ids( $children ) );
			}
		}

		return array_unique( $class_ids );
	}

	private function extract_all_styles( array $elements ): array {
		$all_styles = [];

		foreach ( $elements as $element ) {
			$styles = $element['styles'] ?? [];
			if ( ! empty( $styles ) && is_array( $styles ) ) {
				foreach ( $styles as $style_id => $style_data ) {
					$all_styles[ $style_id ] = [
						'label' => $style_data['label'] ?? 'unknown',
						'has_variants' => ! empty( $style_data['variants'] ),
					];
				}
			}

			$children = $element['elements'] ?? [];
			if ( ! empty( $children ) ) {
				$all_styles = array_merge( $all_styles, $this->extract_all_styles( $children ) );
			}
		}

		return $all_styles;
	}

	public function test_keep_flatten_mode_transforms_correctly(): void {
		$data = $this->load_fixture();
		$result = $this->process_import( $data, 'keep_flatten' );

		$this->assertArrayHasKey( 'content', $result );

		$summary = $this->extract_transformation_summary( $result, $data );
		$this->assertEmpty( $summary['global_classes_in_content'], 'No global classes should remain after keep_flatten' );

		$original_local_count = count( $this->extract_local_styles_from_original( $data ) );
		$final_local_count = count( $summary['local_classes_in_content'] );
		$this->assertGreaterThanOrEqual( $original_local_count, $final_local_count, 'Local classes should be preserved or added' );

		$normalized_content = $this->normalize_random_ids( $result['content'] );
		$this->assertMatchesJsonSnapshot( $normalized_content );
	}

	public function test_match_site_mode_with_exact_match_preserves_id(): void {
		$data = $this->load_fixture();

		$snapshot_class = $data['global_classes']['items']['g-f83024e'];
		Global_Classes_Repository::make()->put( [
			'g-f83024e' => $snapshot_class,
		], [ 'g-f83024e' ] );

		$result = $this->process_import( $data, 'match_site' );

		$this->assertArrayHasKey( 'content', $result );

		$summary = $this->extract_transformation_summary( $result, $data );
		$this->assertContains( 'g-f83024e', $summary['global_classes_in_content'], 'Exact match should preserve global class ID' );

		$normalized_content = $this->normalize_random_ids( $result['content'] );
		$this->assertMatchesJsonSnapshot( $normalized_content );
	}

	public function test_match_site_mode_with_cross_site_name_match_remaps_id(): void {
		$data = $this->load_fixture();

		$snapshot_class = $data['global_classes']['items']['g-f83024e'];
		$existing_class = $snapshot_class;
		$existing_class['id'] = 'g-siteown';

		Global_Classes_Repository::make()->put( [
			'g-siteown' => $existing_class,
		], [ 'g-siteown' ] );

		$result = $this->process_import( $data, 'match_site' );

		$this->assertArrayHasKey( 'content', $result );

		$summary = $this->extract_transformation_summary( $result, $data );
		$this->assertContains( 'g-siteown', $summary['global_classes_in_content'], 'Name match should remap to existing class ID' );
		$this->assertNotContains( 'g-f83024e', $summary['global_classes_in_content'], 'Original remote ID should be remapped' );
	}

	public function test_match_site_mode_with_empty_site_creates_new_classes(): void {
		$data = $this->load_fixture();

		$result = $this->process_import( $data, 'match_site' );

		$this->assertArrayHasKey( 'content', $result );

		$summary = $this->extract_transformation_summary( $result, $data );

		$this->assertNotEmpty( $summary['classes_in_content'], 'Should have classes after import' );

		$normalized_content = $this->normalize_random_ids( $result['content'] );
		$this->assertMatchesJsonSnapshot( $normalized_content );
	}

	public function test_keep_create_mode_transforms_correctly(): void {
		$data = $this->load_fixture();

		Global_Classes_Repository::make()->put( [
			'g-existing' => [
				'id' => 'g-existing',
				'type' => 'class',
				'label' => 'existing',
				'variants' => [],
			],
		], [ 'g-existing' ] );

		$result = $this->process_import( $data, 'keep_create' );

		$this->assertArrayHasKey( 'content', $result );

		$summary = $this->extract_transformation_summary( $result, $data );

		$this->assertNotEmpty( $summary['classes_in_content'], 'Should have classes after import' );

		$normalized_content = $this->normalize_random_ids( $result['content'] );
		$this->assertMatchesJsonSnapshot( $normalized_content );
	}

	public function test_all_modes_preserve_local_styles(): void {
		$data = $this->load_fixture();

		foreach ( [ 'match_site', 'keep_create', 'keep_flatten' ] as $mode ) {
			Global_Classes_Repository::make()->put( [], [] );

			$result = $this->process_import( $data, $mode );
			$summary = $this->extract_transformation_summary( $result, $data );

			$original_locals = $this->extract_local_styles_from_original( $data );
			foreach ( $original_locals as $local_id ) {
				$this->assertContains(
					$local_id,
					$summary['local_classes_in_content'],
					"Mode '$mode' should preserve local class $local_id"
				);
			}
		}
	}

	private function extract_local_styles_from_original( array $data ): array {
		$content = $data['content'] ?? [];
		$all_classes = $this->extract_all_class_ids( $content );

		return array_values( array_filter( $all_classes, fn( $id ) => str_starts_with( $id, 'e-' ) ) );
	}

	public function test_keep_flatten_removes_orphaned_global_classes(): void {
		$data = $this->load_fixture();

		$result = $this->process_import( $data, 'keep_flatten' );
		$all_classes = $this->extract_all_class_ids( $result['content'] );

		$this->assertNotContains( 'g-7561cbe', $all_classes, 'Orphaned g-7561cbe should be removed' );
		$this->assertNotContains( 'g-0c98828', $all_classes, 'Orphaned g-0c98828 should be removed' );
		$this->assertNotContains( 'g-f83024e', $all_classes, 'g-f83024e should be flattened, not preserved as global' );
	}

	public function test_keep_flatten_creates_local_styles_for_snapshot_classes(): void {
		$data = $this->load_fixture();

		$result = $this->process_import( $data, 'keep_flatten' );
		$all_styles = $this->extract_all_styles( $result['content'] );

		$flattened_styles = array_filter(
			$all_styles,
			fn( $style ) => str_contains( $style['label'] ?? '', 'heading' ) || $style['label'] === 'flattened'
		);

		$this->assertNotEmpty( $flattened_styles, 'Should have created local styles from g-f83024e (heading class)' );
	}
}
