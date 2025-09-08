<?php

namespace Elementor\Modules\AtomicWidgets\Query;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

trait Has_Query_Props {
	protected bool $allow_custom_values = true;
	protected int $minimum_input_length = 2;
	protected ?array $post_types = null;
	protected ?string $endpoint = null;
	protected ?string $namespace = null;

	public function set_endpoint( string $endpoint ): self {
		$this->endpoint = $endpoint;

		return $this;
	}

	public function set_namespace( string $namespace ): self {
		$this->namespace = $namespace;

		return $this;
	}

	public function set_post_types( ?array $post_types ): self {
		$this->post_types = $post_types;

		return $this;
	}

	public function set_minimum_input_length( int $input_length ): self {
		$this->minimum_input_length = $input_length;

		return $this;
	}

	public function set_allow_custom_values( bool $allow_custom_values ): self {
		$this->allow_custom_values = $allow_custom_values;

		return $this;
	}
}
