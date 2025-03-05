<?php

namespace Elementor\Tests\Phpunit\Elementor\Modules\WpRest\Isolation;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Post_Type_Mock {
	private string $name;
	private string $label;
	private \WP_Post_Type $post_type;

	public function __construct( string $name, string $label ) {
		$this->name = $name;
		$this->label = $label;

		$this->register();
	}

	private function register() {
		register_post_type( $this->name, [
			'label' => $this->label,
			'public' => true,
		] );
	}

	public function unregister() {
		unregister_post_type( $this->name );
	}
}
