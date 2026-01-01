<?php

namespace Elementor\Modules\Components\PropTypes;

use Elementor\Modules\AtomicWidgets\PropTypes\Base\Array_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Base\Plain_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Contracts\Prop_Type;
use Elementor\Modules\Components\PropTypes\Override_Parser;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Overrides_Prop_Type extends Array_Prop_Type {
	public static function get_key(): string {
		return 'overrides';
	}

	protected function define_item_type(): Prop_Type {
		return Override_Prop_Type::make();
	}

	public function sanitize_value( $value ): array {
		$sanitized = parent::sanitize_value( $value );

		return array_filter( $sanitized, function( $item ) {
			switch ( $item['$$type'] ) {
				case 'override':
					return null !== $item['value'];
				case 'overridable':
					$override = $item['value']['origin_value'];
					return null !== $override['value'];
			}
		} );
	}
}
