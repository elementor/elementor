<?php

namespace Elementor\Testing\Modules\AtomicWidgets\Elements;

use Elementor\Core\Experiments\Manager as Experiments_Manager;
use Elementor\Modules\AtomicWidgets\Elements\Atomic_Button\Atomic_Button;
use Elementor\Modules\AtomicWidgets\Elements\Atomic_Icon_Button\Atomic_Icon_Button;
use Elementor\Modules\AtomicWidgets\Elements\Atomic_Icon_Button\Atomic_Icon_Button_Content\Atomic_Icon_Button_Content;
use Elementor\Modules\AtomicWidgets\Elements\Atomic_Icon_Button\Atomic_Icon_Button_Icon\Atomic_Icon_Button_Icon;
use Elementor\Modules\AtomicWidgets\Module as Atomic_Widgets_Module;
use Elementor\Modules\AtomicWidgets\PropTypes\Attributes_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Classes_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Link_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Primitives\Boolean_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Primitives\String_Prop_Type;
use Elementor\Modules\Components\PropTypes\Overridable_Prop_Type;
use Elementor\Plugin;
use ElementorEditorTesting\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

/**
 * Minimal stand-in for a rendered child element. `Element_Base::render_markdown()` only ever
 * calls `render_markdown()` on the members of `get_children()`, so this is enough to drive the
 * Icon Button's markdown wrapper without registering the whole element tree.
 */
class Icon_Button_Markdown_Child {
	private $markdown;

	public function __construct( string $markdown ) {
		$this->markdown = $markdown;
	}

	public function render_markdown(): string {
		return $this->markdown;
	}
}

class Icon_Button_With_Stub_Children extends Atomic_Icon_Button {
	public $stub_children = [];

	public function get_children() {
		return $this->stub_children;
	}
}

class Test_Atomic_Icon_Button extends Elementor_Test_Base {

	/**
	 * @var string|null
	 */
	private $original_icon_button_experiment_default = null;

	/**
	 * @var bool
	 */
	private $registered_icon_button_experiment = false;

	public function setUp(): void {
		parent::setUp();

		$feature = Plugin::$instance->experiments->get_features( Atomic_Widgets_Module::EXPERIMENT_ICON_BUTTON );

		if ( $feature ) {
			$this->original_icon_button_experiment_default = $feature['default'];
		}
	}

	public function tearDown(): void {
		if ( $this->registered_icon_button_experiment ) {
			Plugin::$instance->experiments->remove_feature( Atomic_Widgets_Module::EXPERIMENT_ICON_BUTTON );
			$this->registered_icon_button_experiment = false;
		} elseif ( null !== $this->original_icon_button_experiment_default ) {
			Plugin::$instance->experiments->set_feature_default_state(
				Atomic_Widgets_Module::EXPERIMENT_ICON_BUTTON,
				$this->original_icon_button_experiment_default
			);
		}

		parent::tearDown();
	}

	// -----------------------------------------------------------------------------------------
	// Props schema
	// -----------------------------------------------------------------------------------------

	public function test_props_schema__contains_the_expected_props_with_the_expected_types() {
		// Act.
		$schema = $this->get_defined_props_schema( Atomic_Icon_Button::class );

		// Assert.
		$this->assertSame(
			[ 'classes', 'tag', 'link', 'show_icon', 'attributes' ],
			array_keys( $schema )
		);

		$this->assertInstanceOf( Classes_Prop_Type::class, $schema['classes'] );
		$this->assertInstanceOf( String_Prop_Type::class, $schema['tag'] );
		$this->assertInstanceOf( Link_Prop_Type::class, $schema['link'] );
		$this->assertInstanceOf( Boolean_Prop_Type::class, $schema['show_icon'] );
		$this->assertInstanceOf( Attributes_Prop_Type::class, $schema['attributes'] );
	}

	public function test_props_schema__show_icon_defaults_to_true() {
		// Act.
		$default = $this->get_defined_props_schema( Atomic_Icon_Button::class )['show_icon']->get_default();

		// Assert.
		$this->assertTrue( $default['value'] );
	}

