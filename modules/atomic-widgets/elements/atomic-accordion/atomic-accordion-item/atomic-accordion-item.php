<?php

namespace Elementor\Modules\AtomicWidgets\Elements\Atomic_Accordion\Atomic_Accordion_Item;

use Elementor\Modules\AtomicWidgets\Controls\Section;
use Elementor\Modules\AtomicWidgets\Elements\Atomic_Accordion\Atomic_Accordion;
use Elementor\Modules\AtomicWidgets\Elements\Atomic_Accordion\Atomic_Accordion_Item_Content\Atomic_Accordion_Item_Content;
use Elementor\Modules\AtomicWidgets\Elements\Atomic_Accordion\Atomic_Accordion_Item_Header\Atomic_Accordion_Item_Header;
use Elementor\Modules\AtomicWidgets\Elements\Base\Atomic_Element_Base;
use Elementor\Modules\AtomicWidgets\Elements\Base\Has_Element_Template;
use Elementor\Modules\AtomicWidgets\Elements\Base\Html_Tag_Computer;
use Elementor\Modules\AtomicWidgets\Elements\Base\Render_Context;
use Elementor\Modules\AtomicWidgets\PropTypes\Attributes_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Classes_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Primitives\String_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Size_Prop_Type;
use Elementor\Modules\AtomicWidgets\Styles\Style_Definition;
use Elementor\Modules\AtomicWidgets\Styles\Style_Variant;
use Elementor\Modules\Components\PropTypes\Overridable_Prop_Type;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Atomic_Accordion_Item extends Atomic_Element_Base {
	use Has_Element_Template;

	const BASE_STYLE_KEY = 'base';

	public static $widget_description = 'A single collapsible accordion item, rendered as <details>. Contains an e-accordion-item-header (the clickable <summary>) and an e-accordion-item-content holding the collapsible body.';

	public function __construct( $data = [], $args = null ) {
		parent::__construct( $data, $args );
		$this->meta( 'permanently_locked', true );
	}

	public static function get_type() {
		return Atomic_Accordion::ELEMENT_TYPE_ITEM;
	}

	public static function get_element_type(): string {
		return Atomic_Accordion::ELEMENT_TYPE_ITEM;
	}

	public function get_title() {
		return esc_html__( 'Accordion Item', 'elementor' );
	}

	public function get_keywords() {
		return [ 'ato', 'atom', 'atoms', 'atomic', 'accordion', 'item' ];
	}

	public function get_icon() {
		return 'eicon-accordion';
	}

	public function should_show_in_panel() {
		return false;
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
				->set_label( __( 'Settings', 'elementor' ) )
				->set_id( 'settings' )
				->set_items( [] ),
		];
	}

	/**
	 * `details` is deliberately absent from `Utils::ALLOWED_HTML_WRAPPER_TAGS`, so
	 * `Utils::validate_html_tag()` would coerce it to `div`. The Twig template therefore
	 * hardcodes the tag and this element must never render through `print_html_tag()`.
	 * The value here only declares intent for the element config.
	 */
	public static function get_computed_html_tag( array $settings ): string {
		return Html_Tag_Computer::compute( $settings, 'details' );
	}

	protected function define_base_styles(): array {
		return [
			static::BASE_STYLE_KEY => Style_Definition::make()
				->add_variant(
					Style_Variant::make()
						->add_props( [
							'display' => String_Prop_Type::generate( 'block' ),
							// See the root accordion's base styles: without this, `.e-con`'s container
							// default gives every item a 10px inline padding, so the header and the
							// content slot both start 10px inside the item's own box.
							'padding' => Size_Prop_Type::generate( [
								'size' => 0,
								'unit' => 'px',
							] ),
						] )
				),
		];
	}

	protected function define_allowed_child_types() {
		return [
			Atomic_Accordion::ELEMENT_TYPE_HEADER,
			Atomic_Accordion::ELEMENT_TYPE_CONTENT,
		];
	}

	protected function define_default_children() {
		return [
			Atomic_Accordion_Item_Header::generate()
				->hydrate_default_children( true )
				->editor_settings( [
					'title' => esc_html__( 'Header', 'elementor' ),
				] )
				->build(),
			Atomic_Accordion_Item_Content::generate()
				->hydrate_default_children( true )
				->editor_settings( [
					'title' => esc_html__( 'Content', 'elementor' ),
				] )
				->build(),
		];
	}

	protected function get_templates(): array {
		return [
			'elementor/elements/atomic-accordion-item' => __DIR__ . '/atomic-accordion-item.html.twig',
		];
	}

	/**
	 * Resolves this item's position among its siblings, and the `open`/`name` attributes that
	 * depend on it, via the accordion's render context.
	 *
	 * `Render_Context::get()` returns `[]` when this item renders outside a parent
	 * `Atomic_Accordion` pass (e.g. the editor's `Render_Element_Action` re-rendering a single
	 * element), so `get-item-index`, `default-state`, `max-expanded` and `accordion-id` may all be
	 * absent. Rather than special-case that, the fallbacks below (`null`/`[]`) simply propagate
	 * through the same expressions used in the normal case: `item_index` stays `null` so it can
	 * never equal `0` and `is_open` resolves `false`, and `accordion_id` stays `null` so
	 * `group_name` resolves `false`/absent regardless of `max_expanded`. A parentless item
	 * therefore renders collapsed and without a `name` — it has no accordion identity to be
	 * exclusive within, so asserting `open` or a `name` would be guessing.
	 *
	 * @return array
	 */
	protected function build_template_context(): array {
		$accordion_context = Render_Context::get( Atomic_Accordion::class );
		$get_item_index = $accordion_context['get-item-index'] ?? null;
		$item_index = is_callable( $get_item_index ) ? $get_item_index( $this->get_id() ) : null;

		$default_state = $accordion_context['default-state'] ?? null;
		$max_expanded = $accordion_context['max-expanded'] ?? null;
		$accordion_id = $accordion_context['accordion-id'] ?? null;

		$is_open = 'first_expanded' === $default_state && 0 === $item_index;
		$group_name = ( 'one' === $max_expanded && $accordion_id ) ? $accordion_id : null;

		return array_merge( $this->build_base_template_context(), [
			'item_index' => $item_index,
			'is_open' => $is_open,
			'group_name' => $group_name,
		] );
	}
}
