<?php

namespace Elementor\Modules\Promotions;

use Elementor\Core\Base\Document;
use Elementor\User;
use Elementor\Utils;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Conversion_Banner {

	const DEFAULT_SELECTOR = '.wrap h1, .wrap h2';
	const SCRIPT_HANDLE = 'e-conversion-banner';
	const STYLE_HANDLE = 'e-conversion-banner';
	const NONCE_ACTION = 'e_conversion_banner_nonce';
	const OBJECT_NAME = 'eConversionBanner';
	const DISMISS_KEY = 'conversion_banner_go_pro';
	const AJAX_ACTION = 'elementor_dismiss_conversion_banner';
	const CONTAINER_ID = 'e-conversion-banner';
	const UPGRADE_URL = 'https://go.elementor.com/go-pro-wp-admin-upgrade-notice/';
	const BIRTHDAY_PROMOTION_URL = 'https://go.elementor.com/go-pro-wp-admin-upgrad-notice/';

	const HELLO_THEME_CONFIG_FILTER = 'hello-plus-theme/rest/admin-config';
	const THEME_SLUGS = [ 'hello-elementor', 'hello-biz', 'hello-commerce' ];
	const THEME_SETTINGS_PAGE_SUFFIX = '-settings';
	const GO_PRO_TITLE_PREFIX = 'Go Pro';
	const MIN_ELEMENTOR_PAGES_TO_TRIGGER = 2;
	const PENDING_TRANSIENT_KEY = 'elementor_conversion_banner_pages_pending';
	const PENDING_TTL = DAY_IN_SECONDS;
	const UNLOCK_OPTION_KEY = 'elementor_conversion_banner_unlocked';
	const UNLOCK_OPTION_VALUE = '1';

	public function __construct() {
		add_action( 'wp_ajax_' . self::AJAX_ACTION, [ $this, 'ajax_dismiss_banner' ] );

		add_filter( self::HELLO_THEME_CONFIG_FILTER, [ $this, 'suppress_hello_theme_banner' ] );

		add_action( 'current_screen', [ $this, 'maybe_register_banner_hooks' ] );
	}

	public static function register_cache_invalidation_hooks(): void {
		static $hooks_registered = false;

		if ( $hooks_registered ) {
			return;
		}

		$hooks_registered = true;

		add_action( 'added_post_meta', [ self::class, 'maybe_invalidate_pending_cache' ], 10, 4 );
		add_action( 'updated_post_meta', [ self::class, 'maybe_invalidate_pending_cache' ], 10, 4 );
	}

	public static function maybe_invalidate_pending_cache( $meta_id, $post_id, $meta_key, $meta_value ): void {
		if ( Document::BUILT_WITH_ELEMENTOR_META_KEY !== $meta_key ) {
			return;
		}

		if ( self::is_unlocked() ) {
			return;
		}

		delete_transient( self::PENDING_TRANSIENT_KEY );
	}

	public function maybe_register_banner_hooks(): void {
		$placement = $this->get_active_placement();

		if ( empty( $placement ) || ! self::has_min_elementor_pages() ) {
			return;
		}

		add_action( 'in_admin_header', [ $this, 'render_banner_container' ], 11 );
		add_action( 'admin_enqueue_scripts', function () use ( $placement ) {
			$this->enqueue_assets( $placement );
		} );
	}

	public function render_banner_container(): void {
		?>
		<div id="<?php echo esc_attr( self::CONTAINER_ID ); ?>">
			<?php $this->print_banner_markup( true ); ?>
		</div>
		<?php
	}

	public function suppress_hello_theme_banner( $config ) {
		if ( $this->is_request_from_theme_admin_page()
			|| ! ( is_array( $config ) && isset( $config['welcome'] ) )
			|| Utils::has_pro()
		) {
			return $config;
		}

		$title = $config['welcome']['title'] ?? '';

		if ( is_string( $title ) && substr( $title, 0, strlen( self::GO_PRO_TITLE_PREFIX ) ) === self::GO_PRO_TITLE_PREFIX ) {
			$config['welcome'] = [];
		}

		return $config;
	}

	private function is_request_from_theme_admin_page(): bool {
		$referer = wp_get_referer();

		if ( ! $referer ) {
			return false;
		}

		parse_str( (string) wp_parse_url( $referer, PHP_URL_QUERY ), $query_args );

		$page = $query_args['page'] ?? '';

		foreach ( self::THEME_SLUGS as $theme_slug ) {
			if ( $page === $theme_slug || $page === $theme_slug . self::THEME_SETTINGS_PAGE_SUFFIX ) {
				return true;
			}
		}

		return false;
	}

	public function ajax_dismiss_banner(): void {
		try {
			check_ajax_referer( self::NONCE_ACTION, 'nonce' );

			if ( ! $this->is_user_allowed() ) {
				wp_send_json_error( 'Permission denied', 403 );
			}

			User::set_introduction_viewed( [ 'introductionKey' => self::DISMISS_KEY ] );

			wp_send_json_success();

		} catch ( \Exception $e ) {
			wp_send_json_error( 'Failed to dismiss banner', 500 );
		}
	}

	private function enqueue_assets( array $placement ): void {
		$min_suffix = Utils::is_script_debug() ? '' : '.min';

		wp_enqueue_script(
			self::SCRIPT_HANDLE,
			ELEMENTOR_ASSETS_URL . 'js/' . self::SCRIPT_HANDLE . $min_suffix . '.js',
			[ 'wp-util', 'elementor-common' ],
			ELEMENTOR_VERSION,
			true
		);

		wp_set_script_translations( self::SCRIPT_HANDLE, 'elementor' );

		wp_localize_script(
			self::SCRIPT_HANDLE,
			self::OBJECT_NAME,
			[
				'nonce' => wp_create_nonce( self::NONCE_ACTION ),
				'action' => self::AJAX_ACTION,
				'placement' => $placement,
			]
		);

		$this->enqueue_styles();
	}

	private function enqueue_styles(): void {
		wp_enqueue_style(
			self::STYLE_HANDLE,
			ELEMENTOR_ASSETS_URL . 'css/modules/promotions/conversion-banner.css',
			[],
			ELEMENTOR_VERSION
		);
	}

	private function print_banner_markup( bool $dismissable ): void {
		$banner = $this->get_banner_config();

		?>
		<div class="e-conversion-banner__paper">
			<?php if ( $dismissable ) : ?>
				<button type="button" class="e-conversion-banner__dismiss notice-dismiss">
					<span class="screen-reader-text"><?php echo esc_html__( 'Dismiss this notice.', 'elementor' ); ?></span>
				</button>
			<?php endif; ?>
			<div class="e-conversion-banner__content">
				<h2 class="e-conversion-banner__title"><?php echo esc_html( $banner['title'] ); ?></h2>
				<p class="e-conversion-banner__text"><?php echo esc_html( $banner['text'] ); ?></p>
				<div class="e-conversion-banner__actions">
					<?php foreach ( $banner['buttons'] as $button ) : ?>
						<a
							class="e-conversion-banner__button button button-primary"
							href="<?php echo esc_url( $button['link'] ); ?>"
							target="<?php echo esc_attr( $button['target'] ?? '_self' ); ?>"
						><?php echo esc_html( $button['text'] ); ?></a>
					<?php endforeach; ?>
				</div>
			</div>
			<?php if ( ! empty( $banner['image']['src'] ) ) : ?>
				<img
					class="e-conversion-banner__image"
					src="<?php echo esc_url( $banner['image']['src'] ); ?>"
					alt="<?php echo esc_attr( $banner['image']['alt'] ); ?>"
				/>
			<?php endif; ?>
		</div>
		<?php
	}

	private function get_banner_config(): array {
		if ( Utils::is_sale_time() ) {
			return $this->get_birthday_banner_config();
		}

		return [
			'title' => __( 'Elevate your site with Elementor Pro', 'elementor' ),
			'text' => __( 'Access Elementor\'s Theme Builder, Dynamic Content, WooCommerce Builder, Popup Builder, 85+ Pro widgets and more when you upgrade to Pro', 'elementor' ),
			'buttons' => [
				[
					'text' => __( 'Upgrade now', 'elementor' ),
					'link' => self::UPGRADE_URL,
					'target' => '_blank',
				],
			],
			'image' => [
				'src' => '',
				'alt' => __( 'Upgrade to Elementor Pro', 'elementor' ),
			],
		];
	}

	private function get_birthday_banner_config(): array {
		return [
			'title' => __( 'Celebrate 10 years of Elementor', 'elementor' ),
			'text' => __( 'Upgrade your workflow with more capabilities for less. Offer ends June 17.', 'elementor' ),
			'buttons' => [
				[
					'text' => __( 'Get Discounts', 'elementor' ),
					'link' => self::BIRTHDAY_PROMOTION_URL,
					'target' => '_blank',
				],
			],
			'image' => [
				'src' => ELEMENTOR_ASSETS_URL . 'images/decade-birthday.png',
				'alt' => __( 'Celebrate 10 years of Elementor', 'elementor' ),
			],
		];
	}

	public static function should_display_banner(): bool {
		return self::is_user_allowed() && self::should_display();
	}

	private function get_active_placement(): array {
		$current_screen = get_current_screen();

		if ( ! $current_screen ) {
			return [];
		}

		$allowed_pages = $this->get_allowed_admin_pages();

		return $allowed_pages[ $current_screen->id ] ?? [];
	}

	private static function should_display(): bool {
		return ! Utils::has_pro() && ! self::is_dismissed() && self::has_min_elementor_pages();
	}

	private static function is_unlocked(): bool {
		return self::UNLOCK_OPTION_VALUE === get_option( self::UNLOCK_OPTION_KEY );
	}

	private static function has_min_elementor_pages(): bool {
		if ( self::is_unlocked() ) {
			return true;
		}

		if ( get_transient( self::PENDING_TRANSIENT_KEY ) ) {
			return false;
		}

		$query = new \WP_Query( [
			'fields' => 'ids',
			'meta_key' => Document::BUILT_WITH_ELEMENTOR_META_KEY,
			'meta_value' => 'builder',
			'no_found_rows' => true,
			'post_status' => 'any',
			'post_type' => 'any',
			'posts_per_page' => self::MIN_ELEMENTOR_PAGES_TO_TRIGGER,
			'update_post_meta_cache' => false,
			'update_post_term_cache' => false,
		] );

		if ( count( $query->posts ) >= self::MIN_ELEMENTOR_PAGES_TO_TRIGGER ) {
			update_option( self::UNLOCK_OPTION_KEY, self::UNLOCK_OPTION_VALUE, true );
			delete_transient( self::PENDING_TRANSIENT_KEY );

			return true;
		}

		set_transient( self::PENDING_TRANSIENT_KEY, 1, self::PENDING_TTL );

		return false;
	}

	private static function is_user_allowed(): bool {
		return current_user_can( 'manage_options' );
	}

	private static function is_dismissed(): bool {
		return (bool) User::get_introduction_meta( self::DISMISS_KEY );
	}

	private function get_allowed_admin_pages(): array {
		$default = [ 'selector' => self::DEFAULT_SELECTOR ];
		$plugin_pages = [ 'selector' => '.wrap hr.wp-header-end' ];

		return [
			'dashboard' => [ 'selector' => '#wpbody #wpbody-content .wrap h1' ],
			'toplevel_page_elementor' => [
				'selector' => '#e-home-screen',
				'before' => true,
			],
			'elementor_page_elementor-settings' => $default,
			'elementor_page_elementor-tools' => $default,
			'elementor_page_elementor-role-manager' => $default,
			'elementor_page_elementor-element-manager' => [
				'selector' => '.wrap h1, .wrap h3.wp-heading-inline',
			],
			'elementor_page_elementor-system-info' => [
				'selector' => '#wpbody #wpbody-content #elementor-system-info .elementor-system-info-header',
				'before' => true,
			],
			'elementor_library_page_e-floating-buttons' => [
				'selector' => '#wpbody-content .e-landing-pages-empty, .wrap h2',
				'before' => true,
			],
			'edit-e-floating-buttons' => $default,
			'edit-elementor_library' => [
				'selector' => self::DEFAULT_SELECTOR,
				'before' => true,
			],
			'edit-elementor_library_category' => $default,
			'themes' => $default,
			'nav-menus' => $default,
			'theme-editor' => $default,
			'plugins' => $plugin_pages,
			'plugin-install' => $plugin_pages,
			'plugin-editor' => $plugin_pages,
		];
	}
}
