<?php

namespace Elementor\Modules\Mcp\Abilities\Appliers\V3\Maps\Settings;

use Elementor\Modules\AtomicWidgets\PropTypes\Base\Array_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Base\Object_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Contracts\Prop_Type;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Array of repeater rows. The row shape is not known until a repeater control is converted, so
 * it is passed with {@see self::set_item_shape()} instead of through a dedicated item class.
 */
class V3_Repeater_Prop_Type extends Array_Prop_Type {

	public static function get_key(): string {
		return 'v3-repeater';
	}

	/**
	 * @param array<string, Prop_Type> $shape Prop types of the row fields, keyed by field key.
	 * @return $this
	 */
	public function set_item_shape( array $shape ): self {
		$this->item_type->set_shape( $shape );

		return $this;
	}

	protected function define_item_type(): Prop_Type {
		return new class() extends Object_Prop_Type {

			public static function get_key(): string {
				return 'v3-repeater-item';
			}

			protected function define_shape(): array {
				return [];
			}
		};
	}
}
