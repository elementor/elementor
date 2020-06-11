<?php
namespace Elementor\Core\Editor\Data\Globals\Endpoints;

use Elementor\Plugin;

class Typography extends Base {
	public function get_name() {
		return 'typography';
	}

	protected function get_kit_items() {
		$result = [];

		$kit = Plugin::$instance->kits_manager->get_active_kit_for_frontend();

		$system_items = $kit->get_settings_for_display( 'system_typography' );
		$custom_items = $kit->get_settings_for_display( 'custom_typography' );

		if ( ! $system_items ) {
			$system_items = [];
		}

		if ( ! $custom_items ) {
			$custom_items = [];
		}

		$items = array_merge( $system_items, $custom_items );

		foreach ( $items as $index => &$item ) {
			foreach ( $item as $setting => $value ) {
				$new_setting = str_replace( 'styles_', '', $setting, $count );
				if ( $count ) {
					$item[ $new_setting ] = $value;
					unset( $item[ $setting ] );
				}
			}

			$id = $item['_id'];

			$result[ $id ] = [
				'title' => $item['title'],
				'id' => $id,
			];

			unset( $item['_id'], $item['title'] );

			$result[ $id ]['value'] = $item;
		}

		return $result;
	}

	protected function convert_db_format( $item ) {
		$db_format = [
			'_id' => $item['id'],
			'title' => $item['title'],
		];

		$values = [];

		foreach ( $item['value'] as $key => $value ) {
			$values[ 'styles_' . $key ] = $value;
		}

		$db_format = array_merge( $values, $db_format );

		return $db_format;
	}
}
