<?php
namespace Elementor\Modules\Home\Transformations\Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}

interface Transformations_Base {

	public function __construct( array $home_screen_data );

	public function transform(): array;
}
