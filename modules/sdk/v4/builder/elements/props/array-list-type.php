<?php

namespace Elementor\Modules\Sdk\V4\Builder\Elements\Props;

use Elementor\Modules\AtomicWidgets\PropTypes\Base\Array_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Contracts\Prop_Type;

class Array_List_Type extends Array_Prop_Type {

	protected $generic_prop_type;

	public static function make_generic( Prop_Type $prop_type ) {
		return new self( $prop_type );
	}

	public function __construct( Prop_Type $prop_type ) {
		$this->generic_prop_type = $prop_type;
		parent::__construct();
	}

	public static function get_key(): string {
		return 'array';
	}

	public function define_item_type(): Prop_Type {
		return $this->generic_prop_type;
	}
}
