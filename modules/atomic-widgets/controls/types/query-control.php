<?php
namespace Elementor\Modules\AtomicWidgets\Controls\Types;

use Elementor\Modules\AtomicWidgets\Base\Atomic_Control_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}

class Query_Control extends Atomic_Control_Base {
	private ?string $placeholder = null;
	private ?bool $allow_custom_values = null;
	private ?string $ajax_url = null;
	private ?array $ajax_params = null;

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
			'ajaxUrl' => $this->ajax_url,
			'ajaxParams' => $this->ajax_params,
		];
	}

	public function set_allow_custom_values( bool $allow_custom_values ): self {
		$this->allow_custom_values = $allow_custom_values;

		return $this;
	}

	public function set_ajax_url( string $url ): self {
		$this->ajax_url = $url;

		return $this;
	}

	public function set_ajax_params( array $params ): self {
		$this->ajax_params = $params;

		return $this;
	}
}
