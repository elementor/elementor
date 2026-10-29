<?php
namespace Elementor\Testing\Modules\GlobalClasses;

use Elementor\Modules\GlobalClasses\Global_Classes_Save_Lock;
use ElementorEditorTesting\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

require_once ABSPATH . 'wp-admin/includes/class-wp-upgrader.php';

class Test_Global_Classes_Save_Lock extends Elementor_Test_Base {

	const NO_WAIT_SECONDS = 0;

	private Global_Classes_Save_Lock $lock;

	public function setUp(): void {
		parent::setUp();

		$this->lock = new Global_Classes_Save_Lock( self::NO_WAIT_SECONDS );
	}

	public function tearDown(): void {
		\WP_Upgrader::release_lock( Global_Classes_Save_Lock::LOCK_NAME );

		parent::tearDown();
	}

	public function test_run__returns_callback_result_and_releases_lock() {
		// Arrange.
		$is_locked_during_callback = false;

		// Act.
		$result = $this->lock->run(
			function () use ( &$is_locked_during_callback ) {
				$is_locked_during_callback = $this->is_locked();

				return 'saved';
			},
			fn() => 'busy'
		);

		// Assert.
		$this->assertSame( 'saved', $result );
		$this->assertTrue( $is_locked_during_callback );
		$this->assertFalse( $this->is_locked() );
	}

	public function test_run__releases_lock_when_callback_throws() {
		// Arrange.
		$callback = function () {
			throw new \Exception( 'Save failed' );
		};

		// Act.
		try {
			$this->lock->run( $callback, fn() => 'busy' );
		} catch ( \Exception $e ) {
			$caught = $e;
		}

		// Assert.
		$this->assertSame( 'Save failed', $caught->getMessage() );
		$this->assertFalse( $this->is_locked() );
	}

	public function test_run__calls_on_busy_without_running_callback_when_lock_is_held() {
		// Arrange.
		\WP_Upgrader::create_lock( Global_Classes_Save_Lock::LOCK_NAME, Global_Classes_Save_Lock::RELEASE_TIMEOUT_SECONDS );
		$is_callback_called = false;

		// Act.
		$result = $this->lock->run(
			function () use ( &$is_callback_called ) {
				$is_callback_called = true;
			},
			fn() => 'busy'
		);

		// Assert.
		$this->assertSame( 'busy', $result );
		$this->assertFalse( $is_callback_called );
		$this->assertTrue( $this->is_locked() );
	}

	public function test_run__reclaims_lock_abandoned_longer_than_release_timeout() {
		// Arrange.
		$abandoned_at = time() - Global_Classes_Save_Lock::RELEASE_TIMEOUT_SECONDS - 1;
		update_option( Global_Classes_Save_Lock::LOCK_NAME . '.lock', $abandoned_at, false );

		// Act.
		$result = $this->lock->run( fn() => 'saved', fn() => 'busy' );

		// Assert.
		$this->assertSame( 'saved', $result );
		$this->assertFalse( $this->is_locked() );
	}

	public function test_run__reads_data_committed_after_it_was_cached_by_the_same_request() {
		// Arrange.
		global $wpdb;

		$post_id = $this->factory()->post->create();
		update_post_meta( $post_id, 'ed_global_classes_order', 'before' );
		get_post_meta( $post_id, 'ed_global_classes_order', true );

		$wpdb->update(
			$wpdb->postmeta,
			[ 'meta_value' => 'committed-by-another-request' ],
			[
				'post_id' => $post_id,
				'meta_key' => 'ed_global_classes_order',
			]
		);

		// Act.
		$result = $this->lock->run(
			fn() => get_post_meta( $post_id, 'ed_global_classes_order', true ),
			fn() => 'busy'
		);

		// Assert.
		$this->assertSame( 'committed-by-another-request', $result );
	}

	private function is_locked(): bool {
		return false !== get_option( Global_Classes_Save_Lock::LOCK_NAME . '.lock' );
	}
}
