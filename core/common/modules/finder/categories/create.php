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
		foreach ( $registered_document_types as $document_name => $document_class ) {
			/**
			 * @var $class \Elementor\Core\Base\Document
			 */
			$document_properties = $document_class::get_properties();

			if ( empty( $document_properties['show_in_finder'] ) ) {
				continue;
			}

			// Reduce from $elementor_supported_post_types by avoid them to be proceed with old mechanism.
			$filter_supported_post_types = function ( $post_type ) use ( $document_name, $document_properties ) {
				if ( empty( $document_properties['cpt'] ) ) {
					return false;
				}

				$document_cpt = $document_properties['cpt'];

				// To Support backward compatibility remove 'post', and 'page'.
				if ( $post_type === $document_name ) {
					return false;
				} elseif ( ! empty( $document_cpt ) && $post_type === $document_cpt[0] ) { // To remove 'e-landing-page'.
					return false;
				}

				return true;
			};

			// To Support backward compatibility avoid those.
			if ( 'post' === $document_name || 'page' === $document_name ) {
				continue;
			}

			$elementor_supported_post_types = array_filter( $elementor_supported_post_types, $filter_supported_post_types );

			$document_types[ $document_name ] = $document_class;
		}

		$items = [];

		// Old mechanism. ( Currently handles 'elementor-library' ).
		foreach ( $elementor_supported_post_types as $post_type ) {
			$url = $this->create_item_url_by_post_type( $post_type );

			if ( ! $url ) {
				continue;
			}

			$items[ $post_type ] = $url;
		}

		// New Mechanism. ( Currently handles 'wp-post', 'wp-page', 'landing-page'. )
		foreach ( $document_types as $document_name => $document_class ) {
			$url = $this->create_item_url_by_document_class( $document_class );

			if ( ! $url ) {
				continue;
			}

			$items[ $document_name ] = $url;
		}

		return $items;
	}

	private function create_item_url_by_post_type( $post_type ) {
		$post_type_object = get_post_type_object( $post_type );

		// If there is an old post type from inactive plugins
		if ( ! $post_type_object ) {
			return false;
		}

		return Plugin::$instance->documents->get_create_new_post_url( $post_type_object->labels->singular_name );
	}

	private function create_item_url_by_document_class( $document_class ) {
		// TODO: Remove - BC, Avoid conflict with ThemeBuilder.
		if ( 'post' === $document_class::get_type() ) {
			return false;
		}

		return $this->get_create_new_template(
			$document_class::get_title(),
			$document_class::get_create_url()
		);
	}

	private function get_create_new_template( $title, $url ) {
		return [
			/* translators: %s the title of the post type */
			'title' => sprintf( __( 'Add New %s', 'elementor' ), $title ),
			'icon' => 'plus-circle-o',
			'url' => $url,
			'keywords' => [ 'post', 'page', 'template', 'new', 'create' ],
		];
	}
}
