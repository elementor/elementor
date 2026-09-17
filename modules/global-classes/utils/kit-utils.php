<?php

namespace Elementor\Modules\GlobalClasses\Utils;

use Elementor\Core\Base\Document;
use Elementor\Core\Kits\Documents\Kit;
use Elementor\Plugin;
use Elementor\TemplateLibrary\Source_Local;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Kit_Utils {
	/**
	 * Returns all kit documents on the current site.
	 *
	 * @return Kit[]
	 */
	public static function get_all_kit_documents(): array {
		$kit_ids = get_posts( [
			'post_type'              => Source_Local::CPT,
			'post_status'            => 'any',
			'fields'                 => 'ids',
			'posts_per_page'         => -1,
			'no_found_rows'          => true,
			'update_post_meta_cache' => false,
			'meta_query'             => [
				[
					'key'   => Document::TYPE_META_KEY,
					'value' => 'kit',
				],
			],
		] );

		$kits = [];

		foreach ( $kit_ids as $kit_id ) {
			$kit = Plugin::$instance->kits_manager->get_kit( $kit_id );

			if ( $kit ) {
				$kits[] = $kit;
			}
		}

		return $kits;
	}
}
