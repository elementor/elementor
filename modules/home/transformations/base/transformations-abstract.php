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

	public function __construct( $home_screen_data ) {
		$this->home_screen_data = $home_screen_data;
	}

	abstract public function transform(): array;
}
