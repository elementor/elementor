<?php

namespace Elementor\Modules\AtomicWidgets\Styles;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Style_Cache_Bundle {
	private string $css;

	/**
	 * @var array<string, string> extension => file contents
	 */
	private array $sidecars;

	/**
	 * @param array<string, string> $sidecars
	 */
	public function __construct( string $css, array $sidecars = [] ) {
		$this->css = $css;
		$this->sidecars = $sidecars;
	}

	/**
	 * @param array<string, string> $sidecars
	 */
	public static function create( string $css, array $sidecars = [] ): self {
		return new self( $css, $sidecars );
	}

	public function get_css(): string {
		return $this->css;
	}

	/**
	 * @return array<string, string>
	 */
	public function get_sidecars(): array {
		return $this->sidecars;
	}
}
