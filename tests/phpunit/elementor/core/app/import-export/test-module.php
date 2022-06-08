<?php
namespace Elementor\Tests\Phpunit\Elementor\Core\App\ImportExport;

use ElementorEditorTesting\Elementor_Test_Base;
use Elementor\Core\App\Modules\ImportExport\Module;

class Test_Module extends Elementor_Test_Base {

	public function test_handle_homepage_conflict__homepage_has_no_conflict() {
        // Arrange
		$result['manifest']['content']['page'] = [
			123456 => [
                'title' => 'Page Title',
            ],
		];

		// Act
		$module = new Module();
        $result = $module->handle_homepage_conflict( $result );

		// Assert
        if ( array_key_exists( 'conflicts', $result ) ) {
            $this->assertArrayNotHasKey( 'homepage', $result['conflicts'] );
        } else {
            $this->assertArrayNotHasKey( 'conflicts', $result );
        }
	}

    public function test_handle_homepage_conflict__homepage_has_conflict() {
        // Arrange
        $imported_id = 123456;
        $old_homepage_id = get_option( 'page_on_front' );
        $document = self::factory()->create_post();

        update_option( 'page_on_front', $document->get_id() );

        // Mock Conflict page data
		$result['manifest']['content']['page'] = [
			$imported_id => [
                'show_on_front' => true,
            ],
		];

        // Act
		$module = new Module();
        $result = $module->handle_homepage_conflict( $result );

        // Back to old state
        update_option( 'page_on_front', $old_homepage_id );

        $this->assertEquals( $imported_id, $result['conflicts']['homepage']['imported_id'] );
    }

    public function test_handle_homepage_conflict__homepage_has_conflict_with_posts_page() {
        // Arrange
        $imported_id = 123456;
        $old_homepage_id = get_option( 'page_on_front' );
        update_option( 'page_on_front', 0 );

        // Mock Conflict page data
		$result['manifest']['content']['page'] = [
			123456 => [
                'show_on_front' => true,
            ],
		];

        // Act
		$module = new Module();
        $result = $module->handle_homepage_conflict( $result );

        // Back to old state
        update_option( 'page_on_front', $old_homepage_id );

        // Assert
        $this->assertEquals( 0, $result['conflicts']['homepage']['id'] );
        $this->assertEquals( $imported_id, $result['conflicts']['homepage']['imported_id'] );
    }
}
