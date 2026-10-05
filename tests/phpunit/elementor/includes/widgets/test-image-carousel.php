<?php

namespace Elementor\Tests\Phpunit\Includes\Widgets;

use Elementor\Plugin;
use ElementorEditorTesting\Elementor_Test_Base;

class Test_Widget_Image_Carousel extends Elementor_Test_Base {

	const MISSING_ATTACHMENT_ID = 999999;

	const CAPTION = 'Existing image caption';

	private function create_carousel( array $attachment_ids ) {
		$carousel = array_map( function ( $attachment_id ) {
			return [
				'id' => $attachment_id,
				'url' => 'https://test.local/image-' . $attachment_id . '.png',
			];
		}, $attachment_ids );

		return Plugin::$instance->elements_manager->create_element_instance( [
			'id' => 'a1b2c3d',
			'elType' => 'widget',
			'widgetType' => 'image-carousel',
			'settings' => [
				'caption_type' => 'caption',
				'carousel' => $carousel,
			],
		] );
	}

	public function test_render__skips_caption_for_missing_attachment() {
		// Arrange
		$this->act_as_admin();

		$attachment_id = wp_insert_attachment( [
			'post_title' => 'Existing image',
			'post_excerpt' => static::CAPTION,
			'post_mime_type' => 'image/png',
			'post_status' => 'inherit',
		] );

		$carousel = $this->create_carousel( [ $attachment_id, static::MISSING_ATTACHMENT_ID ] );

		// Act
		ob_start();
		$carousel->render_content();
		$rendered_content = ob_get_clean();

		// Assert
		$this->assertSame( 1, substr_count( $rendered_content, 'elementor-image-carousel-caption' ) );
		$this->assertStringContainsString( static::CAPTION, $rendered_content );
	}
}
