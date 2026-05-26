<?php

namespace Elementor\Modules\Mcp\Abilities\Post;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

abstract class Post_Operation {

	abstract public function handle( array $input );
}
