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

		if ( version_compare( $elementor_version, '0.9.2', '<' ) ) {
			self::_upgrade_v092();
			update_option( 'elementor_version', '0.9.2' );
		}

		if ( version_compare( $elementor_version, '0.11.0', '<' ) ) {
			self::_upgrade_v0110();
			update_option( 'elementor_version', '0.11.0' );
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
			$data = Plugin::instance()->db->get_plain_editor( $post_id );
			if ( empty( $data ) ) {
				continue;
			}

			$data = Plugin::instance()->db->iterate_data( $data, function( $element ) {
				if ( empty( $element['widgetType'] ) || 'image' !== $element['widgetType'] ) {
					return $element;
				}

				if ( ! empty( $element['settings']['link']['url'] ) ) {
					$element['settings']['link_to'] = 'custom';
				}

				return $element;
			} );

			Plugin::instance()->db->save_editor( $post_id, $data );
		}
	}

	private static function _upgrade_v092() {
		global $wpdb;

		// Fix Icon/Icon Box Widgets padding
		$post_ids = $wpdb->get_col(
			$wpdb->prepare(
				'SELECT `post_id` FROM %1$s
						WHERE `meta_key` = \'_elementor_version\'
							AND `meta_value` = \'%2$s\';',
				$wpdb->postmeta,
				'0.2'
			)
		);

		if ( empty( $post_ids ) )
			return;

		foreach ( $post_ids as $post_id ) {
			$data = Plugin::instance()->db->get_plain_editor( $post_id );
			if ( empty( $data ) ) {
				continue;
			}

			$data = Plugin::instance()->db->iterate_data( $data, function( $element ) {
				if ( empty( $element['widgetType'] ) ) {
					return $element;
				}

				if ( in_array( $element['widgetType'], [ 'icon', 'icon-box', 'social-icons' ] ) ) {
					if ( ! empty( $element['settings']['icon_padding']['size'] ) ) {
						$element['settings']['icon_padding']['size'] = '';
					}
				}

				if ( 'image' === $element['widgetType'] ) {
					if ( empty( $element['settings']['image_size'] ) ) {
						$element['settings']['image_size'] = 'full';
					}
				}

				return $element;
			} );

			Plugin::instance()->db->save_editor( $post_id, $data );
		}
	}

	private static function _upgrade_v0110() {
		global $wpdb;

		// Fix Button widget to new sizes options
		$post_ids = $wpdb->get_col(
			$wpdb->prepare(
				'SELECT `post_id` FROM %1$s
						WHERE `meta_key` = \'_elementor_version\'
							AND `meta_value` = \'%2$s\';',
				$wpdb->postmeta,
				'0.3'
			)
		);

		if ( empty( $post_ids ) )
			return;

		foreach ( $post_ids as $post_id ) {
			$data = Plugin::instance()->db->get_plain_editor( $post_id );
			if ( empty( $data ) ) {
				continue;
			}

			$data = Plugin::instance()->db->iterate_data( $data, function( $element ) {
				if ( empty( $element['widgetType'] ) ) {
					return $element;
				}

				if ( 'button' === $element['widgetType'] ) {
					$size_to_replace = [
						'small' => 'xs',
						'medium' => 'sm',
						'large' => 'md',
						'xl' => 'lg',
						'xxl' => 'xl',
					];

					if ( ! empty( $element['settings']['size'] ) ) {
						$old_size = $element['settings']['size'];

						if ( isset( $size_to_replace[ $old_size ] ) ) {
							$element['settings']['size'] = $size_to_replace[ $old_size ];
						}
					}
				}

				return $element;
			} );

			Plugin::instance()->db->save_editor( $post_id, $data );
		}
	}
}

Upgrades::add_actions();
