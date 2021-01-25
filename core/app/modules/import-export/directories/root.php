<?php

namespace Elementor\Core\App\Modules\ImportExport\Directories;

use Elementor\Core\App\Modules\ImportExport\Module;
use Elementor\Plugin;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}

class Root extends Base {

	protected function get_name() {
		return '';
	}

	protected function export() {
		$kit = Plugin::$instance->kits_manager->get_active_kit();

		$include = $this->exporter->get_settings( 'include' );

		$include_site_settings = in_array( 'settings', $include );

		if ( $include_site_settings ) {
			$this->exporter->add_json_file( 'site-settings', $kit->get_export_data() );
		}

		$kit_post = $kit->get_post();

		$kit_title = $this->exporter->get_settings( 'title' );

		$kit_name = sanitize_title( $kit_title );

		$manifest_data = [
			'author' => get_the_author_meta( 'display_name', $kit_post->post_author ),
			'version' => Module::FORMAT_VERSION,
			'elementor_version' => ELEMENTOR_VERSION,
			'created' => date( 'Y-m-d H:i:s' ),
			'name' => $kit_name,
			'title' => $kit_title,
			'description' => $kit_post->post_excerpt,
			'image' => get_the_post_thumbnail_url( $kit_post ),
		];

		if ( $include_site_settings ) {
			$manifest_data['settings'] = array_keys( $kit->get_tabs() );
		}

		return $manifest_data;
	}

	protected function import( array $settings ) {
		$new_kit_id = Plugin::$instance->kits_manager->create( [
			'post_title' => $settings['title'],
			'post_excerpt' => $settings['description'],
		] );

		$attachment = Plugin::$instance->templates_manager->get_import_images_instance()->import( [
			'url' => $settings['image'],
		], $new_kit_id );
	}

	protected function get_default_sub_directories() {
		$sub_directories = [];

		$include = $this->iterator->get_settings( 'include' );

		if ( in_array( 'templates', $include ) ) {
			$sub_directories[] = new Templates( $this->iterator, $this );
		}

		if ( in_array( 'content', $include ) ) {
			$sub_directories[] = new Content( $this->iterator, $this );
		}

		return $sub_directories;
	}
}
