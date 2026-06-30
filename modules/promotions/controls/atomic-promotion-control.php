<?php
namespace Elementor\Modules\Promotions\Controls;

use Elementor\Modules\AtomicWidgets\Controls\Base\Atomic_Control_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Atomic_Promotion_Control extends Atomic_Control_Base {

	public static function make( string $type ): self {
		return new self( $type );
	}

	public function get_type(): string {
		return $this->get_bind();
	}

	public function get_props(): array {
		return [];
	}
}
