<?php

namespace Elementor\Modules\AtomicWidgets\Controls\Types;

use Elementor\Modules\AtomicWidgets\Base\Atomic_Control_Base;
use Elementor\Modules\AtomicWidgets\Query\Has_Query_Props;
use Elementor\Modules\AtomicWidgets\Query\Query_Builder;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}

class Link_Control extends Atomic_Control_Base {
	use Has_Query_Props;

	private ?string $placeholder = null;

	public function get_type(): string {
		return 'link';
	}

	public function set_placeholder( string $placeholder ): self {
		$this->placeholder = $placeholder;

		return $this;
	}

	public function get_props(): array {
		return [
			'placeholder' => $this->placeholder,
			'allowCustomValues' => $this->allow_custom_values,
			'queryOptions' => Query_Builder::build( $this->post_types, $this->namespace, $this->endpoint ),
			'minInputLength' => $this->minimum_input_length,
		];
	}
}
