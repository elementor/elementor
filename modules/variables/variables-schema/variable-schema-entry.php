<?php

namespace Elementor\Modules\Variables\Variables_Schema;

use Elementor\Modules\AtomicWidgets\PropTypes\Contracts\Prop_Type;

class Variable_Schema_Entry {
	public static $prop_type;

//	public string $value_prop_type;

	public static $normalizer = null;

	public function __construct( string $prop_type ) {
		$this->schema = $schema;
		$this->value_prop_type = $value_prop_type;
	}

	public static function make( string $prop_type, callable $callback ) {
		self::$prop_type = $prop_type;
		self::$normalizer = $callback;
	}
}
