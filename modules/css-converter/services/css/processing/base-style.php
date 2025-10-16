<?php
namespace Elementor\Modules\CssConverter\Services\Css\Processing;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

abstract class Base_Style implements Style_Interface {
	protected $property;
	protected $value;
	protected $specificity;
	protected $order;
	protected $converted_property;
	protected $important;

	public function __construct( array $data ) {
		$this->property = $data['property'];
		$this->value = $data['value'];
		$this->specificity = $data['specificity'];
		$this->order = $data['order'];
		$this->converted_property = $data['converted_property'] ?? null;
		$this->important = $data['important'] ?? false;
	}

	public function get_property(): string {
		return $this->property;
	}

	public function get_value(): string {
		return $this->value;
	}

	public function get_specificity(): int {
		return $this->specificity;
	}

	public function get_order(): int {
		return $this->order;
	}

	public function get_converted_property(): ?array {
		return $this->converted_property;
	}

	public function is_important(): bool {
		return $this->important;
	}

	abstract public function matches( array $widget ): bool;
	abstract public function get_source(): string;
}



