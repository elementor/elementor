<?php
namespace Elementor\Modules\Home\Transformations;

use Elementor\Modules\Home\Transformations\Base\Transformations_Abstract;
use Elementor\Plugin;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Create_Edit_Website_Url extends Transformations_Abstract {

	public function transform( array $home_screen_data ): array {
		$homepage_id = $this->get_homepage_id();
		$edit_url = $this->get_edit_website_url( $homepage_id );

		$home_screen_data['edit_website_url'] = $edit_url;

		return $home_screen_data;
	}

	private function get_homepage_id(): ?int {
		if ( get_option( 'show_on_front' ) !== 'page' ) {
			return null;
		}

		$homepage_id = get_option( 'page_on_front' );

		return $homepage_id ? (int) $homepage_id : null;
	}

	private function get_edit_website_url( ?int $homepage_id ): string {
		if ( ! $homepage_id ) {
			return Plugin::$instance->documents->get_create_new_post_url( 'page' );
		}

		$document = Plugin::$instance->documents->get( $homepage_id );

		if ( ! $document || ! $document->is_built_with_elementor() ) {
			return Plugin::$instance->documents->get_create_new_post_url( 'page' );
		}

		return $document->get_edit_url();
	}
}
