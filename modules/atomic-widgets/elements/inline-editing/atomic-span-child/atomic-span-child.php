<?php
namespace Elementor\Modules\AtomicWidgets\Elements\InlineEditing\AtomicSpanChild;

use Elementor\Modules\AtomicWidgets\Controls\Section;
use Elementor\Modules\AtomicWidgets\Controls\Types\Html_Tag_Control;
use Elementor\Modules\AtomicWidgets\Controls\Types\Inline_Editing_Control;
use Elementor\Modules\AtomicWidgets\Controls\Types\Link_Control;

use Elementor\Modules\AtomicWidgets\Elements\Base\Atomic_Element_Base;
use Elementor\Modules\AtomicWidgets\Elements\Base\Has_Span_Children_Template;
use Elementor\Modules\AtomicWidgets\PropTypes\Attributes_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Classes_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Html\Html_V3_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Link_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Primitives\String_Prop_Type;
use Elementor\Modules\Components\PropTypes\Overridable_Prop_Type;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Atomic_Span_Child extends Atomic_Element_Base {
	use Has_Span_Children_Template;

	public static function get_type() {
		return 'e-html-span-child';
	}

	public static function get_element_type(): string {
		return 'e-html-span-child';
	}

	public function get_title() {
		return esc_html__( 'Span', 'elementor' );
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

			'tag' => String_Prop_Type::make()
				->enum( [ 'span' ] )
				->default( 'span' ),

			'text' => self::get_child_content_prop_type()
				->default( [
					'type' => String_Prop_Type::generate( 'text' ),
					'text'  => String_Prop_Type::generate( '' ),
				] ),

			'link' => Link_Prop_Type::make(),

			'attributes' => Attributes_Prop_Type::make()->meta( Overridable_Prop_Type::ignore() ),
		];
	}

	protected function define_atomic_controls(): array {
		return [
			Section::make()
				->set_label( __( 'Content', 'elementor' ) )
				->set_items( [
					Html_Tag_Control::bind_to( 'tag' )
						->set_options( [
							[
								'value' => 'span',
								'label' => 'span',
							],
						] )
						->set_label( __( 'Tag', 'elementor' ) ),
					Inline_Editing_Control::bind_to( 'text' )
						->set_placeholder( __( 'Type your text here', 'elementor' ) )
						->set_label( __( 'Text', 'elementor' ) ),
					Link_Control::bind_to( 'link' )
						->set_placeholder( __( 'Type or paste your URL', 'elementor' ) )
						->set_label( __( 'Link', 'elementor' ) )
						->set_meta( [
							'topDivider' => true,
						] ),
				] ),
		];
	}

	protected function get_templates(): array {
		return [
			'elementor/elements/atomic-span-child' => __DIR__ . '/atomic-span-child.html.twig',
		];
	}
}
