<?php

namespace Elementor\Modules\AtomicWidgets\Elements\Atomic_List\Atomic_List;

use Elementor\Modules\AtomicWidgets\Controls\Section;
use Elementor\Modules\AtomicWidgets\Controls\Types\Html_Tag_Control;
use Elementor\Modules\AtomicWidgets\Controls\Types\Elements\List_Items_Control;
use Elementor\Modules\AtomicWidgets\Controls\Types\Switch_Control;
use Elementor\Modules\AtomicWidgets\Controls\Types\Text_Control;
use Elementor\Modules\AtomicWidgets\Elements\Atomic_List\Atomic_List_Item\Atomic_List_Item;
use Elementor\Modules\AtomicWidgets\Elements\Atomic_List\Atomic_List_Item_Content\Atomic_List_Item_Content;
use Elementor\Modules\AtomicWidgets\Elements\Atomic_List\Atomic_List_Item_Marker\Atomic_List_Item_Marker;
use Elementor\Modules\AtomicWidgets\Elements\Atomic_Paragraph\Atomic_Paragraph;
use Elementor\Modules\AtomicWidgets\Elements\Atomic_Svg\Atomic_Svg;
use Elementor\Modules\AtomicWidgets\Elements\Base\Atomic_Element_Base;
use Elementor\Modules\AtomicWidgets\Elements\Base\Widget_Builder;
use Elementor\Modules\AtomicWidgets\Elements\Base\Has_Element_Template;
use Elementor\Modules\AtomicWidgets\PropTypes\Attributes_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Classes_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Html_V3_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropDependencies\Manager as Dependency_Manager;
use Elementor\Modules\AtomicWidgets\PropTypes\Primitives\Boolean_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Primitives\String_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Size_Prop_Type;
use Elementor\Modules\AtomicWidgets\Styles\Style_Definition;
use Elementor\Modules\AtomicWidgets\Styles\Style_Variant;
use Elementor\Modules\Components\PropTypes\Overridable_Prop_Type;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Atomic_List_Tag_Prop_Type extends String_Prop_Type {
	protected function sanitize_value( $value ) {
		return 'ul';
	}
}

class Atomic_List extends Atomic_Element_Base {
	use Has_Element_Template;

	const BASE_STYLE_KEY = 'base';
	const ORDERED_BASE_STYLE_KEY = 'ordered';
	const DEFAULT_MARKER_ICON_STYLE_ID = 'e-list-default-marker-icon';
	public static $widget_description = 'Semantic list container. Supports unordered lists with custom marker slots and ordered lists with native numbering.';

	public function __construct( $data = [], $args = null ) {
		parent::__construct( $data, $args );
		$this->meta( 'is_container', true );
	}

	public static function get_type() {
		return 'e-list';
	}

