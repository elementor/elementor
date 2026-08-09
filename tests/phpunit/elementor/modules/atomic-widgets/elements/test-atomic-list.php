<?php

use Elementor\Modules\AtomicWidgets\Controls\Base\Atomic_Control_Base;
use Elementor\Modules\AtomicWidgets\Controls\Section;
use Elementor\Modules\AtomicWidgets\Controls\Types\Switch_Control;
use Elementor\Modules\AtomicWidgets\Elements\Atomic_List\Atomic_List\Atomic_List;
use Elementor\Modules\AtomicWidgets\PropTypes\Contracts\Prop_Type;
use ElementorEditorTesting\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Test_Atomic_List extends Elementor_Test_Base {

	public function test_props_schema_includes_show_markers_boolean_prop() {
		$schema = Atomic_List::get_props_schema();

		$this->assertArrayHasKey( 'show_markers', $schema );
		$this->assertInstanceOf( Prop_Type::class, $schema['show_markers'] );
		$this->assertSame(
			[
				'$$type' => 'boolean',
				'value' => true,
			],
			$schema['show_markers']->get_default()
		);
	}

	public function test_show_markers_switch_control_is_registered() {
		$list = $this->make_atomic_list_instance();

		$show_markers = $this->find_control_by_bind( $list->get_atomic_controls(), 'show_markers' );

		$this->assertInstanceOf( Switch_Control::class, $show_markers );
		$this->assertSame( 'switch', $show_markers->get_type() );
	}

	private function find_control_by_bind( array $controls, string $bind ): ?Atomic_Control_Base {
		foreach ( $controls as $control ) {
			if ( $control instanceof Section ) {
				$found = $this->find_control_by_bind( $control->get_items(), $bind );

				if ( null !== $found ) {
					return $found;
				}

				continue;
			}

			if ( $control instanceof Atomic_Control_Base && $control->get_bind() === $bind ) {
				return $control;
			}
		}

		return null;
	}

	private function make_atomic_list_instance(): Atomic_List {
		return new Atomic_List( [
			'id' => 'test_atomic_list_instance',
			'elType' => Atomic_List::get_type(),
			'settings' => [],
		], null );
	}
}
