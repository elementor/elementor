<?php

namespace Elementor\Modules\Promotions;

use Elementor\Modules\Promotions\AdminMenuItems\Go_Pro_Promotion_Item;
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
	const BIRTHDAY_PROMOTION_URL = 'https://go.elementor.com/go-pro-wp-admin-upgrad-notice/';

	const HELLO_THEME_CONFIG_FILTER = 'hello-plus-theme/rest/admin-config';

	public function __construct() {
		add_action( 'wp_ajax_' . self::AJAX_ACTION, [ $this, 'ajax_dismiss_banner' ] );

		add_filter( self::HELLO_THEME_CONFIG_FILTER, [ $this, 'suppress_hello_theme_banner' ] );

		add_action( 'current_screen', [ $this, 'maybe_register_banner_hooks' ] );
	}

	public function maybe_register_banner_hooks(): void {
		$placement = $this->get_active_placement();

		if ( empty( $placement ) ) {
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
		if ( ! ( is_array( $config ) && isset( $config['welcome'] ) ) ) {
			return $config;
		}

		if ( Utils::has_pro() ) {
			return $config;
		}

		$config['welcome'] = [];

		return $config;
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
			'title' => esc_html__( 'Go Pro, Go Limitless', 'elementor' ),
			'text' => esc_html__( 'Unlock the theme builder, popup builder, 100+ widgets and more advanced tools to take your website to the next level.', 'elementor' ),
			'buttons' => [
				[
					'text' => esc_html__( 'Upgrade Now', 'elementor' ),
					'link' => Go_Pro_Promotion_Item::get_url(),
					'target' => '_blank',
				],
			],
			'image' => [
				'src' => '',
				'alt' => esc_html__( 'Upgrade to Elementor Pro', 'elementor' ),
			],
		];
	}

	private function get_birthday_banner_config(): array {
		return [
			'title' => esc_html__( 'Celebrate 10 years of Elementor', 'elementor' ),
			'text' => esc_html__( 'Upgrade your workflow with more capabilities for less. Offer ends June 17.', 'elementor' ),
			'buttons' => [
				[
					'text' => esc_html__( 'Get Discounts', 'elementor' ),
					'link' => self::BIRTHDAY_PROMOTION_URL,
					'target' => '_blank',
				],
			],
			'image' => [
				'src' => ELEMENTOR_ASSETS_URL . 'images/decade-birthday.png',
				'alt' => esc_html__( 'Celebrate 10 years of Elementor', 'elementor' ),
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
		return ! Utils::has_pro() && ! self::is_dismissed();
	}

	private static function is_user_allowed(): bool {
		return current_user_can( 'manage_options' );
	}

	private static function is_dismissed(): bool {
		return (bool) User::get_introduction_meta( self::DISMISS_KEY );
	}

	private function get_allowed_admin_pages(): array {
		$default = [ 'selector' => self::DEFAULT_SELECTOR ];

		return [
			'dashboard' => [ 'selector' => '#wpbody #wpbody-content .wrap h1' ],
			'toplevel_page_elementor' => [
				'selector' => '#e-home-screen',
				'before' => true,
			],
			'update-core' => $default,
			'edit-post' => $default,
			'edit-page' => $default,
			'edit-category' => $default,
			'edit-post_tag' => $default,
			'upload' => $default,
			'media' => $default,
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
			'plugins' => $default,
			'plugin-install' => $default,
			'plugin-editor' => $default,
			'users' => $default,
			'user' => $default,
			'profile' => $default,
			'tools' => $default,
			'import' => $default,
			'export' => $default,
			'site-health' => $default,
			'export-personal-data' => $default,
			'erase-personal-data' => $default,
			'options-general' => $default,
			'options-writing' => $default,
			'options-reading' => $default,
			'options-discussion' => $default,
			'options-media' => $default,
			'options-permalink' => $default,
			'options-privacy' => $default,
			'privacy-policy-guide' => $default,
		];
	}
}
