<?php
namespace Elementor\Core\Upgrade;

use Elementor\Icons_Manager;
use Elementor\Modules\Usage\Module;
use Elementor\Plugin;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

/**
 * Elementor upgrades.
 *
 * Elementor upgrades handler class is responsible for updating different
 * Elementor versions.
 *
 * @since 1.0.0
 */
class Upgrades {

	/**
	 * Upgrade Elementor 0.3.2
	 *
	 * Change the image widget link URL, setting is to `custom` link.
	 *
	 * @since 2.0.0
	 * @static
	 * @access public
	 */
	public static function _v_0_3_2() {
		global $wpdb;

		$post_ids = $wpdb->get_col(
			'SELECT `post_id` FROM `' . $wpdb->postmeta . '`
					WHERE `meta_key` = \'_elementor_version\'
						AND `meta_value` = \'0.1\';'
		);

		if ( empty( $post_ids ) ) {
			return;
		}

		foreach ( $post_ids as $post_id ) {
			$document = Plugin::$instance->documents->get( $post_id );

			if ( $document ) {
				$data = $document->get_elements_data();
			}

			if ( empty( $data ) ) {
				continue;
			}

			$data = Plugin::$instance->db->iterate_data( $data, function( $element ) {
				if ( empty( $element['widgetType'] ) || 'image' !== $element['widgetType'] ) {
					return $element;
				}

				if ( ! empty( $element['settings']['link']['url'] ) && ! isset( $element['settings']['link_to'] ) ) {
					$element['settings']['link_to'] = 'custom';
				}

				return $element;
			} );

			$document = Plugin::$instance->documents->get( $post_id );

			$document->save( [
				'elements' => $data,
			] );
		}
	}

