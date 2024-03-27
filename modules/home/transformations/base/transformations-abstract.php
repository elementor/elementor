<?php
namespace Elementor\Modules\Home\Transformations\Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}

abstract class Transformations_Abstract {

	protected $wordpress_adapter;

	public function __construct( $args ) {
		$this->wordpress_adapter = $args['wordpress_adapter'] ?? null;
	}

	abstract public function transform( array $home_screen_data ): array;
}
