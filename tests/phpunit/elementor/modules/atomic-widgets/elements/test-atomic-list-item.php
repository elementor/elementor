<?php

use Elementor\Modules\AtomicWidgets\Elements\Atomic_List\Atomic_List_Item\Atomic_List_Item;
use ElementorEditorTesting\Elementor_Test_Base;

/**
 * @group atomic-widgets-e-list
 */
class Test_Atomic_List_Item extends Elementor_Test_Base {
	public function test_get_data_for_save__preserves_sanitized_editor_settings_label(): void {
		// Arrange.
		$instance = new Atomic_List_Item( [
			'id' => 'list-item-1',
			'elType' => 'e-list-item',
			'editor_settings' => [
				'title' => '<b>Primary item</b>',
			],
		] );

		// Act.
		$data_for_save = $instance->get_data_for_save();

		// Assert.
		$this->assertSame(
			[
				'title' => 'Primary item',
			],
			$data_for_save['editor_settings']
		);
	}
}
