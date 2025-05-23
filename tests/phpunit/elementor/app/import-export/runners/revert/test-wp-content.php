<?php
namespace Elementor\Tests\Phpunit\Elementor\App\ImportExport\Runners\Revert;

use Elementor\App\Modules\ImportExport\Module;
use Elementor\App\Modules\ImportExport\Runners\Revert\Wp_Content;
use ElementorEditorTesting\Elementor_Test_Base;

class Test_Wp_Content extends Elementor_Test_Base {

	public function test_revert__revert_nav_menus() {
		// Arrange
		$session_id = 'test_session_id';

		$nav_menu_term = $this->factory()->term->create_and_get( [ 'taxonomy' => 'nav_menu' ] );
		update_term_meta( $nav_menu_term->term_id, Module::META_KEY_ELEMENTOR_IMPORT_SESSION_ID, $session_id );

		$data = [
			'session_id' => $session_id,
			'runners' => [
				'wp-content' => [],
			]
		];

		$wp_content_runner = new Wp_Content();

		// Act
		$wp_content_runner->revert( $data );

		// Assert
		$this->assertNull( get_term( $nav_menu_term->term_id ) );
	}
}
