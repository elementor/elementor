<?php

namespace Elementor\Modules\AtomicWidgets\Elements\Atomic_Accordion\Atomic_Accordion_Item_Title;

use Elementor\Modules\AtomicWidgets\Controls\Section;
use Elementor\Modules\AtomicWidgets\Elements\Atomic_Accordion\Atomic_Accordion;
use Elementor\Modules\AtomicWidgets\Elements\Atomic_Paragraph\Atomic_Paragraph;
use Elementor\Modules\AtomicWidgets\Elements\Base\Atomic_Element_Base;
use Elementor\Modules\AtomicWidgets\Elements\Base\Has_Element_Template;
use Elementor\Modules\AtomicWidgets\Elements\Base\Render_Context;
use Elementor\Modules\AtomicWidgets\PropTypes\Attributes_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Classes_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Html_V3_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Primitives\String_Prop_Type;
use Elementor\Modules\Components\PropTypes\Overridable_Prop_Type;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Atomic_Accordion_Item_Title extends Atomic_Element_Base {
	use Has_Element_Template;

	public static $widget_description = 'The title slot of an accordion item header. Its HTML tag is controlled by the accordion\'s Title HTML Tag setting. Accepts any element as its content.';

	public function __construct( $data = [], $args = null ) {
		parent::__construct( $data, $args );
		$this->meta( 'permanently_locked', true );
	}

	public static function get_type() {
		return Atomic_Accordion::ELEMENT_TYPE_TITLE;
	}

	public static function get_element_type(): string {
		return Atomic_Accordion::ELEMENT_TYPE_TITLE;
	}

	public function get_title() {
		return esc_html__( 'Title', 'elementor' );
	}

	public function get_keywords() {
		return [ 'ato', 'atom', 'atoms', 'atomic', 'accordion', 'title' ];
	}

	public function get_icon() {
		return 'eicon-t-letter';
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
	 * Editor-side default only. On render the tag comes from the accordion's `title_tag`
	 * setting through the render context.
	 */
	protected function define_default_html_tag() {
		return 'span';
	}

	/*
	 * No base styles for this slot (Step 2's table: base styles "none" for the title). Removing
	 * the override entirely, rather than returning an empty `Style_Definition` list, is safe:
	 * `Has_Base_Styles::get_base_styles_dictionary()` returns `[]` for a type with no
	 * `define_base_styles()` override, and the `render_base_classes` Twig macro reads
	 * `base_styles.base` — an empty array leaves that lookup `null`, which `join(' ')` renders as
	 * an empty string alongside the other class names, so the class list still comes out clean.
	 */

	protected function define_default_children() {
		return [
			Atomic_Paragraph::generate()
				->settings( [
					'paragraph' => Html_V3_Prop_Type::generate( [
						'content' => String_Prop_Type::generate( esc_html__( 'Accordion Item', 'elementor' ) ),
						'children' => [],
					] ),
					'tag' => String_Prop_Type::generate( 'span' ),
				] )
				->build(),
		];
	}

	protected function get_templates(): array {
		return [
			'elementor/elements/atomic-accordion-item-title' => __DIR__ . '/atomic-accordion-item-title.html.twig',
		];
	}

	/**
	 * Reads the tag to render as from the accordion's render context.
	 *
	 * `Render_Context::get()` returns `[]` when this element renders outside a parent
	 * `Atomic_Accordion` pass (e.g. `Render_Element_Action` re-rendering a single element), so
	 * `title-tag` may be absent — that falls back to `null` here rather than warn on a missing array
	 * key, and the Twig template's `title_tag | default('span')` turns that into `span`.
	 *
	 * @return array
	 */
	protected function build_template_context(): array {
		$accordion_context = Render_Context::get( Atomic_Accordion::class );

		return array_merge( $this->build_base_template_context(), [
			'title_tag' => $accordion_context['title-tag'] ?? null,
		] );
	}
}
