<?php

use Elementor\Modules\AtomicWidgets\Elements\Atomic_List\Atomic_List;
use ElementorEditorTesting\Elementor_Test_Base;

class Test_Atomic_List extends Elementor_Test_Base {
	public function test__render_list_emits_default_style_tag_class(): void {
		// Arrange.
		$instance = new Atomic_List( [
			'id' => 'e8e55a1',
			'elType' => Atomic_List::get_element_type(),
			'settings' => [],
		] );

		// Act.
		ob_start();
		$instance->print_element();
		$rendered_output = ob_get_clean();

		// Assert.
		$this->assertStringContainsString( '<ul', $rendered_output );
		$this->assertStringContainsString( 'e-default-ul', $rendered_output );
	}
}
