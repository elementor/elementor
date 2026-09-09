<?php
namespace Elementor\Testing\Modules\GlobalClasses;

use Elementor\Core\Kits\Documents\Kit;
use Elementor\Modules\GlobalClasses\Global_Class_Post_Type;
use Elementor\Modules\GlobalClasses\Global_Classes_Labels;
use Elementor\Modules\GlobalClasses\Global_Classes_Order;
use Elementor\Modules\GlobalClasses\Global_Classes_Repository;
use Elementor\Modules\GlobalClasses\Global_Classes_REST_API;
use Elementor\Plugin;
use ElementorEditorTesting\Elementor_Test_Base;
use Elementor\Modules\GlobalClasses\Database\Migrations\Add_Capabilities;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

/**
 * The per-kit write lock serializes overlapping global-classes saves so an old (un-versioned)
 * client cannot clobber a concurrent write. These tests drive the lock through the cache
 * primitives the REST layer uses.
 */
class Test_Global_Classes_Lock extends Elementor_Test_Base {

	/**
	 * @var Kit
	 */
	private $kit;

	private $kit_id;

	public function setUp(): void {
		parent::setUp();

		global $wp_rest_server;

		$wp_rest_server = new \WP_REST_Server();

		$role = get_role( 'administrator' );
		$role->add_cap( Add_Capabilities::UPDATE_CLASS );

		do_action( 'rest_api_init' );

		( new Global_Class_Post_Type() )->register_post_type();

		$this->kit = Plugin::$instance->kits_manager->get_active_kit();
		$this->kit_id = (int) $this->kit->get_main_id();
	}

	public function tearDown(): void {
		parent::tearDown();

		$role = get_role( 'administrator' );
		$role->remove_cap( Add_Capabilities::UPDATE_CLASS );

		$this->kit->delete_meta( Global_Classes_Repository::META_KEY_FRONTEND );
		$this->kit->delete_meta( Global_Classes_Repository::META_KEY_PREVIEW );
		$this->kit->delete_meta( Global_Classes_Labels::META_KEY_FRONTEND );
		$this->kit->delete_meta( Global_Classes_Labels::META_KEY_PREVIEW );
		$this->kit->delete_meta( Global_Classes_Order::META_KEY );
		$this->kit->delete_meta( Global_Classes_Repository::META_KEY_VERSION );

		wp_cache_delete( $this->lock_key(), Global_Classes_REST_API::LOCK_GROUP );

		foreach ( get_posts( [
			'post_type' => Global_Class_Post_Type::CPT,
			'post_status' => 'any',
			'posts_per_page' => -1,
			'fields' => 'ids',
		] ) as $post_id ) {
			wp_delete_post( $post_id, true );
		}
	}

	public function test_put__times_out_when_lock_is_held_and_returns_409() {
		// Arrange - another request holds the per-kit lock (stale lock left behind).
		$this->act_as_admin();
		wp_cache_add( $this->lock_key(), 'other-request-token', Global_Classes_REST_API::LOCK_GROUP );

		$class = $this->create_global_class( 'g-1' );

		$request = new \WP_REST_Request( 'PUT', '/elementor/v1/global-classes' );
		$request->set_body_params( [
			'items' => [ 'g-1' => $class ],
			'order' => [ 'g-1' ],
			'changes' => [ 'added' => [ 'g-1' ], 'deleted' => [], 'modified' => [] ],
		] );

		// Act.
		$response = rest_do_request( $request );

		// Assert - could not acquire the lock within the budget -> conflict, nothing written.
		$this->assertSame( 409, $response->get_status() );
		$this->assertSame( 'global_classes_conflict', $response->get_data()['code'] );
		$snapshot = ( new Global_Classes_Repository( $this->kit ) )->all_labels();
		$this->assertArrayNotHasKey( 'g-1', $snapshot );
	}

	public function test_put__succeeds_when_lock_is_released() {
		// Arrange - a lock held then released is not blocking.
		$this->act_as_admin();
		wp_cache_add( $this->lock_key(), 'other-request-token', Global_Classes_REST_API::LOCK_GROUP );
		wp_cache_delete( $this->lock_key(), Global_Classes_REST_API::LOCK_GROUP );

		$class = $this->create_global_class( 'g-1' );

		$request = new \WP_REST_Request( 'PUT', '/elementor/v1/global-classes' );
		$request->set_body_params( [
			'items' => [ 'g-1' => $class ],
			'order' => [ 'g-1' ],
			'changes' => [ 'added' => [ 'g-1' ], 'deleted' => [], 'modified' => [] ],
		] );

		// Act.
		$response = rest_do_request( $request );

		// Assert.
		$this->assertSame( 204, $response->get_status() );
		$snapshot = ( new Global_Classes_Repository( $this->kit ) )->all_labels();
		$this->assertArrayHasKey( 'g-1', $snapshot );
	}

	private function lock_key(): string {
		return 'elementor_global_classes_' . $this->kit_id;
	}

	private function create_global_class( string $id ) {
		return [
			'id' => $id,
			'label' => $id,
			'type' => 'class',
			'variants' => [],
		];
	}
}
