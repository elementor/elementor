<?php

namespace Elementor\Modules\AtomicWidgets\Styles;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Style_File {
	private string $filename;
	private string $path;
	private string $url;


	private function __construct( string $filename, string $path, string $url ) {
		$this->filename = $filename;
		$this->path = $path;
		$this->url = $url;
	}

	public static function create( string $filename, string $path, string $url = '' ): self {
		return new self( $filename, $path, $url );
	}

	public function get_filename(): string {
		return $this->filename;
	}

	public function get_path(): string {
		return $this->path;
	}

	public function get_url(): string {
		return $this->url;
	}
}
