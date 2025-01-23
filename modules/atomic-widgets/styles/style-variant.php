<?php

namespace Elementor\Modules\AtomicWidgets\Styles;

class Style_Variant implements \JsonSerializable {
	private string $breakpoint = 'desktop';
	private ?string $state = null;
	private array $props = [];

	public static function make(): self {
		return new self();
	}

	public function set_breakpoint( string $breakpoint ): self {
		$this->breakpoint = $breakpoint;
		return $this;
	}

	public function set_state( string $state ): self {
		$this->state = $state;
		return $this;
	}

	public function add_prop( string $key, $value ): self {
		$this->props[ $key ] = $value;
		return $this;
	}

	public function get(): array {
		return [
			'meta' => [
				'breakpoint' => $this->breakpoint,
				'state' => $this->state,
			],
			'props' => $this->props,
		];
	}

	public function jsonSerialize(): array {
		return $this->get();
	}
}
