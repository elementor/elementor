<?php

namespace Elementor\Modules\AtomicWidgets\Services\CssPropConverter;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Conversion_Result {
	private array $props;
	private string $custom_css;
	private array $unconverted;

	public function __construct( array $props, string $custom_css, array $unconverted ) {
		$this->props = $props;
		$this->custom_css = $custom_css;
		$this->unconverted = $unconverted;
	}

	public static function make( array $props, string $custom_css, array $unconverted ): self {
		return new self( $props, $custom_css, $unconverted );
	}

	public function get_props(): array {
		return $this->props;
	}

	public function get_custom_css(): string {
		return $this->custom_css;
	}

	public function get_unconverted(): array {
		return $this->unconverted;
	}
}
