<?php

namespace Elementor\Testing\Modules\AtomicWidgets\TemplateRenderer;

use Elementor\Modules\AtomicWidgets\Elements\Atomic_Widget_Base;
use Elementor\Modules\AtomicWidgets\Elements\Has_Template;
use Elementor\Modules\AtomicWidgets\Styles\Style_Definition;
use Elementor\Modules\AtomicWidgets\TemplateRenderer\Template_Renderer;
use ElementorEditorTesting\Elementor_Test_Base;
use Spatie\Snapshots\MatchesSnapshots;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Test_Template_Renderer extends Elementor_Test_Base {
	use MatchesSnapshots;

	public static function set_up_before_class() {
		parent::set_up_before_class();

		Template_Renderer::reset();
	}

	public function tear_down() {
		parent::tear_down();

		Template_Renderer::reset();
	}

	public function test_render__basic_template() {
		// Arrange.
		$widget = $this->make_mock_widget( [
			'templates' => [
				'elementor/elements/test' => __DIR__ . '/mocks/basic.html.twig'
			],
			'settings' => [
				'classes' => [ 'class1', 'class2' ],
				'title' => 'This is my title',
			],
		] );

		// Act.
		ob_start();

		$widget->render_content();

		$content = ob_get_clean();

		// Assert.
		$this->assertMatchesSnapshot( $content );
	}

	public function test_render__multiple_templates() {
		// Arrange.
		$widget = $this->make_mock_widget( [
			'templates' => [
				'elementor/parts/part' => __DIR__ . '/mocks/part.html.twig',
				'elementor/elements/test' => __DIR__ . '/mocks/with-part.html.twig',
			],
			'main' => 'elementor/elements/test',
			'settings' => [
				'classes' => null,
				'title' => 'This is my title',
			],
		] );

		// Act.
		ob_start();

		$widget->render_content();

		$content = ob_get_clean();

		// Assert.
		$this->assertMatchesSnapshot( $content );
	}

	public function test_render__multiple_templates_without_main() {
		// Arrange.
		$widget = $this->make_mock_widget( [
			'templates' => [
				'elementor/parts/part' => __DIR__ . '/mocks/part.html.twig',
				'elementor/elements/test' => __DIR__ . '/mocks/with-part.html.twig',
			],
			'settings' => [
				'title' => 'This is my title',
			],
		] );

		// Expect.
		$this->expectException( \Exception::class );
		$this->expectExceptionMessage( 'When having more than one template, you should override this method to return the main template.' );

		// Act.
		try {
			$widget->render_content();
		} finally {
			ob_end_clean();
		}
	}

	public function test_render__template_file_not_exists() {
		// Arrange.
		$widget = $this->make_mock_widget( [
			'templates' => [
				'elementor/elements/test' => __DIR__ . '/mocks/not-exists.html.twig'
			],
			'settings' => [
				'title' => 'This is my title',
			],
		] );

		// Expect.
		$this->expectException( \Exception::class );
		$this->expectExceptionMessage( 'Invalid template' );

		// Act.
		try {
			$widget->render_content();
		} finally {
			ob_end_clean();
		}
	}

	/**
	 * @param array{templates: array, settings: array, main: string} $options
	 */
	private function make_mock_widget( array $options ) {
		return new class( $options ) extends Atomic_Widget_Base {
			use Has_Template {
				get_main_template as protected original_get_main_template;
			}

			private $options;

			public function __construct( $options ) {
				$this->options = $options;

				parent::__construct( [
					'id' => 1,
					'settings' => [],
					'styles' => [],
					'elType' => 'widget',
					'widgetType' => 'test-widget',
				], [] );
			}

			protected function define_atomic_controls(): array {
				return [];
			}

			protected static function define_props_schema(): array {
				return [];
			}

			protected function define_base_styles(): array {
				return [
					'something' => Style_Definition::make(),
					'something_else' => Style_Definition::make(),
				];
			}

			public static function get_element_type(): string {
				return 'test-widget';
			}

			protected function get_templates(): array {
				return $this->options['templates'];
			}

			protected function get_main_template() {
				if ( isset( $this->options['main'] ) ) {
					return $this->options['main'];
				}

				return $this->original_get_main_template();
			}

			public function get_atomic_settings(): array {
				return $this->options['settings'];
			}
		};
	}
}
