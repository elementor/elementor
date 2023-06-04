<?php
namespace Elementor\App\Modules\Onboarding;

use Elementor\App\Modules\Onboarding\Data\Controller;
use Elementor\Core\Base\Module as BaseModule;
use Elementor\Core\Common\Modules\Connect\Apps\Library;
use Elementor\Core\Files\Uploads_Manager;
use Elementor\Plugin;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}

/**
 * Onboarding Module
 *
 * Responsible for initializing Elementor App functionality
 *
 * @since 3.6.0
 */
class Module extends BaseModule {

	const VERSION = '1.0.0';
	const ONBOARDING_OPTION = 'elementor_onboarded';

	/**
	 * Get name.
	 *
	 * @since 3.6.0
	 * @access public
	 *
	 * @return string
	 */
	public function get_name() {
		return 'onboarding';
	}

	/**
	 * Set Onboarding Settings
	 *
	 * Creates an array of module settings that is localized into the JS App config.
	 *
	 * @since 3.6.0
	 */
	private function set_onboarding_settings() {
		if ( ! Plugin::$instance->common ) {
			return;
		}

		// Get the published pages and posts
		$pages_and_posts = new \WP_Query( [
			'post_type' => [ 'page', 'post' ],
			'post_status' => 'publish',
			'update_post_meta_cache' => false,
			'update_post_term_cache' => false,
			'no_found_rows' => true,
		] );

		$custom_site_logo_id = get_theme_mod( 'custom_logo' );
		$custom_logo_src = wp_get_attachment_image_src( $custom_site_logo_id, 'full' );
		$site_name = get_option( 'blogname', '' );

		$hello_theme = wp_get_theme( 'hello-elementor' );
		$hello_theme_errors = is_object( $hello_theme->errors() ) ? $hello_theme->errors()->errors : [];

		/** @var Library $library */
		$library = Plugin::$instance->common->get_component( 'connect' )->get_app( 'library' );

		Plugin::$instance->app->set_settings( 'onboarding', [
			'eventPlacement' => 'Onboarding wizard',
			'onboardingAlreadyRan' => get_option( self::ONBOARDING_OPTION ),
			'onboardingVersion' => self::VERSION,
			'isLibraryConnected' => $library->is_connected(),
			// Used to check if the Hello Elementor theme is installed but not activated.
			'helloInstalled' => empty( $hello_theme_errors['theme_not_found'] ),
			'helloActivated' => 'hello-elementor' === get_option( 'template' ),
			// The "Use Hello theme on my site" checkbox should be checked by default only if this condition is met.
			'helloOptOut' => count( $pages_and_posts->posts ) < 5,
			'siteName' => esc_html( $site_name ),
			'isUnfilteredFilesEnabled' => Uploads_Manager::are_unfiltered_uploads_enabled(),
			'urls' => [
				'kitLibrary' => Plugin::$instance->app->get_base_url() . '#/kit-library?order[direction]=desc&order[by]=featuredIndex',
				'createNewPage' => Plugin::$instance->documents->get_create_new_post_url(),
				'connect' => $library->get_admin_url( 'authorize', [
					'utm_source' => 'onboarding-wizard',
					'utm_campaign' => 'connect-account',
					'utm_medium' => 'wp-dash',
					'utm_term' => self::VERSION,
					'source' => 'generic',
				] ),
				'signUp' => $library->get_admin_url( 'authorize', [
					'utm_source' => 'onboarding-wizard',
					'utm_campaign' => 'connect-account',
					'utm_medium' => 'wp-dash',
					'utm_term' => self::VERSION,
					'source' => 'generic',
					'screen_hint' => 'signup',
				] ),
				'uploadPro' => Plugin::$instance->app->get_base_url() . '#/onboarding/uploadAndInstallPro?mode=popup',
			],
			'siteLogo' => [
				'id' => $custom_site_logo_id,
				'url' => $custom_logo_src ? $custom_logo_src[0] : '',
			],
			'utms' => [
				'connectTopBar' => '&utm_content=top-bar',
				'connectCta' => '&utm_content=cta-button',
				'connectCtaLink' => '&utm_content=cta-link',
				'downloadPro' => '?utm_source=onboarding-wizard&utm_campaign=my-account-subscriptions&utm_medium=wp-dash&utm_content=import-pro-plugin&utm_term=' . self::VERSION,
			],
			'nonce' => wp_create_nonce( 'onboarding' ),
		] );
	}

	public function __construct() {
		new Controller();

		add_action( 'elementor/init', function() {
			// Only load when viewing the onboarding app.
			if ( Plugin::$instance->app->is_current() ) {
				$this->set_onboarding_settings();
				// Needed for installing the Hello Elementor theme.
				wp_enqueue_script( 'updates' );
				// Needed for uploading Logo from WP Media Library.
				wp_enqueue_media();
			}
		}, 12 );

		// Needed for uploading Logo from WP Media Library. The 'admin_menu' hook is used because it runs before
		// 'admin_init', and the App triggers printing footer scripts on 'admin_init' at priority 0.
		add_action( 'admin_menu', function () {
			add_action( 'wp_print_footer_scripts', function () {
				if ( function_exists( 'wp_print_media_templates' ) ) {
					wp_print_media_templates();
				}
			} );
		} );
	}
}
