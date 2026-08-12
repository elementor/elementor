<?php

namespace Elementor\Modules\AtomicWidgets\Elements\Atomic_Accordion\Atomic_Accordion_Item_Header;

use Elementor\Modules\AtomicWidgets\ChildrenDependencies\Child_Dependency;
use Elementor\Modules\AtomicWidgets\Controls\Section;
use Elementor\Modules\AtomicWidgets\Elements\Atomic_Accordion\Atomic_Accordion;
use Elementor\Modules\AtomicWidgets\Elements\Atomic_Accordion\Atomic_Accordion_Item_Icon\Atomic_Accordion_Item_Icon;
use Elementor\Modules\AtomicWidgets\Elements\Atomic_Accordion\Atomic_Accordion_Item_Title\Atomic_Accordion_Item_Title;
use Elementor\Modules\AtomicWidgets\Elements\Base\Atomic_Element_Base;
use Elementor\Modules\AtomicWidgets\Elements\Base\Element_Builder;
use Elementor\Modules\AtomicWidgets\Elements\Base\Has_Element_Template;
use Elementor\Modules\AtomicWidgets\PropDependencies\Manager as Dependency_Manager;
use Elementor\Modules\AtomicWidgets\PropTypes\Attributes_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Classes_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Primitives\Boolean_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Primitives\String_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Size_Prop_Type;
use Elementor\Modules\AtomicWidgets\Styles\Style_Definition;
use Elementor\Modules\AtomicWidgets\Styles\Style_Variant;
use Elementor\Modules\AtomicWidgets\Utils\Element_Position;
use Elementor\Modules\Components\PropTypes\Overridable_Prop_Type;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Atomic_Accordion_Item_Header extends Atomic_Element_Base {
	use Has_Element_Template;

	const BASE_STYLE_KEY = 'base';

	public static $widget_description = 'The clickable header of an accordion item, rendered as <summary>. Contains an e-accordion-item-title and, when the accordion\'s Show Icon setting is on, an e-accordion-item-icon indicator.';

	public function __construct( $data = [], $args = null ) {
		parent::__construct( $data, $args );
		$this->meta( 'permanently_locked', true );
	}

	public static function get_type() {
		return Atomic_Accordion::ELEMENT_TYPE_HEADER;
	}

	public static function get_element_type(): string {
		return Atomic_Accordion::ELEMENT_TYPE_HEADER;
	}

	public function get_title() {
		return esc_html__( 'Header', 'elementor' );
	}

	public function get_keywords() {
		return [ 'ato', 'atom', 'atoms', 'atomic', 'accordion', 'header', 'summary' ];
	}

	public function get_icon() {
		return 'eicon-layout';
	}

	public function should_show_in_panel() {
		return false;
	}

	protected static function define_props_schema(): array {
		return [
			'classes' => Classes_Prop_Type::make()
				->default( [] ),
			'attributes' => Attributes_Prop_Type::make()->meta( Overridable_Prop_Type::ignore() ),
			// Mirrors the root `e-accordion`'s `show_icon` toggle (see that class for the user-facing
			// control). This copy exists only so `define_children_dependencies()` below has something
			// on *this* element's own settings to evaluate: the children-dependencies reconciler reads
			// only the declaring element's own settings and can only attach/detach its own direct
			// children, so a root-level prop can never drive whether *this* header's icon child is
			// present. The editor writes this prop through from the root whenever the root's `show_icon`
			// changes (see `useShowIconWriteThrough` alongside the accordion items repeater control) -
			// it is never surfaced in the panel and must never grow a per-item control of its own.
			'show_icon' => Boolean_Prop_Type::make()->default( true ),
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
	 * Like `details`, `summary` is absent from `Utils::ALLOWED_HTML_WRAPPER_TAGS` and would be
	 * coerced to `div` by `Utils::validate_html_tag()`. The Twig template hardcodes the tag.
	 */
	protected function define_default_html_tag() {
		return 'summary';
	}

	protected function define_base_styles(): array {
		return [
			static::BASE_STYLE_KEY => Style_Definition::make()
				->add_variant(
					Style_Variant::make()
						->add_props( [
							'display' => String_Prop_Type::generate( 'flex' ),
							'align-items' => String_Prop_Type::generate( 'center' ),
							'justify-content' => String_Prop_Type::generate( 'space-between' ),
							'gap' => Size_Prop_Type::generate( [
								'size' => 8,
								'unit' => 'px',
							] ),
							'cursor' => String_Prop_Type::generate( 'pointer' ),
							'padding' => Size_Prop_Type::generate( [
								'size' => 10,
								'unit' => 'px',
							] ),
						] )
				),
		];
	}

	protected function define_allowed_child_types() {
		return [
			Atomic_Accordion::ELEMENT_TYPE_TITLE,
			Atomic_Accordion::ELEMENT_TYPE_ICON,
		];
	}

	protected function define_default_children() {
		return [
			Atomic_Accordion_Item_Title::generate()
				->hydrate_default_children( true )
				->editor_settings( [
					'title' => esc_html__( 'Title', 'elementor' ),
				] )
				->build(),
			Atomic_Accordion_Item_Icon::generate()
				->hydrate_default_children( true )
				->editor_settings( [
					'title' => esc_html__( 'Icon', 'elementor' ),
				] )
				->build(),
		];
	}

	/**
	 * Attaches/detaches the icon child as the mirrored `show_icon` prop changes, with `stash( true )`
	 * so a user's *replaced* SVG (or one with edited styles) comes back exactly as it was on
	 * OFF -> ON, instead of a fresh default chevron being reseeded over it. Mirrors
	 * `Atomic_Background_Video::define_children_dependencies()` for `show_controls` / the
	 * Controls child.
	 */
	protected function define_children_dependencies(): array {
		return [
			Child_Dependency::for( Atomic_Accordion::ELEMENT_TYPE_ICON )
				->when( Dependency_Manager::make()->where( [
					'operator' => 'ne',
					'path' => [ 'show_icon' ],
					'value' => false,
				] ) )
				->position( Element_Position::last() )
				->stash( true )
				->default_model(
					Element_Builder::make( Atomic_Accordion::ELEMENT_TYPE_ICON )
						->is_locked( true )
						->hydrate_default_children( true )
						->build()
				),
		];
	}

	protected function get_templates(): array {
		return [
			'elementor/elements/atomic-accordion-item-header' => __DIR__ . '/atomic-accordion-item-header.html.twig',
		];
	}
}
