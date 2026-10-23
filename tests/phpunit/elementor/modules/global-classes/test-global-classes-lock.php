<?php
namespace Elementor\Testing\Modules\GlobalClasses;

use Elementor\Core\Kits\Documents\Kit;
use Elementor\Modules\GlobalClasses\Global_Class_Post_Type;
use Elementor\Modules\GlobalClasses\Global_Classes_Labels;
use Elementor\Modules\GlobalClasses\Global_Classes_Lock;
use Elementor\Modules\GlobalClasses\Global_Classes_Order;
use Elementor\Modules\GlobalClasses\Global_Classes_Repository;
use Elementor\Plugin;
use ElementorEditorTesting\Elementor_Test_Base;
use Elementor\Modules\GlobalClasses\Database\Migrations\Add_Capabilities;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

/**
 * The per-kit write lock serializes overlapping global-classes saves so an old (un-versioned)
 * client cannot clobber a concurrent write. These tests drive the lock through the REST layer.
 */
class Test_Global_Classes_Lock extends Elementor_Test_Base {

	/**
	 * @var Kit
	 */
	private $kit;

	private $kit_id;

	public function setUp(): void {
		parent::setUp();

		$this->register_rest_routes();

		$role = get_role( 'administrator' );
		$role->add_cap( Add_Capabilities::UPDATE_CLASS );

		( new Global_Class_Post_Type() )->register_post_type();

		$this->kit = Plugin::$instance->kits_manager->get_active_kit();
		$this->kit_id = (int) $this->kit->get_main_id();
	}

	public function tearDown(): void {
		remove_all_filters( 'pre_option_elementor_active_kit' );

		parent::tearDown();

		$role = get_role( 'administrator' );
		$role->remove_cap( Add_Capabilities::UPDATE_CLASS );

		$this->kit->delete_meta( Global_Classes_Repository::META_KEY_FRONTEND );
		$this->kit->delete_meta( Global_Classes_Repository::META_KEY_PREVIEW );
		$this->kit->delete_meta( Global_Classes_Labels::META_KEY_FRONTEND );
		$this->kit->delete_meta( Global_Classes_Labels::META_KEY_PREVIEW );
		$this->kit->delete_meta( Global_Classes_Order::META_KEY );
		$this->kit->delete_meta( Global_Classes_Repository::META_KEY_VERSION );

		$this->delete_lock_row();

		foreach ( get_posts( [
			'post_type' => Global_Class_Post_Type::CPT,
			'post_status' => 'any',
			'posts_per_page' => -1,
			'fields' => 'ids',
		] ) as $post_id ) {
			wp_delete_post( $post_id, true );
		}
	}

	public function test_put__returns_409_when_lock_is_held_and_does_not_write() {
		// Arrange - another request holds a fresh per-kit lock.
		$this->act_as_admin();
		$this->hold_lock( 0 );

		// Act.
		$response = rest_do_request( $this->put_request( [ 'g-1' ], [ 'version' => 0 ] ) );

		// Assert - could not acquire the lock within the budget -> conflict, nothing written.
		$this->assertSame( 409, $response->get_status() );
		$this->assertSame( 'global_classes_conflict', $response->get_data()['code'] );
		$this->assertArrayNotHasKey( 'g-1', ( new Global_Classes_Repository( $this->kit ) )->all_labels() );
		$this->assertNotNull( $this->lock_row(), 'The other request must keep its lock.' );
	}

	public function test_put__reclaims_an_expired_lock() {
		// Arrange - a request died while holding the lock, longer ago than the TTL.
		$this->act_as_admin();
		$this->hold_lock( Global_Classes_Lock::TTL + 5 );

		// Act.
		$response = rest_do_request( $this->put_request( [ 'g-1' ] ) );

		// Assert.
		$this->assertSame( 204, $response->get_status() );
		$this->assertArrayHasKey( 'g-1', ( new Global_Classes_Repository( $this->kit ) )->all_labels() );
		$this->assertNull( $this->lock_row() );
	}

	public function test_put__releases_lock_after_success() {
		// Arrange.
		$this->act_as_admin();

		// Act.
		$response = rest_do_request( $this->put_request( [ 'g-1' ] ) );

		// Assert.
		$this->assertSame( 204, $response->get_status() );
		$this->assertNull( $this->lock_row() );
	}

