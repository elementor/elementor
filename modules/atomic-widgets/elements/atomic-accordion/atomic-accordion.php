<?php

namespace Elementor\Modules\AtomicWidgets\Elements\Atomic_Accordion;

use Elementor\Core\Utils\Collection;
use Elementor\Modules\AtomicWidgets\Controls\Section;
use Elementor\Modules\AtomicWidgets\Controls\Types\Elements\Accordion_Items_Control;
use Elementor\Modules\AtomicWidgets\Controls\Types\Html_Tag_Control;
use Elementor\Modules\AtomicWidgets\Controls\Types\Switch_Control;
use Elementor\Modules\AtomicWidgets\Controls\Types\Text_Control;
use Elementor\Modules\AtomicWidgets\Controls\Types\Toggle_Control;
use Elementor\Modules\AtomicWidgets\Elements\Atomic_Paragraph\Atomic_Paragraph;
use Elementor\Modules\AtomicWidgets\Elements\Base\Atomic_Element_Base;
use Elementor\Modules\AtomicWidgets\Elements\Base\Element_Builder;
use Elementor\Modules\AtomicWidgets\Elements\Base\Has_Element_Template;
use Elementor\Modules\AtomicWidgets\PropTypes\Attributes_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Classes_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Html_V3_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Primitives\Boolean_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Primitives\String_Prop_Type;
use Elementor\Modules\AtomicWidgets\Styles\Style_Definition;
use Elementor\Modules\AtomicWidgets\Styles\Style_Variant;
use Elementor\Modules\Components\PropTypes\Overridable_Prop_Type;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Atomic_Accordion extends Atomic_Element_Base {
	use Has_Element_Template;

	const BASE_STYLE_KEY = 'base';

	const ELEMENT_TYPE_ITEM = 'e-accordion-item';
	const ELEMENT_TYPE_HEAD = 'e-accordion-item-head';
	const ELEMENT_TYPE_TITLE = 'e-accordion-item-title';
	const ELEMENT_TYPE_ICON = 'e-accordion-item-icon';
	const ELEMENT_TYPE_CONTENT = 'e-accordion-item-content';

	const DEFAULT_ITEM_COUNT = 2;

	public static $widget_description = 'Create collapsible content sections using native <details>/<summary> semantics, with no JavaScript needed for the toggle. Structure: e-accordion contains e-accordion-item elements; each item contains an e-accordion-item-head (holding e-accordion-item-title and an optional e-accordion-item-icon) and an e-accordion-item-content that accepts any element.';

	public function __construct( $data = [], $args = null ) {
		parent::__construct( $data, $args );
		$this->meta( 'is_container', true );
	}

	public static function get_type() {
		return 'e-accordion';
	}

	public static function get_element_type(): string {
		return 'e-accordion';
	}

	public function get_title() {
		return esc_html__( 'Accordion', 'elementor' );
	}

	public function get_keywords() {
		return [ 'ato', 'atom', 'atoms', 'atomic', 'accordion', 'faq', 'collapse' ];
	}

	public function get_icon() {
		return 'eicon-accordion';
	}

	protected static function define_props_schema(): array {
		return [
			'classes' => Classes_Prop_Type::make()
				->default( [] ),
			'attributes' => Attributes_Prop_Type::make()->meta( Overridable_Prop_Type::ignore() ),
			'default_state' => String_Prop_Type::make()
				->enum( [ 'first_expanded', 'all_collapsed' ] )
				->default( 'first_expanded' ),
			'max_expanded' => String_Prop_Type::make()
				->enum( [ 'one', 'multiple' ] )
				->default( 'one' ),
			'title_tag' => String_Prop_Type::make()
				->enum( [ 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'div', 'p', 'span' ] )
				->default( 'span' ),
			// Single, global, user-facing toggle - there is no per-item Show Icon (confirmed with the
			// PM: users want icons on every item or on none, never mixed). It is exposable as a
			// component property, so no `Overridable_Prop_Type::ignore()`. Every `e-accordion-item-head`
			// carries its own mirrored `show_icon` prop (see that class) purely because the children-
			// dependencies reconciler evaluates a rule against the *declaring* element's own settings
			// and can only attach/detach that element's *direct* children - a root-level prop here can
			// never drive a grandchild's presence. Do not "clean up" the mirror; the duplication is
			// structural, not an oversight.
			'show_icon' => Boolean_Prop_Type::make()->default( true ),
		];
	}

	protected function define_atomic_controls(): array {
		return [
			Section::make()
				->set_label( __( 'Content', 'elementor' ) )
				->set_id( 'content' )
				->set_items( [
					Accordion_Items_Control::make()
						->set_label( __( 'Accordion Items', 'elementor' ) )
						->set_meta( [
							'layout' => 'custom',
						] ),
					Switch_Control::bind_to( 'show_icon' )
						->set_label( esc_html__( 'Show Icon', 'elementor' ) ),
				] ),
			Section::make()
				->set_label( __( 'Settings', 'elementor' ) )
				->set_id( 'settings' )
				->set_items( [
					Text_Control::bind_to( '_cssid' )
						->set_label( __( 'ID', 'elementor' ) )
						->set_meta( $this->get_css_id_control_meta() ),
					Toggle_Control::bind_to( 'default_state' )
						->set_label( esc_html__( 'Default State', 'elementor' ) )
						->add_options( [
							'first_expanded' => [ 'title' => esc_html__( 'First expanded', 'elementor' ) ],
							'all_collapsed' => [ 'title' => esc_html__( 'All collapsed', 'elementor' ) ],
						] )
						->set_exclusive( true )
						->set_convert_options( true )
						->set_size( 'tiny' )
						->set_full_width( true ),
					Toggle_Control::bind_to( 'max_expanded' )
						->set_label( esc_html__( 'Max Items Expanded', 'elementor' ) )
						->add_options( [
							'one' => [ 'title' => esc_html__( 'One', 'elementor' ) ],
							'multiple' => [ 'title' => esc_html__( 'Multiple', 'elementor' ) ],
						] )
						->set_exclusive( true )
						->set_convert_options( true )
						->set_size( 'tiny' )
						->set_full_width( true ),
					Html_Tag_Control::bind_to( 'title_tag' )
						->set_label( esc_html__( 'Title HTML Tag', 'elementor' ) )
						->set_options( [
							[ 'value' => 'h1', 'label' => 'H1' ],
							[ 'value' => 'h2', 'label' => 'H2' ],
							[ 'value' => 'h3', 'label' => 'H3' ],
							[ 'value' => 'h4', 'label' => 'H4' ],
							[ 'value' => 'h5', 'label' => 'H5' ],
							[ 'value' => 'h6', 'label' => 'H6' ],
							[ 'value' => 'div', 'label' => 'Div' ],
							[ 'value' => 'p', 'label' => 'P' ],
							[ 'value' => 'span', 'label' => 'Span' ],
						] ),
				] ),
		];
	}

	protected function define_base_styles(): array {
		return [
			static::BASE_STYLE_KEY => Style_Definition::make()
				->add_variant(
					Style_Variant::make()
						->add_props( [
							'display' => String_Prop_Type::generate( 'flex' ),
							'flex-direction' => String_Prop_Type::generate( 'column' ),
						] )
				),
		];
	}

	protected function define_allowed_child_types() {
		return [ self::ELEMENT_TYPE_ITEM ];
	}

	protected function define_default_children() {
		$items = [];

		foreach ( range( 1, self::DEFAULT_ITEM_COUNT ) as $i ) {
			$items[] = $this->build_default_item( $i );
		}

		return $items;
	}

	/**
	 * Builds one `e-accordion-item` with its numbered title seeded explicitly.
	 *
	 * Each level of `default_children` is hydrated independently client-side
	 * (`Atomic_Element_Base_Model::onElementCreate()`, driven by `hydrateDefaultChildren: true`),
	 * so the title slot's own `define_default_children()` has no way to know which item it
	 * belongs to. Building the item → head → title → paragraph chain explicitly here lets the
	 * numbered text ("Accordion Item 1", "Accordion Item 2") reach the rendered paragraph. The
	 * icon and content branches don't need per-index content, so they keep using their own
	 * `define_default_children()` via `hydrate_default_children( true )`.
	 *
	 * @param int $index
	 * @return array
	 */
	private function build_default_item( int $index ): array {
		/* translators: %d: Accordion item position. */
		$numbered_title = sprintf( esc_html__( 'Accordion Item %d', 'elementor' ), $index );

		$title = Element_Builder::make( self::ELEMENT_TYPE_TITLE )
			->editor_settings( [
				'title' => esc_html__( 'Title', 'elementor' ),
			] )
			->children( [
				Atomic_Paragraph::generate()
					->settings( [
						'paragraph' => Html_V3_Prop_Type::generate( [
							'content' => String_Prop_Type::generate( $numbered_title ),
							'children' => [],
						] ),
						'tag' => String_Prop_Type::generate( 'span' ),
					] )
					->build(),
			] )
			->build();

		$icon = Element_Builder::make( self::ELEMENT_TYPE_ICON )
			->hydrate_default_children( true )
			->editor_settings( [
				'title' => esc_html__( 'Icon', 'elementor' ),
			] )
			->build();

		$head = Element_Builder::make( self::ELEMENT_TYPE_HEAD )
			->editor_settings( [
				'title' => esc_html__( 'Head', 'elementor' ),
			] )
			->children( [ $title, $icon ] )
			->build();

		$content = Element_Builder::make( self::ELEMENT_TYPE_CONTENT )
			->hydrate_default_children( true )
			->editor_settings( [
				'title' => esc_html__( 'Content', 'elementor' ),
			] )
			->build();

		return Element_Builder::make( self::ELEMENT_TYPE_ITEM )
			->editor_settings( [
				'title' => $numbered_title,
				'initial_position' => $index,
			] )
			->children( [ $head, $content ] )
			->build();
	}

	/**
	 * Index of a direct `e-accordion-item` child, by element id.
	 *
	 * Items read this through the render context to decide which one carries the `open`
	 * attribute. Mirrors `Atomic_Tabs::get_tab_index()`.
	 *
	 * @param string $item_id
	 * @return int|null
	 */
	private function get_item_index( string $item_id ) {
		$item_ids = Collection::make( $this->get_children() )
			->filter( fn( $child ) => $child->get_type() === self::ELEMENT_TYPE_ITEM )
			->map( fn( $child ) => $child->get_id() )
			->flip()
			->all();

		return $item_ids[ $item_id ] ?? null;
	}

	protected function get_templates(): array {
		return [
			'elementor/elements/atomic-accordion' => __DIR__ . '/atomic-accordion.html.twig',
		];
	}

	/**
	 * Exposes the accordion's identity and per-item lookup to descendants that render inside its
	 * pass (item, head, title, icon, content) via `Render_Context::get( self::class )`.
	 *
	 * @return array
	 */
	protected function define_render_context(): array {
		return [
			[
				'context' => [
					'accordion-id' => $this->get_id(),
					'get-item-index' => fn( $item_id ) => $this->get_item_index( $item_id ),
					'default-state' => $this->get_atomic_setting( 'default_state' ),
					'max-expanded' => $this->get_atomic_setting( 'max_expanded' ),
					'title-tag' => $this->get_atomic_setting( 'title_tag' ),
				],
			],
		];
	}
}
