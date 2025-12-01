<?php
namespace Elementor\Testing\Modules\Components;

use Elementor\Modules\Components\Documents\Component as Component_Document;
use Elementor\Modules\Components\Documents\Component_Overridable_Props_Parser;
use Elementor\Plugin;
use ElementorEditorTesting\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Test_Component_Overridable_Props extends Elementor_Test_Base {

	private $test_component_id;

	public function setUp(): void {
		parent::setUp();

		Plugin::$instance->documents->register_document_type(
			Component_Document::TYPE,
			Component_Document::get_class_full_name()
		);

		register_post_type( Component_Document::TYPE, [
			'label' => Component_Document::get_title(),
			'labels' => Component_Document::get_labels(),
			'public' => false,
			'supports' => Component_Document::get_supported_features(),
		] );

		$this->test_component_id = $this->create_test_component();
	}

	public function tearDown(): void {
		parent::tearDown();
		$this->clean_up_component();
	}

	private function create_test_component(): int {
		$post_id = wp_insert_post( [
			'post_type' => Component_Document::TYPE,
			'post_title' => 'Test Component',
			'post_status' => 'publish',
		] );

		return $post_id;
	}

	private function clean_up_component() {
		if ( $this->test_component_id && get_post( $this->test_component_id ) ) {
			wp_delete_post( $this->test_component_id, true );
		}
	}

	public function test_set_overridable_props__with_valid_data__succeeds() {
		$component = Plugin::$instance->documents->get( $this->test_component_id );

		$valid_data = [
			'props' => [
				'prop-uuid-1' => [
					'overrideKey' => 'prop-uuid-1',
					'label' => 'User Name',
					'elementId' => 'element-123',
					'propKey' => 'title',
					'widgetType' => 'e-heading',
					'elementType' => 'widget',
					'defaultValue' => [
						'$$type' => 'string',
						'value' => 'Original text',
					],
					'groupId' => 'group-uuid-1',
				],
			],
			'groups' => [
				'items' => [
					'group-uuid-1' => [
						'id' => 'group-uuid-1',
						'label' => 'User Info',
						'props' => [ 'prop-uuid-1' ],
					],
				],
				'order' => [ 'group-uuid-1' ],
			],
		];

		$result = $component->set_overridable_props( $valid_data );

		$this->assertTrue( $result->is_valid() );
	}

	public function test_set_overridable_props__with_empty_data__succeeds() {
		$component = Plugin::$instance->documents->get( $this->test_component_id );

		$empty_data = [
			'props' => [],
			'groups' => [],
		];

		$result = $component->set_overridable_props( $empty_data );

		$this->assertTrue( $result->is_valid() );
	}

	public function test_set_overridable_props__missing_props__fails() {
		$component = Plugin::$instance->documents->get( $this->test_component_id );

		$invalid_data = [
			'groups' => [],
		];

		$result = $component->set_overridable_props( $invalid_data );

		$this->assertFalse( $result->is_valid() );
		$this->assertCount( 1, $result->errors()->all() );
	}

	public function test_set_overridable_props__missing_groups__fails() {
		$component = Plugin::$instance->documents->get( $this->test_component_id );

		$invalid_data = [
			'props' => [],
		];

		$result = $component->set_overridable_props( $invalid_data );

		$this->assertFalse( $result->is_valid() );
		$this->assertCount( 1, $result->errors()->all() );
	}

	public function test_set_overridable_props__mismatching_override_key__fails() {
		$component = Plugin::$instance->documents->get( $this->test_component_id );

		$invalid_data = [
			'props' => [
				'prop-uuid-1' => [
					'overrideKey' => 'different-uuid',
					'label' => 'User Name',
					'elementId' => 'element-123',
					'propKey' => 'title',
					'widgetType' => 'e-heading',
					'elementType' => 'widget',
					'defaultValue' => [
						'$$type' => 'string',
						'value' => 'Original text',
					],
					'groupId' => 'group-uuid-1',
				],
			],
			'groups' => [
				'items' => [
					'group-uuid-1' => [
						'id' => 'group-uuid-1',
						'label' => 'User Info',
						'props' => [ 'prop-uuid-1' ],
					],
				],
				'order' => [ 'group-uuid-1' ],
			],
		];

		$result = $component->set_overridable_props( $invalid_data );

		$this->assertFalse( $result->is_valid() );
	}

	public function test_set_overridable_props__prop_not_in_group__fails() {
		$component = Plugin::$instance->documents->get( $this->test_component_id );

		$invalid_data = [
			'props' => [
				'prop-uuid-1' => [
					'overrideKey' => 'prop-uuid-1',
					'label' => 'User Name',
					'elementId' => 'element-123',
					'propKey' => 'title',
					'widgetType' => 'e-heading',
					'elementType' => 'widget',
					'defaultValue' => [
						'$$type' => 'string',
						'value' => 'Original text',
					],
					'groupId' => 'group-uuid-1',
				],
			],
			'groups' => [
				'items' => [
					'group-uuid-1' => [
						'id' => 'group-uuid-1',
						'label' => 'User Info',
						'props' => [],
					],
				],
				'order' => [ 'group-uuid-1' ],
			],
		];

		$result = $component->set_overridable_props( $invalid_data );

		$this->assertFalse( $result->is_valid() );
	}

	public function test_set_overridable_props__duplicate_group_labels__fails() {
		$component = Plugin::$instance->documents->get( $this->test_component_id );

		$invalid_data = [
			'props' => [
				'prop-uuid-1' => [
					'overrideKey' => 'prop-uuid-1',
					'label' => 'User Name',
					'elementId' => 'element-123',
					'propKey' => 'title',
					'widgetType' => 'e-heading',
					'elementType' => 'widget',
					'defaultValue' => [
						'$$type' => 'string',
						'value' => 'Original text',
					],
					'groupId' => 'group-uuid-1',
				],
				'prop-uuid-2' => [
					'overrideKey' => 'prop-uuid-2',
					'label' => 'User Email',
					'elementId' => 'element-124',
					'propKey' => 'text',
					'widgetType' => 'e-text',
					'elementType' => 'widget',
					'defaultValue' => [
						'$$type' => 'string',
						'value' => 'test@example.com',
					],
					'groupId' => 'group-uuid-2',
				],
			],
			'groups' => [
				'items' => [
					'group-uuid-1' => [
						'id' => 'group-uuid-1',
						'label' => 'User Info',
						'props' => [ 'prop-uuid-1' ],
					],
					'group-uuid-2' => [
						'id' => 'group-uuid-2',
						'label' => 'User Info',
						'props' => [ 'prop-uuid-2' ],
					],
				],
				'order' => [ 'group-uuid-1', 'group-uuid-2' ],
			],
		];

		$result = $component->set_overridable_props( $invalid_data );

		$this->assertFalse( $result->is_valid() );
	}

	public function test_set_overridable_props__duplicate_prop_labels_in_same_group__fails() {
		$component = Plugin::$instance->documents->get( $this->test_component_id );

		$invalid_data = [
			'props' => [
				'prop-uuid-1' => [
					'overrideKey' => 'prop-uuid-1',
					'label' => 'User Name',
					'elementId' => 'element-123',
					'propKey' => 'title',
					'widgetType' => 'e-heading',
					'elementType' => 'widget',
					'defaultValue' => [
						'$$type' => 'string',
						'value' => 'Original text',
					],
					'groupId' => 'group-uuid-1',
				],
				'prop-uuid-2' => [
					'overrideKey' => 'prop-uuid-2',
					'label' => 'User Name',
					'elementId' => 'element-124',
					'propKey' => 'text',
					'widgetType' => 'e-text',
					'elementType' => 'widget',
					'defaultValue' => [
						'$$type' => 'string',
						'value' => 'Another text',
					],
					'groupId' => 'group-uuid-1',
				],
			],
			'groups' => [
				'items' => [
					'group-uuid-1' => [
						'id' => 'group-uuid-1',
						'label' => 'User Info',
						'props' => [ 'prop-uuid-1', 'prop-uuid-2' ],
					],
				],
				'order' => [ 'group-uuid-1' ],
			],
		];

		$result = $component->set_overridable_props( $invalid_data );

		$this->assertFalse( $result->is_valid() );
	}

	public function test_set_overridable_props__group_order_missing_id__fails() {
		$component = Plugin::$instance->documents->get( $this->test_component_id );

		$invalid_data = [
			'props' => [
				'prop-uuid-1' => [
					'overrideKey' => 'prop-uuid-1',
					'label' => 'User Name',
					'elementId' => 'element-123',
					'propKey' => 'title',
					'widgetType' => 'e-heading',
					'elementType' => 'widget',
					'defaultValue' => [
						'$$type' => 'string',
						'value' => 'Original text',
					],
					'groupId' => 'group-uuid-1',
				],
			],
			'groups' => [
				'items' => [
					'group-uuid-1' => [
						'id' => 'group-uuid-1',
						'label' => 'User Info',
						'props' => [ 'prop-uuid-1' ],
					],
				],
				'order' => [],
			],
		];

		$result = $component->set_overridable_props( $invalid_data );

		$this->assertFalse( $result->is_valid() );
	}

	public function test_parser__sanitizes_strings() {
		$parser = Component_Overridable_Props_Parser::make();

		$data_with_html = [
			'props' => [
				'prop-uuid-1' => [
					'overrideKey' => 'prop-uuid-1',
					'label' => '<script>alert("xss")</script>User Name',
					'elementId' => 'element-123',
					'propKey' => 'title',
					'widgetType' => 'e-heading',
					'elementType' => 'widget',
					'defaultValue' => [
						'$$type' => 'string',
						'value' => '<strong>Bold text</strong>',
					],
					'groupId' => 'group-uuid-1',
				],
			],
			'groups' => [
				'items' => [
					'group-uuid-1' => [
						'id' => 'group-uuid-1',
						'label' => '<b>User Info</b>',
						'props' => [ 'prop-uuid-1' ],
					],
				],
				'order' => [ 'group-uuid-1' ],
			],
		];

		$result = $parser->parse( $data_with_html );

		$this->assertTrue( $result->is_valid() );

		$sanitized = $result->unwrap();
		$this->assertStringNotContainsString( '<script>', $sanitized['props']['prop-uuid-1']['label'] );
		$this->assertStringNotContainsString( '<b>', $sanitized['groups']['items']['group-uuid-1']['label'] );
	}
}

