<?php
namespace Elementor\Modules\AtomicWidgets\Controls\Types;

use Elementor\Modules\AtomicWidgets\Base\Atomic_Control_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Repeatable_Control extends Atomic_Control_Base {

	private string $controlType;

	public function get_type(): string {
		return 'repeatable';
	}

	public function set_control_Type( $controlType ): self {
		$this->controlType = $controlType;

		return $this;
	}

	public function get_props(): array {
		return [
			'controlType' => $this->controlType,
		];
	}
}
