<?php

namespace Elementor\Tests\Phpunit\Elementor\Modules\WpRest\Isolation;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Post_Type_Mock {
	public string $name;
	public string $label;

	public function __construct( string $name, string $label ) {
		$this->name = $name;
		$this->label = $label;
	}
}
