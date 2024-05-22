<?php
namespace Elementor\Tests\Phpunit\Includes\Controls\Groups;

use Elementor\Group_Control_Image_Size;
use ElementorEditorTesting\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Test_Image_Size extends Elementor_Test_Base {
	public function test_print_attachment_image_html() {
		// Arrange
		$attachment_id = $this->factory()->attachment->create_upload_object(
			__DIR__ . '/mock/400.png'
		);

		// Act
		ob_start();

		Group_Control_Image_Size::print_attachment_image_html( [
			'image' => [
				'url' => '',
				'id' => $attachment_id,
				'alt' => '',
				'source' => 'library',
			],
			'image_size' => 'large',
		] );

		$html = ob_get_clean();

		$wp_attachment = wp_get_attachment_image( $attachment_id, 'large', false, [ 'class' => "attachment-large size-large wp-image-{$attachment_id}" ] );
		
		// WordPress 6.1 removed the `decoding` attribute, so we need to remove it  to support all versions.
		if ( version_compare( get_bloginfo( 'version' ), '6.1', '>=' ) ) {
			$wp_attachment = str_replace( ' decoding="async"', '', $wp_attachment );
		}

		// Assert
		$this->assertEquals(
			$wp_attachment,
			$html
		);

		// Clean up
		wp_delete_attachment( $attachment_id, true );
	}
}
