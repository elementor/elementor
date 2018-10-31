<?php
namespace Elementor\Core\Common\Modules\Assistant\Categories;

use Elementor\Core\Common\Modules\Assistant\Base_Category;
use Elementor\TemplateLibrary\Source_Local;

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

			if ( Source_Local::CPT === $post_type ) {
				$link = admin_url( 'edit.php?post_type=' . Source_Local::CPT . '#add_new' );
			} else {
				$link = admin_url( 'post-new.php?post_type=' . $post_type );
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
