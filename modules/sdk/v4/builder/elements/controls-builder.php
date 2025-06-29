<?php

namespace Elementor\Modules\Sdk\V4\Builder\Elements;

use Elementor\Modules\AtomicWidgets\Base\Atomic_Control_Base;
use Elementor\Modules\AtomicWidgets\Controls\Types\Image_Control;
use Elementor\Modules\AtomicWidgets\Controls\Types\Link_Control;
use Elementor\Modules\AtomicWidgets\Controls\Types\Select_Control;
use Elementor\Modules\AtomicWidgets\Controls\Types\Text_Control;
use Elementor\Modules\AtomicWidgets\Controls\Types\Textarea_Control;
use Elementor\Modules\AtomicWidgets\PropTypes\Image_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Link_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Primitives\Boolean_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Primitives\String_Prop_Type;
use Elementor\Modules\AtomicWidgets\Image\Placeholder_Image;
use Elementor\Modules\Sdk\V4\Builder\SUPPORTED_PROPERTY_TYPES;
use Exception;

class Controls_Builder {

	private $schema = [];

	public function __construct( array $schema ) {
		$properties   = $schema['properties'] ?? [];
		$this->schema = $properties;
	}

	public function build_control( $property ): Atomic_Control_Base|null {
		$name        = $property['name'];
		$type        = $property['type'] ?? null;
		$label       = $property['label'] ?? $name;
		$placeholder = $property['placeholder'] ?? null;
		$control     = null;
		SUPPORTED_PROPERTY_TYPES::is( $type );
		switch ( $type ) {
			case 'image':
				$control = Image_Control::bind_to( $name );
				$control->set_show_mode( 'media' );
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
			case 'text_area':
				$control = Textarea_Control::bind_to( $name );
				$control->set_placeholder( $placeholder );
				break;
			default:
				throw new Exception( "Unsupported property type: {$type}" );
		}
		$control->set_label( $label );
		$meta = $property['meta'] ?? [];
		if ( ! empty( $meta ) ) {
			$control->set_meta( $meta );
		}
		return $control;
	}

	public function build_props_schema() {
		$properties = $this->schema;
		$result     = [];
		foreach ( $properties as $property ) {
			$name            = $property['name'] ?? '';
			$result[ $name ] = $this->build_property( $property );
		}
		return $result;
	}

	protected function build_property( $property ) {
		$type          = $property['type'] ?? null;
		$default_value = $property['default'] ?? null;
		switch ( $type ) {
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
				return Link_Prop_Type::make()
					->default( $default_value ?? null );
		}
	}
}
