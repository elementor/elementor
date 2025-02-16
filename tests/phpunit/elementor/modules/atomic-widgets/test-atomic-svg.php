<?php

use Elementor\Plugin;
use ElementorEditorTesting\Elementor_Test_Base;
use Spatie\Snapshots\MatchesSnapshots;

class Test_Atomic_Svg extends Elementor_Test_Base {
	use MatchesSnapshots;

	const MOCK_URL = [
		'id' => 'abcd123',
		'elType' => 'widget',
		'settings' => [
			'svg' => [
				'url' => ELEMENTOR_ASSETS_URL . 'images/a-default-svg.svg',
			],
		],
		'widgetType' => 'a-svg',
	];

	const MOCK_ID = [
		'id' => 'abcd123',
		'elType' => 'widget',
		'settings' => [
			'svg' => [
				'id' => 123,
			],
		],
		'widgetType' => 'a-svg',
	];

	protected $instance;

	public function setUp(): void {
		parent::setUp();

		add_filter('wp_get_attachment_image_src', function($image, $attachment_id, $size) {
			if ($attachment_id === 123) {
				return [ELEMENTOR_ASSETS_URL . 'images/test.svg'];
			}
			return $image;
		}, 10, 3);

		add_filter('pre_http_request', function($preempt, $args, $url) {
			if ($url === ELEMENTOR_ASSETS_URL . 'images/test.svg' || $url === ELEMENTOR_ASSETS_URL . 'images/a-default-svg.svg') {
				return [
					'body' => '<div style="margin-inline: auto"><svg width="100" height="100" xmlns="http://www.w3.org/2000/svg">
                        <g transform="translate(50, 50) scale(1.2)" fill="#3F444A">
                            <path d="M30.56 22.052c1.672 0 3.197.41 4.576 1.232a9.14 9.14 0 0 1 3.344 3.344c.821 1.408 1.232 2.948 1.232 4.62 0 1.672-.41 3.212-1.232 4.62a9.248 9.248 0 0 1-3.344 3.3c-1.379.821-2.904 1.232-4.576 1.232-1.672 0-3.212-.41-4.62-1.232a9.248 9.248 0 0 1-3.344-3.3c-.821-1.408-1.232-2.948-1.232-4.62 0-1.672.41-3.212 1.232-4.62a9.14 9.14 0 0 1 3.344-3.344c1.408-.821 2.948-1.232 4.62-1.232Z" transform="translate(-20, -20)"/>
                        </g>
                    </svg></div>',
				];
			}
			return $preempt;
		}, 10, 3);

		add_filter('file_get_contents', function($content, $filename) {
			if (strpos($filename, 'test.svg') !== false || strpos($filename, 'a-default-svg.svg') !== false) {
				return '<div style="margin-inline: auto"><svg width="100" height="100" xmlns="http://www.w3.org/2000/svg">
                    <g transform="translate(50, 50) scale(1.2)" fill="#3F444A">
                        <path d="M30.56 22.052c1.672 0 3.197.41 4.576 1.232a9.14 9.14 0 0 1 3.344 3.344c.821 1.408 1.232 2.948 1.232 4.62 0 1.672-.41 3.212-1.232 4.62a9.248 9.248 0 0 1-3.344 3.3c-1.379.821-2.904 1.232-4.576 1.232-1.672 0-3.212-.41-4.62-1.232a9.248 9.248 0 0 1-3.344-3.3c-.821-1.408-1.232-2.948-1.232-4.62 0-1.672.41-3.212 1.232-4.62a9.14 9.14 0 0 1 3.344-3.344c1.408-.821 2.948-1.232 4.62-1.232Z" transform="translate(-20, -20)"/>
                    </g>
                </svg></div>';
			}
			return $content;
		}, 10, 2);
	}

	public function tearDown(): void {
		parent::tearDown();
		remove_all_filters('wp_get_attachment_image_src');
		remove_all_filters('pre_http_request');
		remove_all_filters('file_get_contents');
	}

	public function test__render_svg_from_url(): void {
		$this->instance = Plugin::$instance->elements_manager->create_element_instance(self::MOCK_URL);

		// Act
		ob_start();
		$this->instance->render_content();
		$rendered_output = ob_get_clean();

		// Assert
		$this->assertMatchesSnapshot($rendered_output);
	}

	public function test__render_svg_from_id(): void {
		$this->instance = Plugin::$instance->elements_manager->create_element_instance(self::MOCK_ID);

		// Act
		ob_start();
		$this->instance->render_content();
		$rendered_output = ob_get_clean();

		// Assert
		$this->assertMatchesSnapshot($rendered_output);
	}
}
