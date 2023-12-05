<?php
namespace Elementor\Testing\Includes\TemplateLibrary;

use ElementorEditorTesting\Elementor_Test_Base;

class Elementor_Test_Manager_Remote extends Elementor_Test_Base {
	const ELEMENTOR_LIBRARY_REMOTE_META_KEY = 'elementor_library_remote';
	const FAVORITES = 'favorites';

	/**
	 * @var \Elementor\TemplateLibrary\Manager
	 */
	protected static $manager;
	private $fake_template_id = '777';
	private $second_fake_template_id = '123';



	public static function setUpBeforeClass(): void {
		self::$manager = self::elementor()->templates_manager;
	}

	public function test_should_mark_template_as_favorite() {
		$user = $this->act_as_admin();
		$this->mark_template_as_favorite( $this->fake_template_id, true );

		$user_meta = get_user_meta( $user->ID, static::ELEMENTOR_LIBRARY_REMOTE_META_KEY, true );
		$this->assertTrue( $user_meta[ self::FAVORITES ][ $this->fake_template_id ] );
	}

	public function test_should_mark_multiple_templates_as_favorite() {
		$user = $this->act_as_admin();
		$this->mark_template_as_favorite( $this->fake_template_id, true );
		$this->mark_template_as_favorite( $this->second_fake_template_id, true );
		$user_meta = get_user_meta( $user->ID, self::ELEMENTOR_LIBRARY_REMOTE_META_KEY, true );
		$this->assertTrue( $user_meta[ self::FAVORITES ][ $this->fake_template_id ] );
		$this->assertTrue( $user_meta[ self::FAVORITES ][ $this->second_fake_template_id ] );
	}

	public function test_should_unmark_favorite_template() {
		$user = $this->act_as_admin();
		$this->mark_template_as_favorite( $this->fake_template_id, true );
		$this->mark_template_as_favorite( $this->second_fake_template_id, true );
		$this->mark_template_as_favorite( $this->fake_template_id, false );
		$user_meta = get_user_meta( $user->ID, self::ELEMENTOR_LIBRARY_REMOTE_META_KEY, true );
		$this->assertTrue( $user_meta[ self::FAVORITES ][ $this->second_fake_template_id ] );
		$this->assertCount( 1, $user_meta[ self::FAVORITES ] );
	}

	public function test_should_return_source() {
		$this->assertInstanceOf( '\Elementor\TemplateLibrary\Source_Remote', self::$manager->get_source( 'remote' ) );
	}

	public function test_should_return_wp_error_from_save_template() {
		$template_data = [
			'post_id' => $this->fake_template_id,
			'source' => 'remote',
			'content' => 'content',
			'type' => 'page',
		];

		$this->assertWPError( self::$manager->save_template( $template_data ), 'cannot save template from remote source' );
	}

	public function test_should_return_wp_error_from_update_template() {
		wp_set_current_user( $this->factory()->get_administrator_user()->ID );
		$template_data = [
			'source' => 'remote',
			'content' => 'content',
			'type' => 'comment',
			'id' => $this->fake_template_id,
		];

		$this->assertWPError( self::$manager->update_template( $template_data ), 'cannot update template from remote source' );
	}

	public function test_should_return_wp_error_from_delete_template() {
		$this->assertWPError(
			self::$manager->delete_template(
				[
					'source' => 'remote',
					'template_id' => $this->fake_template_id,
				]
			), 'cannot delete template from remote source'
		);

	}

	private function mark_template_as_favorite( $template_id, $is_favorite ) {
		self::$manager->mark_template_as_favorite(
			[
				'source' => 'remote',
				'template_id' => $template_id,
				'favorite' => $is_favorite,
			]
		);
	}
}
