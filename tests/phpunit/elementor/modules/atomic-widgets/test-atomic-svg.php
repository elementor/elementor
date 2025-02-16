<?php

use Elementor\Plugin;
use ElementorEditorTesting\Elementor_Test_Base;
use Spatie\Snapshots\MatchesSnapshots;

class Test_Atomic_Svg extends Elementor_Test_Base {
	use MatchesSnapshots;

	const MOCK = [
		'id' => 'abcd123',
		'elType' => 'widget',
		'settings' => [
			'svg' => [
				'id' => 123,
				'url' => ELEMENTOR_ASSETS_URL . 'images/a-default-svg.svg',
			],
		],
		'widgetType' => 'a-svg',
	];

	protected $instance;

	public function setUp(): void {
		parent::setUp();

		add_filter( 'wp_get_attachment_image_src', function( $image, $attachment_id, $size ) {
			if ( $attachment_id === 123 ) {
				return [ ELEMENTOR_ASSETS_URL . 'images/test.svg' ];
			}
			return $image;
		}, 10, 3 );

		$this->instance = Plugin::$instance->elements_manager->create_element_instance( self::MOCK );
	}

	public function test__render_svg(): void {
		// Act
		ob_start();
		$this->instance->render_content();
		$rendered_output = ob_get_clean();

		// Assert
		$this->assertMatchesSnapshot( $rendered_output );
	}

	public function tearDown(): void {
		parent::tearDown();
		remove_all_filters( 'wp_get_attachment_url' );
	}
}
