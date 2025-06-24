<?php

namespace Elementor\Modules\AtomicWidgets\PropTypes;

use Elementor\Modules\AtomicWidgets\PropDependencies\Manager as Dependency_Manager;
use Elementor\Modules\AtomicWidgets\PropTypes\Base\Object_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Primitives\Boolean_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Primitives\Number_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Primitives\String_Prop_Type;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Link_Prop_Type extends Object_Prop_Type {
	public static function get_key(): string {
		return 'link';
	}

	public function get_is_target_blank_prop(): Boolean_Prop_Type {
		return $this->get_shape_field( 'isTargetBlank' );
	}

	protected function define_shape(): array {
		return [
			'destination' => Union_Prop_Type::make()
				->add_prop_type( Url_Prop_Type::make()->skip_validation() )
				->add_prop_type( Number_Prop_Type::make() )
				->required(),
			'label' => Union_Prop_Type::make()
				->add_prop_type( String_Prop_Type::make() ),
			'isTargetBlank' => Boolean_Prop_Type::make(),
		];
	}
}
