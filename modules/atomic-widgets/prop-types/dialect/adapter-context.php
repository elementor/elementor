<?php

namespace Elementor\Modules\AtomicWidgets\PropTypes\Dialect;

use Elementor\Modules\AtomicWidgets\PropTypes\Contracts\Prop_Type;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Adapter_Context {
	/**
	 * @var Prop_Type
	 */
	public $prop_type;

	/**
	 * @var array
	 */
	public $children;

	/**
	 * @var Prop_Type|null
	 */
	public $parent_prop_type;

	/**
	 * @var string|null
	 */
	public $shape_key;

	/**
	 * @var string
	 */
	public $dialect;

	public function __construct( Prop_Type $prop_type, array $children, ?Prop_Type $parent_prop_type = null, ?string $shape_key = null, string $dialect = '' ) {
		$this->prop_type = $prop_type;
		$this->children = $children;
		$this->parent_prop_type = $parent_prop_type;
		$this->shape_key = $shape_key;
		$this->dialect = $dialect;
	}
}
