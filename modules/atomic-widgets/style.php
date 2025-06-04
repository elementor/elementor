<?php

namespace Elementor\Modules\AtomicWidgets;

use Elementor\Core\Files\CSS\Post;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Style {
	private string $handle;

	private string $name;

	private string $content = '';

	public function __construct( string $handle, string $name ) {
		$this->handle = $handle;
		$this->name = $name;
	}

	public function append( string $content ) {
		$this->content .= $content;
	}

	public function get_handle(): string {
		return $this->handle;
	}

	public function get_name(): string {
		return $this->name;
	}

	public function get_content(): string {
		return $this->content;
	}

	public function get_path() {
		$base_path = preg_replace(
			'/\/[^\/]+$/',
			'',
			( new Post( 0 ) )->get_path()
		);

		return $base_path . '/' . $this->name . '.css';
	}

	public function get_src() {
		$base_url = preg_replace(
			'/\/[^\/]+$/',
			'',
			( new Post( 0 ) )->get_url()
		);

		return $base_url . '/' . $this->name . '.css';
	}
}
