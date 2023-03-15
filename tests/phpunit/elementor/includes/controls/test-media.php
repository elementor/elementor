<?php
namespace Elementor\Tests\Phpunit\Includes\Controls;

use Elementor\Controls_Manager;
use Elementor\Plugin;
use Elementor\Base_Data_Control;
use ElementorEditorTesting\Elementor_Test_Base;

class Test_Media extends Elementor_Test_Base {

	/**
	 * @dataProvider get_style_value_data_provider
	 */
	public function test_get_style_value( $test_data ) {
		// Arrange
		$attachment_id = $this->factory()->attachment->create_upload_object(
			__DIR__ . '/../../../resources/mock-image.png'
		);

		/** @var Base_Data_Control $control_obj */
		$control_obj = Plugin::$instance->controls_manager->get_control( Controls_Manager::MEDIA );
		$css_property = 'URL';
		$control_value = [
			'id' => $attachment_id,
			'url' => 'valid-url',
		];

		$control_value = array_merge( $control_value, $test_data );

		// Act
		$style_value = $control_obj->get_style_value( $css_property, $control_value, [] );

		// Assert
		$thumbnail_size = $test_data['size'] ?? 'full';
		$attachment_url = wp_get_attachment_image_url( $attachment_id, $thumbnail_size );

		$this->assertEquals( $attachment_url, $style_value );

		// Clean up
		wp_delete_attachment( $attachment_id, true );
	}

	public function get_style_value_data_provider() {
		return [
			'with-size' => [
				[
					'size' => 'thumbnail',
				],
			],
			'without-size' => [
				[],
			],
		];
	}

	public function test_get_style_value__empty_id() {
		// Arrange
		$attachment_url = 'valid-url';

		/** @var Base_Data_Control $control_obj */
		$control_obj = Plugin::$instance->controls_manager->get_control( Controls_Manager::MEDIA );
		$css_property = 'URL';
		$control_value = [
			'id' => '',
			'url' => $attachment_url,
		];

		// Act
		$style_value = $control_obj->get_style_value( $css_property, $control_value, [] );

		// Assert
		$this->assertEquals( $attachment_url, $style_value );
	}
}
