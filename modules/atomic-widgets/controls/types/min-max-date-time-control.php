<?php
namespace Elementor\Modules\AtomicWidgets\Controls\Types;

use Elementor\Modules\AtomicWidgets\Controls\Base\Atomic_Control_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Min_Max_Date_Time_Control extends Atomic_Control_Base {
	private string $variant = 'date';

	public function get_type(): string {
		return 'min-max-date-time';
	}

	/** @var 'date'|'time' $variant Specifies the control type: either 'date' or 'time'. values other than 'date' or 'time' will be converted to 'date'. */
	public function set_variant( string $variant ): self {
		$this->variant = 'time' === $variant ? 'time' : 'date';

		return $this;
	}

	public function get_props(): array {
		return [
			'variant' => $this->variant,
		];
	}
}
