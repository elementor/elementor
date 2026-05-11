<?php

namespace Elementor\Modules\WidgetCreation;

use Elementor\Core\Experiments\Manager as Experiments_Manager;
use Elementor\Core\Upgrade\Manager as Upgrade_Manager;
use Elementor\Core\Utils\Hints;
use Elementor\Modules\ElementorCounter\Module as Elementor_Counter;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class AngiePromotion {
	const ANGIE_GUIDE_AUTO_SHOWN_OPTION = 'elementor_angie_guide_auto_shown';

	public static function init() {
		if ( ! self::should_display_promotion() ) {
			return;
		}

		add_filter( 'elementor/editor/localize_settings', function ( $settings ) {
			$settings = self::register_for_new_site( $settings );
			$settings = self::register_for_existing_site( $settings );

			return $settings;
		}, 10 );
	}

	private static function should_display_promotion(): bool {
		return ! Hints::is_plugin_active( 'angie' );
	}

	private static function register_for_new_site( array $settings ): array {
		if ( ! Upgrade_Manager::is_new_installation() ) {
			return $settings;
		}

		if ( 'yes' === get_option( self::ANGIE_GUIDE_AUTO_SHOWN_OPTION ) ) {
			return $settings;
		}

		$editor_visit_count = (int) get_option( Elementor_Counter::EDITOR_COUNTER_KEY, 0 );

		if ( $editor_visit_count <= 2 ) {
			return $settings;
		}

		update_option( self::ANGIE_GUIDE_AUTO_SHOWN_OPTION, 'yes' );

		$settings['angie']['autoShow'] = true;

		return $settings;
	}

	private static function register_for_existing_site( array $settings ): array {
		if ( Upgrade_Manager::is_new_installation() ) {
			return $settings;
		}

		if ( 'yes' === get_option( self::ANGIE_GUIDE_AUTO_SHOWN_OPTION ) ) {
			return $settings;
		}

		$is_container_active = 'active' === get_option( Experiments_Manager::OPTION_PREFIX . 'container' );

		if ( $is_container_active ) {
			$is_atomic_active   = 'active' === get_option( Experiments_Manager::OPTION_PREFIX . 'e_atomic_elements' );
			$user_intro         = get_user_meta( get_current_user_id(), 'elementor_introduction', true );
			$is_promo_dismissed = ! empty( $user_intro['atomic_elements_promo'] );

			if ( ! $is_atomic_active && ! $is_promo_dismissed ) {
				return $settings;
			}
		}

		update_option( self::ANGIE_GUIDE_AUTO_SHOWN_OPTION, 'yes' );
		$settings['angie']['autoShow'] = true;

		return $settings;
	}
}
