<?php
namespace Elementor\Modules\CssConverter\Convertors\Variables\Convertors;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

use Elementor\Modules\CssConverter\Convertors\Variables\VariableConvertorInterface;

abstract class Abstract_Variable_Convertor implements VariableConvertorInterface {
	public function convert( string $name, string $value ): array {
		$variable = [
			'id' => $this->generate_variable_id( $name ),
			'type' => $this->get_type(),
			'value' => $this->normalize_value( $value ),
			'source' => 'css-variable',
			'name' => $name,
		];

		return $variable;
	}

	abstract protected function get_type(): string;
	abstract protected function normalize_value( string $value ): string;

	private function generate_variable_id( string $name ): string {
		$trimmed = ltrim( $name, '-' );
		$slug = strtolower( $trimmed );
		$slug = preg_replace( '/[^a-z0-9_\-]+/', '-', $slug );
		$slug = trim( $slug, '-' );

		if ( '' === $slug ) {
			return 'e-gv-' . $this->get_type() . '-variable';
		}

		return 'e-gv-' . $this->get_type() . '-' . $slug . '-variable';
	}
}