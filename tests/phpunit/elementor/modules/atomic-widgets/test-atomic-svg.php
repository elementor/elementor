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
                'url' => 'data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2024%2024%22%3E%3Cpath%20d%3D%22M0%200h24v24H0z%22%2F%3E%3C%2Fsvg%3E',
            ],
			'classes' => '',
        ],
        'widgetType' => 'a-svg',
    ];

    protected $instance;

    public function setUp(): void {
        parent::setUp();
        $this->instance = Plugin::$instance->elements_manager->create_element_instance( self::MOCK );
    }

    public function test__render_paragraph(): void {
        // Act
        ob_start();
        $this->instance->render_content();
        $rendered_output = ob_get_clean();

        // Assert
        $this->assertMatchesSnapshot( $rendered_output );
    }
}
