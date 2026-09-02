<?php

use Elementor\Modules\AtomicWidgets\Elements\Atomic_Tabs\Atomic_Tabs\Atomic_Tabs;
use Elementor\Modules\AtomicWidgets\Elements\Atomic_Accordion\Atomic_Accordion;
use Elementor\Modules\AtomicWidgets\Elements\Atomic_List\Atomic_List\Atomic_List;
use Elementor\Modules\AtomicWidgets\Elements\Atomic_Form\Atomic_Form;
use Elementor\Modules\AtomicWidgets\Elements\Atomic_Collection_Loop\Collection_Loop_Promotion;
use Elementor\Plugin;
use ElementorEditorTesting\Elementor_Test_Base;

/**
 * Regression test: compound atomic elements must declare `is_compound => true` in their meta.
 *
 * The JS function `isCompoundAtomicType()` in the editor reads `elements[type].meta.is_compound`
 * to decide whether a dropped element should be auto-wrapped in a flexbox container.
 * If any element removes `$this->meta('is_compound', true)` from its constructor, this test fails.
 */
class Test_Compound_Atomic_Element_Meta extends Elementor_Test_Base {

	/**
	 * @dataProvider compound_element_types_provider
	 */
	public function test__compound_element_declares_is_compound_meta( string $element_type ): void {
		// Arrange.
		$mock = [
			'id'         => 'test-' . $element_type,
			'elType'     => $element_type,
			'settings'   => [],
			'widgetType' => $element_type,
		];

		// Act.
		$instance = Plugin::$instance->elements_manager->create_element_instance( $mock );

		// Assert.
		$this->assertNotNull( $instance, "Element type '{$element_type}' is not registered." );
		$this->assertTrue(
			$instance->get_meta()['is_compound'] ?? false,
			"Element '{$element_type}' must call \$this->meta('is_compound', true) in its constructor."
		);
	}

	public static function compound_element_types_provider(): array {
		return [
			'Tabs'            => [ Atomic_Tabs::get_element_type() ],
			'Accordion'       => [ Atomic_Accordion::get_element_type() ],
			'List'            => [ Atomic_List::get_element_type() ],
			'Form'            => [ Atomic_Form::get_element_type() ],
			'Collection Loop' => [ Collection_Loop_Promotion::get_element_type() ],
		];
	}
}
