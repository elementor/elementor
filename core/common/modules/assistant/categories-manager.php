<?php

namespace Elementor\Core\Common\Modules\Assistant;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}

class Categories_Manager {

	/**
	 * @var Base_Category[]
	 */
	private $categories;

	private $categories_list = [
		'edit',
		'general',
		'create',
		'site',
		'settings',
		'tools',
	];

	/**
	 * @param string $category
	 *
	 * @return Base_Category|Base_Category[]|null
	 */
	public function get_categories( $category = '' ) {
		if ( ! $this->categories ) {
			$this->init_categories();
		}

		if ( $category ) {
			if ( isset( $this->categories[ $category ] ) ) {
				return $this->categories[ $category ];
			}

			return null;
		}

		return $this->categories;
	}

	private function init_categories() {
		foreach ( $this->categories_list as $category_name ) {
			$class_name = __NAMESPACE__ . '\Categories\\' . $category_name;

			$this->categories[ $category_name ] = new $class_name();
		}
	}
}
