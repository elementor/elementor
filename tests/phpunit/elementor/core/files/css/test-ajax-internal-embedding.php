<?php

namespace Elementor\Tests\Phpunit\Elementor\Core\Files\Css;

use Elementor\Core\Common\Modules\Ajax\Module as Ajax_Module;
use Elementor\Core\Files\CSS\Post as Post_CSS;
use Elementor\Plugin;
use ElementorEditorTesting\Elementor_Test_Base;

class Test_Ajax_Internal_Embedding extends Elementor_Test_Base {

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

		$this->previous_css_print_method = get_option( 'elementor_css_print_method', 'external' );
		update_option( 'elementor_css_print_method', 'internal' );
	}

	public function tearDown(): void {
		update_option( 'elementor_css_print_method', $this->previous_css_print_method );

		parent::tearDown();
	}

	public function test_get_builder_content_does_not_echo_post_css_during_elementor_ajax() {
		add_filter( 'wp_doing_ajax', '__return_true' );
		$_REQUEST['action'] = Ajax_Module::NONCE_KEY;

		$this->act_as_admin();

		$document = $this->factory()->documents->publish_and_get( [
			'post_type' => 'page',
			'meta_input' => [
				'_elementor_data' => wp_json_encode( self::STYLED_DOCUMENT_DATA ),
			],
		] );
		$post_id = $document->get_main_id();

		Post_CSS::create( $post_id )->update();

		ob_start();
		Plugin::$instance->frontend->get_builder_content( $post_id );
		$unexpected_output = ob_get_clean();

		unset( $_REQUEST['action'] );
		remove_filter( 'wp_doing_ajax', '__return_true' );

		$this->assertSame( '', $unexpected_output, 'Post CSS must not be echoed outside builder content during elementor_ajax.' );
	}
}
