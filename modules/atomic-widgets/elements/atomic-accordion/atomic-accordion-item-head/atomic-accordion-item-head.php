<?php

namespace Elementor\Modules\AtomicWidgets\Elements\Atomic_Accordion\Atomic_Accordion_Item_Head;

use Elementor\Modules\AtomicWidgets\Controls\Section;
use Elementor\Modules\AtomicWidgets\Elements\Atomic_Accordion\Atomic_Accordion;
use Elementor\Modules\AtomicWidgets\Elements\Atomic_Accordion\Atomic_Accordion_Item_Icon\Atomic_Accordion_Item_Icon;
use Elementor\Modules\AtomicWidgets\Elements\Atomic_Accordion\Atomic_Accordion_Item_Title\Atomic_Accordion_Item_Title;
use Elementor\Modules\AtomicWidgets\Elements\Base\Atomic_Element_Base;
use Elementor\Modules\AtomicWidgets\Elements\Base\Has_Element_Template;
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

class Atomic_Accordion_Item_Head extends Atomic_Element_Base {
	use Has_Element_Template;

	const BASE_STYLE_KEY = 'base';

	public static $widget_description = 'The clickable header of an accordion item, rendered as <summary>. Contains an e-accordion-item-title and, when the accordion\'s Show Icon setting is on, an e-accordion-item-icon indicator.';

	public function __construct( $data = [], $args = null ) {
		parent::__construct( $data, $args );
		$this->meta( 'permanently_locked', true );
	}

	public static function get_type() {
		return Atomic_Accordion::ELEMENT_TYPE_HEAD;
	}

	public static function get_element_type(): string {
		return Atomic_Accordion::ELEMENT_TYPE_HEAD;
	}

	public function get_title() {
		return esc_html__( 'Head', 'elementor' );
	}

	public function get_keywords() {
		return [ 'ato', 'atom', 'atoms', 'atomic', 'accordion', 'head', 'summary' ];
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

	protected function get_templates(): array {
		return [
			'elementor/elements/atomic-accordion-item-head' => __DIR__ . '/atomic-accordion-item-head.html.twig',
		];
	}
}
