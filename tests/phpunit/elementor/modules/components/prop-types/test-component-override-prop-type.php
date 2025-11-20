<?php

namespace Elementor\Testing\Modules\Components\PropTypes;

use Elementor\Modules\Components\PropTypes\Component_Override_Prop_type;
use Elementor\Plugin;
use ElementorEditorTesting\Elementor_Test_Base;
use Elementor\Elements_Manager;
use Elementor\Modules\AtomicWidgets\Elements\Atomic_Heading\Atomic_Heading;
use Elementor\Modules\AtomicWidgets\Elements\Atomic_Image\Atomic_Image;
use PHPUnit\Framework\MockObject\MockObject;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Test_Component_Override_Prop_Type extends Elementor_Test_Base {
	private Elements_Manager $elements_manager;
	private MockObject $elements_manager_mock;

	public function setUp(): void {
		parent::setUp();

		$this->elements_manager = Plugin::$instance->elements_manager;
		$this->elements_manager_mock = $this->getMockBuilder( Elements_Manager::class )->disableOriginalConstructor()->onlyMethods( [ 'get_element' ] )->getMock();

        $this->elements_manager_mock->method( 'get_element' )
            ->willReturnCallback( function ( $el_type, $widget_type = null ) {
                switch ( $widget_type ) {
                    case 'e-heading':
                        return new Atomic_Heading();
					case 'e-image':
						return new Atomic_Image();
                    default:
                        return null;
                }
            } );

        Plugin::$instance->elements_manager = $this->elements_manager_mock;
	}

	public function tearDown(): void {
		parent::tearDown();

		Plugin::$instance->elements_manager = $this->elements_manager;
	}

	public function test_validate__passes_with_valid_override() {
		// Arrange
		$component_overridable_props = $this->create_mock_overridable_props();
		$prop_type = Component_Override_Prop_type::make()
			->set_component_overridable_props( $component_overridable_props );

		// Act
		$result = $prop_type->validate( [
			'$$type' => 'component-override',
			'value' => [
				'override_key' => 'prop-uuid-1',
				'value' => [ '$$type' => 'html', 'value' => 'New Title' ],
			],
		] );

		// Assert
		$this->assertTrue( $result );
	}

	public function test_validate__passes_when_override_key_not_in_component_props() {
		// Arrange
		$component_overridable_props = $this->create_mock_overridable_props();
		$prop_type = Component_Override_Prop_type::make()
			->set_component_overridable_props( $component_overridable_props );

		// Act
		$result = $prop_type->validate( [
			'$$type' => 'component-override',
			'value' => [
				'override_key' => 'non-existent-key',
				'value' => [ '$$type' => 'string', 'value' => 'Some Value' ],
			],
		] );

		// Assert
		$this->assertTrue( $result );
	}

	public function test_validate__fails_with_invalid_structure() {
		// Arrange
		$component_overridable_props = $this->create_mock_overridable_props();
		$prop_type = Component_Override_Prop_type::make()
			->set_component_overridable_props( $component_overridable_props );

		// Act
		$result = $prop_type->validate( [
			'$$type' => 'component-override',
			'value' => [	
				'override_key' => 'prop-uuid-1',
			],
		] );

		// Assert
		$this->assertFalse( $result );
	}

	public function test_validate__fails_with_non_array_value() {
		// Arrange
		$component_overridable_props = $this->create_mock_overridable_props();
		$prop_type = Component_Override_Prop_type::make()
			->set_component_overridable_props( $component_overridable_props );

		// Act
		$result = $prop_type->validate( 'not-an-array' );

		// Assert
		$this->assertFalse( $result );
	}

	public function test_validate__fails_with_non_string_override_key() {
		// Arrange
		$component_overridable_props = $this->create_mock_overridable_props();
		$prop_type = Component_Override_Prop_type::make()
			->set_component_overridable_props( $component_overridable_props );

		// Act
		$result = $prop_type->validate( [
			'$$type' => 'component-override',
			'value' => [
				'override_key' => 123,
				'value' => [ '$$type' => 'string', 'value' => 'New Title' ],
			],
		] );

		// Assert
		$this->assertFalse( $result );
	}

	public function test_validate__fails_with_non_array_override_value() {
		// Arrange
		$component_overridable_props = $this->create_mock_overridable_props();
		$prop_type = Component_Override_Prop_type::make()
			->set_component_overridable_props( $component_overridable_props );


		// Act
		$result = $prop_type->validate( [
			'override_key' => 'prop-uuid-1',
			'value' => 'not-an-array',
		] );

		// Assert
		$this->assertFalse( $result );
	}

	public function test_validate__fails_with_invalid_value() {
		// Arrange
		$component_overridable_props = $this->create_mock_overridable_props();
		$prop_type = Component_Override_Prop_type::make()
			->set_component_overridable_props( $component_overridable_props );


		// Act
		$result = $prop_type->validate( [
			'$$type' => 'component-override',
			'value' => [
				'override_key' => 'prop-uuid-1',
				'value' => [ '$$type' => 'html', 'value' => 123 ],
			],
		] );

		// Assert
		$this->assertFalse( $result );
	}

	public function test_validate__fails_with_prop_value_not_matching_component_overridable_props() {
		// Arrange
		$component_overridable_props = $this->create_mock_overridable_props();
		$prop_type = Component_Override_Prop_type::make()
			->set_component_overridable_props( $component_overridable_props );


		// Act
		$result = $prop_type->validate( [
			'$$type' => 'component-override',
			'value' => [
				'override_key' => 'prop-uuid-1',
				'value' => [ '$$type' => 'number', 'value' => 123 ],
			],
		] );

		// Assert
		$this->assertFalse( $result );
	}

	public function test_sanitize__sanitizes_valid_override() {
		// Arrange
		$component_overridable_props = $this->create_mock_overridable_props();
		$prop_type = Component_Override_Prop_type::make()
			->set_component_overridable_props( $component_overridable_props );


		// Act
		$result = $prop_type->sanitize( [
			'$$type' => 'component-override',
			'value' => [
				'override_key' => ' <script>alert(1)</script>prop-uuid-2 ',
				'value' => [ '$$type' => 'image', 'value' => [
					'src' => [
						'$$type' => 'image-src',
						'value' => [
							'id' => [
								'$$type' => 'image-attachment-id',
								'value' => '123',
							],
							'url' => null,
						],
					],
				] ],
			],
		] );

		// Assert
		$this->assertEquals( [
			'$$type' => 'component-override',
			'value' => [
				'override_key' => 'prop-uuid-2',
				'value' => [ '$$type' => 'image', 'value' => [
					'src' => [
						'$$type' => 'image-src',
						'value' => [
							'id' => [
								'$$type' => 'image-attachment-id',
								'value' => 123,
							],
							'url' => null,
						],
					],
				] ],
			],
		], $result );
	}

	public function test_sanitize__returns_null_when_override_key_not_in_component_props() {
		// Arrange
		$component_overridable_props = $this->create_mock_overridable_props();
		$prop_type = Component_Override_Prop_type::make()
			->set_component_overridable_props( $component_overridable_props );

		// Act
		$result = $prop_type->sanitize( [
			'$$type' => 'component-override',
			'value' => [
				'override_key' => 'non-existent-key',
				'value' => [ '$$type' => 'string', 'value' => 'Some Value' ],
			],
		] );

		// Assert
		$this->assertEquals( [
			'$$type' => 'component-override',
			'value' => null,
		], $result );
	}

	private function create_mock_overridable_props(): array {
		return [
			'props' => [
				'prop-uuid-1' => [
					'overrideKey' => 'prop-uuid-1',
					'label' => 'Heading Title',
					'elementId' => 'element-123',
					'elType' => 'widget',
					'widgetType' => 'e-heading',
					'propKey' => 'title',
					'defaultValue' => [
						'$$type' => 'string',
						'value' => 'Original Title',
					],
					'groupId' => 'group-1',
				],
				'prop-uuid-2' => [
					'overrideKey' => 'prop-uuid-2',
					'label' => 'Image',
					'elementId' => 'element-123',
					'elType' => 'widget',
					'widgetType' => 'e-image',
					'propKey' => 'image',
					'defaultValue' => [
						'$$type' => 'image',
						'value' => [
							'src' => [
								'$$type' => 'image-src',
								'value' => [
									'id' => null,
									'url' => [
										'$$type' => 'url',
										'value' => 'https://example.com/image.jpg'
									],
								],
							],
							'size' => [ '$$type' => 'string', 'value' => 'full' ],
						],
					],
					'groupId' => 'group-1',
				],
			],
			'groups' => [
				'items' => [
					'group-1' => [
						'id' => 'group-1',
						'label' => 'Content',
						'props' => [ 'prop-uuid-1' ],
					],
				],
				'order' => [ 'group-1' ],
			],
		];
	}
}

