<?php

namespace Elementor\Tests\Phpunit\Elementor\Modules\WpRest\Isolation;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Post_Mock {
	public string $post_title;
	public string $ID;
	public string $description;
	public string $guid;
	public string $status;
	public string $post_type;

	public function __construct( string $post_title, string $ID, string $description, string $guid, string $status, string $post_type ) {
		$this->post_title = $post_title;
		$this->ID = $ID;
		$this->description = $description;
		$this->guid = $guid;
		$this->status = $status;
		$this->post_type = $post_type;
	}
}
