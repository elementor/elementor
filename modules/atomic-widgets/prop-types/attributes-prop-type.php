<?php
namespace Elementor\Modules\AtomicWidgets\PropTypes;

use Elementor\Modules\AtomicWidgets\PropTypes\Base\Array_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Contracts\Prop_Type;
use Elementor\Modules\AtomicWidgets\Utils\Custom_Attributes_Trust;
use Elementor\Utils;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Attributes_Prop_Type extends Array_Prop_Type {
	public static function get_key(): string {
		return 'attributes';
	}

	protected function define_item_type(): Prop_Type {
		return Key_Value_Prop_Type::make();
	}

	public function sanitize_value( $value ) {
		$sanitized = [];
		$allow_unfiltered_names = Custom_Attributes_Trust::can_current_user_save_unfiltered();

		foreach ( parent::sanitize_value( $value ) as $item ) {
			$key = $item['value']['key']['value'] ?? null;

			if ( ! Utils::is_allowed_custom_attribute_name( $key, $allow_unfiltered_names ) ) {
				continue;
			}

			$sanitized[] = $this->sanitize_item_value( $item, $key );
		}

		return $sanitized;
	}

	private function sanitize_item_value( array $item, string $key ): array {
		$attribute_value = $item['value']['value']['value'] ?? null;

		if ( ! is_string( $attribute_value ) ) {
			return $item;
		}

		$decoded_value = html_entity_decode( $attribute_value, ENT_QUOTES | ENT_HTML5, 'UTF-8' );
		$item['value']['value']['value'] = esc_attr( Utils::sanitize_custom_attribute_value( $key, $decoded_value ) );

		return $item;
	}
}
