<?php
namespace Elementor\Testing\Modules\Components\Mocks;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Component_Overrides_Mocks {
	const VALID_COMPONENT_ID = 123;

	public function get_mock_component_overridable_props(): array {
		return [
			'props' => [
				'prop-uuid-1' => [
					'overrideKey' => 'prop-uuid-1',
					'label' => 'Heading Title',
					'elementId' => 'heading-123',
					'elType' => 'widget',
					'widgetType' => 'e-heading',
					'propKey' => 'title',
					'originValue' => [
						'$$type' => 'string',
						'value' => 'Original Title',
					],
					'groupId' => 'group-1',
				],
				'prop-uuid-2' => [
					'overrideKey' => 'prop-uuid-2',
					'label' => 'Heading Tag',
					'elementId' => 'heading-123',
					'elType' => 'widget',
					'widgetType' => 'e-heading',
					'propKey' => 'tag',
					'originValue' => [
						'$$type' => 'string',
						'value' => 'h3',
					],
					'groupId' => 'group-1',
				],
				'prop-uuid-3' => [
					'overrideKey' => 'prop-uuid-3',
					'label' => 'Image',
					'elementId' => 'image-123',
					'elType' => 'widget',
					'widgetType' => 'e-image',
					'propKey' => 'image',
					'originValue' => [
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
					'groupId' => 'group-2',
				],
				'prop-uuid-4' => [
					'overrideKey' => 'prop-uuid-4',
					'label' => 'Image Link',
					'elementId' => 'image-123',
					'elType' => 'widget',
					'widgetType' => 'e-image',
					'propKey' => 'link',
					'originValue' => [
						'$$type' => 'link',
						'value' => [
							'destination' => [
								'$$type' => 'url',
								'value' => 'https://test.com',
							],
							'isTargetBlank' => [
								'$$type' => 'boolean',
								'value' => true,
							]
						],
					],
					'groupId' => 'group-2',
				],
				'prop-uuid-5' => [
					'overrideKey' => 'prop-uuid-5',
					'label' => 'Exposed further button text',
					'elementId' => 'button-123',
					'elType' => 'widget',
					'widgetType' => 'e-component',
					'propKey' => 'override',
					'originValue' => [
						'$$type' => 'string',
						'value' => 'Click here',
					],
					'originPropFields' => [
						'elType' => 'widget',
						'widgetType' => 'e-button',
						'propKey' => 'text',
					],
					'groupId' => 'group-2',
				],
			],
			'groups' => [
				'items' => [
					'group-1' => [
						'id' => 'group-1-uuid',
						'label' => 'Heading',
						'props' => [ 'prop-uuid-1', 'prop-uuid-2' ],
					],
					'group-2' => [
						'id' => 'group-2-uuid',
						'label' => 'Image',
						'props' => [ 'prop-uuid-3', 'prop-uuid-4', 'prop-uuid-5' ],
					],
				],
				'order' => [ 'group-1-uuid', 'group-2-uuid' ],
			],
		];
	}

	public function get_mock_valid_heading_title_component_override(): array {
		return [
			'$$type' => 'override',
			'value' => [
				'override_key' => 'prop-uuid-1',
				'override_value' => [ '$$type' => 'html', 'value' => 'New Title' ],
				'schema_source' => ['type' => 'component', 'id' => self::VALID_COMPONENT_ID ],
			],
		];
	}

	public function get_mock_valid_heading_tag_component_override(): array {
		return [
			'$$type' => 'override',
			'value' => [
				'override_key' => 'prop-uuid-2',
				'override_value' => [ '$$type' => 'string', 'value' => 'h1' ],
				'schema_source' => ['type' => 'component', 'id' => self::VALID_COMPONENT_ID ],
			],
		];
	}

	public function get_mock_valid_image_image_component_override(): array {
		return [
			'$$type' => 'override',
			'value' => [
				'override_key' => 'prop-uuid-3',
				'override_value' => [
					'$$type' => 'image',
					'value' => [
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
					],
				],
				'schema_source' => ['type' => 'component', 'id' => self::VALID_COMPONENT_ID ],
			],
		];
	}

	public function get_mock_valid_image_link_component_override(): array {
		return [
			'$$type' => 'override',
			'value' => [
				'override_key' => 'prop-uuid-4',
				'override_value' => [
					'$$type' => 'link',
					'value' => [
						'destination' => [
							'$$type' => 'url',
							'value' => 'https://elementor.com',
						],
						'isTargetBlank' => [
							'$$type' => 'boolean',
							'value' => true,
						],
					],
				],
				'schema_source' => ['type' => 'component', 'id' => self::VALID_COMPONENT_ID ],
			],
		];
	}

	public function get_mock_component_overridable_props_with_autosave_only_prop(): array {
		$base_props = $this->get_mock_component_overridable_props();

		$base_props['props']['prop-uuid-autosave-only'] = [
			'overrideKey' => 'prop-uuid-autosave-only',
			'label' => 'Autosave Only Prop',
			'elementId' => 'heading-456',
			'elType' => 'widget',
			'widgetType' => 'e-heading',
			'propKey' => 'title',
			'originValue' => [
				'$$type' => 'html',
				'value' => 'Autosave Title',
			],
			'groupId' => 'group-1',
		];

		return $base_props;
	}

	public function get_mock_image_image_component_override_to_sanitize(): array {
		$before_sanitization = [
			'override_key' => ' </>prop-uuid-3 ',
			'override_value' => [ 
				'$$type' => 'image', 
				'value' => [
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
				],
			],
			'schema_source' => ['type' => 'component', 'id' => self::VALID_COMPONENT_ID ],
		];

		$expected_after_sanitization = [
			'override_key' => 'prop-uuid-3',
			'override_value' => [ 
				'$$type' => 'image',
				'value' => [
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
				] 
			],
			'schema_source' => ['type' => 'component', 'id' => self::VALID_COMPONENT_ID ],
		];

		return [
			'before_sanitization' => $before_sanitization,
			'expected_after_sanitization' => $expected_after_sanitization,
		];
	}
}
