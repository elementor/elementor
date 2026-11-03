<?php

namespace Elementor\Modules\Mcp\Abilities\Appliers\V3\Maps\Settings;

use Elementor\Modules\AtomicWidgets\PropTypes\Primitives\String_Prop_Type;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * String with a JSON Schema `pattern` and `maxLength` that are both published and enforced, so the
 * schema an agent reads is the rule the value is checked against. V4 string schemas are unchanged.
 */
class V3_String_Prop_Type extends String_Prop_Type {

	private ?string $pattern = null;

	private ?int $max_length = null;

	public function pattern( string $pattern ): self {
		$this->pattern = $pattern;

		return $this;
	}

	public function max_length( int $max_length ): self {
		$this->max_length = $max_length;

		return $this;
	}

	protected function validate_value( $value ): bool {
		return parent::validate_value( $value )
			&& ( null === $this->pattern || rest_validate_json_schema_pattern( $this->pattern, $value ) )
			&& ( null === $this->max_length || mb_strlen( $value ) <= $this->max_length );
	}

	public function to_json_schema(): array {
		$schema = parent::to_json_schema();

		if ( null !== $this->pattern ) {
			$schema['properties']['value']['pattern'] = $this->pattern;
		}

		if ( null !== $this->max_length ) {
			$schema['properties']['value']['maxLength'] = $this->max_length;
		}

		return $schema;
	}
}
