<?php
namespace Elementor\Modules\AtomicWidgets\Elements\Atomic_List\Atomic_List_Item;

use Elementor\Modules\AtomicWidgets\Controls\Section;
use Elementor\Modules\AtomicWidgets\Elements\Atomic_List\Atomic_List_Item_Content\Atomic_List_Item_Content;
use Elementor\Modules\AtomicWidgets\Elements\Atomic_List\Atomic_List_Item_Marker\Atomic_List_Item_Marker;
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

class Atomic_List_Item extends Atomic_Element_Base {
	use Has_Element_Template;

	const BASE_STYLE_KEY = 'base';

	public static $widget_description = 'A locked list item wrapper that contains marker and content slots.';

	public function __construct( $data = [], $args = null ) {
		parent::__construct( $data, $args );
		$this->meta( 'permanently_locked', true );
	}

	public static function get_type() {
		return 'e-list-item';
	}

	public static function get_element_type(): string {
		return self::get_type();
	}

	public function get_title() {
		return esc_html__( 'List item', 'elementor' );
	}

	public function get_icon() {
		return 'eicon-bullet-list';
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
							'flex-direction' => String_Prop_Type::generate( 'row' ),
							'align-items' => String_Prop_Type::generate( 'flex-start' ),
							'gap' => Size_Prop_Type::generate( [
								'size' => 8,
								'unit' => 'px',
							] ),
							'list-style-type' => String_Prop_Type::generate( 'none' ),
							'width' => Size_Prop_Type::generate( [
								'size' => 100,
								'unit' => '%',
							] ),
						] )
				),
		];
	}

	protected function define_default_children() {
		return [
			Atomic_List_Item_Marker::generate()
				->hydrate_default_children( true )
				->build(),
			Atomic_List_Item_Content::generate()
				->hydrate_default_children( true )
				->build(),
		];
	}

	protected function define_allowed_child_types() {
		return [
			Atomic_List_Item_Marker::get_element_type(),
			Atomic_List_Item_Content::get_element_type(),
		];
	}

	protected function parse_editor_settings( array $data ): array {
		$editor_data = parent::parse_editor_settings( $data );

		if ( isset( $data['label'] ) && is_string( $data['label'] ) ) {
			$editor_data['label'] = sanitize_text_field( $data['label'] );
		}

		return $editor_data;
	}

	protected function get_templates(): array {
		return [
			'elementor/elements/atomic-list-item' => __DIR__ . '/atomic-list-item.html.twig',
		];
	}
}
