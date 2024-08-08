<?php
namespace Elementor\Testing\Modules\AtomicWidgets\Widgets;

use Elementor\Modules\AtomicWidgets\Widgets\Atomic_Image;
use ElementorEditorTesting\Elementor_Test_Base;
use Elementor\Modules\AtomicWidgets\Base\Atomic_Control_Base;
use Elementor\Modules\AtomicWidgets\Controls\Section;

class Test_Atomic_Image extends Elementor_Test_Base {

    public function test_get_atomic_controls__returns_the_expected_image_sizes() {
        // Arrange.
        $widget = new Atomic_Image( [], [] );

        // Act.
        $atomic_controls = $widget->get_atomic_controls();

        $control = $this->find_control_by_binding( $atomic_controls, 'image_size' );

        // Assert.
        $this->assertEqualSetsWithIndex( [
            [
                'label' => 'Thumbnail - 150*150',
                'value' => 'thumbnail',
            ],
            [
                'label' => 'Medium - 300*300',
                'value' => 'medium',
            ],
            [
                'label' => 'Medium Large - 768*0',
                'value' => 'medium_large',
            ],
            [
                'label' => 'Large - 1024*1024',
                'value' => 'large',
            ],
            [
                'label' => '1536x1536 - 1536*1536',
                'value' => '1536x1536',
            ],
            [
                'label' => '2048x2048 - 2048*2048',
                'value' => '2048x2048',
            ],
            [
                'label' => 'Full',
                'value' => 'full',
            ],
        ], $control->get_options() );
    }

    private function find_control_by_binding( $controls, $binding ) {
        foreach ( $controls as $control ) {
            if ( $control instanceof Atomic_Control_Base && $control->get_bind() === $binding ) {
                return $control;
            }

            if ( $control instanceof Section ) {
                $found_control = $this->find_control_by_binding( $control->get_items(), $binding );

                if ( $found_control ) {
                    return $found_control;
                }
            }
        }

        return null;
    }
}