	public function test_props_schema__tag_defaults_to_button_and_enum_allows_button_and_anchor() {
		// Act.
		$tag = $this->get_defined_props_schema( Atomic_Icon_Button::class )['tag'];

		// Assert.
		$this->assertSame( 'button', $tag->get_default()['value'] );
		$this->assertContains( 'button', $tag->get_enum() );
		$this->assertContains( 'a', $tag->get_enum() );
	}

	public function test_props_schema__tag_carries_dependencies_driven_by_the_link_prop() {
		// Act.
		$dependencies = $this->get_defined_props_schema( Atomic_Icon_Button::class )['tag']->get_dependencies();

		// Assert.
		$this->assertNotEmpty( $dependencies );
		$this->assertSame( 'and', $dependencies['relation'] );
		$this->assertCount( 2, $dependencies['terms'] );
		$this->assertSame( [ 'link', 'destination' ], $dependencies['terms'][0]['path'] );
		$this->assertSame( 'button', $dependencies['terms'][0]['newValue']['value'] );
		$this->assertSame( 'not_exist', $dependencies['terms'][1]['operator'] );
		$this->assertSame( 'a', $dependencies['terms'][1]['newValue']['value'] );
	}

	public function test_props_schema__show_icon_and_link_stay_overridable_for_components() {
		// Act.
		$schema = $this->get_defined_props_schema( Atomic_Icon_Button::class );

		// Assert.
		$this->assertArrayNotHasKey( Overridable_Prop_Type::META_KEY, $schema['show_icon']->get_meta() );
		$this->assertArrayNotHasKey( Overridable_Prop_Type::META_KEY, $schema['link']->get_meta() );
	}

	public function test_props_schema__attributes_is_not_overridable() {
		// Act.
		$meta = $this->get_defined_props_schema( Atomic_Icon_Button::class )['attributes']->get_meta();

		// Assert.
		$this->assertArrayHasKey( Overridable_Prop_Type::META_KEY, $meta );
		$this->assertFalse( $meta[ Overridable_Prop_Type::META_KEY ] );
	}

	public function test_props_schema__cssid_is_auto_injected_and_not_overridable() {
		// Act.
		$defined = $this->get_defined_props_schema( Atomic_Icon_Button::class );
		$schema = Atomic_Icon_Button::get_props_schema();

		// Assert.
		$this->assertArrayNotHasKey( '_cssid', $defined );
		$this->assertArrayHasKey( '_cssid', $schema );
		$this->assertFalse( $schema['_cssid']->get_meta_item( Overridable_Prop_Type::META_KEY ) );
	}

	// -----------------------------------------------------------------------------------------
	// Children dependencies
	// -----------------------------------------------------------------------------------------

	public function test_children_dependencies__declare_a_single_stashing_rule_for_the_icon_slot() {
		// Act.
		$config = $this->get_initial_config( $this->make_icon_button() );

		// Assert.
		$this->assertCount( 1, $config['children_dependencies'] );

		$rule = $config['children_dependencies'][0];

		$this->assertSame( 'e-icon-button-icon', $rule['child_type'] );
		$this->assertSame( 'last', $rule['position']['kind'] );
		$this->assertTrue( $rule['stash'] );
	}

	public function test_children_dependencies__default_model_is_a_locked_hydrated_icon_slot() {
		// Act.
		$config = $this->get_initial_config( $this->make_icon_button() );

		// Assert.
		$default_model = $config['children_dependencies'][0]['default_model'];

		$this->assertNotEmpty( $default_model );
		$this->assertSame( 'e-icon-button-icon', $default_model['elType'] );
		$this->assertTrue( $default_model['isLocked'] );
		$this->assertTrue( $default_model['hydrateDefaultChildren'] );
	}

	public function test_children_dependencies__condition_is_show_icon_not_equal_false() {
		// Act.
		$config = $this->get_initial_config( $this->make_icon_button() );

		// Assert.
		$term = $config['children_dependencies'][0]['when']['terms'][0];

		$this->assertSame( 'ne', $term['operator'] );
		$this->assertSame( [ 'show_icon' ], $term['path'] );
		$this->assertFalse( $term['value'] );
	}

	// -----------------------------------------------------------------------------------------
	// Default children / allowed children
	// -----------------------------------------------------------------------------------------

