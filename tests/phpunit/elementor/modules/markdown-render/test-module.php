<?php
namespace Elementor\Testing\Modules\MarkdownRender;

use Elementor\Modules\MarkdownRender\Module;
use Elementor\Plugin;
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

	public function test_rendering_markdown_flag_defaults_to_false() {
		$this->assertFalse( Module::is_rendering_markdown() );
	}

	public function test_rendering_markdown_flag_can_be_toggled() {
		Module::set_rendering_markdown( true );
		$this->assertTrue( Module::is_rendering_markdown() );
		Module::set_rendering_markdown( false );
		$this->assertFalse( Module::is_rendering_markdown() );
	}

	public function test_rendering_markdown_flag_resets_after_render_exception() {
		$post = $this->factory()->create_and_get_default_post();
		$document = $this->getMockBuilder( \Elementor\Core\Base\Document::class )
			->disableOriginalConstructor()
			->onlyMethods( [ 'get_main_id', 'get_elements_data' ] )
			->getMock();

		$document->method( 'get_main_id' )->willReturn( $post->ID );
		$document->method( 'get_elements_data' )->willReturn( [
			[
				'id' => 'abc123',
				'elType' => 'widget',
				'widgetType' => 'heading',
				'settings' => [
					'title' => 'Hello',
				],
			],
		] );

		add_filter(
			'elementor/markdown/document_output',
			static function () {
				throw new \RuntimeException( 'markdown render failed' );
			}
		);

		$renderer = new \Elementor\Modules\MarkdownRender\Markdown_Renderer();

		try {
			$renderer->render( $document );
			$this->fail( 'Expected RuntimeException was not thrown.' );
		} catch ( \RuntimeException $exception ) {
			$this->assertSame( 'markdown render failed', $exception->getMessage() );
		} finally {
			remove_all_filters( 'elementor/markdown/document_output' );
		}

		$this->assertFalse( Module::is_rendering_markdown() );
	}

	public function test_render_elements_data_renders_nested_widgets() {
		$renderer = new \Elementor\Modules\MarkdownRender\Markdown_Renderer();
		$elements_data = [
			[
				'id' => 'heading-1',
				'elType' => 'widget',
				'widgetType' => 'heading',
				'settings' => [
					'title' => 'Nested Heading',
					'header_size' => 'h2',
				],
			],
		];

		$markdown = $renderer->render_elements_data( $elements_data );

		$this->assertStringContainsString( '## Nested Heading', $markdown );
		$this->assertFalse( Module::is_rendering_markdown() );
	}

	public function test_nested_widget_render_markdown_delegates_to_children() {
		$nested_tabs = Plugin::$instance->widgets_manager->get_widget_types( 'nested-tabs' );

		if ( ! $nested_tabs ) {
			$this->markTestSkipped( 'Nested tabs widget not available' );
		}

		$element = Plugin::$instance->elements_manager->create_element_instance( [
			'id' => 'nested-tabs-1',
			'elType' => 'widget',
			'widgetType' => 'nested-tabs',
			'settings' => [
				'tabs' => [
					[ 'tab_title' => 'Tab 1' ],
				],
			],
			'elements' => [
				[
					'id' => 'tab-container-1',
					'elType' => 'container',
					'settings' => [],
					'elements' => [
						[
							'id' => 'tab-heading-1',
							'elType' => 'widget',
							'widgetType' => 'heading',
							'settings' => [
								'title' => 'Tab Content',
								'header_size' => 'h3',
							],
						],
					],
				],
			],
		] );

		if ( ! $element ) {
			$this->markTestSkipped( 'Nested tabs element could not be created' );
		}

		$markdown = $element->render_markdown();

		$this->assertStringContainsString( '### Tab Content', $markdown );
	}

	public function test_execute_while_rendering_markdown_resets_flag_after_exception() {
		try {
			Module::execute_while_rendering_markdown( static function () {
				throw new \RuntimeException( 'markdown render failed' );
			} );
			$this->fail( 'Expected RuntimeException was not thrown.' );
		} catch ( \RuntimeException $exception ) {
			$this->assertSame( 'markdown render failed', $exception->getMessage() );
		}

		$this->assertFalse( Module::is_rendering_markdown() );
	}

	public function test_execute_while_rendering_markdown_preserves_existing_flag_state() {
		Module::set_rendering_markdown( true );

		$result = Module::execute_while_rendering_markdown( static function () {
			return Module::is_rendering_markdown();
		} );

		$this->assertTrue( $result );
		$this->assertTrue( Module::is_rendering_markdown() );

		Module::set_rendering_markdown( false );
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
