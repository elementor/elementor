<?php

namespace Elementor\Core\Common\Modules\Assistant;

use Elementor\Core\Base\Module as BaseModule;
use Elementor\Core\Common\Modules\Ajax\Module as Ajax;
use Elementor\Plugin;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}

class Module extends BaseModule {

	/**
	 * @var Categories_Manager
	 */
	private $categories_manager;

	public function __construct() {
		$this->categories_manager = new Categories_Manager();

		$this->add_template();

		add_action( 'elementor/ajax/register_actions', [ $this, 'register_ajax_actions' ] );
	}

	public function get_name() {
		return 'assistant';
	}

	public function add_template() {
		Plugin::$instance->common->add_template( __DIR__ . '/template.php' );
	}

	public function register_ajax_actions( Ajax $ajax ) {
		$ajax->register_ajax_action( 'assistant_get_category_data', [ $this, 'ajax_get_category_data' ] );
	}

	public function ajax_get_category_data( array $data ) {
		$category = $this->categories_manager->get_categories( $data['category'] );

		return $category->get_category_items( $data );
	}

	protected function get_init_settings() {
		$categories = $this->categories_manager->get_categories();

		$categories_data = [];

		foreach ( $categories as $category_name => $category ) {
			$categories_data[ $category_name ] = array_merge( $category->get_settings(), [ 'name' => $category_name ] );
		}

		$categories_data = apply_filters( 'elementor/assistant/categories', $categories_data );

		return [
			'data' => $categories_data,
			'i18n' => [
				'finder' => __( 'Finder', 'elementor' ),
			],
		];
	}
}