	/**
	 * Upgrade Elementor 0.9.2
	 *
	 * Change the icon widget, icon-box widget and the social-icons widget,
	 * setting their icon padding size to an empty string.
	 *
	 * Change the image widget, setting the image size to full image size.
	 *
	 * @since 2.0.0
	 * @static
	 * @access public
	 */
	public static function _v_0_9_2() {
		global $wpdb;

		// Fix Icon/Icon Box Widgets padding.
		$post_ids = $wpdb->get_col(
			'SELECT `post_id` FROM `' . $wpdb->postmeta . '`
					WHERE `meta_key` = \'_elementor_version\'
						AND `meta_value` = \'0.2\';'
		);

		if ( empty( $post_ids ) ) {
			return;
		}

		foreach ( $post_ids as $post_id ) {
			$document = Plugin::$instance->documents->get( $post_id );

			if ( $document ) {
				$data = $document->get_elements_data();
			}

			if ( empty( $data ) ) {
				continue;
			}

			$data = Plugin::$instance->db->iterate_data( $data, function( $element ) {
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

			$document = Plugin::$instance->documents->get( $post_id );

			$document->save( [
				'elements' => $data,
			] );
		}
	}

	/**
	 * Upgrade Elementor 0.11.0
	 *
	 * Change the button widget sizes, setting up new button sizes.
	 *
	 * @since 2.0.0
	 * @static
	 * @access public
	 */
	public static function _v_0_11_0() {
		global $wpdb;

		// Fix Button widget to new sizes options.
		$post_ids = $wpdb->get_col(
			'SELECT `post_id` FROM `' . $wpdb->postmeta . '`
					WHERE `meta_key` = \'_elementor_version\'
						AND `meta_value` = \'0.3\';'
		);

		if ( empty( $post_ids ) ) {
			return;
		}

		foreach ( $post_ids as $post_id ) {
			$document = Plugin::$instance->documents->get( $post_id );

			if ( $document ) {
				$data = $document->get_elements_data();
			}

			if ( empty( $data ) ) {
				continue;
			}

			$data = Plugin::$instance->db->iterate_data( $data, function( $element ) {
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

			$document = Plugin::$instance->documents->get( $post_id );

			$document->save( [
				'elements' => $data,
			] );
		}
	}

	/**
	 * Upgrade Elementor 2.0.0
	 *
	 * Fix post titles for old autosave drafts that saved with the format 'Auto Save 2018-03-18 17:24'.
	 *
	 * @static
	 * @since 2.0.0
	 * @access public
	 */
	public static function _v_2_0_0() {
		global $wpdb;

		$posts = $wpdb->get_results(
			'SELECT `ID`, `post_title`, `post_parent`
					FROM `' . $wpdb->posts . '` p
					LEFT JOIN `' . $wpdb->postmeta . '` m ON p.ID = m.post_id
					WHERE `post_status` = \'inherit\'
					AND `post_title` = CONCAT(\'Auto Save \', DATE_FORMAT(post_date, "%Y-%m-%d %H:%i"))
					AND  m.`meta_key` = \'_elementor_data\';'
		);

		if ( empty( $posts ) ) {
			return;
		}

		foreach ( $posts as $post ) {
			wp_update_post( [
				'ID' => $post->ID,
				'post_title' => get_the_title( $post->post_parent ),
			] );
		}
	}

	/**
	 * Upgrade Elementor 2.0.1
	 *
	 * Fix post titles for old autosave drafts that saved with the format 'Auto Save...'.
	 *
	 * @since 2.0.2
	 * @static
	 * @access public
	 */
	public static function _v_2_0_1() {
		global $wpdb;

		$posts = $wpdb->get_results(
			'SELECT `ID`, `post_title`, `post_parent`
					FROM `' . $wpdb->posts . '` p
					LEFT JOIN `' . $wpdb->postmeta . '` m ON p.ID = m.post_id
					WHERE `post_status` = \'inherit\'
					AND `post_title` REGEXP \'^Auto Save [0-9]{4}-[0-9]{2}-[0-9]{2} [0-9]{2}:[0-9]{2}$\'
					AND  m.`meta_key` = \'_elementor_data\';'
		);

		if ( empty( $posts ) ) {
			return;
		}

		foreach ( $posts as $post ) {
			$parent = get_post( $post->post_parent );
			$title = isset( $parent->post_title ) ? $parent->post_title : '';

			wp_update_post( [
				'ID' => $post->ID,
				'post_title' => $title,
			] );
		}
	}

	/**
	 * Upgrade Elementor 2.0.10
	 *
	 * Fix post titles for old autosave drafts that saved with the format 'Auto Save...'.
	 * Fix also Translated titles.
	 *
	 * @since 2.0.10
	 * @static
	 * @access public
	 */
	public static function _v_2_0_10() {
		global $wpdb;

		$posts = $wpdb->get_results(
			'SELECT `ID`, `post_title`, `post_parent`
					FROM `' . $wpdb->posts . '` p
					LEFT JOIN `' . $wpdb->postmeta . '` m ON p.ID = m.post_id
					WHERE `post_status` = \'inherit\'
					AND `post_title` REGEXP \'[[:alnum:]]+ [[:alnum:]]+ [0-9]{4}-[0-9]{2}-[0-9]{2} [0-9]{2}:[0-9]{2}$\'
					AND  m.`meta_key` = \'_elementor_data\';'
		);

		if ( empty( $posts ) ) {
			return;
		}

		foreach ( $posts as $post ) {
			$parent = get_post( $post->post_parent );
			$title = isset( $parent->post_title ) ? $parent->post_title : '';

			wp_update_post( [
				'ID' => $post->ID,
				'post_title' => $title,
			] );
		}
	}

	public static function _v_2_1_0() {
		global $wpdb;

		// upgrade `video` widget settings (merge providers).
		$post_ids = $wpdb->get_col(
			'SELECT `post_id` FROM `' . $wpdb->postmeta . '` WHERE `meta_key` = "_elementor_data" AND `meta_value` LIKE \'%"widgetType":"video"%\';'
		);

		if ( empty( $post_ids ) ) {
			return;
		}

		foreach ( $post_ids as $post_id ) {
			$do_update = false;
			$document = Plugin::$instance->documents->get( $post_id );

			if ( $document ) {
				$data = $document->get_elements_data();
			}

			if ( empty( $data ) ) {
				continue;
			}

			$data = Plugin::$instance->db->iterate_data( $data, function( $element ) use ( &$do_update ) {
				if ( empty( $element['widgetType'] ) || 'video' !== $element['widgetType'] ) {
					return $element;
				}

				$replacements = [];

				if ( empty( $element['settings']['video_type'] ) || 'youtube' === $element['settings']['video_type'] ) {
					$replacements = [
						'yt_autoplay' => 'autoplay',
						'yt_controls' => 'controls',
						'yt_mute' => 'mute',
						'yt_rel' => 'rel',
						'link' => 'youtube_url',
					];
				} elseif ( 'vimeo' === $element['settings']['video_type'] ) {
					$replacements = [
						'vimeo_autoplay' => 'autoplay',
						'vimeo_loop' => 'loop',
						'vimeo_color' => 'color',
						'vimeo_link' => 'vimeo_url',
					];
				}

				// cleanup old unused settings.
				unset( $element['settings']['yt_rel_videos'] );

				foreach ( $replacements as $old => $new ) {
					if ( ! empty( $element['settings'][ $old ] ) ) {
						$element['settings'][ $new ] = $element['settings'][ $old ];
						$do_update = true;
					}
				}

				return $element;
			} );

			// Only update if needed.
			if ( ! $do_update ) {
				continue;
			}

			// We need the `wp_slash` in order to avoid the unslashing during the `update_post_meta`
			$json_value = wp_slash( wp_json_encode( $data ) );

			update_metadata( 'post', $post_id, '_elementor_data', $json_value );

			// Clear WP cache for next step.
			wp_cache_flush();
		} // End foreach().
	}

	/**
	 * @param Updater $updater
	 *
	 * @return bool
	 */
	public static function _v_2_3_0_widget_image( $updater ) {
		global $wpdb;

		// upgrade `video` widget settings (merge providers).
		$post_ids = $updater->query_col(
			'SELECT `post_id` FROM `' . $wpdb->postmeta . '` WHERE `meta_key` = "_elementor_data" AND (
			`meta_value` LIKE \'%"widgetType":"image"%\' 
			OR `meta_value` LIKE \'%"widgetType":"theme-post-featured-image"%\'
			OR `meta_value` LIKE \'%"widgetType":"theme-site-logo"%\'
			OR `meta_value` LIKE \'%"widgetType":"woocommerce-category-image"%\'
			);'
		);

		if ( empty( $post_ids ) ) {
			return false;
		}

		$widgets = [
			'image',
			'theme-post-featured-image',
			'theme-site-logo',
			'woocommerce-category-image',
		];

		foreach ( $post_ids as $post_id ) {
			// Clear WP cache for next step.
			wp_cache_flush();

			$do_update = false;

			$document = Plugin::$instance->documents->get( $post_id );

			if ( ! $document ) {
				continue;
			}

			$data = $document->get_elements_data();

			if ( empty( $data ) ) {
				continue;
			}

			$data = Plugin::$instance->db->iterate_data( $data, function( $element ) use ( &$do_update, $widgets ) {
				if ( empty( $element['widgetType'] ) || ! in_array( $element['widgetType'], $widgets ) ) {
					return $element;
				}

				if ( ! empty( $element['settings']['caption'] ) ) {
					if ( ! isset( $element['settings']['caption_source'] ) ) {
						$element['settings']['caption_source'] = 'custom';

						$do_update = true;
					}
				}

				return $element;
			} );

			// Only update if needed.
			if ( ! $do_update ) {
				continue;
			}

			// We need the `wp_slash` in order to avoid the unslashing during the `update_post_meta`
			$json_value = wp_slash( wp_json_encode( $data ) );

			update_metadata( 'post', $post_id, '_elementor_data', $json_value );
		} // End foreach().

		return $updater->should_run_again( $post_ids );
	}

	/**
	 * @param Updater $updater
	 *
	 * @return bool
	 */
	public static function _v_2_3_0_template_type( $updater ) {
		global $wpdb;

		$post_ids = $updater->query_col(
			'SELECT p.ID
					FROM `' . $wpdb->posts . '` AS p
					LEFT JOIN `' . $wpdb->postmeta . '` AS pm1 ON (p.ID = pm1.post_id)
					LEFT JOIN `' . $wpdb->postmeta . '` AS pm2 ON (pm1.post_id = pm2.post_id AND pm2.meta_key = "_elementor_template_type")
					WHERE p.post_status != "inherit" AND pm1.`meta_key` = "_elementor_data" AND pm2.post_id IS NULL;'
		);

		if ( empty( $post_ids ) ) {
			return false;
		}

		foreach ( $post_ids as $post_id ) {
			// Clear WP cache for next step.
			wp_cache_flush();

			$document = Plugin::$instance->documents->get( $post_id );

			if ( ! $document ) {
				continue;
			}

			$document->save_template_type();
		} // End foreach().

		return $updater->should_run_again( $post_ids );
	}

	/**
	 * Set FontAwesome Migration needed flag
	 */
	public static function _v_2_6_0_fa4_migration_flag() {
		add_option( 'elementor_icon_manager_needs_update', 'yes' );
		add_option( 'elementor_load_fa4_shim', 'yes' );
	}

	/**
	 * migrate Icon control string value to Icons control array value
	 *
	 * @param array $element
	 * @param array $args
	 *
	 * @return mixed
	 */
	public static function _migrate_icon_fa4_value( $element, $args ) {
		$widget_id = $args['widget_id'];

		if ( empty( $element['widgetType'] ) || $widget_id !== $element['widgetType'] ) {
			return $element;
		}
		foreach ( $args['control_ids'] as $old_name => $new_name ) {
			// exit if new value exists
			if ( isset( $element['settings'][ $new_name ] ) ) {
				continue;
			}

			// exit if no value to migrate
			if ( ! isset( $element['settings'][ $old_name ] ) ) {
				continue;
			}

			$element['settings'][ $new_name ] = Icons_Manager::fa4_to_fa5_value_migration( $element['settings'][ $old_name ] );
			$args['do_update'] = true;
		}
		return $element;
	}

	/**
	 * Set FontAwesome 5 value Migration on for button widget
	 *
	 * @param Updater $updater
	 */
	public static function _v_2_6_6_fa4_migration_button( $updater ) {
		$changes = [
			[
				'callback' => [ 'Elementor\Core\Upgrade\Upgrades', '_migrate_icon_fa4_value' ],
				'control_ids' => [
					'icon' => 'selected_icon',
				],
			],
		];
		Upgrade_Utils::_update_widget_settings( 'button', $updater, $changes );
		Upgrade_Utils::_update_widget_settings( 'icon-box', $updater, $changes );
	}

	/**
	 *  Update database to separate page from post.
	 *
	 * @param Updater $updater
	 *
	 * @param string $type
	 *
	 * @return bool
	 */
	public static function rename_document_base_to_wp( $updater, $type ) {
		global $wpdb;

		$post_ids = $updater->query_col( $wpdb->prepare(
			"SELECT p1.ID FROM {$wpdb->posts} AS p 
					LEFT JOIN {$wpdb->posts} AS p1 ON (p.ID = p1.post_parent || p.ID = p1.ID) 
					WHERE p.post_type = %s;", $type ) );

		if ( empty( $post_ids ) ) {
			return false;
		}

		$sql_post_ids = implode( ',', $post_ids );

		$wpdb->query( $wpdb->prepare(
			"UPDATE $wpdb->postmeta SET meta_value = %s
			WHERE meta_key = '_elementor_template_type' && post_id in ( %s );
		 ", 'wp-' . $type, $sql_post_ids ) );

		return $updater->should_run_again( $post_ids );
	}

	/**
	 *  Update database to separate page from post.
	 *
	 * @param Updater $updater
	 *
	 * @return bool
	 */
	// Because the query is slow on large sites, temporary don't upgrade.
	/*	public static function _v_2_7_0_rename_document_types_to_wp( $updater ) {
		return self::rename_document_base_to_wp( $updater, 'post' ) || self::rename_document_base_to_wp( $updater, 'page' );
	}*/

	// Upgrade code was fixed & moved to _v_2_7_1_remove_old_usage_data.
	/* public static function _v_2_7_0_remove_old_usage_data() {} */

	// Upgrade code moved to _v_2_7_1_recalc_usage_data.
	/* public static function _v_2_7_0_recalc_usage_data( $updater ) {} */

	/**
	 * Don't use the old data anymore.
	 * Since 2.7.1 the key was changed from `elementor_elements_usage` to `elementor_controls_usage`.
	 */
	public static function _v_2_7_1_remove_old_usage_data() {
		delete_option( 'elementor_elements_usage' );
		delete_post_meta_by_key( '_elementor_elements_usage' );
	}

	/**
	 * Recalc usage.
	 *
	 * @param Updater $updater
	 *
	 * @return bool
	 */
	public static function recalc_usage_data( $updater ) {
		/** @var Module $module */
		$module = Plugin::$instance->modules_manager->get_modules( 'usage' );

		$post_count = $module->recalc_usage( $updater->get_limit(), $updater->get_current_offset() );

		return ( $post_count === $updater->get_limit() );
	}

	public static function _v_2_7_1_recalc_usage_data( $updater ) {
		return self::recalc_usage_data( $updater );
	}

	public static function _v_2_8_3_recalc_usage_data( $updater ) {
		// Re-calc since older version(s) had invalid values.
		return self::recalc_usage_data( $updater );
	}
}
