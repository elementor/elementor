<?php
namespace Elementor\Tests\Phpunit\Elementor\Modules\CssConverter;

use ElementorEditorTesting\Elementor_Test_Base;

$plugin_root = dirname( __DIR__, 5 );
require_once $plugin_root . '/modules/css-converter/routes/variables-route.php';

class Test_Variables_Route extends Elementor_Test_Base {
	public function setUp(): void {
		parent::setUp();
		$this->act_as_admin();
		do_action( 'rest_api_init' );
	}

    public function test_missing_url_or_css_returns_400() {
		$request = new \WP_REST_Request( 'POST', '/elementor/v2/css-converter/variables' );
		$response = rest_get_server()->dispatch( $request );
		$this->assertEquals( 400, $response->get_status() );
	}

	public function test_fetch_and_logs_and_variables_file() {
		$css = ':root { --primary: #eee; }';
		$url = add_query_arg( [ 'css' => rawurlencode( $css ) ], home_url( '/?mvp-css' ) );
		add_filter( 'pre_http_request', function( $pre, $args, $request_url ) use ( $url, $css ) {
			if ( 0 === strpos( $request_url, $url ) ) {
				return [ 'response' => [ 'code' => 200, 'message' => 'OK' ], 'body' => $css ];
			}
			return $pre;
		}, 10, 3 );

		$request = new \WP_REST_Request( 'POST', '/elementor/v2/css-converter/variables' );
		$request->set_param( 'url', $url );
		$response = rest_get_server()->dispatch( $request );
		$this->assertEquals( 200, $response->get_status() );
		$data = $response->get_data();
		$this->assertTrue( $data['success'] );
		$this->assertNotEmpty( $data['variables'] );
		$this->assertArrayHasKey( 'logs', $data );
		$this->assertFileExists( $data['logs']['css'] );
		$this->assertFileExists( $data['logs']['variables'] );
	}

    public function test_css_body_accepted_and_counters_returned() {
        $request = new \WP_REST_Request( 'POST', '/elementor/v2/css-converter/variables' );
        $request->set_param( 'css', ':root { --primary: #eee; --spacing: 16px; }' );
        $response = rest_get_server()->dispatch( $request );
        $this->assertEquals( 200, $response->get_status() );
        $data = $response->get_data();
        $this->assertArrayHasKey( 'stats', $data );
        $this->assertSame( 2, $data['stats']['extracted'] );
        $this->assertSame( 1, $data['stats']['converted'] );
        $this->assertSame( 1, $data['stats']['skipped'] );
    }
}


