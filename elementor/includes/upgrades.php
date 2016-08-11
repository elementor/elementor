<?php
namespace Elementor;

if ( ! defined( 'ABSPATH' ) ) exit; // Exit if accessed directly

class Upgrades {

	public static function add_actions() {
		add_action( 'init', [ __CLASS__, 'init' ], 20 );
	}

	public static function init() {
		$elementor_version = get_option( 'elementor_version' );

		if ( ! $elementor_version ) {
			// 0.3.1 is the first version to use this option so we must add it
			$elementor_version = '0.3.1';
			update_option( 'elementor_version', $elementor_version );
		}

		if ( version_compare( $elementor_version, '0.3.2', '<' ) ) {
			self::_upgrade_v032();
			update_option( 'elementor_version', '0.3.2' );
		}
	}

	private static function _upgrade_v032() {
		global $wpdb;

		$post_ids = $wpdb->get_col(
			$wpdb->prepare(
				'SELECT `post_id` FROM %1$s
						WHERE `meta_key` = \'_elementor_version\'
							AND `meta_value` = \'%2$s\';',
				$wpdb->postmeta,
				'0.1'
			)
		);

		if ( empty( $post_ids ) )
			return;

		foreach ( $post_ids as $post_id ) {
			$data = Plugin::instance()->db->get_plain_builder( $post_id );
			$data = Plugin::instance()->db->iterate_data( $data, function( $element ) {
				if ( empty( $element['widgetType'] ) || 'image' !== $element['widgetType'] ) {
					return $element;
				}

				if ( ! empty( $element['settings']['link']['url'] ) ) {
					$element['settings']['link_to'] = 'custom';
				}

				return $element;
			} );

			Plugin::instance()->db->save_builder( $post_id, $data );
		}
	}
}

Upgrades::add_actions();
