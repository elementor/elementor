<?php

namespace Elementor\Modules\AtomicWidgets\Styles;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Dynamic_Style_Definition {
	public string $var_name;

	public array $dynamic_node;

	public array $meta;

	public function __construct( string $var_name, array $dynamic_node, array $meta = [] ) {
		$this->var_name = $var_name;
		$this->dynamic_node = $dynamic_node;
		$this->meta = $meta;
	}
}
