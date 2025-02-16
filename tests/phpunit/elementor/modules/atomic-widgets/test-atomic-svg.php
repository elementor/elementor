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
				'src' => [
					'$$type' => 'svg-src',
					'value' => [
						'id' => [
							'$$type' => 'image-attachment-id',
							'value' => 123,
						],
					],
				],
			],
		],
		'widgetType' => 'a-svg',
	];

	protected $instance;

	public function setUp(): void {
		parent::setUp();
		
		add_filter('pre_http_request', function($preempt, $args, $url) {
			return [
				'body' => '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="40"/></svg>',
			];
		}, 10, 3);

		add_filter('wp_get_attachment_url', function($url, $attachment_id) {
			if ($attachment_id === 123) {
				return 'https://example.com/test.svg';
			}
			return $url;
		}, 10, 2);

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
		remove_all_filters('pre_http_request');
		remove_all_filters('wp_get_attachment_url');
	}
}
