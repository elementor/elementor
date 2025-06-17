<?php

namespace Elementor\Modules\AtomicWidgets\Styles;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Style_File {
	private string $handle;
	private string $path;
	private string $url;

	private function __construct( string $handle, string $path, string $url ) {
		$this->handle = $handle;
		$this->path = $path;
		$this->url = $url;
	}

	public static function create( string $handle, string $path, string $url = '' ): self {
		return new self( $handle, $path, $url );
	}

	public function get_handle(): string {
		return $this->handle;
	}

	public function get_path(): string {
		return $this->path;
	}

	public function get_url(): string {
		return $this->url;
	}
}
