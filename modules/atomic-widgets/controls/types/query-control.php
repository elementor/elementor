<?php

namespace Elementor\Modules\AtomicWidgets\Controls\Types;

use Elementor\Modules\AtomicWidgets\Base\Atomic_Control_Base;
use Elementor\Modules\AtomicWidgets\Query\Query_Builder;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}

class Query_Control extends Atomic_Control_Base {
	private bool $allow_custom_values = true;
	private int $minimum_input_length = 2;
	private ?array $query_config = null;
	private ?string $placeholder = null;

	public function get_type(): string {
		return 'query';
	}

	public function set_placeholder( string $placeholder ): self {
		$this->placeholder = $placeholder;

		return $this;
	}

	public function set_allow_custom_values( bool $allow_custom_values ): self {
		$this->allow_custom_values = $allow_custom_values;

		return $this;
	}

	public function set_query_config( $config ): self {
		$this->query_config = $config;

		return $this;
	}

	public function get_props(): array {
		return [
			'allowCustomValues' => $this->allow_custom_values,
			'placeholder' => $this->placeholder,
			'queryOptions' => Query_Builder::build( $this->query_config ),
			'minInputLength' => $this->minimum_input_length,
		];
	}
}