	public function test_default_children__are_the_content_slot_then_the_icon_slot() {
		// Act.
		$config = $this->get_initial_config( $this->make_icon_button() );

		// Assert.
		$children = $config['default_children'];

		$this->assertCount( 2, $children );
		$this->assertSame( 'e-icon-button-content', $children[0]['elType'] );
		$this->assertSame( 'e-icon-button-icon', $children[1]['elType'] );
		$this->assertTrue( $children[0]['hydrateDefaultChildren'] );
		$this->assertTrue( $children[1]['hydrateDefaultChildren'] );
	}

	public function test_default_children__content_slot_seeds_a_paragraph_rendered_as_a_span() {
		// Act.
		$config = $this->get_initial_config( $this->make_content_slot() );

		// Assert.
		$children = $config['default_children'];

		$this->assertCount( 1, $children );
		$this->assertSame( 'widget', $children[0]['elType'] );
		$this->assertSame( 'e-paragraph', $children[0]['widgetType'] );
		$this->assertSame( 'span', $children[0]['settings']['tag']['value'] );
	}

	public function test_default_children__icon_slot_seeds_an_svg() {
		// Act.
		$config = $this->get_initial_config( $this->make_icon_slot() );

		// Assert.
		$children = $config['default_children'];

		$this->assertCount( 1, $children );
		$this->assertSame( 'widget', $children[0]['elType'] );
		$this->assertSame( 'e-svg', $children[0]['widgetType'] );
	}

	public function test_allowed_child_types__root_accepts_only_its_two_slots() {
		// Act.
		$config = $this->get_initial_config( $this->make_icon_button() );

		// Assert.
		$this->assertSame(
			[ 'e-icon-button-content', 'e-icon-button-icon' ],
			$config['allowed_child_types']
		);
	}

	public function test_allowed_child_types__slots_impose_no_restriction() {
		// Act.
		$content_config = $this->get_initial_config( $this->make_content_slot() );
		$icon_config = $this->get_initial_config( $this->make_icon_slot() );

		// Assert.
		$this->assertSame( [], $content_config['allowed_child_types'] );
		$this->assertSame( [], $icon_config['allowed_child_types'] );
	}

	// -----------------------------------------------------------------------------------------
	// Root / slot element config
	// -----------------------------------------------------------------------------------------

	public function test_root__renders_as_a_button_and_is_a_container() {
		// Arrange.
		$icon_button = $this->make_icon_button();

		// Act.
		$config = $this->get_initial_config( $icon_button );

		// Assert.
		$this->assertSame( 'e-icon-button', Atomic_Icon_Button::get_element_type() );
		$this->assertSame( 'button', $config['default_html_tag'] );
		$this->assertSame( 'eicon-e-button', $icon_button->get_icon() );
		$this->assertSame( 'Button', $icon_button->get_title() );
		$this->assertTrue( $config['show_in_panel'] );
		$this->assertTrue( (bool) $icon_button->get_meta_item( 'is_container' ) );
	}

	/**
	 * @dataProvider slot_provider
	 */
	public function test_slots__are_hidden_locked_spans_without_display_conditions( string $class ) {
		// Arrange.
		$slot = $this->make_slot( $class );

		// Act.
		$config = $this->get_initial_config( $slot );

		// Assert.
		$this->assertFalse( $slot->should_show_in_panel() );
		$this->assertFalse( $config['show_in_panel'] );
		$this->assertTrue( $config['meta']['permanently_locked'] );
		$this->assertSame( 'span', $config['default_html_tag'] );
		$this->assertArrayNotHasKey( 'display-conditions', $class::get_props_schema() );
	}

	public function slot_provider(): array {
		return [
			'content slot' => [ Atomic_Icon_Button_Content::class ],
			'icon slot' => [ Atomic_Icon_Button_Icon::class ],
		];
	}

	// -----------------------------------------------------------------------------------------
	// Markdown
	// -----------------------------------------------------------------------------------------

	public function test_render_markdown__returns_empty_string_when_there_is_no_child_text() {
		// Arrange.
		$icon_button = $this->make_icon_button_with_children( [] );

		// Act & Assert.
		$this->assertSame( '', $icon_button->render_markdown() );
	}

