<?php

namespace Elementor\Testing\Modules\Components;

use Elementor\Core\Base\Document;
use Elementor\Modules\Components\Documents\Component as Component_Document;
use Elementor\Plugin;
use ElementorEditorTesting\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Test_Component_Align_Overridable_Props extends Elementor_Test_Base {

	public function setUp(): void {
		parent::setUp();

		Plugin::$instance->documents->register_document_type(
			Component_Document::TYPE,
			Component_Document::get_class_full_name()
		);

		register_post_type( Component_Document::TYPE, [
			'label'    => Component_Document::get_title(),
			'labels'   => Component_Document::get_labels(),
			'public'   => false,
			'supports' => Component_Document::get_supported_features(),
		] );
	}

	public function tearDown(): void {
		parent::tearDown();

		$components = get_posts( [
			'post_type'      => Component_Document::TYPE,
			'post_status'    => 'any',
			'posts_per_page' => -1,
		] );

		foreach ( $components as $component ) {
			wp_delete_post( $component->ID, true );
		}
	}

	public function test_align__updates_stale_origin_values_from_elements() {
		// Arrange
		$this->act_as_admin();

		$new_origin_value = [
			'$$type' => 'html-v3',
			'value'  => [
				'content'  => [
					'$$type' => 'string',
					'value' => 'Migrated Title',
				],
				'children' => [],
			],
		];

		$elements_data = [
			[
				'id'       => 'heading-el',
				'elType'   => 'widget',
				'widgetType' => 'e-heading',
				'settings' => [
					'title' => [
						'$$type' => 'overridable',
						'value'  => [
							'override_key' => 'prop-111',
							'origin_value' => $new_origin_value,
						],
					],
				],
				'elements' => [],
			],
		];

		$stale_overridable_props = [
			'props' => [
				'prop-111' => [
					'overrideKey' => 'prop-111',
					'elementId'   => 'heading-el',
					'elType'      => 'widget',
					'widgetType'  => 'e-heading',
					'propKey'     => 'title',
					'label'       => 'Title',
					'originValue' => [
						'$$type' => 'string',
						'value'  => 'Old Stale Title',
					],
					'groupId' => 'group-1',
				],
			],
			'groups' => [
				'items' => [
					'group-1' => [
						'id'    => 'group-1',
						'label' => 'Default',
						'props' => [ 'prop-111' ],
					],
				],
				'order' => [ 'group-1' ],
			],
		];

		$component_id = $this->create_test_component_with_data( $elements_data, $stale_overridable_props );
		$document = Plugin::$instance->documents->get( $component_id, false );

		// Act
		/** @var Component_Document $document */
		$document->align_overridable_props_with_elements();

		// Assert
		$updated_meta = $this->get_stored_overridable_props( $component_id );

		$this->assertEquals(
			$new_origin_value,
			$updated_meta['props']['prop-111']['originValue']
		);
	}

	public function test_align__for_nested_component_with_exposed_further_override_unwraps_override_prop_type_from_origin_value() {
		// Arrange
		$this->act_as_admin();

		$inner_component_overridable_props = [
			'props' => [
				'inner-key' => [
					'overrideKey' => 'inner-key',
					'elementId'   => 'inner-el',
					'elType'      => 'widget',
					'widgetType'  => 'e-heading',
					'propKey'     => 'title',
					'label'       => 'Title',
					'originValue' => [
						'$$type' => 'string',
						'value'  => 'Inner Title',
					],
					'groupId' => 'group-1',
				],
			],
		];

		$inner_component_id = $this->create_test_component_with_data( [], $inner_component_overridable_props );

		$new_origin_value = [
			'$$type' => 'html-v3',
			'value'  => [
				'content'  => [
					'$$type' => 'string',
					'value' => 'Title',
				],
				'children' => [],
			],
		];

		$elements_data = [
			[
				'id'       => 'comp-instance-el',
				'elType'   => 'widget',
				'widgetType' => 'e-component',
				'settings' => [
					'component_instance' => [
						'$$type' => 'component-instance',
						'value'  => [
							'component_id' => [
								'$$type' => 'number',
								'value' => $inner_component_id,
							],
							'overrides' => [
								'$$type' => 'overrides',
								'value' => [
									[
										'$$type' => 'overridable',
										'value'  => [
											'override_key' => 'prop-222',
											'origin_value' => [
												'$$type' => 'override',
												'value'  => [
													'override_key'   => 'inner-key',
													'override_value' => $new_origin_value,
													'schema_source' => [
														'type' => 'component',
														'id' => $inner_component_id,
													],
												],
											],
										],
									]
								]
							],
						],
					],
				],
				'elements' => [],
			],
		];

		$stale_overridable_props = [
			'props' => [
				'prop-222' => [
					'overrideKey' => 'prop-222',
					'elementId'   => 'comp-instance-el',
					'elType'      => 'widget',
					'widgetType'  => 'e-heading',
					'propKey'     => 'title',
					'label'       => 'Title',
					'originValue' => [
						'$$type' => 'html-v3',
						'value'  => [
							'content'  => [
								'$$type' => 'string',
								'value' => 'Old Title',
							],
							'children' => [],
						],
					],
					'groupId' => 'group-1',
				],
			],
			'groups' => [
				'items' => [
					'group-1' => [
						'id'    => 'group-1',
						'label' => 'Default',
						'props' => [ 'prop-222' ],
					],
				],
				'order' => [ 'group-1' ],
			],
		];

		$component_id = $this->create_test_component_with_data( $elements_data, $stale_overridable_props );
		$document = Plugin::$instance->documents->get( $component_id, false );

		// Act
		/** @var Component_Document $document */
		$document->align_overridable_props_with_elements();

		// Assert
		$updated_meta = $this->get_stored_overridable_props( $component_id );

		$this->assertEquals( $new_origin_value, $updated_meta['props']['prop-222']['originValue'] );
	}

	public function test_align__no_op_when_elements_have_no_overridable_settings() {
		// Arrange
		$this->act_as_admin();

		$elements_data = [
			[
				'id'       => 'heading-el',
				'elType'   => 'widget',
				'widgetType' => 'e-heading',
				'settings' => [
					'title' => [
						'$$type' => 'string',
						'value'  => 'Regular non-overridable title',
					],
				],
				'elements' => [],
			],
		];

		$original_overridable_props = [
			'props' => [
				'prop-333' => [
					'overrideKey' => 'prop-333',
					'elementId'   => 'heading-el',
					'elType'      => 'widget',
					'widgetType'  => 'e-heading',
					'propKey'     => 'title',
					'label'       => 'Title',
					'originValue' => [
						'$$type' => 'string',
						'value'  => 'Should Not Change',
					],
					'groupId' => 'group-1',
				],
			],
			'groups' => [
				'items' => [
					'group-1' => [
						'id'    => 'group-1',
						'label' => 'Default',
						'props' => [ 'prop-333' ],
					],
				],
				'order' => [ 'group-1' ],
			],
		];

		$component_id = $this->create_test_component_with_data( $elements_data, $original_overridable_props );
		$document = Plugin::$instance->documents->get( $component_id, false );

		// Act
		/** @var Component_Document $document */
		$document->align_overridable_props_with_elements();

		// Assert
		$stored_meta = $this->get_stored_overridable_props( $component_id );

		$this->assertEquals( $original_overridable_props, $stored_meta );
	}

	public function test_align__traverses_nested_child_elements() {
		// Arrange
		$this->act_as_admin();

		$new_origin_value = [
			'$$type' => 'html-v3',
			'value'  => [
				'content'  => [
					'$$type' => 'string',
					'value' => 'Nested Migrated Value',
				],
				'children' => [],
			],
		];

		$elements_data = [
			[
				'id'       => 'flexbox-wrapper',
				'elType'   => 'e-flexbox',
				'settings' => [],
				'elements' => [
					[
						'id'       => 'nested-heading',
						'elType'   => 'widget',
						'widgetType' => 'e-heading',
						'settings' => [
							'title' => [
								'$$type' => 'overridable',
								'value'  => [
									'override_key' => 'prop-nested',
									'origin_value' => $new_origin_value,
								],
							],
						],
						'elements' => [],
					],
				],
			],
		];

		$stale_overridable_props = [
			'props' => [
				'prop-nested' => [
					'overrideKey' => 'prop-nested',
					'elementId'   => 'nested-heading',
					'elType'      => 'widget',
					'widgetType'  => 'e-heading',
					'propKey'     => 'title',
					'label'       => 'Nested Title',
					'originValue' => [
						'$$type' => 'string',
						'value'  => 'Old Nested Value',
					],
					'groupId' => 'group-1',
				],
			],
			'groups' => [
				'items' => [
					'group-1' => [
						'id'    => 'group-1',
						'label' => 'Default',
						'props' => [ 'prop-nested' ],
					],
				],
				'order' => [ 'group-1' ],
			],
		];

		$component_id = $this->create_test_component_with_data( $elements_data, $stale_overridable_props );
		$document = Plugin::$instance->documents->get( $component_id, false );

		// Act
		/** @var Component_Document $document */
		$document->align_overridable_props_with_elements();

		// Assert
		$updated_meta = $this->get_stored_overridable_props( $component_id );

		$this->assertEquals(
			$new_origin_value,
			$updated_meta['props']['prop-nested']['originValue']
		);
	}

	public function test_align__handles_multiple_overridable_props_across_elements() {
		// Arrange
		$this->act_as_admin();

		$new_title_origin_value = [
			'$$type' => 'html-v3',
			'value'  => [
				'content'  => [
					'$$type' => 'string',
					'value' => 'New Title',
				],
				'children' => [],
			],
		];

		$new_tag_origin_value = [
			'$$type' => 'string',
			'value'  => 'h1',
		];

		$new_image_origin_value = [
			'$$type' => 'image',
			'value'  => [
				'src' => [
					'$$type' => 'image-src',
					'value'  => [
						'id'  => null,
						'url' => [
							'$$type' => 'url',
							'value' => 'https://new.com/img.jpg',
						],
					],
				],
			],
		];

		$elements_data = [
			[
				'id'       => 'heading-el',
				'elType'   => 'widget',
				'widgetType' => 'e-heading',
				'settings' => [
					'title' => [
						'$$type' => 'overridable',
						'value'  => [
							'override_key' => 'prop-title',
							'origin_value' => $new_title_origin_value,
						],
					],
					'tag' => [
						'$$type' => 'overridable',
						'value'  => [
							'override_key' => 'prop-tag',
							'origin_value' => $new_tag_origin_value,
						],
					],
				],
				'elements' => [],
			],
			[
				'id'       => 'image-el',
				'elType'   => 'widget',
				'widgetType' => 'e-image',
				'settings' => [
					'image' => [
						'$$type' => 'overridable',
						'value'  => [
							'override_key' => 'prop-image',
							'origin_value' => $new_image_origin_value,
						],
					],
				],
				'elements' => [],
			],
		];

		$stale_props = [
			'props' => [
				'prop-title' => [
					'overrideKey' => 'prop-title',
					'elementId'   => 'heading-el',
					'elType'      => 'widget',
					'widgetType'  => 'e-heading',
					'propKey'     => 'title',
					'label'       => 'Title',
					'originValue' => [
						'$$type' => 'string',
						'value' => 'Stale Title',
					],
					'groupId'     => 'group-1',
				],
				'prop-tag' => [
					'overrideKey' => 'prop-tag',
					'elementId'   => 'heading-el',
					'elType'      => 'widget',
					'widgetType'  => 'e-heading',
					'propKey'     => 'tag',
					'label'       => 'Tag',
					'originValue' => [
						'$$type' => 'string-v0',
						'value' => 'h3',
					],
					'groupId'     => 'group-1',
				],
				'prop-image' => [
					'overrideKey' => 'prop-image',
					'elementId'   => 'image-el',
					'elType'      => 'widget',
					'widgetType'  => 'e-image',
					'propKey'     => 'image',
					'label'       => 'Image',
					'originValue' => [
						'$$type' => 'image',
						'value'  => [
							'src' => [
								'$$type' => 'image-src-v0',
								'value'  => [
									'id'  => null,
									'url' => [
										'$$type' => 'url',
										'value' => 'https://old.com/img.jpg',
									],
								],
							],
						],
					],
					'groupId'     => 'group-2',
				],
			],
			'groups' => [
				'items' => [
					'group-1' => [
						'id'    => 'group-1',
						'label' => 'Heading',
						'props' => [ 'prop-title', 'prop-tag' ],
					],
					'group-2' => [
						'id'    => 'group-2',
						'label' => 'Media',
						'props' => [ 'prop-image' ],
					],
				],
				'order' => [ 'group-1', 'group-2' ],
			],
		];

		$component_id = $this->create_test_component_with_data( $elements_data, $stale_props );
		$document = Plugin::$instance->documents->get( $component_id, false );

		// Act
		/** @var Component_Document $document */
		$document->align_overridable_props_with_elements();

		// Assert
		$updated_meta = $this->get_stored_overridable_props( $component_id );

		$this->assertEquals(
			$new_title_origin_value,
			$updated_meta['props']['prop-title']['originValue']
		);

		$this->assertEquals(
			$new_tag_origin_value,
			$updated_meta['props']['prop-tag']['originValue']
		);

		$this->assertEquals(
			$new_image_origin_value,
			$updated_meta['props']['prop-image']['originValue']
		);
	}

	private function create_test_component_with_data( array $elements_data, array $overridable_props ): int {
		$document = Plugin::$instance->documents->create(
			Component_Document::get_type(),
			[
				'post_title'  => 'Test Component',
				'post_status' => 'publish',
			]
		);

		$component_id = $document->get_main_id();

		update_post_meta(
			$component_id,
			Document::ELEMENTOR_DATA_META_KEY,
			wp_slash( wp_json_encode( $elements_data ) )
		);

		update_post_meta(
			$component_id,
			Component_Document::OVERRIDABLE_PROPS_META_KEY,
			wp_slash( wp_json_encode( $overridable_props ) )
		);

		return $component_id;
	}

	private function get_stored_overridable_props( int $component_id ): array {
		$raw = get_post_meta( $component_id, Component_Document::OVERRIDABLE_PROPS_META_KEY, true );

		return json_decode( $raw, true );
	}
}
