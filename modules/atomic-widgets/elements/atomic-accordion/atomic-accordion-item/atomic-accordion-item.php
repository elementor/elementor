<?php

namespace Elementor\Modules\AtomicWidgets\Elements\Atomic_Accordion\Atomic_Accordion_Item;

use Elementor\Modules\AtomicWidgets\Controls\Section;
use Elementor\Modules\AtomicWidgets\Elements\Atomic_Accordion\Atomic_Accordion;
use Elementor\Modules\AtomicWidgets\Elements\Atomic_Accordion\Atomic_Accordion_Item_Content\Atomic_Accordion_Item_Content;
use Elementor\Modules\AtomicWidgets\Elements\Atomic_Accordion\Atomic_Accordion_Item_Head\Atomic_Accordion_Item_Head;
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

class Atomic_Accordion_Item extends Atomic_Element_Base {
	use Has_Element_Template;

	const BASE_STYLE_KEY = 'base';

	public static $widget_description = 'A single collapsible accordion item, rendered as <details>. Contains an e-accordion-item-head (the clickable <summary>) and an e-accordion-item-content holding the collapsible body.';

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
	protected function define_default_html_tag() {
		return 'details';
	}

	protected function define_base_styles(): array {
		return [
			static::BASE_STYLE_KEY => Style_Definition::make()
				->add_variant(
					Style_Variant::make()
						->add_props( [
							'display' => String_Prop_Type::generate( 'block' ),
						] )
				),
		];
	}

	protected function define_allowed_child_types() {
		return [
			Atomic_Accordion::ELEMENT_TYPE_HEAD,
			Atomic_Accordion::ELEMENT_TYPE_CONTENT,
		];
	}

	protected function define_default_children() {
		return [
			Atomic_Accordion_Item_Head::generate()
				->hydrate_default_children( true )
				->editor_settings( [
					'title' => esc_html__( 'Head', 'elementor' ),
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
}
