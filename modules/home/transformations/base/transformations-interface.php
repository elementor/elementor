<?php
namespace Elementor\Modules\Home\Transformations\Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}

interface Transformations_Interface {

	public function __construct( array $home_screen_data, array $wordpress_adapter );

	public function transform(): array;
}
