<?php
namespace Elementor\Modules\AtomicWidgets\Controls\Types;

use Elementor\Modules\AtomicWidgets\Controls\Base\Atomic_Control_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Query_Chips_Control extends Atomic_Control_Base {
	private ?array $query_options = null;
	private ?string $placeholder = null;
	private ?int $min_input_length = null;

	public function get_type(): string {
		return 'query-chips';
	}

	public function set_query_options( array $query_options ): self {
		$this->query_options = $query_options;

		return $this;
	}

	public function set_placeholder( string $placeholder ): self {
		$this->placeholder = $placeholder;

		return $this;
	}

	public function set_min_input_length( int $min_input_length ): self {
		$this->min_input_length = $min_input_length;

		return $this;
	}

	public function get_props(): array {
		return [
			'queryOptions' => $this->query_options,
			'placeholder' => $this->placeholder,
			'minInputLength' => $this->min_input_length,
		];
	}
}
