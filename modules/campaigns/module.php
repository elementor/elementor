<?php
namespace Elementor\Modules\Campaigns;

use Elementor\Core\Base\Module as BaseModule;
use Elementor\Modules\LandingPages\Module as Landing_Page_Module;
use Elementor\Plugin;
use Elementor\TemplateLibrary\Source_Local;
use Elementor\Utils;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

/**
 * Campaigns Module
 *
 * 'e-campaigns' is a custom taxonomy that is associated with Popups, Landing Pages, and Form Submissions.
 */
class Module extends BaseModule {

	const TAXONOMY_NAME = 'e-campaigns';

	public function get_name() {
		return 'campaigns';
	}

	private function register_campaigns_taxonomy() {
		$taxonomy_labels = [
			'name' => _x( 'Campaigns', 'Campaigns taxonomy general name', 'elementor' ),
			'singular_name' => _x( 'Campaign', 'Campaign singular name', 'elementor' ),
			'search_items' => __( 'Search Campaigns', 'elementor' ),
			'popular_items' => __( 'Popular Campaigns', 'elementor' ),
			'all_items' => __( 'All Campaigns', 'elementor' ),
			'edit_item' => __( 'Edit Campaign', 'elementor' ),
			'update_item' => __( 'Update Campaign', 'elementor' ),
			'add_new_item' => __( 'Add New Campaign', 'elementor' ),
			'new_item_name' => __( 'New Campaign Name', 'elementor' ),
			'separate_items_with_commas' => __( 'Separate Campaigns with commas', 'elementor' ),
			'add_or_remove_items' => __( 'Add or remove Campaigns', 'elementor' ),
			'choose_from_most_used' => __( 'Choose from the most used Campaigns', 'elementor' ),
			'not_found' => __( 'No Campaigns found.', 'elementor' ),
			'menu_name' => __( 'Campaigns', 'elementor' ),
		];

		$taxonomy_args = [
			'labels' => $taxonomy_labels,
			'public' => false,
			'meta_box_cb' => false, // Don't show metabox.
			'show_in_quick_edit' => false,
			'query_var' => is_admin(),
			'rewrite' => false,
		];

		register_taxonomy( self::TAXONOMY_NAME, Source_Local::CPT, $taxonomy_args );
	}

	public function __construct() {
		$this->register_campaigns_taxonomy();
	}
}