	public static function get_element_type(): string {
		return 'e-list';
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
		$readonly_tag_dependencies = Dependency_Manager::make( Dependency_Manager::RELATION_AND )
			->where( [
				'operator' => 'eq',
				'path' => [ 'tag' ],
				'value' => '__read_only__',
				'effect' => 'disable',
			] )
			->get();

		return [
			'classes' => Classes_Prop_Type::make()
				->default( [] )
				->description( 'CSS classes applied to the list wrapper.' ),
			'tag' => Atomic_List_Tag_Prop_Type::make()
				->enum( [ 'ul', 'ol' ] )
				->default( 'ul' )
				->description( 'Internal HTML tag selection. The UI keeps this control read-only and saved output is currently normalized to unordered lists.' )
				->set_dependencies( $readonly_tag_dependencies ),
			'show_markers' => Boolean_Prop_Type::make()
				->default( true )
				->description( 'Controls custom marker visibility for unordered lists.' ),
			'attributes' => Attributes_Prop_Type::make()
				->description( 'Custom HTML attributes applied to the list wrapper.' )
				->meta( Overridable_Prop_Type::ignore() ),
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
					Html_Tag_Control::bind_to( 'tag' )
						->set_options( [
							[
								'value' => 'ul',
								'label' => 'UL',
							],
							[
								'value' => 'ol',
								'label' => 'OL',
							],
						] )
						->set_label( __( 'HTML Tag', 'elementor' ) ),
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
							'gap' => Size_Prop_Type::generate( [
								'size' => 12,
								'unit' => 'px',
							] ),
						] )
				),
			static::ORDERED_BASE_STYLE_KEY => Style_Definition::make()
				->add_variant(
					Style_Variant::make()
						->add_props( [
							'display' => String_Prop_Type::generate( 'block' ),
							'list-style-type' => String_Prop_Type::generate( 'decimal' ),
							'padding-inline-start' => Size_Prop_Type::generate( [
								'size' => 24,
								'unit' => 'px',
							] ),
						] )
				),
		];
	}

	protected function define_allowed_child_types() {
		return [ Atomic_List_Item::get_element_type() ];
	}

	protected function define_default_children() {
		return [
			Atomic_List_Item::generate()
				->editor_settings( [
					'label' => 'Item 1',
					'initial_position' => 1,
				] )
				->children( [
					Atomic_List_Item_Marker::generate()
						->children( [
							[
								'elType' => 'widget',
								'widgetType' => Atomic_Svg::get_element_type(),
								'settings' => [
									'classes' => Classes_Prop_Type::generate( [ static::DEFAULT_MARKER_ICON_STYLE_ID ] ),
								],
								'styles' => $this->get_default_marker_icon_styles(),
							],
						] )
						->build(),
					Atomic_List_Item_Content::generate()
						->children( [
							Widget_Builder::make( Atomic_Paragraph::get_element_type() )
								->settings( [
									'paragraph' => Html_V3_Prop_Type::generate( [
										'content' => String_Prop_Type::generate( __( 'List item', 'elementor' ) ),
										'children' => [],
									] ),
								] )
								->build(),
						] )
						->build(),
				] )
				->build(),
		];
	}

	private function get_default_marker_icon_styles(): array {
		return [
			Style_Definition::make()
				->add_variant(
					Style_Variant::make()
						->add_props( [
							'width' => Size_Prop_Type::generate( [
								'size' => 20,
								'unit' => 'px',
							] ),
							'height' => Size_Prop_Type::generate( [
								'size' => 20,
								'unit' => 'px',
							] ),
						] )
				)
				->build( static::DEFAULT_MARKER_ICON_STYLE_ID ),
		];
	}

	protected function define_default_html_tag() {
		return 'ul';
	}

	protected function define_render_context(): array {
		$tag = $this->get_atomic_setting( 'tag' ) ?? 'ul';

		return [
			[
				'context' => [
					'tag' => $tag,
					'is_ordered' => 'ol' === $tag,
				],
			],
		];
	}

	protected function get_templates(): array {
		return [
			'elementor/elements/atomic-list' => __DIR__ . '/atomic-list.html.twig',
		];
	}

	public function render_markdown(): string {
		$tag = $this->get_atomic_setting( 'tag' ) ?? 'ul';
		$items_markdown = [];
		$list_item_index = 0;

		foreach ( $this->get_children() as $child ) {
			if ( Atomic_List_Item::get_element_type() !== $child->get_type() ) {
				continue;
			}

			$line = $this->render_list_item_markdown( $child );

			if ( '' === trim( $line ) ) {
				continue;
			}

			++$list_item_index;
			$prefix = 'ol' === $tag ? $list_item_index . '. ' : '- ';
			$items_markdown[] = $prefix . ltrim( $line );
		}

		return implode( "\n", $items_markdown );
	}

	private function render_list_item_markdown( $list_item ): string {
		foreach ( $list_item->get_children() as $child ) {
			if ( Atomic_List_Item_Content::get_element_type() !== $child->get_type() ) {
				continue;
			}

			$parts = [];

			foreach ( $child->get_children() as $content_child ) {
				$markdown = trim( (string) $content_child->render_markdown() );

				if ( '' !== $markdown ) {
					$parts[] = $markdown;
				}
			}

			return implode( "\n", $parts );
		}

		return '';
	}
}
