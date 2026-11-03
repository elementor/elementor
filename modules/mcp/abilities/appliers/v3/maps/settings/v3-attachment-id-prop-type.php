<?php

namespace Elementor\Modules\Mcp\Abilities\Appliers\V3\Maps\Settings;

use Elementor\Modules\AtomicWidgets\PropTypes\Primitives\Number_Prop_Type;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Media Library attachment id: a positive whole number.
 */
class V3_Attachment_Id_Prop_Type extends Number_Prop_Type {

	const MINIMUM = 1;

	public static function get_key(): string {
		return 'v3-attachment-id';
	}

	protected function validate_value( $value ): bool {
		return parent::validate_value( $value ) && floor( (float) $value ) === (float) $value && $value >= self::MINIMUM;
	}

	public function to_json_schema(): array {
		$schema = parent::to_json_schema();
		$schema['properties']['value']['type'] = 'integer';
		$schema['properties']['value']['minimum'] = self::MINIMUM;

		return $schema;
	}
}
