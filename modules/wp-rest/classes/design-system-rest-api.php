<?php

namespace Elementor\Modules\WpRest\Classes;

use Elementor\App\Modules\SiteBuilder\Services\Design_System_Service;
use Elementor\Core\Utils\Api\Error_Builder;
use Elementor\Core\Utils\Api\Response_Builder;
use Elementor\Plugin;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Design_System_REST_API {

	const API_NAMESPACE = 'elementor/v1';
	const API_BASE = 'site-builder/deploy-design-system';

	private Design_System_Service $service;

	public function __construct( ?Design_System_Service $service = null ) {
		$this->service = $service ?? new Design_System_Service();
	}

	public function register(): void {
		register_rest_route( self::API_NAMESPACE, '/' . self::API_BASE, [
			[
				'methods' => \WP_REST_Server::CREATABLE,
				'callback' => [ $this, 'deploy' ],
				'permission_callback' => [ $this, 'check_permissions' ],
				'args' => $this->get_endpoint_args(),
			],
		] );
	}

	public function check_permissions() {
		return current_user_can( 'manage_options' );
	}

	public function deploy( \WP_REST_Request $request ) {
		$global_classes = $request->get_param( 'globalClasses' );
		$global_variables = $request->get_param( 'globalVariables' );

		if ( empty( $global_classes ) && empty( $global_variables ) ) {
			return Error_Builder::make( 'invalid_payload' )
				->set_status( 400 )
				->set_message( esc_html__( 'Either globalClasses or globalVariables must be provided.', 'elementor' ) )
				->build();
		}

		try {
			$results = [];

			if ( ! empty( $global_classes ) ) {
				$results['globalClasses'] = $this->service->deploy_global_classes( $global_classes );
			}

			if ( ! empty( $global_variables ) ) {
				$results['globalVariables'] = $this->service->deploy_global_variables( $global_variables );
			}

			return Response_Builder::make( $results )->build();
		} catch ( \Exception $e ) {
			return $this->handle_unexpected_error( $e );
		}
	}

	private function handle_unexpected_error( \Exception $e ) {
		Plugin::$instance->logger->get_logger()->error( $e->getMessage(), [
			'meta' => [ 'trace' => $e->getTraceAsString() ],
		] );

		return Error_Builder::make( 'design_system_deploy_failed' )
			->set_status( 500 )
			->set_message( esc_html__( 'Something went wrong', 'elementor' ) )
			->build();
	}

	private function get_endpoint_args() {
		return [
			'globalClasses' => [
				'type' => 'object',
				'required' => false,
				'properties' => [
					'items' => [
						'type' => 'object',
						'required' => true,
					],
					'order' => [
						'type' => 'array',
						'required' => true,
						'items' => [ 'type' => 'string' ],
					],
				],
			],
			'globalVariables' => [
				'type' => 'object',
				'required' => false,
				'properties' => [
					'data' => [
						'type' => 'object',
						'required' => true,
					],
					'watermark' => [
						'type' => 'integer',
						'required' => false,
					],
					'version' => [
						'type' => 'integer',
						'required' => false,
					],
				],
			],
		];
	}
}
