<?php
namespace Elementor\Modules\Notifications;

class API {

	public static function get_notifications( $force_request = false ) {
		$notifications = self::get_transient( '_elementor_notifications_data' );

		$notifications = false;

		if ( $force_request || false === $notifications ) {
			$notifications = [
				[
					// Required
					'id' => 'release-note-3.17',
					// Required
					'title' => 'Elementor 3.17 Released (HEB)!',
					// Required
					'description' => 'Elementor 3.17 is here! This release includes a new way to create.',

					'link' => '{https_url}',
					'imageSrc' => 'https://ps.w.org/elementor/assets/screenshot-1.gif',
					'date' => '{YYYY-MM-DD}',
					'time' => '{00-00}',
					'topic' => 'New Feature',
					'chipPlan' => 'Pro',
					'chipTags' => [ 'Improvment', 'Tweak' ],
					'readMoreText' => 'Read More',
					'cta' => 'Get Started',
					'ctaLink' => '{https_url}',
					'conditions' => [
						[
							[
								'type' => 'language',
								'languages' => [ 'en_US1' ],
								'operator' => 'in',
							],
						],
					],
				],
				[
					'id' => 'release-note-3.17',
					'title' => 'Elementor 3.17 Released (DUPE)!',
					'description' => 'Elementor 3.17 is here! This release includes a new way to create.',
					'link' => '{https_url}',
					'imageSrc' => 'https://ps.w.org/elementor/assets/screenshot-1.gif',
					'date' => '{YYYY-MM-DD}',
					'time' => '{00-00}',
					'topic' => 'New Feature',
					'chipPlan' => 'Pro',
					'chipTags' => [ 'Improvment', 'Tweak' ],
					'readMoreText' => 'Read More',
					'cta' => 'Get Started',
					'ctaLink' => '{https_url}',
				],
				[
					'id' => 'release-note-3.17-2',
					'title' => 'Elementor 3.17 Released!',
					'description' => 'Elementor 3.17 is here! This release includes a new way to create',
					'link' => '{https_url}',
					'date' => '{YYYY-MM-DD}',
					'time' => '{00-00}',
					'chipPlan' => 'Pro',
					'chipTags' => [ 'Improvment' ],
				],
				[
					'id' => 'release-note-3.17-3',
					'title' => 'Elementor 3.17 Released!',
					'description' => 'Elementor 3.17 is here! This release includes a new way to create',
					'imageSrc' => 'https://ps.w.org/elementor/assets/screenshot-1.gif',
					'date' => '{YYYY-MM-DD}',
					'time' => '{00-00}',
					'chipPlan' => 'Pro',
					'chipTags' => [ 'Improvment' ],
					'readMoreText' => 'Read More',
				],
			];

			static::set_transient( '_elementor_notifications_data', $notifications, '+1 hour' );
		}

		return $notifications;
	}

	public static function get_notifications_by_conditions() {
		$notifications = static::get_notifications();

		$filtered_notifications = [];

		foreach ( $notifications as $notification ) {
			if ( empty( $notification['conditions'] ) ) {
				$filtered_notifications = static::add_to_array( $filtered_notifications, $notification );

				continue;
			}

			if ( ! static::check_conditions( $notification['conditions'] ) ) {
				continue;
			}

			$filtered_notifications = static::add_to_array( $filtered_notifications, $notification );
		}

		return $filtered_notifications;
	}

	private static function add_to_array( $filtered_notifications, $notification ) {
		foreach ( $filtered_notifications as $filtered_notification ) {
			if ( $filtered_notification['id'] === $notification['id'] ) {
				return $filtered_notifications;
			}
		}

		$filtered_notifications[] = $notification;

		return $filtered_notifications;
	}

	private static function check_conditions( $groups ) {
		foreach ( $groups as $group ) {
			if ( static::check_group( $group ) ) {
				return true;
			}
		}

		return false;
	}

	private static function check_group( $group ) {
		$is_or_relation = ! empty( $group['relation'] ) && 'OR' === $group['relation'];
		unset( $group['relation'] );
		$result = false;

		foreach ( $group as $condition ) {
			// Reset results for each condition.
			$result = false;
			switch ( $condition['type'] ) {
				case 'wordpress': // phpcs:ignore WordPress.WP.CapitalPDangit.Misspelled
					// include an unmodified $wp_version
					include ABSPATH . WPINC . '/version.php';
					$result = version_compare( $wp_version, $condition['version'], $condition['operator'] );
					break;
				case 'multisite':
					$result = is_multisite() === $condition['multisite'];
					break;
				case 'language':
					$in_array = in_array( get_locale(), $condition['languages'], true );
					$result = 'in' === $condition['operator'] ? $in_array : ! $in_array;
					break;
				case 'plugin':
					if ( ! empty( $condition['plugin_file'] ) ) {
						$plugin_file = $condition['plugin_file']; // For PHP Unit tests.
					} else {
						$plugin_file = WP_PLUGIN_DIR . '/' . $condition['plugin']; // Default.
					}

					$version = '';

					if ( is_plugin_active( $condition['plugin'] ) && file_exists( $plugin_file ) ) {
						$plugin_data = get_plugin_data( $plugin_file );
						if ( isset( $plugin_data['Version'] ) ) {
							$version = $plugin_data['Version'];
						}
					}

					$result = version_compare( $version, $condition['version'], $condition['operator'] );
					break;
				case 'theme':
					$theme = wp_get_theme();
					if ( wp_get_theme()->parent() ) {
						$theme = wp_get_theme()->parent();
					}

					if ( $theme->get_template() === $condition['theme'] ) {
						$version = $theme->version;
					} else {
						$version = '';
					}

					$result = version_compare( $version, $condition['version'], $condition['operator'] );
					break;

				default:
					$result = apply_filters( "elementor/notifications/condition/{$condition['type']}", $result, $condition );
					break;
			}

			if ( ( $is_or_relation && $result ) || ( ! $is_or_relation && ! $result ) ) {
				return $result;
			}
		}

		return $result;
	}

	private static function get_transient( $cache_key ) {
		$cache = get_option( $cache_key );

		if ( empty( $cache['timeout'] ) ) {
			return false;
		}

		if ( current_time( 'timestamp' ) > $cache['timeout'] ) {
			return false;
		}

		return json_decode( $cache['value'], true );
	}

	private static function set_transient( $cache_key, $value, $expiration = '+12 hours' ) {
		$data = [
			'timeout' => strtotime( $expiration, current_time( 'timestamp' ) ),
			'value' => json_encode( $value ),
		];

		return update_option( $cache_key, $data, false );
	}
}
