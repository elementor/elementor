<?php

namespace Elementor\Modules\AtomicWidgets\PropsResolver;

use Elementor\Modules\AtomicWidgets\PropTypes\Contracts\Transformable_Prop_Type;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Props_Resolver_Context {
	private ?string $key = null;

	private ?Transformable_Prop_Type $prop_type;

	private bool $disabled = false;

	private ?Shared_Props_Context $shared_context = null;

	public static function make(): self {
		return new static();
	}

	public function set_key( ?string $key ): self {
		$this->key = $key;

		return $this;
	}

	public function set_disabled( bool $disabled ): self {
		$this->disabled = $disabled;

		return $this;
	}

	public function set_prop_type( Transformable_Prop_Type $prop_type ): self {
		$this->prop_type = $prop_type;

		return $this;
	}

	public function set_shared_context( Shared_Props_Context $shared_context ): self {
		$this->shared_context = $shared_context;

		return $this;
	}

	public function get_key(): ?string {
		return $this->key;
	}

	public function is_disabled(): bool {
		return $this->disabled;
	}

	public function get_prop_type(): ?Transformable_Prop_Type {
		return $this->prop_type;
	}

	public function get_shared_context(): ?Shared_Props_Context {
		return $this->shared_context;
	}
}
