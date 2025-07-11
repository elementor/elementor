<?php

namespace Elementor\Modules\Sdk\V4\Builder\Elements;

use Elementor\Modules\AtomicWidgets\Base\Atomic_Control_Base;
use Elementor\Modules\AtomicWidgets\Controls\Types\Color_Control;
use Elementor\Modules\AtomicWidgets\Controls\Types\Image_Control;
use Elementor\Modules\AtomicWidgets\Controls\Types\Link_Control;
use Elementor\Modules\AtomicWidgets\Controls\Types\Repeatable_Control;
use Elementor\Modules\AtomicWidgets\Controls\Types\Select_Control;
use Elementor\Modules\AtomicWidgets\Controls\Types\Text_Control;
use Elementor\Modules\AtomicWidgets\Controls\Types\Textarea_Control;
use Elementor\Modules\AtomicWidgets\PropTypes\Image_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Link_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Primitives\Boolean_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Primitives\String_Prop_Type;
use Elementor\Modules\AtomicWidgets\Image\Placeholder_Image;
use Elementor\Modules\AtomicWidgets\PropTypes\Key_Value_Array_Prop_Type;
use Elementor\Modules\Sdk\V4\Builder\Elements\Props\Array_List_Type;
use Elementor\Modules\Sdk\V4\Builder\SUPPORTED_PROPERTY_TYPES;
use Exception;

class Controls_Builder {

	private $schema = [];

	public function __construct( array $schema ) {
		$properties   = $schema['properties'] ?? [];
		$this->schema = $properties;
	}

	/**
	 * @param array $property
	 * @return Atomic_Control_Base[]
	 */
	public function build_control( $property ): array {
		$name        = $property['name'];
		$type        = $property['type'] ?? null;
		$label       = $property['label'] ?? $name;
		$placeholder = $property['placeholder'] ?? null;
		$controls    = [];
		$control     = null;
		SUPPORTED_PROPERTY_TYPES::is( $type );
		switch ( $type ) {
			case 'image':
				$img_control = Image_Control::bind_to( $name );
				$img_control->set_show_mode( 'media' );
				$size_control = Image_Control::bind_to( $name )
					->set_show_mode( 'sizes' )
					->set_label( __( 'Image resolution', 'elementor' ) )
					->set_meta( [ 'layout' => 'two-columns' ] );
				$controls[] = $img_control;
				$controls[] = $size_control;
				break;
			case 'link':
				$control = Link_Control::bind_to( $name );
				break;
			case 'text':
				$control = Text_Control::bind_to( $name );
				$control->set_placeholder( $placeholder ?? '' );
				break;
			case 'select':
				$control = Select_Control::bind_to( $name );
				$control->set_options( $property['options'] ?? [] );
				break;
			case 'color':
				$control = Color_Control::bind_to( $name );
				$control->set_label( $label );
				break;
			case 'text_area':
				$control = Textarea_Control::bind_to( $name );
				$control->set_placeholder( $placeholder );
				break;
			case 'array':
				$control = Repeatable_Control::bind_to( $name );
				$control->set_child_control_type( $property['array_type'] );
				$control->set_repeaterLabel( $label );
				$control->hide_duplicate();
				$control->hide_toggle();
				$child_prop_type = String_Prop_Type::make();
				switch ( $property['array_type'] ) {
					case 'image':
						$child_prop_type = Image_Prop_Type::make();
						break;
				}
				$control->set_initialValues( $property['default_item_value'] ?? $child_prop_type->get_default() );
				$control->set_placeholder( $placeholder ?? $label );
				$control->set_patternLabel( 'Add new item' );
				$control->set_child_control_props( $child_prop_type );
				break;
			default:
				throw new Exception( esc_html( "Unsupported property type: {$type}" ) );
		}
		if ( $control ) {
			$controls[] = $control;
		}
		if ( count( $controls ) === 1 ) {
			$control = $controls[0];
			$control->set_label( $label );
			$meta = $property['meta'] ?? [];
			if ( ! empty( $meta ) ) {
				$control->set_meta( $meta );
			}
		}
		return $controls;
	}

	public function build_props_schema() {
		$properties = $this->schema;
		$result     = [];
		foreach ( $properties as $property ) {
			$name            = $property['name'] ?? '';
			$result[ $name ] = $this->build_property( $property );
		}
		if ( ! isset( $result['attributes'] ) ) {
			$result['attributes'] = Key_Value_Array_Prop_Type::make();
		}
		return $result;
	}

	protected function build_array_property( $property ) {
		$type = $property['array_type'] ?? null;
		$default_value = $property['default_item_value'] ?? null;
		switch ( $type ) {
			case 'image':
				return Array_List_Type::make_generic( Image_Prop_Type::make()->default( $default_value ) );
			case 'text':
				return Array_List_Type::make_generic( String_Prop_Type::make()->default( $default_value ?? '' ) );
			default:
				throw new Exception( esc_html( "Unsupported array type: {$type}" ) );
		}
	}

	protected function build_property( $property ) {
		$type          = $property['type'] ?? null;
		$default_value = $property['default'] ?? null;
		switch ( $type ) {
			case 'array':
				return $this->build_array_property( $property )->default( $default_value ?? [] );
			case 'boolean':
			case 'bool':
			case 'switch':
				return Boolean_Prop_Type::make()
					->default( $default_value ?? false );
			case 'image':
				return Image_Prop_Type::make()
					->default_url( $default_value ?? Placeholder_Image::get_placeholder_image() )
					->default_size( 'full' );
			case 'text':
				return String_Prop_Type::make()
					->default( $default_value ?? null );
			case 'select':
				$options = $property['options'] ?? [];
				$values  = array_map(
					fn( $option ) => $option['value'],
					$options
				);
				return String_Prop_Type::make()
					->enum( $values )
					->default( $default_value ?? $values[0] );
			case 'text_area':
				return String_Prop_Type::make()
					->default( $default_value ?? null );
			case 'link':
				$prop = Link_Prop_Type::make();
				if ( ! is_null( $default_value ) ) {
					$prop->default( $default_value );
				}
				return $prop;
		}
	}
}
