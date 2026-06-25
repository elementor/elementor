<?php
namespace Elementor\Testing\Modules\MarkdownRender;

use Elementor\Modules\MarkdownRender\Module;
use ElementorEditorTesting\Elementor_Test_Base;

class Test_Module extends Elementor_Test_Base {

	public function test_experiment_is_registered() {
		// Arrange
		$data = Module::get_experimental_data();

		// Act & Assert
		$this->assertEquals( 'markdown_rendering', $data['name'] );
		$this->assertEquals( 'inactive', $data['default'] );
		$this->assertEquals( 'alpha', $data['release_status'] );
	}

	public function test_cache_meta_key_is_defined() {
		// Assert
		$this->assertEquals( '_elementor_markdown_cache', Module::CACHE_META_KEY );
	}

	public function test_non_markdown_request_does_not_intercept() {
		// Arrange
		unset( $_GET['format'] );
		unset( $_SERVER['HTTP_ACCEPT'] );
		$module = new Module();

		// Act
		ob_start();
		$module->maybe_serve_markdown();
		$output = ob_get_clean();

		// Assert
		$this->assertSame( '', $output );
	}

	public function test_format_query_param_is_recognized_as_markdown_request() {
		// Arrange
		$_GET['format'] = 'markdown';
		unset( $_SERVER['HTTP_ACCEPT'] );
		$module = new Module();
		$method = new \ReflectionMethod( Module::class, 'is_markdown_request' );
		$method->setAccessible( true );

		// Act
		$result = $method->invoke( $module );

		// Cleanup
		unset( $_GET['format'] );

		// Assert
		$this->assertTrue( $result );
	}

	public function test_accept_header_is_recognized_as_markdown_request() {
		// Arrange
		unset( $_GET['format'] );
		$_SERVER['HTTP_ACCEPT'] = 'text/markdown, text/html;q=0.9';
		$module = new Module();
		$method = new \ReflectionMethod( Module::class, 'is_markdown_request' );
		$method->setAccessible( true );

		// Act
		$result = $method->invoke( $module );

		// Cleanup
		unset( $_SERVER['HTTP_ACCEPT'] );

		// Assert
		$this->assertTrue( $result );
	}

	public function test_cache_invalidation_hooks_are_registered() {
		// Arrange
		$module = new Module();

		// Assert
		$this->assertNotFalse( has_action( 'save_post', [ $module, 'clear_post_markdown_cache' ] ) );
		$this->assertNotFalse( has_action( 'elementor/core/files/clear_cache', [ $module, 'clear_all_markdown_cache' ] ) );
		$this->assertNotFalse( has_action( 'activated_plugin', [ $module, 'clear_all_markdown_cache' ] ) );
		$this->assertNotFalse( has_action( 'deactivated_plugin', [ $module, 'clear_all_markdown_cache' ] ) );
		$this->assertNotFalse( has_action( 'switch_theme', [ $module, 'clear_all_markdown_cache' ] ) );
	}
}
