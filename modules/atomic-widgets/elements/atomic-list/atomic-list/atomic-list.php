<?php
namespace Elementor\Modules\AtomicWidgets\Elements\Atomic_List\Atomic_List;

use Elementor\Modules\AtomicWidgets\Controls\Section;
use Elementor\Modules\AtomicWidgets\Controls\Types\Elements\List_Items_Control;
use Elementor\Modules\AtomicWidgets\Controls\Types\Text_Control;
use Elementor\Modules\AtomicWidgets\Controls\Types\Toggle_Control;
use Elementor\Modules\AtomicWidgets\Elements\Atomic_Paragraph\Atomic_Paragraph;
use Elementor\Modules\AtomicWidgets\Elements\Atomic_List\Atomic_List_Item\Atomic_List_Item;
use Elementor\Modules\AtomicWidgets\Elements\Base\Atomic_Element_Base;
use Elementor\Modules\AtomicWidgets\Elements\Base\Has_Element_Template;
use Elementor\Modules\AtomicWidgets\PropTypes\Attributes_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Classes_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Html_V3_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Primitives\String_Prop_Type;
use Elementor\Modules\AtomicWidgets\Styles\Style_Definition;
use Elementor\Modules\AtomicWidgets\Styles\Style_States;
use Elementor\Modules\AtomicWidgets\Styles\Style_Variant;
use Elementor\Modules\Components\PropTypes\Overridable_Prop_Type;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Atomic_List extends Atomic_Element_Base {
	use Has_Element_Template;

	const BASE_STYLE_KEY = 'base';

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
		return [
			'classes' => Classes_Prop_Type::make()
				->default( [] ),
			'list-type' => String_Prop_Type::make()
				->enum( [ 'unordered', 'ordered' ] )
				->default( 'unordered' ),
			'attributes' => Attributes_Prop_Type::make()->meta( Overridable_Prop_Type::ignore() ),
		];
	}

	protected function define_atomic_controls(): array {
		return [
			Section::make()
				->set_label( __( 'Content', 'elementor' ) )
				->set_id( 'content' )
				->set_items( [
					Toggle_Control::bind_to( 'list-type' )
						->add_options( [
							'unordered' => [
								'title' => __( 'Unordered', 'elementor' ),
								'atomic-icon' => 'ListIcon',
							],
							'ordered' => [
								'title' => __( 'Ordered', 'elementor' ),
								'atomic-icon' => 'Number123Icon',
							],
						] )
						->set_exclusive( true )
						->set_convert_options( true )
						->set_size( 'tiny' )
						->set_full_width( true )
						->set_label( __( 'List Type', 'elementor' ) ),
					List_Items_Control::make()
						->set_label( __( 'List Items', 'elementor' ) )
						->set_meta( [
							'layout' => 'custom',
						] ),
				] ),
			Section::make()
				->set_label( __( 'Settings', 'elementor' ) )
				->set_id( 'settings' )
				->set_items( [
					Text_Control::bind_to( '_cssid' )
						->set_label( __( 'ID', 'elementor' ) )
						->set_meta( [
							'layout' => 'two-columns',
						] ),
				] ),
		];
	}

	protected function define_atomic_pseudo_states(): array {
		return [
			Style_States::get_custom_states_map()['list-markers'],
		];
	}

	protected function define_base_styles(): array {
		return [
			static::BASE_STYLE_KEY => Style_Definition::make()
				->add_variant(
					Style_Variant::make()
						->add_prop( 'display', String_Prop_Type::generate( 'block' ) )
				),
		];
	}

	protected function define_default_children() {
		return array_map(
			fn ( $index ) => Atomic_List_Item::generate()
				->children( [
					Atomic_Paragraph::generate()
						->settings( [
							'paragraph' => Html_V3_Prop_Type::generate( [
								'content' => String_Prop_Type::generate( "Item #{$index}" ),
								'children' => [],
							] ),
							'tag' => String_Prop_Type::generate( 'span' ),
						] )
						->build(),
				] )
				->editor_settings( [
					'title' => "Item #{$index}",
					'initial_position' => $index,
				] )
				->is_locked( true )
				->build(),
			range( 1, 3 )
		);
	}

	protected function define_allowed_child_types() {
		return [ Atomic_List_Item::get_element_type() ];
	}

	protected function get_templates(): array {
		return [
			'elementor/elements/atomic-list' => __DIR__ . '/atomic-list.html.twig',
		];
	}
}
