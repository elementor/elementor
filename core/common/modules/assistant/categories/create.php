<?php
namespace Elementor\Core\Common\Modules\Assistant\Categories;

use Elementor\Core\Common\Modules\Assistant\Base_Category;
use Elementor\TemplateLibrary\Source_Local;
use Elementor\Utils;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}

class Create extends Base_Category {

	public function get_title() {
		return __( 'Create', 'elementor' );
	}

	public function get_category_items( array $options = [] ) {
		$elementor_supported_post_types = get_post_types_by_support( 'elementor' );

		$items = [];

		foreach ( $elementor_supported_post_types as $post_type ) {
			$post_type_object = get_post_type_object( $post_type );

			// If there is an old post type from inactive plugins
			if ( ! $post_type_object ) {
				continue;
			}

			if ( Source_Local::CPT === $post_type ) {
				$link = admin_url( 'edit.php?post_type=' . Source_Local::CPT . '#add_new' );
			} else {
				$link = Utils::get_create_new_post_url( $post_type );
			}

			$items[] = [
				'title' => $post_type_object->labels->new_item,
				'icon' => 'plus-circle',
				'link' => $link,
			];
		}

		return $items;
	}
}
