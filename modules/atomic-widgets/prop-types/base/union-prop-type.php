<?php

namespace Elementor\Modules\AtomicWidgets\PropTypes;

use Elementor\Modules\AtomicWidgets\PropTypes\Base\Prop_Type;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

abstract class Union_Prop_Type extends Prop_Type {
	public static function get_type(): string {
		return 'union';
	}

	public function __construct() {
		foreach ( $this->init_sub_types() as $type ) {
			$this->sub_type( $type );
		}
	}

	public function get_relevant_prop_types(): array {
		return $this->get_sub_types();
	}

	public function generate_value( $value, ?string $type = null ) {
		$sub_type = $this->get_sub_type( $type );

		if ( ! $sub_type ) {
			return null;
		}

		return [
			'$$type' => $sub_type::get_key(),
			'value' => $value,
		];
	}

	public function default( $value, $type = null ): self {
		$this->default = $this->generate_value( $value, $type );

		return $this;
	}

	protected function validate_value( $value ): bool {
		return false;
	}

	abstract protected function init_sub_types(): array;
}
