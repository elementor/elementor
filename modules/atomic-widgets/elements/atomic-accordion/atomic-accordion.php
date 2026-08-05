<?php

namespace Elementor\Modules\AtomicWidgets\Elements\Atomic_Accordion;

use Elementor\Core\Utils\Collection;
use Elementor\Modules\AtomicWidgets\Controls\Section;
use Elementor\Modules\AtomicWidgets\Controls\Types\Text_Control;
use Elementor\Modules\AtomicWidgets\Elements\Atomic_Accordion\Atomic_Accordion_Item\Atomic_Accordion_Item;
use Elementor\Modules\AtomicWidgets\Elements\Base\Atomic_Element_Base;
use Elementor\Modules\AtomicWidgets\Elements\Base\Has_Element_Template;
use Elementor\Modules\AtomicWidgets\PropTypes\Attributes_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Classes_Prop_Type;
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
		return [ 'ato', 'atom', 'atoms', 'atomic', 'accordion', 'faq', 'collapse', 'toggle' ];
	}

	public function get_icon() {
		return 'eicon-accordion';
	}

	protected static function define_props_schema(): array {
		return [
			'classes' => Classes_Prop_Type::make()
				->default( [] ),
			'attributes' => Attributes_Prop_Type::make()->meta( Overridable_Prop_Type::ignore() ),
		];
	}

	protected function define_atomic_controls(): array {
		return [
			Section::make()
				->set_label( __( 'Content', 'elementor' ) )
				->set_id( 'content' )
				->set_items( [] ),
			Section::make()
				->set_label( __( 'Settings', 'elementor' ) )
				->set_id( 'settings' )
				->set_items( [
					Text_Control::bind_to( '_cssid' )
						->set_label( __( 'ID', 'elementor' ) )
						->set_meta( $this->get_css_id_control_meta() ),
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
			$items[] = Atomic_Accordion_Item::generate()
				->hydrate_default_children( true )
				->editor_settings( [
					/* translators: %d: Accordion item position. */
					'title' => sprintf( esc_html__( 'Accordion Item %d', 'elementor' ), $i ),
					'initial_position' => $i,
				] )
				->build();
		}

		return $items;
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
	public function get_item_index( string $item_id ) {
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
}