	public function test_render_markdown__returns_bold_text_when_there_is_no_link() {
		// Arrange.
		$icon_button = $this->make_icon_button_with_children( [ new Icon_Button_Markdown_Child( 'Click here' ) ] );

		// Act & Assert.
		$this->assertSame( '**Click here**', $icon_button->render_markdown() );
	}

	public function test_render_markdown__returns_a_markdown_link_when_a_link_is_set() {
		// Arrange.
		$icon_button = $this->make_icon_button_with_children(
			[ new Icon_Button_Markdown_Child( 'Click here' ) ],
			[
				'link' => [
					'href' => 'https://example.com/',
					'target' => '_blank',
					'tag' => 'a',
				],
			]
		);

		// Act & Assert.
		$this->assertSame( '[Click here](https://example.com/)', $icon_button->render_markdown() );
	}

	// -----------------------------------------------------------------------------------------
	// Legacy button panel visibility
	// -----------------------------------------------------------------------------------------

	public function test_legacy_button__is_hidden_from_the_panel_when_the_icon_button_experiment_is_active() {
		// Arrange.
		$this->set_icon_button_experiment( Experiments_Manager::STATE_ACTIVE );

		// Act & Assert.
		$this->assertFalse( ( new Atomic_Button() )->show_in_panel() );
	}

	public function test_legacy_button__is_shown_in_the_panel_when_the_icon_button_experiment_is_inactive() {
		// Arrange.
		$this->set_icon_button_experiment( Experiments_Manager::STATE_INACTIVE );

		// Act & Assert.
		$this->assertTrue( ( new Atomic_Button() )->show_in_panel() );
	}

	// -----------------------------------------------------------------------------------------
	// Helpers
	// -----------------------------------------------------------------------------------------

	/**
	 * The authored schema, before `Has_Atomic_Base::get_props_schema()` injects `_cssid` and before
	 * the `elementor/atomic-widgets/props-schema` filter wraps props in unions (dynamic tags,
	 * component overrides). Those wrappers preserve meta/default/dependencies but change the
	 * concrete prop-type class, so type assertions have to run against the raw definition.
	 */
	private function get_defined_props_schema( string $class ): array {
		$reflection = new \ReflectionMethod( $class, 'define_props_schema' );
		$reflection->setAccessible( true );

		return $reflection->invoke( null );
	}

	private function get_initial_config( $element ): array {
		$reflection = new \ReflectionMethod( get_class( $element ), 'get_initial_config' );
		$reflection->setAccessible( true );

		return $reflection->invoke( $element );
	}

	private function make_icon_button(): Atomic_Icon_Button {
		return new Atomic_Icon_Button( $this->make_element_data( Atomic_Icon_Button::get_element_type() ), null );
	}

	private function make_content_slot(): Atomic_Icon_Button_Content {
		return $this->make_slot( Atomic_Icon_Button_Content::class );
	}

	private function make_icon_slot(): Atomic_Icon_Button_Icon {
		return $this->make_slot( Atomic_Icon_Button_Icon::class );
	}

	private function make_slot( string $class ) {
		return new $class( $this->make_element_data( $class::get_element_type() ), null );
	}

	private function make_icon_button_with_children( array $children, array $settings = [] ): Icon_Button_With_Stub_Children {
		$icon_button = new Icon_Button_With_Stub_Children(
			$this->make_element_data( Atomic_Icon_Button::get_element_type(), $settings ),
			null
		);

		$icon_button->stub_children = $children;

		return $icon_button;
	}

	private function make_element_data( string $el_type, array $settings = [] ): array {
		return [
			'id' => 'test',
			'elType' => $el_type,
			'settings' => $settings,
		];
	}

	private function set_icon_button_experiment( string $state ): void {
		$experiments = Plugin::$instance->experiments;

		if ( ! $experiments->get_features( Atomic_Widgets_Module::EXPERIMENT_ICON_BUTTON ) ) {
			$experiments->add_feature( [
				'name' => Atomic_Widgets_Module::EXPERIMENT_ICON_BUTTON,
				'title' => 'Icon Button',
				'hidden' => true,
				'default' => Experiments_Manager::STATE_INACTIVE,
			] );

			$this->registered_icon_button_experiment = true;
		}

		$experiments->set_feature_default_state( Atomic_Widgets_Module::EXPERIMENT_ICON_BUTTON, $state );
	}
}
