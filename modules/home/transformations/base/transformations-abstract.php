<?php
namespace Elementor\Modules\Home\Transformations\Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}

abstract class Transformations_Abstract {
	/**
	 * @var array
	 */
	protected $home_screen_data;

	protected $wordpress_adapter;

	public function __construct( $home_screen_data, $wordpress_adapter ) {
		$this->home_screen_data = $home_screen_data;
		$this->wordpress_adapter = $wordpress_adapter;
	}

	abstract public function transform(): array;
}
