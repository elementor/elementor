<?php

namespace Elementor\Modules\AtomicWidgets\Elements\Atomic_Accordion\Atomic_Accordion_Item_Title;

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

class Atomic_Accordion_Item_Title extends Atomic_Element_Base {
	use Has_Element_Template;

	const BASE_STYLE_KEY = 'base';

	public static $widget_description = 'The title slot of an accordion item header. Always renders as a fixed, non-semantic wrapper; the visible HTML tag is controlled by the inner Paragraph element\'s own Tag setting. Accepts any element as its content.';

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
	 * Editor-side default only, reported via `to_config()['default_html_tag']`. This element no
	 * longer has a settable `tag` prop of its own — the twig always renders a fixed `span` wrapper
	 * (`title_tag | default('span')` with `title_tag` never supplied) regardless of this value; the
	 * visible tag is controlled solely by the inner Paragraph child's own `tag` setting.
	 */
	protected function define_default_html_tag() {
		return 'span';
	}

	/**
	 * Padding `0` is the *whole* base style here, and it is not redundant: `render_base_classes`
	 * puts `e-con` on every atomic element, and `.e-con` declares
	 * `padding-inline-start/end: var(--padding-inline-start/end)`, resolving to the container
	 * default of 10px. A slot that declares no padding of its own therefore silently inherits a
	 * 10px inline inset from that rule, which pushed the title text 10px to the right of the
	 * content slot's children (the header already owns the item's 10px padding, so the title must
	 * add none). Same reasoning as `Atomic_Background_Video_Content`'s explicit `padding: 0`.
	 */
	protected function define_base_styles(): array {
		return [
			static::BASE_STYLE_KEY => Style_Definition::make()
				->add_variant(
					Style_Variant::make()
						->add_props( [
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
}
