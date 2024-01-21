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
					'title' => 'Elementor 3.17 Released!',
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

					],
				],
				[
					'id' => 'release-note-3.1111',
					'title' => 'Elementor 3.17 Released!',
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
					'conditions'
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
