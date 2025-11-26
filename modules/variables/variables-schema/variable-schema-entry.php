<?php

namespace Elementor\Modules\Variables\Variables_Schema;

use Elementor\Modules\AtomicWidgets\PropTypes\Contracts\Prop_Type;

class Variable_Schema_Entry {
	public Prop_Type $schema;

	public string $value_prop_type;

	public $normalizer = null;

	public function __construct( Prop_Type $schema, string $value_prop_type ) {
		$this->schema = $schema;
		$this->value_prop_type = $value_prop_type;
	}

	public static function make( Prop_Type $schema, string $value_prop_type ): self {
		return new self( $schema, $value_prop_type);
	}

	public function normalize_value( callable $callback ): self {
		$this->normalizer = $callback;

		return $this;
	}
}
