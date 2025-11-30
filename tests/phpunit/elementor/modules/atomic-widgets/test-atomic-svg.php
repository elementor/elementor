<?php

use Elementor\Modules\AtomicWidgets\Elements\Atomic_Svg\Atomic_Svg;
use Elementor\Plugin;
use ElementorEditorTesting\Elementor_Test_Base;
use Spatie\Snapshots\MatchesSnapshots;

class Test_Atomic_Svg extends Elementor_Test_Base {
	use MatchesSnapshots;

	const TEST_RESOURCES_DIR = __DIR__ . '/../../../resources/';

	protected $instance;

	public function setUp() : void {
		parent::setUp();

		add_filter( 'get_attached_file', function( $path, $attachment_id ) {
			if ( $attachment_id === 123 ) {
				return self::TEST_RESOURCES_DIR . 'test.svg';
			}

			return $path;
		}, 10, 2 );

		add_filter( 'pre_http_request', function( $preempt, $args, $url ) {
			if ( $url === self::TEST_RESOURCES_DIR . 'test.svg' ) {
				return [
					'body' => '<svg width="100" height="100" xmlns="http://www.w3.org/2000/svg"><path d="M0 0h100v100H0z"/></svg>',
				];
			}

			return $preempt;
		}, 10, 3 );

		add_filter( 'pre_filesystem_method', function() {
			return 'direct';
		} );

		WP_Filesystem();
		global $wp_filesystem;
		$wp_filesystem->put_contents(
			self::TEST_RESOURCES_DIR . 'test.svg',
			'<svg width="100" height="100" xmlns="http://www.w3.org/2000/svg"><path d="M0 0h100v100H0z"/></svg>'
		);
	}

	public function test__default_svg_structure() : void {
		// Arrange
		$mock_svg = [
			'id' => 'abcd123',
			'elType' => 'widget',
			'settings' => [],
			'widgetType' => Atomic_Svg::get_element_type(),
		];

		$this->instance = Plugin::$instance->elements_manager->create_element_instance( $mock_svg );

		// Act
		ob_start();
		$this->instance->render_content();
		$rendered_output = ob_get_clean();

		// Assert
		$this->assertMatchesSnapshot( $rendered_output );
	}

	public function test__render_svg_from_id() : void {
		// Arrange
		$mock_svg = $this->get_mock_svg();
		$this->instance = Plugin::$instance->elements_manager->create_element_instance( $mock_svg );

		// Act
		ob_start();
		$this->instance->render_content();
		$rendered_output = ob_get_clean();

		// Assert
		$this->assertMatchesSnapshot( $rendered_output );
	}

	public function test__render_svg_from_url() : void {
		// Arrange
		$mock_svg = $this->get_mock_svg( true );
		$this->instance = Plugin::$instance->elements_manager->create_element_instance( $mock_svg );

		// Act
		ob_start();
		$this->instance->render_content();
		$rendered_output = ob_get_clean();

		// Assert
		$this->assertMatchesSnapshot( $rendered_output );
	}

	/**
	 * @dataProvider link_href_provider
	 */
	public function test__should_render_svg_wrapped_in_link( $href ) : void {
		$element = [
			'id' => 'abcd123',
			'elType' => 'widget',
			'settings' => [
				'svg' => [
					'id' => 123,
				],
				'link' => [
					'href' => $href,
					'target' => '_blank',
				]
			],
			'widgetType' => Atomic_Svg::get_element_type(),
		];

		$this->instance = Plugin::$instance->elements_manager->create_element_instance( $element );

		// Act
		ob_start();
		$this->instance->render_content();
		$rendered_output = ob_get_clean();

		// Assert
		$this->assertMatchesSnapshot( $rendered_output );
	}

	public function test__should_not_render_svg_wrapped_in_link_if_link_object_not_well_defined() : void {
		$element = [
			'id' => 'abcd123',
			'elType' => 'widget',
			'settings' => [
				'svg' => [
					'id' => 123,
				],
				'link' => [
					'href' => '',
					'target' => '_blank',
				]
			],
			'widgetType' => Atomic_Svg::get_element_type(),
		];

		$this->instance = Plugin::$instance->elements_manager->create_element_instance( $element );

		// Act
		ob_start();
		$this->instance->render_content();
		$rendered_output = ob_get_clean();

		// Assert
		$this->assertMatchesSnapshot( $rendered_output );
	}

	private function get_mock_svg( $is_url = false ) {
		return ! $is_url ? [
			'id' => 'abcd123',
			'elType' => 'widget',
			'settings' => [
				'svg' => [
					'id' => 123,
				],
			],
			'widgetType' => Atomic_Svg::get_element_type(),
		] :
			[
				'id' => 'abcd123',
				'elType' => 'widget',
				'settings' => [
					'svg' => [
						'url' => self::TEST_RESOURCES_DIR . 'test.svg',
					],
				],
				'widgetType' => Atomic_Svg::get_element_type(),
			];
	}
	public function test__render_svg_with_interactions(): void {
		// Arrange.
		$mock_with_interactions = [
			'id' => 'e8e55a1',
			'elType' => 'widget',
			'settings' => [],
			'widgetType' => Atomic_Svg::get_element_type(),
			'interactions' => [
				'version' => 1,
				'items' => [
					[
						'animation' => [
							'animation_type' => 'full-preset',
							'animation_id' => 'load-fade-in--300-0',
						],
					],
				],
			],
		];
		$widget_instance = Plugin::$instance->elements_manager->create_element_instance( $mock_with_interactions );

		// Act.
		ob_start();
		$widget_instance->render_content();
		$rendered_output = ob_get_clean();

		// Assert.
		$this->assertMatchesSnapshot( $rendered_output );
	}

	public function test__svg_element_has_data_interaction_id_attribute(): void {
		// Arrange
		$mock_svg = [
			'id' => 'test123',
			'elType' => 'widget',
			'settings' => [],
			'widgetType' => Atomic_Svg::get_element_type(),
		];
		$this->instance = Plugin::$instance->elements_manager->create_element_instance( $mock_svg );

		// Act
		ob_start();
		$this->instance->render_content();
		$rendered_output = ob_get_clean();

		// Assert
		$this->assertStringContainsString( 'data-interaction-id="test123"', $rendered_output );
		$this->assertMatchesRegularExpression( '/<svg[^>]*data-interaction-id="test123"/', $rendered_output );
	}

	public function test__svg_element_has_data_interaction_id_attribute_when_wrapped_in_link(): void {
		// Arrange
		$element = [
			'id' => 'linked456',
			'elType' => 'widget',
			'settings' => [
				'svg' => [
					'id' => 123,
				],
				'link' => [
					'href' => 'https://elementor.com',
					'target' => '_blank',
				]
			],
			'widgetType' => Atomic_Svg::get_element_type(),
		];
		$this->instance = Plugin::$instance->elements_manager->create_element_instance( $element );

		// Act
		ob_start();
		$this->instance->render_content();
		$rendered_output = ob_get_clean();

		// Assert
		$this->assertStringContainsString( 'data-interaction-id="linked456"', $rendered_output );
		$this->assertMatchesRegularExpression( '/<svg[^>]*data-interaction-id="linked456"/', $rendered_output );
	}

	public function link_href_provider(): array {
		return [
			'External link' => [ 'https://elementor.com' ],
			'ID link'       => [ '#element-id' ],
		];
	}
}
