<?php

namespace Elementor\Tests\Phpunit\Elementor\Modules\Promotions;

use Elementor\Core\Base\Document;
use Elementor\Modules\Promotions\Conversion_Banner;
use ElementorEditorTesting\Elementor_Test_Base;
use ReflectionMethod;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Test_Conversion_Banner_Trigger extends Elementor_Test_Base {

	public function setUp(): void {
		parent::setUp();

		$this->act_as_admin();
		$this->reset_conversion_banner_cache();
	}

	public function tearDown(): void {
		$this->reset_conversion_banner_cache();

		parent::tearDown();
	}

	public function test_has_min_elementor_pages__returns_false_when_zero_pages() {
		// Act
		$result = $this->invoke_has_min_elementor_pages();

		// Assert
		$this->assertFalse( $result );
	}

	public function test_has_min_elementor_pages__returns_false_when_one_page() {
		// Arrange
		$this->create_published_elementor_post();

		// Act
		$result = $this->invoke_has_min_elementor_pages();

		// Assert
		$this->assertFalse( $result );
	}

	public function test_has_min_elementor_pages__returns_true_when_two_pages() {
		// Arrange
		$this->create_published_elementor_post();
		$this->create_published_elementor_post();

		// Act
		$result = $this->invoke_has_min_elementor_pages();

		// Assert
		$this->assertTrue( $result );
	}

	public function test_has_min_elementor_pages__counts_draft_posts() {
		// Arrange
		$this->create_elementor_post( 'draft' );
		$this->create_published_elementor_post();

		// Act
		$result = $this->invoke_has_min_elementor_pages();

		// Assert
		$this->assertTrue( $result );
	}

	public function test_has_min_elementor_pages__counts_two_draft_posts() {
		// Arrange
		$this->create_elementor_post( 'draft' );
		$this->create_elementor_post( 'draft' );

		// Act
		$result = $this->invoke_has_min_elementor_pages();

		// Assert
		$this->assertTrue( $result );
	}

	public function test_has_min_elementor_pages__ignores_posts_without_meta() {
		// Arrange
		$this->factory()->post->create( [
			'post_status' => 'publish',
		] );
		$this->create_published_elementor_post();

		// Act
		$result = $this->invoke_has_min_elementor_pages();

		// Assert
		$this->assertFalse( $result );
	}

	public function test_has_min_elementor_pages__uses_unlock_option_short_circuit() {
		// Arrange
		update_option( Conversion_Banner::UNLOCK_OPTION_KEY, Conversion_Banner::UNLOCK_OPTION_VALUE, true );

		// Act
		$result = $this->invoke_has_min_elementor_pages();

		// Assert
		$this->assertTrue( $result );
	}

	public function test_has_min_elementor_pages__uses_pending_transient_short_circuit() {
		// Arrange
		$this->create_published_elementor_post();
		$this->create_published_elementor_post();
		set_transient( Conversion_Banner::PENDING_TRANSIENT_KEY, 1, Conversion_Banner::PENDING_TTL );

		// Act
		$result = $this->invoke_has_min_elementor_pages();

		// Assert
		$this->assertFalse( $result );
	}

	public function test_has_min_elementor_pages__sets_unlock_option_after_crossing_threshold() {
		// Arrange
		$this->create_published_elementor_post();
		$this->create_published_elementor_post();

		// Act
		$this->invoke_has_min_elementor_pages();

		// Assert
		$this->assertSame( Conversion_Banner::UNLOCK_OPTION_VALUE, get_option( Conversion_Banner::UNLOCK_OPTION_KEY ) );
	}

	public function test_has_min_elementor_pages__sets_pending_transient_when_below_threshold() {
		// Act
		$this->invoke_has_min_elementor_pages();

		// Assert
		$this->assertNotFalse( get_transient( Conversion_Banner::PENDING_TRANSIENT_KEY ) );
	}

	public function test_maybe_invalidate_pending_cache__clears_transient_on_relevant_meta_key() {
		// Arrange
		set_transient( Conversion_Banner::PENDING_TRANSIENT_KEY, 1, Conversion_Banner::PENDING_TTL );
		$post_id = $this->factory()->post->create( [
			'post_status' => 'publish',
		] );

		// Act
		Conversion_Banner::maybe_invalidate_pending_cache( 0, $post_id, Document::BUILT_WITH_ELEMENTOR_META_KEY, 'builder' );

		// Assert
		$this->assertFalse( get_transient( Conversion_Banner::PENDING_TRANSIENT_KEY ) );
	}

	public function test_maybe_invalidate_pending_cache__ignores_unrelated_meta_key() {
		// Arrange
		set_transient( Conversion_Banner::PENDING_TRANSIENT_KEY, 1, Conversion_Banner::PENDING_TTL );
		$post_id = $this->factory()->post->create( [
			'post_status' => 'publish',
		] );

		// Act
		Conversion_Banner::maybe_invalidate_pending_cache( 0, $post_id, '_unrelated_meta', 'value' );

		// Assert
		$this->assertNotFalse( get_transient( Conversion_Banner::PENDING_TRANSIENT_KEY ) );
	}

	public function test_maybe_invalidate_pending_cache__noop_when_already_unlocked() {
		// Arrange
		update_option( Conversion_Banner::UNLOCK_OPTION_KEY, Conversion_Banner::UNLOCK_OPTION_VALUE, true );
		set_transient( Conversion_Banner::PENDING_TRANSIENT_KEY, 1, Conversion_Banner::PENDING_TTL );
		$post_id = $this->factory()->post->create( [
			'post_status' => 'publish',
		] );

		// Act
		Conversion_Banner::maybe_invalidate_pending_cache( 0, $post_id, Document::BUILT_WITH_ELEMENTOR_META_KEY, 'builder' );

		// Assert
		$this->assertNotFalse( get_transient( Conversion_Banner::PENDING_TRANSIENT_KEY ) );
	}

	private function create_published_elementor_post(): int {
		return $this->create_elementor_post( 'publish' );
	}

	private function create_elementor_post( string $post_status ): int {
		$post_id = $this->factory()->post->create( [
			'post_status' => $post_status,
		] );
		update_post_meta( $post_id, Document::BUILT_WITH_ELEMENTOR_META_KEY, 'builder' );

		return $post_id;
	}

	private function invoke_has_min_elementor_pages(): bool {
		$method = new ReflectionMethod( Conversion_Banner::class, 'has_min_elementor_pages' );
		$method->setAccessible( true );

		return $method->invoke( null );
	}

	private function reset_conversion_banner_cache(): void {
		delete_option( Conversion_Banner::UNLOCK_OPTION_KEY );
		delete_transient( Conversion_Banner::PENDING_TRANSIENT_KEY );
	}
}
