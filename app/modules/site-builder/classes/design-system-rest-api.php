<?php
namespace Elementor\App\Modules\SiteBuilder\Classes;

use Elementor\Core\Utils\Api\Error_Builder;
use Elementor\Core\Utils\Api\Response_Builder;
use Elementor\Modules\GlobalClasses\Global_Classes_Repository;
use Elementor\Modules\Variables\Storage\Constants as Variables_Constants;
use Elementor\Plugin;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Design_System_REST_API {


	const API_NAMESPACE = 'elementor/v1';
	const API_BASE = 'site-builder/deploy-design-system';

	public function register_hooks() {
		add_action( 'rest_api_init', fn() => $this->register_routes() );
	}

	private function register_routes() {
		register_rest_route(self::API_NAMESPACE, '/' . self::API_BASE, [
			[
				'methods' => 'POST',
				'callback' => fn( $request ) => $this->route_wrapper( fn() => $this->deploy( $request ) ),
				'permission_callback' => fn() => current_user_can( 'manage_options' ),
				'args' => [
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
				],
			],
		]);
	}

	private function deploy( \WP_REST_Request $request ) {
		$global_classes = $request->get_param( 'globalClasses' );
		$global_variables = $request->get_param( 'globalVariables' );

		if ( empty( $global_classes ) && empty( $global_variables ) ) {
			return Error_Builder::make( 'invalid_payload' )
				->set_status( 400 )
				->set_message( 'Either globalClasses or globalVariables must be provided.' )
				->build();
		}

		$results = [];

		if ( ! empty( $global_classes ) ) {
			$this->write_global_classes( $global_classes );
			$results['globalClasses'] = [
				'items' => count( $global_classes['items'] ?? [] ),
				'order' => count( $global_classes['order'] ?? [] ),
			];
		}

		if ( ! empty( $global_variables ) ) {
			$this->write_global_variables( $global_variables );
			$results['globalVariables'] = [
				'data' => count( $global_variables['data'] ?? [] ),
				'watermark' => (int) ( $global_variables['watermark'] ?? 0 ),
				'version' => (int) ( $global_variables['version'] ?? 1 ),
			];
		}

		return Response_Builder::make( $results )->build();
	}

	private function write_global_classes( array $global_classes ): void {
		$items = isset( $global_classes['items'] ) && is_array( $global_classes['items'] )
			? $global_classes['items']
			: [];
		$order = isset( $global_classes['order'] ) && is_array( $global_classes['order'] )
			? array_values( $global_classes['order'] )
			: [];

		Global_Classes_Repository::make()
			->context( Global_Classes_Repository::CONTEXT_FRONTEND )
			->put( $items, $order );
	}

	private function write_global_variables( array $global_variables ): void {
		$kit = Plugin::$instance->kits_manager->get_active_kit();

		if ( ! $kit ) {
			throw new \Exception( 'No active kit found' );
		}

		$record = [
			'data' => isset( $global_variables['data'] ) && is_array( $global_variables['data'] )
				? $global_variables['data']
				: [],
			'watermark' => (int) ( $global_variables['watermark'] ?? 0 ),
			'version' => (int) ( $global_variables['version'] ?? 1 ),
		];

		$result = $kit->update_json_meta( Variables_Constants::VARIABLES_META_KEY, $record );

		if ( false === $result ) {
			throw new \Exception( 'Failed to update global variables' );
		}
	}

	private function route_wrapper( callable $cb ) {
		try {
			return $cb();
		} catch ( \Exception $e ) {
			Plugin::$instance->logger->get_logger()->error($e->getMessage(), [
				'meta' => [ 'trace' => $e->getTraceAsString() ],
			]);

			return Error_Builder::make( 'design_system_deploy_failed' )
				->set_status( 500 )
				->set_message( esc_html__( 'Something went wrong', 'elementor' ) )
				->build();
		}
	}
}
