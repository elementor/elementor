<?php
namespace Elementor\Core\Upgrade;

use Elementor\Plugin;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}

class Upgrade_Utils {

	/**
	 *  _update_widget_settings
	 *
	 * @param string  $widget_id Widget type id. Pass "*" for any widget type.
	 * @param Updater $updater   Updater instance.
	 * @param array   $changes   Array containing updating control_ids, callback and other data needed by the callback.
	 *
	 * @return bool
	 */
	public static function _update_widget_settings( $widget_id, $updater, $changes ) {
		global $wpdb;

		$widget_type = '*' === $widget_id
			? 'REGEXP \'"widgetType":"[a-zA-Z_\-]+"\''
			: 'LIKE \'%"widgetType":"' . $widget_id . '"%\'';

		$post_ids = $updater->query_col(
			'SELECT `post_id`
				FROM `' . $wpdb->postmeta . '`
				WHERE `meta_key` = "_elementor_data"
				AND `meta_value` ' . $widget_type . ';'
		);

		if ( empty( $post_ids ) ) {
			return false;
		}

		foreach ( $post_ids as $post_id ) {
			$do_update = false;

			$document = Plugin::instance()->documents->get( $post_id );

			if ( ! $document ) {
				continue;
			}

			$data = $document->get_elements_data();

			if ( empty( $data ) ) {
				continue;
			}

			// loop through callbacks & array
			foreach ( $changes as $change ) {
				$args = [
					'do_update' => &$do_update,
					'widget_id' => $widget_id,
					'control_ids' => $change['control_ids'] ?? null,
				];

				if ( isset( $change['prefix'] ) ) {
					$args['prefix'] = $change['prefix'];
					$args['new_id'] = $change['new_id'];
				}

				$data = Plugin::instance()->db->iterate_data( $data, $change['callback'], $args );
				if ( ! $do_update ) {
					continue;
				}

				// We need the `wp_slash` in order to avoid the unslashing during the `update_metadata`
				$json_value = wp_slash( wp_json_encode( $data ) );

				update_metadata( 'post', $post_id, '_elementor_data', $json_value );
			}
		} // End foreach().

		return $updater->should_run_again( $post_ids );
	}
}
