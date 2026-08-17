<?php

namespace Elementor\Modules\AtomicWidgets\Elements\Atomic_Accordion\Atomic_Accordion_Item_Icon;

use Elementor\Modules\AtomicWidgets\Controls\Section;
use Elementor\Modules\AtomicWidgets\Elements\Atomic_Accordion\Atomic_Accordion;
use Elementor\Modules\AtomicWidgets\Elements\Atomic_Svg\Atomic_Svg;
use Elementor\Modules\AtomicWidgets\Elements\Base\Atomic_Element_Base;
use Elementor\Modules\AtomicWidgets\Elements\Base\Has_Element_Template;
use Elementor\Modules\AtomicWidgets\PropTypes\Attributes_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Classes_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Flex_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Primitives\Number_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Primitives\String_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Size_Prop_Type;
use Elementor\Modules\AtomicWidgets\Styles\Style_Definition;
use Elementor\Modules\AtomicWidgets\Styles\Style_Variant;
use Elementor\Modules\Components\PropTypes\Overridable_Prop_Type;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Atomic_Accordion_Item_Icon extends Atomic_Element_Base {
	use Has_Element_Template;

	const BASE_STYLE_KEY = 'base';

	const ICON_WIDTH = 200;

	const ICON_HEIGHT = 20;

	public static $widget_description = 'The open/closed indicator slot of an accordion item header. Decorative (aria-hidden), and rotated by CSS when the item is open. Holds an e-svg (defaulting to Atomic_Svg\'s own default SVG) by default; the SVG can be replaced.';

	public function __construct( $data = [], $args = null ) {
		parent::__construct( $data, $args );
		$this->meta( 'permanently_locked', true );
	}

	public static function get_type() {
		return Atomic_Accordion::ELEMENT_TYPE_ICON;
	}

	public static function get_element_type(): string {
		return Atomic_Accordion::ELEMENT_TYPE_ICON;
	}

	public function get_title() {
		return esc_html__( 'Icon', 'elementor' );
	}

	public function get_keywords() {
		return [ 'ato', 'atom', 'atoms', 'atomic', 'accordion', 'icon', 'chevron' ];
	}

	public function get_icon() {
		return 'eicon-chevron-down';
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
	 * The slot — not the SVG inside it — is the sizing box. `e-svg` ships a fixed 65x65 base
	 * style, which the accordion's inline CSS neutralises inside this slot so a replaced SVG
	 * takes the slot's height and keeps its own aspect ratio, pinned to the slot's trailing edge.
	 */
	protected function define_base_styles(): array {
		$width = Size_Prop_Type::generate( [
			'size' => self::ICON_WIDTH,
			'unit' => 'px',
		] );

		$height = Size_Prop_Type::generate( [
			'size' => self::ICON_HEIGHT,
			'unit' => 'px',
		] );

		return [
			static::BASE_STYLE_KEY => Style_Definition::make()
				->add_variant(
					Style_Variant::make()
						->add_props( [
							'display' => String_Prop_Type::generate( 'inline-flex' ),
							'align-items' => String_Prop_Type::generate( 'center' ),
							// The indicator belongs at the header's trailing edge, and the slot is far
							// wider than the icon it holds (200px, so it stays a usable drop target once
							// the default SVG is deleted), so its content — not the slot itself, which the
							// header's `space-between` already pushes to the end — is what has to be
							// pinned. Declared here, on the permanently locked slot, rather than on the
							// SVG child: a child carries its styles with it when the user deletes it, so
							// the next element dropped in would fall back to centred. `flex-end`, not
							// `right`, so RTL flips it in step with the header's `space-between`.
							'justify-content' => String_Prop_Type::generate( 'flex-end' ),
							// The style schema has no `flex-shrink` longhand — only the composite
							// `flex`. This slot is a flex item of the header (`display: flex`), so the
							// main-axis size is governed by `flex-basis`, not `width`, unless the basis
							// is `auto`. `flexShrink: 0` alone resolves to `flex: 0 0` — CSS treats an
							// omitted basis as `0`, i.e. `flex-basis: 0%` — which would override the
							// `width` below. Passing `flexBasis: auto` keeps the declared width in the
							// main axis while still preventing the icon from shrinking.
							'flex' => Flex_Prop_Type::generate( [
								'flexShrink' => Number_Prop_Type::generate( 0 ),
								'flexBasis' => Size_Prop_Type::generate( [
									'size' => 'auto',
									'unit' => 'custom',
								] ),
							] ),
							'width' => $width,
							'height' => $height,
							// `.e-con`'s container default would add a 10px inline padding here, which
							// (with `box-sizing: border-box`) both shrinks the SVG inside the declared
							// width and pushes the chevron 10px further from the header's padding edge
							// than the title is from the opposite one.
							'padding' => Size_Prop_Type::generate( [
								'size' => 0,
								'unit' => 'px',
							] ),
						] )
				),
		];
	}

	protected function define_default_children() {
		return [
			Atomic_Svg::generate()
				->build(),
		];
	}

	protected function get_templates(): array {
		return [
			'elementor/elements/atomic-accordion-item-icon' => __DIR__ . '/atomic-accordion-item-icon.html.twig',
		];
	}
}
