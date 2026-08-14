<?php

namespace Elementor\Modules\AtomicWidgets\Elements\Atomic_Carousel;

use Elementor\Modules\AtomicWidgets\Controls\Section;
use Elementor\Modules\AtomicWidgets\Elements\Atomic_Paragraph\Atomic_Paragraph;
use Elementor\Modules\AtomicWidgets\Elements\Base\Atomic_Element_Base;
use Elementor\Modules\AtomicWidgets\PropTypes\Attributes_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Background_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Classes_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Color_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Dimensions_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Html_V3_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Primitives\String_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Size_Prop_Type;
use Elementor\Modules\AtomicWidgets\Styles\Style_Definition;
use Elementor\Modules\AtomicWidgets\Styles\Style_Variant;
use Elementor\Modules\Components\PropTypes\Overridable_Prop_Type;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

/**
 * Shared behaviour of the previous/next arrows. The two only differ by their type, label and
 * which inline edge they sit on, so everything else lives here.
 *
 * Both are `<button>` elements and both are containers: the user drops any element inside to
 * replace the default label, and the button keeps handling the navigation. They are siblings of
 * the viewport rather than children of it, so a pointer-down on an arrow never begins a drag.
 */
abstract class Atomic_Carousel_Arrow_Base extends Atomic_Element_Base {
	const BASE_STYLE_KEY = 'base';

	abstract protected static function get_default_label(): string;

	abstract protected static function get_aria_label(): string;

	/**
	 * `inset-inline-start` or `inset-inline-end`. Logical, not `left`/`right`: physical
	 * properties do not follow `direction`, which is why the spec's claim that the arrows swap
	 * automatically in RTL does not hold. Measured in the POC.
	 */
	abstract protected static function get_inline_edge(): string;

	public function __construct( $data = [], $args = null ) {
		parent::__construct( $data, $args );
		$this->meta( 'permanently_locked', true );
		$this->meta( 'is_container', true );
	}

	public function get_keywords() {
		return [ 'ato', 'atom', 'atoms', 'atomic', 'carousel', 'arrow' ];
	}

	public function should_show_in_panel() {
		return false;
	}

	protected static function define_props_schema(): array {
		return [
			'classes' => Classes_Prop_Type::make()->default( [] ),
			'attributes' => Attributes_Prop_Type::make()->meta( Overridable_Prop_Type::ignore() ),
		];
	}

	public static function get_props_schema(): array {
		$schema = parent::get_props_schema();

		unset( $schema['display-conditions'] );

		return $schema;
	}

	protected function define_atomic_controls(): array {
		return [
			Section::make()
				->set_label( __( 'Settings', 'elementor' ) )
				->set_id( 'settings' )
				->set_items( [] ),
		];
	}

	protected function define_default_html_tag() {
		return 'button';
	}

	protected function define_initial_attributes() {
		return [
			'type' => 'button',
			'aria-label' => static::get_aria_label(),
		];
	}

	protected function define_base_styles(): array {
		$styles = [
			'position' => String_Prop_Type::generate( 'absolute' ),
			'inset-block-start' => Size_Prop_Type::generate( [
				'size' => 50,
				'unit' => '%',
			] ),
			'z-index' => String_Prop_Type::generate( '1' ),
			'display' => String_Prop_Type::generate( 'flex' ),
			'align-items' => String_Prop_Type::generate( 'center' ),
			'justify-content' => String_Prop_Type::generate( 'center' ),
			'cursor' => String_Prop_Type::generate( 'pointer' ),
			'border-style' => String_Prop_Type::generate( 'none' ),
			'background' => Background_Prop_Type::generate( [
				'color' => Color_Prop_Type::generate( 'transparent' ),
			] ),
			'padding' => Dimensions_Prop_Type::generate( [
				'block-start' => Size_Prop_Type::generate( [
					'size' => 8,
					'unit' => 'px',
				] ),
				'block-end' => Size_Prop_Type::generate( [
					'size' => 8,
					'unit' => 'px',
				] ),
				'inline-start' => Size_Prop_Type::generate( [
					'size' => 8,
					'unit' => 'px',
				] ),
				'inline-end' => Size_Prop_Type::generate( [
					'size' => 8,
					'unit' => 'px',
				] ),
			] ),
			static::get_inline_edge() => Size_Prop_Type::generate( [
				'size' => 16,
				'unit' => 'px',
			] ),
		];

		return [
			static::BASE_STYLE_KEY => Style_Definition::make()
				->add_variant(
					Style_Variant::make()->add_props( $styles )
				),
		];
	}

	public static function build_default_element(): array {
		return static::generate()
			->children( [ static::build_label_paragraph() ] )
			->editor_settings( [
				'title' => static::get_default_label(),
			] )
			->build();
	}

	protected function define_default_children() {
		return [ static::build_label_paragraph() ];
	}

	/**
	 * Text, not an icon: the Icon Library (ED-25022) is not available yet. Swapping this for an
	 * SVG later is a content-only change to the default children, which does not affect
	 * documents already saved.
	 */
	private static function build_label_paragraph(): array {
		return Atomic_Paragraph::generate()
			->settings( [
				'paragraph' => Html_V3_Prop_Type::generate( [
					'content' => String_Prop_Type::generate( static::get_default_label() ),
					'children' => [],
				] ),
				'tag' => String_Prop_Type::generate( 'span' ),
			] )
			->build();
	}

	protected function build_template_context(): array {
		return array_merge( $this->build_base_template_context(), [
			'initial_attributes' => $this->define_initial_attributes(),
		] );
	}
}