	public function test_put__releases_lock_after_a_rejected_request() {
		// Arrange - the class id does not match its key, so the request is rejected with a 400.
		$this->act_as_admin();

		$request = $this->put_request( [ 'g-1' ] );
		$params = $request->get_body_params();
		$params['items'] = [ 'g-1' => $this->create_global_class( 'g-other' ) ];
		$request->set_body_params( $params );

		// Act.
		$response = rest_do_request( $request );

		// Assert.
		$this->assertSame( 400, $response->get_status() );
		$this->assertNull( $this->lock_row() );
	}

	public function test_put__consecutive_saves_with_advancing_version_succeed() {
		// Arrange - a client that stores the version it just wrote (version + 1) on every save.
		$this->act_as_admin();

		// Act.
		$first = rest_do_request( $this->put_request( [ 'g-1' ], [ 'version' => 0 ] ) );
		$second = rest_do_request( $this->put_request( [ 'g-2' ], [ 'version' => 1, 'existing' => [ 'g-1' ] ] ) );
		$repeated_stale = rest_do_request( $this->put_request( [ 'g-3' ], [ 'version' => 1, 'existing' => [ 'g-1', 'g-2' ] ] ) );

		// Assert.
		$this->assertSame( 204, $first->get_status() );
		$this->assertSame( 204, $second->get_status() );
		$this->assertSame( 409, $repeated_stale->get_status() );
		$this->assertSame( 2, Global_Classes_Repository::make()->get_version() );
	}

	public function test_put__preview_then_frontend_save_share_one_version() {
		// Arrange - a draft save and a publish from the same client use one shared counter.
		$this->act_as_admin();

		// Act.
		$draft = rest_do_request( $this->put_request( [ 'g-1' ], [ 'version' => 0, 'context' => Global_Classes_Repository::CONTEXT_PREVIEW ] ) );
		$publish = rest_do_request( $this->put_request( [ 'g-2' ], [ 'version' => 1, 'existing' => [ 'g-1' ] ] ) );

		// Assert.
		$this->assertSame( 204, $draft->get_status() );
		$this->assertSame( 204, $publish->get_status() );
		$this->assertSame( 2, Global_Classes_Repository::make()->get_version() );
	}

	public function test_put__does_not_lock_or_conflict_when_there_is_no_kit() {
		// Arrange - no active kit, so there is no shared index to lock.
		$this->act_as_admin();
		add_filter( 'pre_option_elementor_active_kit', '__return_zero' );
		$this->register_rest_routes();
		$this->hold_lock( 0 );

		$this->assertSame( 0, (int) Plugin::$instance->kits_manager->get_active_kit()->get_main_id() );

		// Act - the version is meaningless without a kit, so a client that tracks it must not be rejected.
		$response = rest_do_request( $this->put_request( [ 'g-1' ], [ 'version' => 5 ] ) );

		// Assert - the held lock belongs to the real kit, and is not consulted without a kit.
		$this->assertNotSame( 409, $response->get_status() );
	}

	private function register_rest_routes() {
		global $wp_rest_server;

		$wp_rest_server = new \WP_REST_Server();

		do_action( 'rest_api_init' );
	}

	private function put_request( array $added_ids, array $extra = [] ): \WP_REST_Request {
		$existing = $extra['existing'] ?? [];
		unset( $extra['existing'] );

		$items = [];

		foreach ( $added_ids as $id ) {
			$items[ $id ] = $this->create_global_class( $id );
		}

		$request = new \WP_REST_Request( 'PUT', '/elementor/v1/global-classes' );
		$request->set_body_params( array_merge( [
			'items' => $items,
			'order' => array_merge( $existing, $added_ids ),
			'changes' => [
				'added' => $added_ids,
				'deleted' => [],
				'modified' => [],
			],
		], $extra ) );

		return $request;
	}

	private function hold_lock( int $age_in_seconds ) {
		global $wpdb;

		$wpdb->query( $wpdb->prepare(
			"INSERT INTO `$wpdb->options` ( `option_name`, `option_value`, `autoload` ) VALUES (%s, %s, 'off')",
			$this->lock_name(),
			( time() - $age_in_seconds ) . '|other-request'
		) );
	}

	private function lock_row() {
		global $wpdb;

		return $wpdb->get_var( $wpdb->prepare(
			"SELECT option_value FROM `$wpdb->options` WHERE option_name = %s",
			$this->lock_name()
		) );
	}

	private function delete_lock_row() {
		global $wpdb;

		$wpdb->delete( $wpdb->options, [ 'option_name' => $this->lock_name() ] );
	}

	private function lock_name(): string {
		return 'elementor_global_classes_lock_' . $this->kit_id;
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
