<?php
namespace Elementor\Tests\Phpunit\Elementor\Modules\CssConverter;

use ElementorEditorTesting\Elementor_Test_Base;
use Elementor\Modules\CssConverter\Routes\VariablesRoute;
use Elementor\Modules\CssConverter\Parsers\CssParser;
use Elementor\Modules\CssConverter\Parsers\ParsedCss;
use ReflectionClass;

class Test_Variables_Route extends Elementor_Test_Base {
	private $mock_parser;

	public function setUp(): void {
		parent::setUp();
		$this->act_as_admin();
		
		$this->mock_parser = $this->createMock(CssParser::class);
		$mockParsedCss = $this->createMock(ParsedCss::class);
		$this->mock_parser->method('parse')->willReturn($mockParsedCss);
		$this->mock_parser->method('extract_variables')->willReturn([]);
		
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

		$mockParser = $this->createMock(CssParser::class);
		$mockParsedCss = $this->createMock(ParsedCss::class);
		$mockParser->method('parse')->willReturn($mockParsedCss);
		$mockParser->method('extract_variables')->willReturn([
			['name' => '--primary', 'value' => '#eee'],
		]);
		$route = new VariablesRoute($mockParser);

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
        $mockParser = $this->createMock(CssParser::class);
        $mockParsedCss = $this->createMock(ParsedCss::class);
        $mockParser->method('parse')->willReturn($mockParsedCss);
        $mockParser->method('extract_variables')->willReturn([
            ['name' => '--primary', 'value' => '#eee'],
            ['name' => '--spacing', 'value' => '16px'],
        ]);
        $route = new VariablesRoute($mockParser);
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

    public function test_variables_route_class_exists() {
        $this->assertTrue( class_exists( 'Elementor\Modules\CssConverter\Routes\VariablesRoute' ) );
    }

    public function test_check_permissions_returns_boolean() {
        $route = new VariablesRoute($this->mock_parser);
        $result = $route->check_permissions();
        $this->assertIsBool( $result );
    }

    public function test_check_permissions_allows_admin() {
        $this->act_as_admin();
        $route = new VariablesRoute($this->mock_parser);
        $result = $route->check_permissions();
        $this->assertTrue( $result );
    }

    public function test_fallback_extract_css_variables() {
        $route = new VariablesRoute($this->mock_parser);
        $reflection = new ReflectionClass( $route );
        $method = $reflection->getMethod( 'fallback_extract_css_variables' );
        $method->setAccessible( true );

        $css = ':root { --primary: #007cba; --spacing-md: 16px; }';
        $result = $method->invoke( $route, $css );

        $this->assertIsArray( $result );
        $this->assertCount( 2, $result );
        $this->assertEquals( '--primary', $result[0]['name'] );
        $this->assertEquals( '#007cba', $result[0]['value'] );
        $this->assertEquals( '--spacing-md', $result[1]['name'] );
        $this->assertEquals( '16px', $result[1]['value'] );
    }

    public function test_fallback_extract_css_variables_empty_css() {
        $route = new VariablesRoute($this->mock_parser);
        $reflection = new ReflectionClass( $route );
        $method = $reflection->getMethod( 'fallback_extract_css_variables' );
        $method->setAccessible( true );

        $result = $method->invoke( $route, '' );
        $this->assertIsArray( $result );
        $this->assertEmpty( $result );
    }

    public function test_handle_variables_import_missing_parameters() {
        $route = new VariablesRoute($this->mock_parser);
        $request = new \WP_REST_Request( 'POST', '/elementor/v2/css-converter/variables' );
        $response = $route->handle_variables_import( $request );

        $this->assertEquals( 400, $response->get_status() );
        $data = $response->get_data();
        $this->assertEquals( 'Missing url or css', $data['error'] );
    }

    public function test_format_variable_label() {
        $route = new VariablesRoute($this->mock_parser);
        $reflection = new ReflectionClass( $route );
        $method = $reflection->getMethod( 'format_variable_label' );
        $method->setAccessible( true );

        $this->assertEquals( 'Primary Color', $method->invoke( $route, '--primary-color' ) );
        $this->assertEquals( 'Spacing Md', $method->invoke( $route, '--spacing-md' ) );
        $this->assertEquals( 'Background Color Primary', $method->invoke( $route, '--background-color-primary' ) );
    }

    public function test_save_editor_variables_method_exists() {
        $route = new VariablesRoute($this->mock_parser);
        $reflection = new ReflectionClass( $route );
        $this->assertTrue( $method = $reflection->hasMethod( 'save_editor_variables' ) );
        
        $method = $reflection->getMethod( 'save_editor_variables' );
        $method->setAccessible( true );
        
        $result = $method->invoke( $route, [] );
        $this->assertIsArray( $result );
    }
}

