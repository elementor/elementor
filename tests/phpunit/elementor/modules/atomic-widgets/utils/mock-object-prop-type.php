<?php

namespace Elementor\Tests\Phpunit\Elementor\Modules\AtomicWidgets\Utils;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Mock_Object_Prop_Type extends Mock_Prop_Type {
	private $shape;

	public function __construct( array $shape ) {
		$this->shape = $shape;
	}

	public function get_shape(): array {
		return $this->shape;
	}

	public static function get_key(): string {
		return 'object';
	}

	public function get_type(): string {
		return 'object';
	}
}
