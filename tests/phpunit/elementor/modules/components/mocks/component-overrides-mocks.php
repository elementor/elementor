<?php
namespace Elementor\Testing\Modules\Components\Mocks;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Component_Overrides_Mocks {
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
						'props' => [ 'prop-uuid-3', 'prop-uuid-4' ],
					],
				],
				'order' => [ 'group-1-uuid', 'group-2-uuid' ],
			],
		];
	}

	public function get_mock_valid_heading_title_component_override(): array {
		return [
			'override_key' => 'prop-uuid-1',
			'value' => [ '$$type' => 'html', 'value' => 'New Title' ],
		];
	}

	public function get_mock_valid_heading_tag_component_override(): array {
		return [
			'override_key' => 'prop-uuid-2',
			'value' => [ '$$type' => 'string', 'value' => 'h1' ],
		];
	}

	public function get_mock_valid_image_image_component_override(): array {
		return [
			'override_key' => 'prop-uuid-3',
			'value' => [
				'$$type' => 'image',
				'value' => [
					'src' => [
						'$$type' => 'image-src',
						'value' => [
							'id' => [
								'$$type' => 'image-attachment-id',
								'value' => 123
							],
							'url' => null,
						]
					],
					'size' => [ '$$type' => 'string', 'value' => 'full' ],
				],
			],
		];
	}

	public function get_mock_valid_image_link_component_override(): array {
		return [
			'override_key' => 'prop-uuid-4',
			'value' => [
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
		];
	}

	public function get_mock_invalid_override(): array {
		return [
			'override_key' => 'prop-uuid-2',
			'value' => [
				'$$type' => 'string',
				'value' => 'invalid-value-not-matching-original-prop-type-enum-h1-h6',
			],
		];
	}

	public function get_mock_image_image_component_override_to_sanitize(): array {
		$before_sanitization = [
			'override_key' => ' <script>alert(1)</script>prop-uuid-3 ',
			'value' => [ 
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
		];

		$expected_after_sanitization = [
			'override_key' => 'prop-uuid-3',
			'value' => [ 
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
		];

		return [
			'before_sanitization' => $before_sanitization,
			'expected_after_sanitization' => $expected_after_sanitization,
		];
	}

	public function get_mock_heading_tag_component_override_to_sanitize(): array {
		$before_sanitization = [
			'override_key' => ' <script>alert(2)</script>prop-uuid-2 ',
			'value' => [ '$$type' => 'string', 'value' => '<script>alert(3)</script>h1' ],
		];
		$expected_after_sanitization = [
			'override_key' => 'prop-uuid-2',
			'value' => [ '$$type' => 'string', 'value' => 'h1' ],
		];
		return [
			'before_sanitization' => $before_sanitization,
			'expected_after_sanitization' => $expected_after_sanitization,
		];
	}
}
