<?php
namespace elementor\core\utils;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

use Elementor\User;

class Hints {
	const INFO = 'info';
	const SUCCESS = 'success';
	const WARNING = 'warning';
	const DANGER = 'danger';

	const DEFINED = 'defined';
	const DISMISSED = 'dismissed';
	const CAPABILITY = 'capability';
	const PLUGIN_INSTALLED = 'plugin_installed';
	const PLUGIN_ACTIVE = 'plugin_active';

	/**
	 * get_notice_types
	 * @return string[]
	 */
	public static function get_notice_types(): array {
		return [
			self::INFO,
			self::SUCCESS,
			self::WARNING,
			self::DANGER,
		];
	}

	/**
	 * get_hints
	 *
	 * @param $hint_key
	 *
	 * @return array|string[]|\string[][]
	 */
	public static function get_hints( $hint_key = null ): array {
		$hints = [
			'image-optimization-once' => [
				self::DISMISSED => 'image-optimization-once',
				self::CAPABILITY => 'install_plugins',
				self::DEFINED => 'IMAGE_OPTIMIZATION_VERSION',
			],
			'image-optimization' => [
				self::DISMISSED => 'image_optimizer_hint',
				self::CAPABILITY => 'install_plugins',
				self::DEFINED => 'IMAGE_OPTIMIZATION_VERSION',
			],
		];
		if ( ! $hint_key ) {
			return $hints;
		}

		return $hints[ $hint_key ] ?? [];
	}

	/**
	 * get_notice_icon
	 * @return string
	 */
	public static function get_notice_icon(): string {
		return '<div class="elementor-control-notice-icon">
				<svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
					<path d="M2.25 9H3M9 2.25V3M15 9H15.75M4.2 4.2L4.725 4.725M13.8 4.2L13.275 4.725M7.27496 12.75H10.725M6.75 12C6.12035 11.5278 5.65525 10.8694 5.42057 10.1181C5.1859 9.36687 5.19355 8.56082 5.44244 7.81415C5.69133 7.06748 6.16884 6.41804 6.80734 5.95784C7.44583 5.49764 8.21294 5.25 9 5.25C9.78706 5.25 10.5542 5.49764 11.1927 5.95784C11.8312 6.41804 12.3087 7.06748 12.5576 7.81415C12.8065 8.56082 12.8141 9.36687 12.5794 10.1181C12.3448 10.8694 11.8796 11.5278 11.25 12C10.9572 12.2899 10.7367 12.6446 10.6064 13.0355C10.4761 13.4264 10.4397 13.8424 10.5 14.25C10.5 14.6478 10.342 15.0294 10.0607 15.3107C9.77936 15.592 9.39782 15.75 9 15.75C8.60218 15.75 8.22064 15.592 7.93934 15.3107C7.65804 15.0294 7.5 14.6478 7.5 14.25C7.56034 13.8424 7.52389 13.4264 7.3936 13.0355C7.2633 12.6446 7.04282 12.2899 6.75 12Z" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/>
				</svg>
			</div>';
	}

	/**
	 * get_notice_template
	 *
	 * Print or Retrieve the notice template.
	 * @param array $notice
	 * @param bool $return
	 *
	 * @return string|void
	 */
	public static function get_notice_template( array $notice, bool $return = false ) {
		$default_settings = [
			'type' => 'info',
			'icon' => false,
			'heading' => '',
			'content' => '',
			'dismissible' => false,
			'button_text' => '',
			'button_event' => '',
			'button_data' => [],
			'display' => false,
		];
		$notice_settings = array_merge( $default_settings, $notice );

		if ( empty( $notice_settings['heading'] ) && empty( $notice_settings['content'] ) ) {
			return '';
		}

		if ( ! in_array( $notice_settings['type'], self::get_notice_types(), true ) ) {
			$notice_settings['type'] = 'info';
		}

		$icon = '';
		$heading = '';
		$content = '';
		$dismissible = '';
		$button = '';

		if ( $notice_settings['icon'] ) {
			$icon = self::get_notice_icon();
		}

		if ( ! empty( $notice_settings['heading'] ) ) {
			$heading = '<div class="elementor-control-notice-main-heading">' . $notice_settings['heading'] . '</div>';
		}

		if ( ! empty( $notice_settings['content'] ) ) {
			$content = '<div class="elementor-control-notice-main-content">' . $notice_settings['content'] . '</div>';
		}

		if ( ! empty( $notice_settings['button_text'] ) ) {
			$button_settings = ( ! empty( $notice_settings['button_data'] ) ) ? ' data-settings="' . esc_attr( json_encode( $notice_settings['button_data'] ) ) . '"' : '';
			$button = '<div class="elementor-control-notice-main-actions">
				<button type="button" class="e-btn e-' . $notice_settings['type'] . ' e-btn-1" data-event="' . $notice_settings['button_event'] . '"' . $button_settings . '>
					' . $notice_settings['button_text'] . '
				</button>
			</div>';
		}

		if ( $notice_settings['dismissible'] ) {
			$dismissible = '<button class="elementor-control-notice-dismiss" data-event="' . $notice_settings['dismissible'] . '">
				<i class="eicon eicon-close" aria-hidden="true"></i>
				<span class="elementor-screen-only">' . __( 'Dismiss this notice.', 'elementor' ) . '</span>
			</button>';
		}

		$notice_template = sprintf( '<div class="elementor-control-notice elementor-control-notice-type-%1$s" data-display="%7$s">
			%2$s
			<div class="elementor-control-notice-main">
				%3$s
				%4$s
				%5$s
			</div>
			%6$s
		</div>',
			$notice_settings['type'],
			$icon,
			$heading,
			$content,
			$button,
			$dismissible,
			$notice_settings['display']
		);

		if ( $return ) {
			return $notice_template;
		}
		echo wp_kses( $notice_template, self::get_notice_allowed_html() );
	}

