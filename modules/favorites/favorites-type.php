<?php
namespace Elementor\Modules\Favorites;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

use Elementor\Core\Utils\Collection;
use Elementor\Core\Utils\Static_Collection;

abstract class Favorites_Type extends Static_Collection {

	/**
	 * Get the name of the type.
	 *
	 * @return mixed
	 */
	abstract public function get_name();

	/**
	 * Prepare favorites before taking any action.
	 *
	 * @param array $favorites
	 *
	 * @return array
	 */
	public function prepare( $favorites ) {
		if ( ! is_array( $favorites ) && ! $favorites instanceof Collection ) {
			return [ $favorites ];
		}

		return $favorites;
	}
}
