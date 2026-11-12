<?php

namespace Elementor\Modules\CompositeWidgets\Definitions\Validation;

use Elementor\Core\Utils\Api\Parse_Result;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Widget_Definition_Validator {
	private Shape_Rules $shape_rules;
	private Template_Rules $template_rules;
	private Fields_Rules $fields_rules;
	private Style_Preset_Rules $style_preset_rules;

	public static function make(): self {
		$variable_references = new Variable_References();
		$style_props_rules = new Style_Props_Rules();

		return new self(
			new Shape_Rules(),
			new Template_Rules( $variable_references, new Local_Style_Rules( $style_props_rules ) ),
			new Fields_Rules(),
			new Style_Preset_Rules( $variable_references, $style_props_rules )
		);
	}

	public function __construct(
		Shape_Rules $shape_rules,
		Template_Rules $template_rules,
		Fields_Rules $fields_rules,
		Style_Preset_Rules $style_preset_rules
	) {
		$this->shape_rules = $shape_rules;
		$this->template_rules = $template_rules;
		$this->fields_rules = $fields_rules;
		$this->style_preset_rules = $style_preset_rules;
	}

	public function validate( array $definition ): Parse_Result {
		$result = Parse_Result::make()->wrap( $definition );
		$errors = $result->errors();

		$this->shape_rules->validate( $definition, $errors );

		if ( ! $errors->is_empty() ) {
			return $result;
		}

		$parts = $this->template_rules->validate( $definition, $errors );

		$this->fields_rules->validate( $definition, $parts, $errors );
		$this->style_preset_rules->validate( $definition, $parts, $errors );

		return $result;
	}
}
