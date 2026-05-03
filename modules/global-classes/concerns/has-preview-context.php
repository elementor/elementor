<?php

namespace Elementor\Modules\GlobalClasses\Concerns;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

trait Has_Preview_Context {
	private bool $is_preview = false;

	public function set_preview( bool $is_preview = true ): self {
		if ( $is_preview === $this->is_preview ) {
			return $this;
		}

		$this->is_preview = $is_preview;
		$this->on_preview_change();

		return $this;
	}

	protected function is_preview(): bool {
		return $this->is_preview;
	}

	protected function get_context_key( string $key ): string {
		$map = $this->get_context_keys()[ $key ] ?? null;

		if ( null === $map ) {
			throw new \InvalidArgumentException( sprintf( 'Unknown context key: %s', $key ) );
		}

		return $this->is_preview ? $map['preview'] : $map['frontend'];
	}

	protected function get_context_keys(): array {
		if ( empty( $this->context_keys ) ) {
			return [];
		}

		return $this->context_keys;
	}

	protected function on_preview_change(): void {
	}
}
