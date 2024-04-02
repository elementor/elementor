<?php
namespace Elementor\Modules\Home\Transformations;

use Elementor\Core\Base\Document;
use Elementor\Plugin;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}

class Create_Site_Settings_Url extends Base\Transformations_Abstract {

	public function transform( array $home_screen_data ): array {
//		$home_screen_data['create_new_page_url'] = Plugin::$instance->documents->get_create_new_post_url( 'page' );


		$kit = Plugin::$instance->kits_manager->get_active_kit();
		$t = $this->get_elementor_page();

		var_dump( $kit );
		var_dump( $this->get_elementor_edit_url( $t->ID ) );die();

		return $home_screen_data;
	}

	private function get_elementor_edit_url( int $post_id ) {
		$document = Plugin::$instance->documents->get( $post_id );
		return $document->get_edit_url();
	}

	private function get_elementor_page() {
		$args = array(
			'meta_key' => Document::BUILT_WITH_ELEMENTOR_META_KEY,
			'sort_order' => 'asc',
			'sort_column' => 'post_date',
		);
		$pages = get_pages( $args );

		if ( empty( $pages ) ) {
			return null;
		}

		$home_page_id = get_option( 'page_on_front' );

		foreach ( $pages as $page ) {
			if ( (string) $page->ID === $home_page_id ) {
				return $page;
			}
		}

		return $pages[0];
	}
}
