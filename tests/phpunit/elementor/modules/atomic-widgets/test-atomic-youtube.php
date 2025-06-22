<?php

use Elementor\Modules\AtomicWidgets\Elements\Atomic_Youtube\Atomic_Youtube;
use Elementor\Plugin;
use ElementorEditorTesting\Elementor_Test_Base;
use Spatie\Snapshots\MatchesSnapshots;

class Test_Atomic_Youtube extends Elementor_Test_Base {
    use MatchesSnapshots;

    public function test__render_youtube_with_youtube_url(): void {
		// Arrange.
		$mock_with_id = [
			'id' => 'e8e55a1',
			'elType' => 'widget',
			'settings' => [
                'youtube_url' => 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
			],
			'widgetType' => Atomic_Youtube::get_element_type(),
		];

		$widget_instance = Plugin::$instance->elements_manager->create_element_instance( $mock_with_id );

		// Act.
		ob_start();
		$widget_instance->render_content();
		$rendered_output = ob_get_clean();

		// Assert.
		$this->assertMatchesSnapshot( $rendered_output );
	}

    public function test__render_youtube_with_css_id(): void {
		// Arrange.
		$mock_with_id = [
			'id' => 'e8e55a1',
			'elType' => 'widget',
			'settings' => [
				'_cssid' => 'my-custom-youtube',
                'youtube_url' => 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
			],
			'widgetType' => Atomic_Youtube::get_element_type(),
		];

		$widget_instance = Plugin::$instance->elements_manager->create_element_instance( $mock_with_id );

		// Act.
		ob_start();
		$widget_instance->render_content();
		$rendered_output = ob_get_clean();

		// Assert.
		$this->assertMatchesSnapshot( $rendered_output );
	}
}
