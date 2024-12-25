<?php

namespace Elementor\Modules\Ai\SitePlannerConnect;

defined( 'ABSPATH' ) || exit;

class Module {

	public function __construct() {
		add_action( 'rest_api_init', [ $this, 'on_rest_init' ] );
		add_action( 'admin_menu', [ $this, 'register_menu_page' ], 100 );
		add_filter('rest_prepare_application_password', function ( $response, $item, $request ) {
			if ( $request->get_route() === '/wp/v2/users/me/application-passwords' && is_user_logged_in() ) {
				$user = wp_get_current_user();
				$response->data['user_login'] = $user->user_login;
			}
			return $response;
		}, 10, 3);
	}

	public function on_rest_init(): void {
		( new WpRestApi() )->register();
	}

	public function register_menu_page() {
		add_submenu_page(
			null, // Hidden page
			'App Password Generator',
			'App Password',
			'manage_options',
			'site-planner-password-generator',
			[ $this, 'render_menu_page' ]
		);
	}

	public function render_menu_page() {
		$root_url = 'https://planner.elementor.com';

		ob_start();
		require_once __DIR__ . '/view.php';
		$content = ob_get_clean();
		$vars = [
			'%root_url%' => $root_url,
			'%domain%' => isset( $_SERVER['HTTP_HOST'] ) ? sanitize_key( $_SERVER['HTTP_HOST'] ) : '',
		];

		// phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
		echo strtr( $content, $vars );
	}
}
