<?php

namespace Elementor\Modules\AtomicWidgets\Elements\Atomic_Accordion\Atomic_Accordion_Item_Content;

use Elementor\Modules\AtomicWidgets\Controls\Section;
use Elementor\Modules\AtomicWidgets\Elements\Atomic_Accordion\Atomic_Accordion;
use Elementor\Modules\AtomicWidgets\Elements\Atomic_Paragraph\Atomic_Paragraph;
use Elementor\Modules\AtomicWidgets\Elements\Base\Atomic_Element_Base;
use Elementor\Modules\AtomicWidgets\Elements\Base\Has_Element_Template;
use Elementor\Modules\AtomicWidgets\PropTypes\Attributes_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Classes_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Html_V3_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Primitives\String_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Size_Prop_Type;
use Elementor\Modules\AtomicWidgets\Styles\Style_Definition;
use Elementor\Modules\AtomicWidgets\Styles\Style_Variant;
use Elementor\Modules\Components\PropTypes\Overridable_Prop_Type;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Atomic_Accordion_Item_Content extends Atomic_Element_Base {
	use Has_Element_Template;

	const BASE_STYLE_KEY = 'base';

	public static $widget_description = 'The collapsible body of an accordion item. Accepts any element as children, including another e-accordion.';

	public function __construct( $data = [], $args = null ) {
		parent::__construct( $data, $args );
		$this->meta( 'permanently_locked', true );
	}

	public static function get_type() {
		return Atomic_Accordion::ELEMENT_TYPE_CONTENT;
	}

	public static function get_element_type(): string {
		return Atomic_Accordion::ELEMENT_TYPE_CONTENT;
	}

	public function get_title() {
		return esc_html__( 'Content', 'elementor' );
	}

	public function get_keywords() {
		return [ 'ato', 'atom', 'atoms', 'atomic', 'accordion', 'content' ];
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

	protected function define_base_styles(): array {
		return [
			static::BASE_STYLE_KEY => Style_Definition::make()
				->add_variant(
					Style_Variant::make()
						->add_props( [
							'display' => String_Prop_Type::generate( 'flex' ),
							'flex-direction' => String_Prop_Type::generate( 'column' ),
							'padding' => Size_Prop_Type::generate( [
								'size' => 10,
								'unit' => 'px',
							] ),
						] )
				),
		];
	}

	protected function define_default_children() {
		return [
			Atomic_Paragraph::generate()
				->settings( [
					'paragraph' => Html_V3_Prop_Type::generate( [
						'content' => String_Prop_Type::generate( esc_html__( 'Content goes here...', 'elementor' ) ),
						'children' => [],
					] ),
					'tag' => String_Prop_Type::generate( 'p' ),
				] )
				->build(),
		];
	}

	protected function get_templates(): array {
		return [
			'elementor/elements/atomic-accordion-item-content' => __DIR__ . '/atomic-accordion-item-content.html.twig',
		];
	}
}
