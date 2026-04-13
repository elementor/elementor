<?php

namespace Elementor\Modules\AtomicWidgets\Styles;

class Style_Variant {
	private ?string $breakpoint = null;
	private ?string $state = null;

	/** @var array<string, array> */
	private array $props = [];

	private ?string $css = null;

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

	public function add_props( array $props ): self {
		$this->props = array_merge( $this->props, $props );
		return $this;
	}

	public function set_css( string $css ): self {
		$this->css = $css;
		return $this;
	}

	public function build(): array {
		return [
			'meta' => [
				'breakpoint' => $this->breakpoint,
				'state' => $this->state,
			],
			'props' => $this->props,
		];
	}

	public function build_css(): array {
		return [
			'meta' => [
				'breakpoint' => $this->breakpoint,
				'state'      => $this->state,
			],
			'css' => $this->css ?? '',
		];
	}
}
