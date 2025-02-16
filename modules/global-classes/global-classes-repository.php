<?php
namespace Elementor\Modules\GlobalClasses;

use Elementor\Plugin;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Global_Classes_Repository {
	const META_KEY = '_elementor_global_classes';

	public static function make(): Global_Classes_Repository {
		return new self();
	}

	public function all() {
		$all = Plugin::$instance->kits_manager->get_active_kit()->get_json_meta( self::META_KEY );

		return Global_Classes::make( $all['items'] ?? [], $all['order'] ?? [] );
	}

	public function put( array $items, array $order ) {
		$current_value = $this->all()->get();

		$updated_value = [
			'items' => $items,
			'order' => $order,
		];

		// `update_metadata` fails for identical data, so we skip it.
		if ( $current_value === $updated_value ) {
			return;
		}

		$value = Plugin::$instance->kits_manager->get_active_kit()->update_json_meta( self::META_KEY, $updated_value );

		if ( ! $value ) {
			throw new \Exception( 'Failed to update global classes' );
		}

		do_action( 'elementor/global_classes/update' );
	}
}
