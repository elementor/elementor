<?php

namespace Elementor\Modules\AtomicWidgets\PropTypes;

use Elementor\Modules\AtomicWidgets\PropTypes\Base\Object_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Base\Plain_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Primitives\String_Prop_Type;
use MailPoetVendor\Doctrine\ORM\Mapping\UnderscoreNamingStrategy;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Size_Prop_Type extends Plain_Prop_Type {
	public static function get_key(): string {
		return 'size';
	}

	protected function validate_value( $value ): bool {
		// TODO: Implement validate_value() method.
		return is_string( $value );
	}

	protected function sanitize_value( $value ) {
		return Union_Prop_Type::make()
								->add_prop_type( String_Prop_Type::make()->enum( [ 'auto' ] ) )
								->add_prop_type( Size_Unit_Prop_Type::make() );
	}
}
