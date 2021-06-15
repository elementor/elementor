<?php
namespace Elementor\Core\Common\Modules\Finder\Categories;

use Elementor\Core\Common\Modules\Finder\Base_Category;
use Elementor\Plugin;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}

/**
 * Create Category
 *
 * Provides items related to creation of new posts/pages/templates etc.
 */
class Create extends Base_Category {

	/**
	 * Get title.
	 *
	 * @since 2.3.0
	 * @access public
	 *
	 * @return string
	 */
	public function get_title() {
		return __( 'Create', 'elementor' );
	}

	/**
	 * Get category items.
	 *
	 * @since 2.3.0
	 * @access public
	 *
	 * @param array $options
	 *
	 * @return array
	 */
	public function get_category_items( array $options = [] ) {
		$registered_document_types = Plugin::$instance->documents->get_document_types();
		$elementor_supported_post_types = get_post_types_by_support( 'elementor' );

		/**
		 * @var $class \Elementor\Core\Base\Document[]
		 */
		$document_types = [];

		// This loop should filter which types to proceed with.
		foreach ( $registered_document_types as $document_name => $document_type ) {
			/**
			 * @var $class \Elementor\Core\Base\Document
			 */
			$document_class = $document_type;
			$document_properties = $document_class::get_properties();
			$document_cpt = empty( $document_properties['cpt'] ) ? [] : $document_properties['cpt'];

			if ( empty( $document_cpt ) ) {
				continue;
			}

			if ( in_array( $document_name, $document_cpt, true ) ) {
				continue;
			}

			// Remove current document_cpt from '$elementor_supported_post_types' as those will be handled by another part of code below.
			foreach ( $elementor_supported_post_types as $key => $post_type ) {
				if ( $document_name === $post_type || in_array( $post_type, $document_cpt, true ) ) {
					unset( $elementor_supported_post_types[ $key ] );
				}
			}

			$document_types[ $document_name ] = $document_class;
		}

		$items = [];

		// To support old mechanism.
		foreach ( $elementor_supported_post_types as $post_type ) {
			$post_type_object = get_post_type_object( $post_type );

			// If there is an old post type from inactive plugins
			if ( ! $post_type_object ) {
				continue;
			}

			$url = Plugin::$instance->documents->get_create_new_post_url( $post_type );

			$items[ $post_type ] = $this->get_create_new_template( $post_type_object, $url );
		}

		foreach ( $document_types as $document_name => $document_class ) {
			$post_type_object = get_post_type_object( $document_class::get_properties()['cpt'][0] );

			if ( ! $post_type_object ) {
				continue;
			}

			// Support BC.
			if ( 'code_snippet' === $document_name ) {
				continue;
			}

			$items[ $document_name ] = $this->get_create_new_template(
				$post_type_object,
				$document_class::get_create_url()
			);
		}

		return $items;
	}

	private function get_create_new_template( $post_type_object, $url ) {
		return [
			/* translators: %s the title of the post type */
			'title' => sprintf( __( 'Add New %s', 'elementor' ), $post_type_object->labels->singular_name ),
			'icon' => 'plus-circle-o',
			'url' => $url,
			'keywords' => [ 'post', 'page', 'template', 'new', 'create' ],
		];
	}
}
