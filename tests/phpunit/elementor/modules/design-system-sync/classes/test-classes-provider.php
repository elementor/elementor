<?php

namespace Elementor\Modules\DesignSystemSync\Classes;

use Elementor\Modules\GlobalClasses\Global_Class_Post_Type;
use Elementor\Modules\GlobalClasses\Global_Classes_Order;
use Elementor\Modules\GlobalClasses\Global_Classes_Repository;
use Elementor\Plugin;
use ElementorEditorTesting\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * @group design-system-sync
 */
class Test_Classes_Provider extends Elementor_Test_Base {
	public function setUp(): void {
		parent::setUp();

		( new Global_Class_Post_Type() )->register_post_type();

		Classes_Provider::clear_cache();
		$this->clear_kit_classes();
	}

	public function tearDown(): void {
		Classes_Provider::clear_cache();
		$this->clear_kit_classes();

		parent::tearDown();
	}

	public function test_get_synced_classes__returns_empty_when_no_classes_exist() {
		// Act
		$result = Classes_Provider::get_synced_classes();

		// Assert
		$this->assertSame( [], $result );
	}

	public function test_get_synced_classes__returns_only_classes_with_sync_to_v3_true() {
		// Arrange
		$this->put_classes( [
			'g-1' => [
				'id' => 'g-1',
				'label' => 'Synced',
				'type' => 'class',
				'sync_to_v3' => true,
				'variants' => [],
			],
			'g-2' => [
				'id' => 'g-2',
				'label' => 'NotSynced',
				'type' => 'class',
				'sync_to_v3' => false,
				'variants' => [],
			],
			'g-3' => [
				'id' => 'g-2',
				'label' => 'NotSynced-2',
				'type' => 'class',
				'variants' => [],
			],
		] );

		// Act
		$result = Classes_Provider::get_synced_classes();

		// Assert
		$this->assertArrayHasKey( 'g-1', $result );
		$this->assertArrayNotHasKey( 'g-2', $result );
	}

	public function test_get_synced_classes__returns_empty_when_no_class_has_sync_flag() {
		// Arrange
		$this->put_classes( [
			'g-1' => [
				'id' => 'g-1',
				'label' => 'Plain',
				'type' => 'class',
				'variants' => [],
			],
		] );

		// Act
		$result = Classes_Provider::get_synced_classes();

		// Assert
		$this->assertSame( [], $result );
	}

	public function test_get_synced_classes__returns_multiple_synced_classes() {
		// Arrange
		$this->put_classes( [
			'g-1' => [
				'id' => 'g-1',
				'label' => 'Alpha',
				'type' => 'class',
				'sync_to_v3' => true,
				'variants' => [],
			],
			'g-2' => [
				'id' => 'g-2',
				'label' => 'Beta',
				'type' => 'class',
				'sync_to_v3' => true,
				'variants' => [],
			],
			'g-3' => [
				'id' => 'g-3',
				'label' => 'Gamma',
				'type' => 'class',
				'sync_to_v3' => false,
				'variants' => [],
			],
		] );

		// Act
		$result = Classes_Provider::get_synced_classes();

		// Assert
		$this->assertCount( 2, $result );
		$this->assertArrayHasKey( 'g-1', $result );
		$this->assertArrayHasKey( 'g-2', $result );
		$this->assertArrayNotHasKey( 'g-3', $result );
	}

	public function test_get_synced_classes__returns_full_class_data() {
		// Arrange
		$variants = [
			[
				'meta' => [ 'breakpoint' => 'desktop', 'state' => null ],
				'props' => [
					'font-size' => [ '$$type' => 'size', 'value' => [ 'size' => 24, 'unit' => 'px' ] ],
				],
			],
		];

		$this->put_classes( [
			'g-1' => [
				'id' => 'g-1',
				'label' => 'Heading',
				'type' => 'class',
				'sync_to_v3' => true,
				'variants' => $variants,
			],
		] );

		// Act
		$result = Classes_Provider::get_synced_classes();

		// Assert
		$this->assertArrayHasKey( 'g-1', $result );
		$this->assertSame( 'Heading', $result['g-1']['label'] );
		$this->assertSame( $variants, $result['g-1']['variants'] );
	}

	private function put_classes( array $classes ): void {
		Global_Classes_Repository::make()->put( $classes, array_keys( $classes ) );
		Classes_Provider::clear_cache();
	}

	private function clear_kit_classes(): void {
		$kit = Plugin::$instance->kits_manager->get_active_kit();

		if ( $kit ) {
			$kit->delete_meta( Global_Classes_Repository::META_KEY_FRONTEND );
			$kit->delete_meta( Global_Classes_Repository::META_KEY_PREVIEW );
			$kit->delete_meta( Global_Classes_Order::META_KEY );
			$kit->delete_meta( Global_Classes_Sync_Map::META_KEY );
		}

		$posts = get_posts( [
			'post_type' => Global_Class_Post_Type::CPT,
			'post_status' => 'any',
			'posts_per_page' => -1,
			'fields' => 'ids',
		] );

		foreach ( $posts as $post_id ) {
			wp_delete_post( $post_id, true );
		}
	}
}
