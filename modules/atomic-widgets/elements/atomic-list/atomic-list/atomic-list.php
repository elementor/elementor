<?php
namespace Elementor\Modules\AtomicWidgets\Elements\Atomic_List\Atomic_List;

use Elementor\Modules\AtomicWidgets\Controls\Section;
use Elementor\Modules\AtomicWidgets\Controls\Types\Elements\List_Items_Control;
use Elementor\Modules\AtomicWidgets\Controls\Types\Switch_Control;
use Elementor\Modules\AtomicWidgets\Controls\Types\Text_Control;
use Elementor\Modules\AtomicWidgets\Elements\Atomic_List\Atomic_List_Item\Atomic_List_Item;
use Elementor\Modules\AtomicWidgets\Elements\Atomic_List\Atomic_List_Item_Content\Atomic_List_Item_Content;
use Elementor\Modules\AtomicWidgets\Elements\Base\Atomic_Element_Base;
use Elementor\Modules\AtomicWidgets\Elements\Base\Has_Element_Template;
use Elementor\Modules\AtomicWidgets\PropTypes\Attributes_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Classes_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Primitives\Boolean_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Primitives\String_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Size_Prop_Type;
use Elementor\Modules\AtomicWidgets\Styles\Style_Definition;
use Elementor\Modules\AtomicWidgets\Styles\Style_Variant;
use Elementor\Modules\Components\PropTypes\Overridable_Prop_Type;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Atomic_List extends Atomic_Element_Base {
	use Has_Element_Template;

	const BASE_STYLE_KEY = 'base';

	public static $widget_description = 'Create a semantic list with structured list items, marker slots, and content slots.';

	public function __construct( $data = [], $args = null ) {
		parent::__construct( $data, $args );
		$this->meta( 'is_container', true );
	}

	public static function get_type() {
		return 'e-list';
	}

	public static function get_element_type(): string {
		return self::get_type();
	}

	public function get_title() {
		return esc_html__( 'List', 'elementor' );
	}

	public function get_keywords() {
		return [ 'ato', 'atom', 'atoms', 'atomic', 'list' ];
	}

	public function get_icon() {
		return 'eicon-bullet-list';
	}

	protected static function define_props_schema(): array {
		return [
			'classes' => Classes_Prop_Type::make()
				->default( [] )
				->description( 'CSS classes applied to the list container.' ),
			'tag' => String_Prop_Type::make()
				->default( 'ul' )
				->meta( Overridable_Prop_Type::ignore() )
				->description( 'The HTML tag for the list container. Currently hardcoded to ul (unordered list). Future phases may support ol (ordered list).' ),
			'show_markers' => Boolean_Prop_Type::make()
				->default( true )
				->description( 'Controls marker visibility for all list items. When true, markers are shown; when false, markers are hidden but preserved (stashed) for restoration.' ),
			'attributes' => Attributes_Prop_Type::make()
				->meta( Overridable_Prop_Type::ignore() )
				->description( 'Custom HTML attributes applied to the list container element.' ),
		];
	}

	protected function define_atomic_controls(): array {
		return [
			Section::make()
				->set_label( __( 'Content', 'elementor' ) )
				->set_id( 'content' )
				->set_items( [
					List_Items_Control::make()
						->set_label( __( 'List Items', 'elementor' ) )
						->set_meta( [
							'layout' => 'custom',
						] ),
					Switch_Control::bind_to( 'show_markers' )
						->set_label( __( 'Show Markers', 'elementor' ) ),
				] ),
			Section::make()
				->set_label( __( 'Settings', 'elementor' ) )
				->set_id( 'settings' )
				->set_items( [
					Text_Control::bind_to( '_cssid' )
						->set_label( __( 'ID', 'elementor' ) )
						->set_meta( $this->get_css_id_control_meta() ),
				] ),
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
							'list-style-type' => String_Prop_Type::generate( 'none' ),
							'margin' => Size_Prop_Type::generate( [
								'size' => 0,
								'unit' => 'px',
							] ),
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
			Atomic_List_Item::generate()
				->hydrate_default_children( true )
				->editor_settings( [
					'title' => esc_html__( 'Item 1', 'elementor' ),
					'initial_position' => 1,
				] )
				->build(),
		];
	}

	protected function define_default_html_tag() {
		return 'ul';
	}

	protected function define_allowed_child_types() {
		return [ Atomic_List_Item::get_element_type() ];
	}

	protected function define_render_context(): array {
		return [
			[
				'context' => [
					'show_markers' => $this->get_atomic_setting( 'show_markers' ),
				],
			],
		];
	}

	public function render_markdown(): string {
		$children = $this->get_children();

		if ( empty( $children ) ) {
			return '';
		}

		$lines = [];

		foreach ( $children as $child ) {
			if ( $child::get_element_type() !== Atomic_List_Item::get_element_type() ) {
				continue;
			}

			$item_children = $child->get_children();
			$content_text = '';

			foreach ( $item_children as $item_child ) {
				if ( $item_child::get_element_type() === Atomic_List_Item_Content::get_element_type() ) {
					$content_children = $item_child->get_children();
					$content_parts = [];
					foreach ( $content_children as $content_child ) {
						if ( method_exists( $content_child, 'render_markdown' ) ) {
							$md = $content_child->render_markdown();
							if ( ! empty( trim( $md ) ) ) {
								$content_parts[] = $md;
							}
						}
					}
					$content_text = implode( ' ', $content_parts );
					break;
				}
			}

			if ( empty( trim( $content_text ) ) ) {
				continue;
			}

			$lines[] = '- ' . trim( $content_text );
		}

		if ( empty( $lines ) ) {
			return '';
		}

		return implode( "\n", $lines );
	}

	protected function get_templates(): array {
		return [
			'elementor/elements/atomic-list' => __DIR__ . '/atomic-list.html.twig',
		];
	}
}
