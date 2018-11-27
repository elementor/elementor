<?php

namespace Elementor\Core\Common\Modules\Finder;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}

class Categories_Manager {

	/**
	 * @access private
	 *
	 * @var Base_Category[]
	 */
	private $categories;

	/**
	 * @var array
	 */
	private $categories_list = [
		'edit',
		'general',
		'create',
		'site',
		'settings',
		'tools',
	];

	/**
	 * Add category.
	 *
	 * @param string        $category_name
	 * @param Base_Category $category
	 */
	public function add_category( $category_name, Base_Category $category ) {
		$this->categories[ $category_name ] = $category;
	}

	/**
	 * Get categories.
	 *
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

	/**
	 * Init categories.
	 *
	 * Used to initialize finder default categories.
	 */
	private function init_categories() {
		foreach ( $this->categories_list as $category_name ) {
			$class_name = __NAMESPACE__ . '\Categories\\' . $category_name;

			$this->add_category( $category_name, new $class_name() );
		}

		/**
		 * Elementor Finder categories init.
		 *
		 * Fires after Elementor Finder initialize it's native categories.
		 *
		 * This hook should be used to add your own Finder categories.
		 *
		 * @since 2.3.0
		 *
		 * @param Categories_Manager $this.
		 */
		do_action( 'elementor/finder/categories/init', $this );
	}
}
