<?php

namespace Elementor\Modules\AtomicWidgets\PropTypes;

use Elementor\Modules\AtomicWidgets\PropTypes\Base\Object_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Primitives\Number_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Primitives\String_Prop_Type;
use Elementor\Modules\AtomicWidgets\Styles\Size_Constants;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Grid_Prop_Type extends Object_Prop_Type {
	public static function get_key(): string {
		return 'grid';
	}

	protected function define_shape(): array {
		$units = Size_Constants::layout();

		return [
			'columnsCount' => Number_Prop_Type::make()->default( 3 ),
			'rowsCount' => Number_Prop_Type::make()->default( 2 ),
			'columnsTemplate' => String_Prop_Type::make()->default( '' ),
			'rowsTemplate' => String_Prop_Type::make()->default( '' ),
			'columnGap' => Size_Prop_Type::make()->units( $units ),
			'rowGap' => Size_Prop_Type::make()->units( $units ),
			'autoFlow' => String_Prop_Type::make()
				->enum( [ 'row', 'column', 'dense', 'row dense', 'column dense' ] )
				->default( 'row' ),
		];
	}
}
