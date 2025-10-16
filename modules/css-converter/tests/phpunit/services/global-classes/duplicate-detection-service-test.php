<?php
namespace Elementor\Modules\CssConverter\Tests\Services\GlobalClasses;

use Elementor\Modules\CssConverter\Services\GlobalClasses\Duplicate_Detection_Service;
use Elementor\Modules\CssConverter\Services\GlobalClasses\Class_Comparison_Service;
use WP_UnitTestCase;

class Duplicate_Detection_Service_Test extends WP_UnitTestCase {
	private $service;

	public function setUp(): void {
		parent::setUp();
		$this->service = new Duplicate_Detection_Service();
	}

	public function test_reuses_identical_class() {
		$existing_classes = [
			'g-abc123' => $this->create_class( 'button', [
				'color' => [ '$$type' => 'color', 'value' => '#ff0000' ],
			] ),
		];

		$new_class = $this->create_class( 'button', [
			'color' => [ '$$type' => 'color', 'value' => '#ff0000' ],
		] );

		$result = $this->service->find_or_create_class( $new_class, $existing_classes );

		$this->assertEquals( 'reused', $result['action'] );
		$this->assertEquals( 'g-abc123', $result['class_id'] );
		$this->assertEquals( 'button', $result['class_label'] );
	}

	public function test_creates_new_class_with_different_properties() {
		$existing_classes = [
			'g-abc123' => $this->create_class( 'button', [
				'color' => [ '$$type' => 'color', 'value' => '#ff0000' ],
			] ),
		];

		$new_class = $this->create_class( 'button', [
			'color' => [ '$$type' => 'color', 'value' => '#00ff00' ],
		] );

		$result = $this->service->find_or_create_class( $new_class, $existing_classes );

		$this->assertEquals( 'created', $result['action'] );
		$this->assertEquals( 'button-1', $result['class_data']['label'] );
		$this->assertEquals( 'button', $result['original_label'] );
		$this->assertEquals( 1, $result['applied_suffix'] );
	}

	public function test_finds_next_available_suffix() {
		$existing_classes = [
			'g-abc123' => $this->create_class( 'button', [ 'color' => [ '$$type' => 'color', 'value' => '#ff0000' ] ] ),
			'g-def456' => $this->create_class( 'button-1', [ 'color' => [ '$$type' => 'color', 'value' => '#00ff00' ] ] ),
			'g-ghi789' => $this->create_class( 'button-2', [ 'color' => [ '$$type' => 'color', 'value' => '#0000ff' ] ] ),
		];

		$new_class = $this->create_class( 'button', [
			'color' => [ '$$type' => 'color', 'value' => '#ffff00' ],
		] );

		$result = $this->service->find_or_create_class( $new_class, $existing_classes );

		$this->assertEquals( 'created', $result['action'] );
		$this->assertEquals( 'button-3', $result['class_data']['label'] );
	}

	public function test_reuses_suffixed_variant_when_matches() {
		$existing_classes = [
			'g-abc123' => $this->create_class( 'button', [ 'color' => [ '$$type' => 'color', 'value' => '#ff0000' ] ] ),
			'g-def456' => $this->create_class( 'button-1', [ 'color' => [ '$$type' => 'color', 'value' => '#00ff00' ] ] ),
		];

		$new_class = $this->create_class( 'button', [
			'color' => [ '$$type' => 'color', 'value' => '#00ff00' ],
		] );

		$result = $this->service->find_or_create_class( $new_class, $existing_classes );

		$this->assertEquals( 'reused', $result['action'] );
		$this->assertEquals( 'g-def456', $result['class_id'] );
		$this->assertEquals( 'button-1', $result['class_label'] );
	}

	public function test_handles_empty_existing_classes() {
		$existing_classes = [];

		$new_class = $this->create_class( 'button', [
			'color' => [ '$$type' => 'color', 'value' => '#ff0000' ],
		] );

		$result = $this->service->find_or_create_class( $new_class, $existing_classes );

		$this->assertEquals( 'created', $result['action'] );
		$this->assertEquals( 'button-1', $result['class_data']['label'] );
	}

	public function test_suffix_handles_gaps() {
		$existing_classes = [
			'g-abc123' => $this->create_class( 'button', [ 'color' => [ '$$type' => 'color', 'value' => '#ff0000' ] ] ),
			'g-def456' => $this->create_class( 'button-5', [ 'color' => [ '$$type' => 'color', 'value' => '#00ff00' ] ] ),
		];

		$new_class = $this->create_class( 'button', [
			'color' => [ '$$type' => 'color', 'value' => '#0000ff' ],
		] );

		$result = $this->service->find_or_create_class( $new_class, $existing_classes );

		$this->assertEquals( 'created', $result['action'] );
		$this->assertEquals( 'button-6', $result['class_data']['label'] );
	}

	public function test_extract_base_label_from_suffixed() {
		$new_class = $this->create_class( 'button-1', [
			'color' => [ '$$type' => 'color', 'value' => '#ff0000' ],
		] );

		$existing_classes = [
			'g-abc123' => $this->create_class( 'button', [ 'color' => [ '$$type' => 'color', 'value' => '#ff0000' ] ] ),
		];

		$result = $this->service->find_or_create_class( $new_class, $existing_classes );

		$this->assertEquals( 'reused', $result['action'] );
		$this->assertEquals( 'button', $result['class_label'] );
	}

	public function test_performance_logging() {
		$existing_classes = [
			'g-abc123' => $this->create_class( 'button', [ 'color' => [ '$$type' => 'color', 'value' => '#ff0000' ] ] ),
		];

		$new_class = $this->create_class( 'button', [
			'color' => [ '$$type' => 'color', 'value' => '#ff0000' ],
		] );

		$this->service->find_or_create_class( $new_class, $existing_classes );

		$stats = $this->service->get_performance_stats();

		$this->assertEquals( 1, $stats['total_comparisons'] );
		$this->assertGreaterThan( 0, $stats['total_time'] );
		$this->assertEquals( 1, $stats['reused_count'] );
		$this->assertEquals( 0, $stats['created_count'] );
	}

	public function test_case_insensitive_label_matching() {
		$existing_classes = [
			'g-abc123' => $this->create_class( 'Button', [ 'color' => [ '$$type' => 'color', 'value' => '#ff0000' ] ] ),
		];

		$new_class = $this->create_class( 'button', [
			'color' => [ '$$type' => 'color', 'value' => '#ff0000' ],
		] );

		$result = $this->service->find_or_create_class( $new_class, $existing_classes );

		$this->assertEquals( 'reused', $result['action'] );
	}

	private function create_class( string $label, array $props ): array {
		return [
			'id' => 'g-' . wp_generate_password( 7, false ),
			'label' => $label,
			'type' => 'class',
			'variants' => [
				[
					'meta' => [
						'breakpoint' => 'desktop',
						'state' => null,
					],
					'props' => $props,
					'custom_css' => null,
				],
			],
		];
	}
}

