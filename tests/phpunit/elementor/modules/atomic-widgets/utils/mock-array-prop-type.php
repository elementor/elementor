<?php

namespace Elementor\Tests\Phpunit\Elementor\Modules\AtomicWidgets\Utils;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

use Elementor\Modules\AtomicWidgets\PropTypes\Contracts\Prop_Type;

class Mock_Array_Prop_Type extends Mock_Prop_Type {
	private $item_type;

	public function __construct( Prop_Type $item_type) {
		$this->item_type = $item_type;
	}

	public static function make( ?Prop_Type $item_type = null ) {
		return new static( $item_type );
	}

	public function get_item_type(): Prop_Type {
		return $this->item_type;
	}

	public static function get_key(): string {
		return 'array';
	}

	public function get_type(): string {
		return 'array';
	}
}