	/**
	 * get_plugin_install_url
	 * @param $plugin_slug
	 *
	 * @return string
	 */
	public static function get_plugin_install_url( $plugin_slug ): string {
		$action = 'install-plugin';
		return wp_nonce_url(
			add_query_arg(
				[
					'action' => $action,
					'plugin' => $plugin_slug,
				],
				admin_url( 'update.php' )
			),
			$action . '_' . $plugin_slug
		);
	}

	/**
	 * get_plugin_activate_url
	 * @param $plugin_slug
	 *
	 * @return string
	 */
	public static function get_plugin_activate_url( $plugin_slug ): string {
		return admin_url( 'plugins.php' );
	}

	/**
	 * is_dismissed
	 * @param $key
	 *
	 * @return bool
	 */
	public static function is_dismissed( $key ): bool {
		$dismissed = User::get_dismissed_editor_notices();
		return in_array( $key, $dismissed, true );
	}

	/**
	 * should_display_hint
	 * @param $hint_key
	 *
	 * @return bool
	 */
	public static function should_display_hint( $hint_key ): bool {
		$hint = self::get_hints( $hint_key );
		if ( empty( $hint ) ) {
			return false;
		}

		foreach ( $hint as $key => $value ) {
			switch ( $key ) {
				case self::DISMISSED:
					if ( self::is_dismissed( $value ) ) {
						return false;
					}
					break;
				case self::CAPABILITY:
					if ( ! current_user_can( $value ) ) {
						return false;
					}
					break;
				case self::DEFINED:
					if ( defined( $value ) ) {
						return false;
					}
					break;
				case self::PLUGIN_INSTALLED:
					if ( ! self::is_plugin_installed( $value ) ) {
						return false;
					}
					break;
				case self::PLUGIN_ACTIVE:
					if ( ! self::is_plugin_active( $value ) ) {
						return false;
					}
					break;
			}
		}
		return true;
	}

	/**
	 * is_plugin_installed
	 * @param $plugin
	 *
	 * @return bool
	 */
	public static function is_plugin_installed( $plugin ) : bool {
		$plugins = get_plugins();
		$plugin = self::ensure_plugin_folder( $plugin );
		return ! empty( $plugins[ $plugin ] );
	}

	/**
	 * is_plugin_active
	 * @param $plugin
	 *
	 * @return bool
	 */
	public static function is_plugin_active( $plugin ): bool {
		$plugin = self::ensure_plugin_folder( $plugin );
		return is_plugin_active( $plugin );
	}

	/**
	 * get_plugin_action_url
	 * @param $plugin
	 *
	 * @return string
	 */
	public static function get_plugin_action_url( $plugin ): string {
		if ( ! self::is_plugin_installed( $plugin ) ) {
			return self::get_plugin_install_url( $plugin );
		}

		if ( ! self::is_plugin_active( $plugin ) ) {
			return self::get_plugin_activate_url( $plugin );
		}

		return '';
	}

	/**
	 * ensure_plugin_folder
	 * @param $plugin
	 *
	 * @return string
	 */
	private static function ensure_plugin_folder( $plugin ): string {
		if ( false === strpos( $plugin, '/' ) ) {
			$plugin = $plugin . '/' . $plugin . '.php';
		}
		return $plugin;
	}

	/**
	 * get_notice_allowed_html
	 * @return array[]
	 */
	public static function get_notice_allowed_html(): array {
		return [
			'div' => [
				'class' => [],
				'data-display' => [],
			],
			'svg' => [
				'width' => [],
				'height' => [],
				'viewbox' => [],
				'fill' => [],
				'xmlns' => [],
			],
			'path' => [
				'd' => [],
				'stroke' => [],
				'stroke-width' => [],
				'stroke-linecap' => [],
				'stroke-linejoin' => [],
			],
			'button' => [
				'class' => [],
				'data-event' => [],
				'data-settings' => [],
			],
			'i' => [
				'class' => [],
				'aria-hidden' => [],
			],
			'span' => [
				'class' => [],
			],
			'a' => [
				'href' => [],
				'style' => [],
			],
		];
	}
}
