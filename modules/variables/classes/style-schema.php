<?php

namespace Elementor\Modules\Variables\Classes;

use Elementor\Modules\Variables\PropTypes\Color_Variable_Prop_Type;
use Elementor\Modules\Variables\Transformers\Global_Variable as Global_Variable_Transformer;
use Elementor\Modules\AtomicWidgets\PropsResolver\Transformers_Registry;
use Elementor\Modules\AtomicWidgets\PropTypes\Base\Array_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Base\Object_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Color_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Union_Prop_Type;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Style_Schema {
	public function append_to( Transformers_Registry $transformers ) {
		$transformers->register( Color_Variable_Prop_Type::get_key(), new Global_Variable_Transformer() );

		return $this;
	}

	public function augment( array $schema ): array {
		$result = [];

		foreach ( $schema as $key => $node ) {
			$result[ $key ] = $this->process( $node );
		}

		return $result;
	}

	private function process( $node ) {
		if ( $node instanceof Color_Prop_Type ) {
			return Union_Prop_Type::create_from( $node )
				->add_prop_type( Color_Variable_Prop_Type::make() );
		}

		if ( $node instanceof Object_Prop_Type ) {
			return $node->set_shape(
				$this->augment( $node->get_shape() )
			);
		}

		if ( $node instanceof Array_Prop_Type ) {
			return $node->set_item_type(
				$this->process( $node->get_item_type() )
			);
		}

		if ( $node instanceof Union_Prop_Type ) {
			$prop_type = Union_Prop_Type::make();
			foreach ( $node->get_prop_types() as $type ) {
				$prop_type->add_prop_type( $this->process( $type ) );
			}
			return $prop_type;
		}

		return $node;
	}
}
