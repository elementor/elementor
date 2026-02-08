<?php

namespace Elementor\Modules\AtomicWidgets\PropsResolver;

use Elementor\Modules\AtomicWidgets\PropTypes\Contracts\Transformable_Prop_Type;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Props_Resolver_Context {
	private ?string $element_id = null;

	private bool $disabled = false;

	private ?string $key = null;

	private ?Transformable_Prop_Type $prop_type;

	public static function make(): self {
		return new static();
	}

	public function get_element_id(): ?string {
		return $this->element_id;
	}

	public function get_key(): ?string {
		return $this->key;
	}

	public function get_prop_type(): ?Transformable_Prop_Type {
		return $this->prop_type;
	}

	public function is_disabled(): bool {
		return $this->disabled;
	}

	public function set_disabled( bool $disabled ): self {
		$this->disabled = $disabled;

		return $this;
	}

	public function set_element_id( ?string $element_id ): self {
		$this->element_id = $element_id;

		return $this;
	}

	public function set_key( ?string $key ): self {
		$this->key = $key;

		return $this;
	}

	public function set_prop_type( Transformable_Prop_Type $prop_type ): self {
		$this->prop_type = $prop_type;

		return $this;
	}
}
