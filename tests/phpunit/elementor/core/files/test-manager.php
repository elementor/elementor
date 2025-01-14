<?php
namespace Elementor\Tests\Phpunit\Elementor\Core\Files;

use Elementor\Core\Files\Manager;
use Elementor\Core\Page_Assets\Data_Managers\Base as Page_Assets_Data_Manager;
use ElementorEditorTesting\Elementor_Test_Base;
use WP_REST_Request;

class Test_Files_Manager extends Elementor_Test_Base {

     /** @var Manager */
     private $files_manager;

     public function setUp(): void {
         parent::setUp();
         $this->files_manager = new Manager();
     }

	/**
	 * @dataProvider site_url_change_hook_data_provider
	 *
	 * @return void
	 */
	public function test_register_actions__change_site_url( $type ) {
		// Arrange.
		remove_all_actions( "update_option_{$type}" );
		update_option( Page_Assets_Data_Manager::ASSETS_DATA_KEY, 'test-value' );

		$manager = new Manager();

		// Act.
		do_action( "update_option_{$type}" );

		// Assert.
		$this->assertFalse( get_option( Page_Assets_Data_Manager::ASSETS_DATA_KEY ) );
	}

	public function site_url_change_hook_data_provider() {
		return [
			[ 'siteurl' ],
			[ 'home' ],
		];
	}

    public function test_rest_clear_cache_unauthorized() {
        // Arrange
        do_action( 'rest_api_init' );

        $request = new WP_REST_Request('DELETE', '/elementor/v1/cache');

        // Act
        $response = rest_do_request($request);

        // Assert
        $this->assertEquals(401, $response->get_status());
    }


    public function test_rest_clear_cache_forbidden() {
        // Arrange
        do_action( 'rest_api_init' );

        $this->act_as_editor();

        $request = new WP_REST_Request('DELETE', '/elementor/v1/cache');

        // Act
        $response = rest_do_request($request);

        // Assert
        $this->assertEquals(403, $response->get_status());
    }

    public function test_rest_clear_cache_authorized() {
        // Arrange
        do_action( 'rest_api_init' );

        $this->act_as_admin();

        $request = new WP_REST_Request('DELETE', '/elementor/v1/cache');

        // Act
        $response = rest_do_request($request);

        // Assert
        $this->assertEquals(200, $response->get_status());
    }
}
