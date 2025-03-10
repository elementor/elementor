<?php
namespace Elementor\Tests\Phpunit\Elementor\Core\Settings\Page;

use Elementor\Core\Settings\Page\Manager;
use Elementor\Core\Utils\Exceptions;
use Elementor\Tests\Phpunit\Test_Upgrades_Trait;
use ElementorEditorTesting\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Test_Manager extends Elementor_Test_Base {

	use Test_Upgrades_Trait;

	/**
	 * @var Manager
	 */
	private $manager;

	public function setUp(): void {
		parent::setUp();
		$this->manager = new Manager();
	}

	public function tearDown(): void {
		parent::tearDown();
		$this->manager = null;
	}

	public function test_ajax_before_save_settings__contributor_can_not_delete_post_thumbnail() {
		// Arrange
		$this->act_as('contributor');

		$post_data = [
			'post_author' => get_current_user_id(),
			'post_status' => 'pending',
			'post_type' => 'post',
		];

		$document_post = $this->create_post_with_data( $post_data );

		$data = [
			'post_title' => 'Test Post Title',
			'post_excerpt' => 'Test Excerpt',
			'post_featured_image' => 'Test Featured Image',
		];

		$post_id = $document_post->get_id();

		// Assert
		$this->expectExceptionCode( Exceptions::FORBIDDEN );
		$this->expectExceptionMessage( 'You do not have permission to modify the featured image.' );

		// Act
		$this->manager->ajax_before_save_settings( $data, $post_id );
	}

	public function test_save_post_status__contributor_can_not_set_post_status_private() {
		// Arrange
		$this->act_as('contributor');

		$post_data = [
			'post_author' => get_current_user_id(),
			'post_status' => 'pending',
			'post_type' => 'post',
		];

		$document_post = $this->create_post_with_data( $post_data );
		$post_id = $document_post->get_id();

		$data = [
			'post_title' => 'Test Post Title',
			'post_excerpt' => 'Test Excerpt',
			'post_status' => 'private',
		];

		// Act
		$this->manager->ajax_before_save_settings( $data, $post_id );
		$document_post->refresh_post();
		$post_status = $document_post->get_post()->post_status;

		// Assert
		$this->assertEquals( 'pending', $post_status );
	}

	public function test_ajax_before_save_settings__admin_can_delete_post_thumbnail() {
		// Arrange
		$this->act_as_admin();

		$attachment = $this->factory()->post->create_and_get( [
			'post_type' => 'attachment',
		] );
		$post_data = [
			'post_author' => get_current_user_id(),
			'post_status' => 'publish',
			'post_type' => 'post',
			'meta_input' => [
				'_thumbnail_id' => $attachment->ID,
			],
		];
		$document_post = $this->create_post_with_data( $post_data );
		$data = [
			'post_title' => 'Test Post Title',
			'post_excerpt' => 'Test Excerpt',
			'post_status' => 'publish',
			'post_featured_image' => 'Remove Featured Image',
		];
		$post_id = $document_post->get_id();

		$this->assertEquals( get_post_thumbnail_id($post_id), $attachment->ID );

		// Act
		$this->manager->ajax_before_save_settings( $data, $post_id );

		// Assert
		$this->assertNotEquals( get_post_thumbnail_id($post_id), $attachment->ID );
		$this->assertEquals( 0, get_post_thumbnail_id($post_id));
	}

	public function test_save_post_status__admin_can_set_private_post_status() {
		// Arrange
		$this->act_as_admin();

		$post_data = [
			'post_author' => get_current_user_id(),
			'post_status' => 'pending',
			'post_type' => 'post',
		];

		$document_post = $this->create_post_with_data( $post_data );
		$post_id = $document_post->get_id();

		$data = [
			'post_title' => 'Test Post Title',
			'post_excerpt' => 'Test Excerpt',
			'post_status' => 'private',
		];

		// Act
		$this->manager->ajax_before_save_settings( $data, $post_id );
		$document_post->refresh_post();
		$post_status = $document_post->get_post()->post_status;

		// Assert
		$this->assertEquals( 'private', $post_status );
	}
}
