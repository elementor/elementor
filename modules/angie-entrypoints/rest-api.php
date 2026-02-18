<?php

namespace Elementor\Modules\AngieEntrypoints;

use Elementor\Core\Utils\Api\Error_Builder;
use Elementor\Core\Utils\Api\Response_Builder;
use Elementor\Core\Utils\Plugins_Manager;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Rest_Api {
	const API_NAMESPACE = 'elementor/v1';
	const API_BASE = 'angie';

	public function register_hooks() {
		add_action( 'rest_api_init', fn() => $this->register_routes() );
	}

	private function register_routes() {
		register_rest_route( self::API_NAMESPACE, '/' . self::API_BASE . '/install', [
			[
				'methods' => 'POST',
				'callback' => fn() => $this->route_wrapper( fn() => $this->install() ),
				'permission_callback' => fn() => current_user_can( 'install_plugins' ),
			],
		] );

		register_rest_route( self::API_NAMESPACE, '/' . self::API_BASE . '/activate', [
			[
				'methods' => 'POST',
				'callback' => fn() => $this->route_wrapper( fn() => $this->activate() ),
				'permission_callback' => fn() => current_user_can( 'activate_plugins' ),
			],
		] );
	}

	private function install() {
		if ( Module::is_angie_installed() ) {
			return Response_Builder::make( [ 'status' => 'already_installed' ] )->build();
		}

		$plugins_manager = new Plugins_Manager();
		$result = $plugins_manager->install( Module::ANGIE_PLUGIN_PATH );

		if ( ! empty( $result['failed'] ) ) {
			return Error_Builder::make( 'install_failed' )
				->set_status( 500 )
				->set_message( __( 'Failed to install Angie plugin', 'elementor' ) )
				->build();
		}

		return Response_Builder::make( [ 'status' => 'installed' ] )
			->set_status( 201 )
			->build();
	}

	private function activate() {
		if ( ! Module::is_angie_installed() ) {
			return Error_Builder::make( 'not_installed' )
				->set_status( 400 )
				->set_message( __( 'Angie plugin is not installed', 'elementor' ) )
				->build();
		}

		if ( Module::is_angie_active() ) {
			return Response_Builder::make( [ 'status' => 'already_active' ] )->build();
		}

		$plugins_manager = new Plugins_Manager();
		$result = $plugins_manager->activate( Module::ANGIE_PLUGIN_PATH );

		if ( ! empty( $result['failed'] ) ) {
			return Error_Builder::make( 'activation_failed' )
				->set_status( 500 )
				->set_message( __( 'Failed to activate Angie plugin', 'elementor' ) )
				->build();
		}

		return Response_Builder::make( [ 'status' => 'activated' ] )->build();
	}

	private function route_wrapper( callable $cb ) {
		try {
			return $cb();
		} catch ( \Exception $e ) {
			return Error_Builder::make( 'unexpected_error' )
				->set_message( __( 'Something went wrong', 'elementor' ) )
				->build();
		}
	}
}
