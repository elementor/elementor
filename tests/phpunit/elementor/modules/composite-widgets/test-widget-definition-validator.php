<?php

namespace Elementor\Testing\Modules\CompositeWidgets;

use Elementor\Core\Utils\Api\Parse_Result;
use Elementor\Modules\CompositeWidgets\Definitions\Validation\Definition_Error_Codes;
use Elementor\Modules\CompositeWidgets\Definitions\Validation\Template_Rules;
use Elementor\Modules\CompositeWidgets\Definitions\Validation\Widget_Definition_Validator;
use ElementorEditorTesting\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Test_Widget_Definition_Validator extends Elementor_Test_Base {
	const EXAMPLES_DIR = __DIR__ . '/../../../../../modules/composite-widgets/schema/examples/';
	const LABEL_PATH = 'template.elements.1';

	private Widget_Definition_Validator $validator;

	public function setUp(): void {
		parent::setUp();

		$this->validator = Widget_Definition_Validator::make();
	}

	public function tearDown(): void {
		remove_all_filters( Template_Rules::ALLOWED_PART_TYPES_FILTER );

		parent::tearDown();
	}

	public function test_validate__every_example_is_valid() {
		foreach ( glob( self::EXAMPLES_DIR . '*.json' ) as $file ) {
			// Act.
			$result = $this->validator->validate( $this->read_example( basename( $file ) ) );

			// Assert.
			$this->assertSame( '', $result->errors()->to_string(), basename( $file ) );
		}
	}

	public function test_validate__rejects_invalid_shape_and_stops() {
		// Arrange.
		$definition = $this->icon_button();
		$definition['id'] = 'Not An Id';
		$definition['template']['elements'][0]['elType'] = 'e-tabs';

		// Act.
		$result = $this->validator->validate( $definition );

		// Assert.
		$this->assertSame( 'id: ' . Definition_Error_Codes::DEFINITION_INVALID, $result->errors()->to_string() );
	}

	public function test_validate__rejects_element_id_in_template() {
		// Arrange.
		$definition = $this->icon_button();
		$definition['template']['elements'][0]['id'] = 'abc123';

		// Act.
		$result = $this->validator->validate( $definition );

		// Assert.
		$this->assert_has_error( $result, 'template.elements.0', Definition_Error_Codes::TEMPLATE_NODE_INVALID );
	}

	public function test_validate__rejects_invalid_and_duplicate_part_names() {
		// Arrange.
		$definition = $this->icon_button();
		$definition['template']['elements'][0]['part'] = 'Icon';
		$definition['template']['elements'][1]['part'] = 'root';

		// Act.
		$result = $this->validator->validate( $definition );

		// Assert.
		$this->assert_has_error( $result, 'template.elements.0.part', Definition_Error_Codes::PART_INVALID );
		$this->assert_has_error( $result, self::LABEL_PATH . '.part', Definition_Error_Codes::PART_DUPLICATE );
	}

	public function test_validate__rejects_element_types_outside_the_allow_list() {
		// Arrange.
		$definition = $this->icon_button();
		$definition['template']['elements'][0]['widgetType'] = 'e-tabs';

		// Act.
		$result = $this->validator->validate( $definition );

		// Assert.
		$this->assert_has_error( $result, 'template.elements.0.widgetType', Definition_Error_Codes::PART_TYPE_NOT_ALLOWED );
	}

	public function test_validate__allow_list_is_filterable() {
		// Arrange.
		add_filter( Template_Rules::ALLOWED_PART_TYPES_FILTER, fn ( array $types ) => array_diff( $types, [ 'e-svg' ] ) );

		// Act.
		$result = $this->validator->validate( $this->icon_button() );

		// Assert.
		$this->assert_has_error( $result, 'template.elements.0.widgetType', Definition_Error_Codes::PART_TYPE_NOT_ALLOWED );
	}

	public function test_validate__falls_back_to_default_allow_list_when_filter_returns_non_array() {
		// Arrange.
		add_filter( Template_Rules::ALLOWED_PART_TYPES_FILTER, fn () => 'not-an-array' );

		// Act.
		$result = $this->validator->validate( $this->icon_button() );

		// Assert.
		$this->assertSame( '', $result->errors()->to_string() );
	}

	public function test_validate__resolves_widgets_and_elements_in_their_own_manager() {
		// Arrange.
		$definition = $this->icon_button();
		$definition['template']['elements'][1] = [
			'elType' => 'e-paragraph',
			'part' => 'label',
		];
		$definition['template']['elements'][0] = [
			'elType' => 'widget',
			'widgetType' => 'e-flexbox',
			'part' => 'icon',
		];

		// Act.
		$result = $this->validator->validate( $definition );

		// Assert.
		$this->assert_has_error( $result, self::LABEL_PATH . '.elType', Definition_Error_Codes::ELEMENT_TYPE_NOT_FOUND );
		$this->assert_has_error( $result, 'template.elements.0.widgetType', Definition_Error_Codes::ELEMENT_TYPE_NOT_FOUND );
	}

	public function test_validate__rejects_widget_type_on_an_element_node() {
		// Arrange.
		$definition = $this->icon_button();
		$definition['template']['widgetType'] = 'e-flexbox';

		// Act.
		$result = $this->validator->validate( $definition );

		// Assert.
		$this->assert_has_error( $result, 'template.widgetType', Definition_Error_Codes::TEMPLATE_NODE_INVALID );
	}

	public function test_validate__rejects_settings_the_element_would_reject_on_save() {
		// Arrange.
		$definition = $this->icon_button();
		$definition['template']['elements'][1]['settings']['paragraph'] = [ '$$type' => 'number', 'value' => 5 ];

		// Act.
		$result = $this->validator->validate( $definition );

		// Assert.
		$this->assert_has_error( $result, self::LABEL_PATH . '.settings.paragraph', Definition_Error_Codes::TEMPLATE_SETTINGS_INVALID );
	}

	public function test_validate__rejects_local_style_not_keyed_by_the_part() {
		// Arrange.
		$definition = $this->icon_button();
		$definition['template']['styles']['local-other'] = $definition['template']['styles']['local-root'];

		// Act.
		$result = $this->validator->validate( $definition );

		// Assert.
		$this->assert_has_error( $result, 'template.styles.local-other', Definition_Error_Codes::TEMPLATE_STYLE_INVALID );
	}

	public function test_validate__rejects_local_style_the_style_parser_rejects() {
		// Arrange.
		$definition = $this->icon_button();
		$definition['template']['styles']['local-root']['variants'][0]['meta']['state'] = 'not-a-state';

		// Act.
		$result = $this->validator->validate( $definition );

		// Assert.
		$this->assertStringContainsString( 'template.styles.local-root.', $result->errors()->to_string() );
		$this->assertStringContainsString( Definition_Error_Codes::TEMPLATE_STYLE_INVALID, $result->errors()->to_string() );
	}

	public function test_validate__rejects_unknown_style_prop_in_local_style() {
		// Arrange.
		$definition = $this->icon_button();
		$definition['template']['styles']['local-root']['variants'][0]['props']['colr'] = [ '$$type' => 'color', 'value' => '#000000' ];

		// Act.
		$result = $this->validator->validate( $definition );

		// Assert.
		$this->assert_has_error( $result, 'template.styles.local-root.variants.0.props.colr', Definition_Error_Codes::TEMPLATE_STYLE_INVALID );
	}

	public function test_validate__rejects_unknown_breakpoints_in_local_styles_and_presets() {
		// Arrange.
		$definition = $this->icon_button();
		$definition['template']['styles']['local-root']['variants'][0]['meta']['breakpoint'] = 'phone';
		$definition['style']['appearance'][0]['options'][0]['set'][0]['style']['phone'] = [ 'color' => [ '$$type' => 'color', 'value' => '#000000' ] ];

		// Act.
		$result = $this->validator->validate( $definition );

		// Assert.
		$this->assert_has_error( $result, 'template.styles.local-root.variants.0.meta.breakpoint', Definition_Error_Codes::TEMPLATE_STYLE_INVALID );
		$this->assert_has_error( $result, 'style.appearance.0.options.0.set.0.style.phone', Definition_Error_Codes::PRESET_STYLE_INVALID );
	}

	public function test_validate__accepts_every_defined_breakpoint_active_or_not() {
		// Arrange.
		$definition = $this->icon_button();
		$root_variant = $definition['template']['styles']['local-root']['variants'][0];
		$preset_write = $definition['style']['appearance'][0]['options'][0]['set'][1];

		foreach ( [ 'widescreen', 'laptop', 'tablet_extra', 'tablet', 'mobile_extra', 'mobile' ] as $breakpoint ) {
			$variant = $root_variant;
			$variant['meta']['breakpoint'] = $breakpoint;
			$definition['template']['styles']['local-root']['variants'][] = $variant;
			$preset_write['style'][ $breakpoint ] = $preset_write['style']['desktop'];
		}

		$definition['style']['appearance'][0]['options'][0]['set'][1] = $preset_write;

		// Act.
		$result = $this->validator->validate( $definition );

		// Assert.
		$this->assertSame( '', $result->errors()->to_string() );
	}

	public function test_validate__rejects_style_lists_that_are_not_arrays() {
		// Arrange.
		$definition = $this->icon_button();
		$definition['style']['appearance'] = 'filled';
		$definition['style']['quick_edit'] = 'align';

		// Act.
		$result = $this->validator->validate( $definition );

		// Assert.
		$this->assert_has_error( $result, 'style.appearance', Definition_Error_Codes::DEFINITION_INVALID );
		$this->assert_has_error( $result, 'style.quick_edit', Definition_Error_Codes::DEFINITION_INVALID );
	}

	public function test_validate__rejects_global_class_and_variable_references_in_code_definitions() {
		// Arrange.
		$definition = $this->with_global_references( $this->icon_button() );

		// Act.
		$result = $this->validator->validate( $definition );

		// Assert.
		$this->assert_has_error( $result, 'template.settings.classes', Definition_Error_Codes::GLOBAL_REFERENCE_NOT_ALLOWED );
		$this->assert_has_error( $result, 'template.styles.local-root.variants.0.props.border-color', Definition_Error_Codes::GLOBAL_REFERENCE_NOT_ALLOWED );
		$this->assert_has_error( $result, 'style.appearance.0.options.0.set.1.style.desktop.color', Definition_Error_Codes::GLOBAL_REFERENCE_NOT_ALLOWED );
	}

	public function test_validate__allows_global_references_in_site_definitions() {
		// Arrange.
		$definition = $this->with_global_references( $this->icon_button() );
		$definition['source'] = 'site';

		// Act.
		$result = $this->validator->validate( $definition );

		// Assert.
		$this->assertStringNotContainsString( Definition_Error_Codes::GLOBAL_REFERENCE_NOT_ALLOWED, $result->errors()->to_string() );
	}

	public function test_validate__rejects_targets_to_missing_parts_and_props() {
		// Arrange.
		$definition = $this->icon_button();
		$definition['general'][0]['fields'][0]['target'] = [ 'part' => 'missing', 'prop' => 'paragraph' ];
		$definition['general'][0]['fields'][2]['target']['prop'] = 'not_a_prop';

		// Act.
		$result = $this->validator->validate( $definition );

		// Assert.
		$this->assert_has_error( $result, 'general.0.fields.0.target.part', Definition_Error_Codes::TARGET_PART_NOT_FOUND );
		$this->assert_has_error( $result, 'general.0.fields.2.target.prop', Definition_Error_Codes::TARGET_PROP_NOT_FOUND );
	}

	public function test_validate__rejects_groups_nested_in_a_group_or_a_repeater() {
		// Arrange.
		$definition = $this->read_example( 'pricing-card.json' );
		$nested_group = [
			'label' => 'Advanced',
			'fields' => [ [ 'label' => 'Link', 'target' => [ 'part' => 'button', 'prop' => 'link' ] ] ],
		];
		$definition['general'][0]['fields'][3]['fields'][] = $nested_group;
		$definition['general'][1]['item_fields'][] = $nested_group;

		// Act.
		$result = $this->validator->validate( $definition );

		// Assert.
		$this->assert_has_error( $result, 'general.0.fields.3.fields.2', Definition_Error_Codes::DEFINITION_INVALID );
		$this->assert_has_error( $result, 'general.1.item_fields.1', Definition_Error_Codes::DEFINITION_INVALID );
	}

	public function test_validate__rejects_removable_root_and_missing_removable_part() {
		// Arrange.
		$definition = $this->icon_button();
		$definition['general'][0]['fields'][2]['removable'] = true;
		$definition['general'][0]['fields'][0]['removable'] = [ 'part' => 'missing' ];

		// Act.
		$result = $this->validator->validate( $definition );

		// Assert.
		$this->assert_has_error( $result, 'general.0.fields.2.removable', Definition_Error_Codes::REMOVABLE_PART_INVALID );
		$this->assert_has_error( $result, 'general.0.fields.0.removable', Definition_Error_Codes::REMOVABLE_PART_INVALID );
	}

	public function test_validate__rejects_invalid_preset_writes() {
		// Arrange.
		$definition = $this->icon_button();
		$definition['style']['appearance'][0]['options'][0]['set'][0]['part'] = 'missing';
		$definition['style']['appearance'][0]['options'][1]['set'][1]['style']['desktop']['not-a-css-prop'] = [ '$$type' => 'string', 'value' => 'x' ];
		$definition['style']['appearance'][0]['options'][1]['set'][1]['style']['desktop']['color'] = [ '$$type' => 'size', 'value' => 1 ];

		// Act.
		$result = $this->validator->validate( $definition );

		// Assert.
		$this->assert_has_error( $result, 'style.appearance.0.options.0.set.0.part', Definition_Error_Codes::TARGET_PART_NOT_FOUND );
		$this->assert_has_error( $result, 'style.appearance.0.options.1.set.1.style.desktop.not-a-css-prop', Definition_Error_Codes::PRESET_STYLE_INVALID );
		$this->assert_has_error( $result, 'style.appearance.0.options.1.set.1.style.desktop.color', Definition_Error_Codes::PRESET_STYLE_INVALID );
	}

	public function test_validate__rejects_invalid_quick_edit() {
		// Arrange.
		$definition = $this->icon_button();
		$definition['style']['quick_edit'] = [
			[ 'label' => 'Bad prop', 'style_prop' => 'not-a-css-prop', 'targets' => [ 'root' ] ],
			[ 'label' => 'Bad target', 'style_prop' => 'gap', 'targets' => [ 'root', 'missing' ] ],
		];

		// Act.
		$result = $this->validator->validate( $definition );

		// Assert.
		$this->assert_has_error( $result, 'style.quick_edit.0', Definition_Error_Codes::QUICK_EDIT_INVALID );
		$this->assert_has_error( $result, 'style.quick_edit.1.targets.1', Definition_Error_Codes::TARGET_PART_NOT_FOUND );
	}

	public function test_validate__repeater_items_share_parts_but_must_share_their_shape() {
		// Arrange.
		$definition = $this->read_example( 'pricing-card.json' );
		array_pop( $definition['template']['elements'][3]['elements'][1]['elements'] );

		// Act.
		$result = $this->validator->validate( $definition );

		// Assert.
		$this->assertSame(
			'template.elements.3.elements.1: ' . Definition_Error_Codes::REPEATER_ITEM_SHAPE_MISMATCH,
			$result->errors()->to_string()
		);
	}

	public function test_validate__rejects_repeater_with_missing_container() {
		// Arrange.
		$definition = $this->read_example( 'pricing-card.json' );
		$definition['general'][1]['container'] = 'missing';

		// Act.
		$result = $this->validator->validate( $definition );

		// Assert.
		$this->assert_has_error( $result, 'general.1.container', Definition_Error_Codes::TARGET_PART_NOT_FOUND );
	}

	public function test_validate__accepts_a_slot_with_regular_content() {
		// Arrange.
		$definition = $this->tabs_like_with_slot();

		// Act.
		$result = $this->validator->validate( $definition );

		// Assert.
		$this->assertSame( '', $result->errors()->to_string() );
	}

	public function test_validate__rejects_invalid_slots() {
		// Arrange.
		$definition = $this->tabs_like_with_slot();
		$definition['template']['slot'] = true;
		$definition['template']['elements'][0]['slot'] = true;
		$definition['template']['elements'][1]['slot'] = 'yes';
		$definition['template']['elements'][1]['elements'][0]['slot'] = true;

		// Act.
		$result = $this->validator->validate( $definition );

		// Assert.
		$this->assert_has_error( $result, 'template.slot', Definition_Error_Codes::SLOT_INVALID );
		$this->assert_has_error( $result, 'template.elements.0.slot', Definition_Error_Codes::SLOT_INVALID );
		$this->assert_has_error( $result, 'template.elements.1.slot', Definition_Error_Codes::SLOT_INVALID );
		$this->assert_has_error( $result, 'template.elements.1.elements.0.slot', Definition_Error_Codes::SLOT_INVALID );
	}

	public function test_validate__rejects_parts_below_a_slot() {
		// Arrange.
		$definition = $this->tabs_like_with_slot();
		$definition['template']['elements'][1]['elements'][0]['part'] = 'slot_title';

		// Act.
		$result = $this->validator->validate( $definition );

		// Assert.
		$this->assertSame(
			'template.elements.1.elements.0.part: ' . Definition_Error_Codes::SLOT_CONTENT_PART,
			$result->errors()->to_string()
		);
	}

	private function tabs_like_with_slot(): array {
		return [
			'id' => 'test/tabs-like',
			'version' => 1,
			'source' => 'code',
			'title' => 'Tabs like',
			'template' => [
				'elType' => 'e-flexbox',
				'part' => 'root',
				'elements' => [
					[
						'elType' => 'widget',
						'widgetType' => 'e-heading',
						'part' => 'title',
					],
					[
						'elType' => 'e-flexbox',
						'part' => 'content',
						'slot' => true,
						'elements' => [
							[
								'elType' => 'widget',
								'widgetType' => 'e-heading',
							],
						],
					],
				],
			],
			'general' => [],
		];
	}

	private function with_global_references( array $definition ): array {
		$definition['template']['settings']['classes']['value'][] = 'g-123';
		$definition['template']['styles']['local-root']['variants'][0]['props']['border-color'] = [
			'$$type' => 'global-color-variable',
			'value' => 'e-gv-123',
		];
		$definition['style']['appearance'][0]['options'][0]['set'][1]['style']['desktop']['color'] = [
			'$$type' => 'global-color-variable',
			'value' => 'e-gv-123',
		];

		return $definition;
	}

	private function assert_has_error( Parse_Result $result, string $path, string $code ): void {
		$this->assertContains(
			[
				'key' => $path,
				'error' => $code,
			],
			$result->errors()->all(),
			$result->errors()->to_string()
		);
	}

	private function icon_button(): array {
		return $this->read_example( 'icon-button.json' );
	}

	private function read_example( string $file ): array {
		return json_decode( file_get_contents( self::EXAMPLES_DIR . $file ), true );
	}
}
