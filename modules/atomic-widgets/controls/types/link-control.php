<?php

namespace Elementor\Modules\AtomicWidgets\Controls\Types;

use Elementor\Modules\AtomicWidgets\Base\Atomic_Control_Base;
use Elementor\Modules\AtomicWidgets\Controls\Traits\Http;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}

class Link_Control extends Atomic_Control_Base {
	use Http;

	private ?string $placeholder = null;

	public function __construct( ...$args ) {
		parent::__construct( ...$args );
		$this->set_placeholder( __( 'Type or paste your URL', 'elementor' ) );
	}

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
			'queryOptions' => $this->get_query_options(),
			'minInputLength' => $this->minimum_input_length,
		];
	}
}
