<?php
namespace Elementor\Modules\Promotions\Controls;

use Elementor\Modules\AtomicWidgets\Controls\Base\Atomic_Control_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Display_Conditions_Promotion_Control extends Atomic_Control_Base {
	private const TYPE = 'display-conditions';

	public function get_type(): string {
		return self::TYPE;
	}

	public function get_props(): array {
		return [];
	}
}
