<?php

namespace Elementor\Testing\Modules\CompositeWidgets;

use Elementor\Modules\CompositeWidgets\ClosedStructure\Closed_Structure;
use Elementor\Testing\Modules\CompositeWidgets\Fixtures\Closed_Structure_Factory;
use ElementorEditorTesting\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

require_once __DIR__ . '/fixtures/closed-structure-factory.php';

class Test_Closed_Structure extends Elementor_Test_Base {
	const REGISTERED_WIDGET_ID = Closed_Structure_Factory::WIDGET_ID;
	const UNKNOWN_WIDGET_ID = 'acme/missing';

	private Closed_Structure $closed_structure;

	public function setUp(): void {
		parent::setUp();

		$this->closed_structure = Closed_Structure_Factory::make();
	}

	/**
	 * @dataProvider closed_elements_provider
	 */
	public function test_is_element_locked__locks_elements_under_a_registered_widget_root( string $element_id ) {
		// Act.
		$result = $this->closed_structure->is_element_locked( $this->tree(), $element_id );

		// Assert.
		$this->assertTrue( $result );
	}

	public function closed_elements_provider(): array {
		return [
			'a part' => [ 'label' ],
			'the slot itself' => [ 'slot' ],
			'a part of a nested widget inside a slot' => [ 'nested-part' ],
		];
	}

	/**
	 * @dataProvider open_elements_provider
	 */
	public function test_is_element_locked__leaves_roots_slot_content_and_unknown_widgets_unlocked( string $element_id ) {
		// Act.
		$result = $this->closed_structure->is_element_locked( $this->tree(), $element_id );

		// Assert.
		$this->assertFalse( $result );
	}

	public function open_elements_provider(): array {
		return [
			'the widget root' => [ 'root' ],
			'slot content' => [ 'slot-child' ],
			'a nested widget root inside a slot' => [ 'nested-root' ],
			'a part of a widget whose definition is not registered' => [ 'unknown-part' ],
			'an element that does not exist' => [ 'missing' ],
		];
	}

	public function test_is_insertion_locked__locks_the_root_and_leaves_the_slot_and_the_document_open() {
		// Arrange.
		$tree = $this->tree();

		// Act & Assert.
		$this->assertTrue( $this->closed_structure->is_insertion_locked( $tree, 'root' ) );
		$this->assertTrue( $this->closed_structure->is_insertion_locked( $tree, 'label' ) );
		$this->assertFalse( $this->closed_structure->is_insertion_locked( $tree, 'slot' ) );
		$this->assertFalse( $this->closed_structure->is_insertion_locked( $tree, Closed_Structure::DOCUMENT_ROOT_ID ) );
	}

	private function tree(): array {
		return [
			[
				'id' => 'root',
				'elType' => 'e-flexbox',
				'part' => 'root',
				'widget' => [ 'id' => self::REGISTERED_WIDGET_ID, 'version' => 1 ],
				'elements' => [
					[ 'id' => 'label', 'elType' => 'widget', 'widgetType' => 'e-paragraph', 'part' => 'label' ],
					[
						'id' => 'slot',
						'elType' => 'e-flexbox',
						'part' => 'content',
						'slot' => true,
						'elements' => [
							[ 'id' => 'slot-child', 'elType' => 'e-flexbox' ],
							[
								'id' => 'nested-root',
								'elType' => 'e-flexbox',
								'part' => 'root',
								'widget' => [ 'id' => self::REGISTERED_WIDGET_ID, 'version' => 1 ],
								'elements' => [
									[ 'id' => 'nested-part', 'elType' => 'widget', 'widgetType' => 'e-svg', 'part' => 'icon' ],
								],
							],
						],
					],
				],
			],
			[
				'id' => 'unknown-root',
				'elType' => 'e-flexbox',
				'part' => 'root',
				'widget' => [ 'id' => self::UNKNOWN_WIDGET_ID, 'version' => 1 ],
				'elements' => [
					[ 'id' => 'unknown-part', 'elType' => 'widget', 'widgetType' => 'e-heading', 'part' => 'label' ],
				],
			],
		];
	}
}
