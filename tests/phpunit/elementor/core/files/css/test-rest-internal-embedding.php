<?php

namespace Elementor\Tests\Phpunit\Elementor\Core\Files\Css;

use Elementor\Core\Files\CSS\Post as Post_CSS;
use Elementor\Plugin;
use ElementorEditorTesting\Elementor_Test_Base;

class Test_Rest_Internal_Embedding extends Elementor_Test_Base {

	private const STYLED_DOCUMENT_DATA = [
		[
			'id' => 'styled-section',
			'elType' => 'section',
			'settings' => [],
			'elements' => [
				[
					'id' => 'styled-column',
					'elType' => 'column',
					'settings' => [ '_column_size' => 100 ],
					'elements' => [
						[
							'id' => 'styled-heading',
							'elType' => 'widget',
							'widgetType' => 'heading',
							'settings' => [
								'title' => 'Styled heading',
								'title_color' => '#FF0000',
							],
							'elements' => [],
						],
					],
				],
			],
		],
	];

	private string $previous_css_print_method;

	public function setUp(): void {
		parent::setUp();

		global $wp_styles;

		$wp_styles = new \WP_Styles();
		rest_get_server();

		$this->previous_css_print_method = get_option( 'elementor_css_print_method', 'external' );
		update_option( 'elementor_css_print_method', 'internal' );
	}

	public function tearDown(): void {
		Plugin::$instance->data_manager_v2->kill_server();

		update_option( 'elementor_css_print_method', $this->previous_css_print_method );

		parent::tearDown();
	}

	public function test_pages_rest_response_is_valid_json_without_leading_post_css_output() {
		$this->act_as_admin();

		$document = $this->factory()->documents->publish_and_get( [
			'post_type' => 'page',
			'meta_input' => [
				'_elementor_data' => wp_json_encode( self::STYLED_DOCUMENT_DATA ),
			],
		] );
		$post_id = $document->get_main_id();

		Post_CSS::create( $post_id )->update();

		$request = new \WP_REST_Request( 'GET', '/wp/v2/pages/' . $post_id );

		ob_start();
		$response = rest_do_request( $request );
		$unexpected_output = ob_get_clean();

		$this->assertSame( 200, $response->get_status() );
		$this->assertSame( '', $unexpected_output, 'Post CSS must not be echoed outside the REST JSON payload.' );

		$encoded = wp_json_encode( $response->get_data() );
		$this->assertIsString( $encoded );
		$this->assertSame( JSON_ERROR_NONE, json_last_error() );
		$this->assertStringStartsWith( '{', $encoded );
	}
}
