<?php

namespace Elementor\Modules\AtomicWidgets;

use Elementor\Core\Files\CSS\Post;
use Elementor\Core\Utils\Collection;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Style {
	private string $handle;

	private string $name;

	private array $fonts;

	private string $content = '';

	public function __construct( string $handle, string $name, array $fonts ) {
		$this->handle = $handle;
		$this->name = $name;
		$this->fonts = $fonts;
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

	public function get_fonts(): Collection {
		return Collection::make( $this->fonts );
	}
}
