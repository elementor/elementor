<?php
namespace Elementor\Tests\Phpunit;

use Elementor\Core\Base\Document;
use Elementor\Core\Upgrade\Manager;
use Elementor\Core\Upgrade\Updater;
use Elementor\Tests\Phpunit\Elementor\Modules\Usage\Test_Module;

trait Test_Upgrades_Trait {

	// Create revisions.
	protected $revisions_count = 10;
	protected $query_limit = 3;

	/**
	 * @return Updater
	 */
	protected function create_updater() {
		$upgrades_manager = new Manager();

		/** @var Updater $updater */
		$updater = $upgrades_manager->get_task_runner();

		$updater->set_current_item( [
			'iterate_num' => 1,
		] );

		return $updater;
	}

	/**
	 * @param string $post_type
	 *
	 * @return Document|false
	 */
	protected function create_post( $post_type = 'post' ) {
		$admin = $this->factory()->create_and_get_administrator_user();

		wp_set_current_user( $admin->ID );

		$post = $this->factory()->create_and_get_custom_post( [
			'post_author' => $admin->ID,
			'post_type' => $post_type,
		] );

		$document = self::elementor()->documents->get( $post->ID );
		$document->save_template_type();

		return $document;
	}

	protected function create_post_with_data( $data = [ 'post_author' => null, 'post_type' => 'post' ] ) {

		if ( $data['post_author'] === null ) {
			$admin = $this->factory()->create_and_get_administrator_user();

			$data = [
				'post_author' => $admin->ID,
			];
		}

		wp_set_current_user( $data[ 'post_author' ] );

		$post = $this->factory()->create_and_get_custom_post( $data );

		$document = self::elementor()->documents->get( $post->ID );
		$document->save_template_type();

		return $document;
	}

	/**
	 * @param array|null $data Optional
	 *
	 * @return Document|false
	 */
	protected function create_document_with_data( $data = null ) {
		$document = $this->create_post();

		if ( ! $data ) {
			$data = Test_Module::$document_mock_default;
		}

		// Save document.
		$document->save( $data );

		return $document;
	}
}
