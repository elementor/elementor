<?php
namespace Elementor\Testing\Modules\LazyLoad;

use ElementorEditorTesting\Elementor_Test_Base;
use Elementor\Modules\LazyLoad\Module as LazyLoad;
use Elementor\Plugin;
use Elementor\Testing\Modules\LazyLoadֿ\Mocks\Document;

require_once __DIR__ . '/mocks/document.php';

class Elementor_Test_LazyLoad extends Elementor_Test_Base {

	public function test_remove_background_image() {

		//Arrange
		$reflection = new \ReflectionClass( LazyLoad::class );
		$method = $reflection->getMethod( 'append_lazyload_selector' );
		$method->setAccessible( true );
		$lazyload = new LazyLoad();
		
		$control = [
			'selectors' => [
				'{{WRAPPER}}' => 'background-image: url("{{URL}}");',
			],
			'background_lazyload' => [
				'active' => true,
			],
		];

		$values = [
			'url' => "test.jpg",
			'id' => 747,
		];

		//Act
		$control = $method->invokeArgs( $lazyload, [ $control, $values ] );

		//Assert
		$this->assertEquals( $control['selectors']['{{WRAPPER}}'], 'background-image: var(--e-bg-lazyload-loaded);--e-bg-lazyload: url("test.jpg");' );
	}

	function test_document_support_lazyload() {

		//Arrange 
		$post = $this->factory()->create_and_get_custom_post( [
			'post_type' => 'test-document',
		] );
		
		$document = new Document([
			'post_id' => $post->ID
		]);

		$document->save_template_type( 'test-document' );

		// Mock current post.
		$GLOBALS['post'] = $post;

		//register document type as current post type
		Plugin::$instance->documents->register_document_type( 'test-document', Document::get_class_full_name() );
		Plugin::$instance->documents->switch_to_document( $document );

		//Act
		ob_start();

		$document->print_elements_with_wrapper( [
			[
				'id' => 0,
				'elType' => 'section',
				'settings' => [
					'background_image' => [
						'url' => 'test.jpg',
						'id' => 1,
					],
					'background_background' => 'classic',
				],
			],
		]);

		$content = ob_get_clean();

		$lazyload_attr = strpos( $content, 'data-e-bg-lazyload' );

		$this->assertFalse( $lazyload_attr );
	}
}

