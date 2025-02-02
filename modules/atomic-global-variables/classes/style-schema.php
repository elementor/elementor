<?php

namespace Elementor\Modules\AtomicGlobalVariables\Classes;

use Elementor\Modules\AtomicGlobalVariables\PropTypes\Color_Variable_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Base\Array_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Base\Object_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Color_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Contracts\Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Contracts\Transformable_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Union_Prop_Type;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Style_Schema {
	public function append( array $schema ): array {
		$result = [];
		foreach ( $schema as $key => $node ) {
			$result[ $key ] = $this->process( $node );
		}
		file_put_contents('/tmp/atomic-widgets.styles.log', print_r( $result, true ) );
		return $result;
	}

	private function process( $node ) {
		if ( ! $node instanceof Prop_Type ) {
			return $node;
		}

		if ( $node instanceof Color_Prop_Type ) {
			$node = Union_Prop_Type::create_from( $node )
				->add_prop_type( Color_Variable_Prop_Type::make() );

			return $node;
		}

		if ( $node instanceof Object_Prop_Type ) {
			$node->set_shape(
				$this->append( $node->get_shape() )
			);

			return $node;
		}

		return $node;

//		if ( $node instanceof Color_Prop_Type ) {
//			return Union_Prop_Type::make()
//				->add_prop_type( Color_Variable_Prop_Type::make() )
//				->add_prop_type( $node );
//		}
//
//		if ( $node instanceof Object_Prop_Type ) {
//			$node->set_shape( $this->process( $node->get_shape() );
//			return $node;
//		}
//
//		return $node;
	}

	private function extract_prop_types_from( Prop_Type $node ): array {
		return ( $node instanceof Union_Prop_Type )
			? $node->get_prop_types()
			: [ $node ];
	}
}
