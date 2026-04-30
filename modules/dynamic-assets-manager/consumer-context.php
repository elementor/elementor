<?php

namespace Elementor\Modules\DynamicAssetsManager;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

final class Consumer_Context {

	public const SURFACE_EDITOR_CANVAS = 'editor_canvas';

	public const SURFACE_EDITOR_SHELL = 'editor_shell';

	private string $surface;

	private int $post_id;

	public function __construct( string $surface, int $post_id ) {
		$this->surface = $surface;
		$this->post_id = $post_id;
	}

	public static function editor_canvas( int $post_id ): self {
		return new self( self::SURFACE_EDITOR_CANVAS, $post_id );
	}

	public static function editor_shell( int $post_id ): self {
		return new self( self::SURFACE_EDITOR_SHELL, $post_id );
	}

	public function get_surface(): string {
		return $this->surface;
	}

	public function get_post_id(): int {
		return $this->post_id;
	}
}
