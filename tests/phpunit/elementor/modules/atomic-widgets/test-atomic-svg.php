<?php

use Elementor\Plugin;
use ElementorEditorTesting\Elementor_Test_Base;
use Spatie\Snapshots\MatchesSnapshots;

class Test_Atomic_Svg extends Elementor_Test_Base {
	use MatchesSnapshots;

	const TEST_RESOURCES_DIR = __DIR__ . '/../../../resources/';
	const MOCK_URL = [
		'id' => 'abcd123',
		'elType' => 'widget',
		'settings' => [
			'svg' => [
				'url' => ELEMENTOR_ASSETS_PATH . '/images/a-default-svg.svg',
			],
		],
		'widgetType' => 'e-svg',
	];

	const MOCK_ID = [
		'id' => 'abcd123',
		'elType' => 'widget',
		'settings' => [
			'svg' => [
				'id' => 123,
			],
		],
		'widgetType' => 'e-svg',
	];

	protected $instance;

	public function setUp() : void {
		parent::setUp();

		add_filter( 'wp_get_attachment_image_src', function( $image, $attachment_id, $size ) {
			if ( $attachment_id === 123 ) {
				return [ self::TEST_RESOURCES_DIR . 'test.svg' ];
			}

			return $image;
		}, 10, 3 );

		add_filter( 'pre_http_request', function( $preempt, $args, $url ) {
			if ( $url === self::TEST_RESOURCES_DIR . 'test.svg' || $url === ELEMENTOR_ASSETS_PATH . '/images/a-default-svg.svg' ) {
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

	public function test__render_svg_from_id() : void {
		$this->instance = Plugin::$instance->elements_manager->create_element_instance( self::MOCK_ID );

		// Act
		ob_start();
		$this->instance->render_content();
		$rendered_output = ob_get_clean();

		// Assert
		$this->assertMatchesSnapshot( $rendered_output );
	}

	public function test__render_svg_from_url() : void {
		$this->instance = Plugin::$instance->elements_manager->create_element_instance( self::MOCK_URL );

		// Act
		ob_start();
		$this->instance->render_content();
		$rendered_output = ob_get_clean();

		// Assert
		$this->assertMatchesSnapshot( $rendered_output );
	}

	public function test__should_render_svg_wrapped_in_link() : void {
		$element = [
			'id' => 'abcd123',
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
			'widgetType' => 'e-svg',
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
			'widgetType' => 'e-svg',
		];

		$this->instance = Plugin::$instance->elements_manager->create_element_instance( $element );

		// Act
		ob_start();
		$this->instance->render_content();
		$rendered_output = ob_get_clean();

		// Assert
		$this->assertMatchesSnapshot( $rendered_output );
	}
}
