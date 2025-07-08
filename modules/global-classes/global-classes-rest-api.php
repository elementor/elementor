<?php

namespace Elementor\Modules\GlobalClasses;

use Elementor\Modules\Global_Classes\Usage\Applied_Global_Classes_Usage;
use Elementor\Modules\GlobalClasses\Utils\Error_Builder;
use Elementor\Modules\GlobalClasses\Utils\Response_Builder;
use Elementor\Modules\GlobalClasses\Database\Migrations\Add_Capabilities;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Global_Classes_REST_API {
	const API_NAMESPACE = 'elementor/v1';
	const API_BASE = 'global-classes';
	const API_BASE_USAGE = self::API_BASE . '-usage';
	const MAX_ITEMS = 50;

	private $repository = null;

	public function register_hooks() {
		add_action( 'rest_api_init', fn() => $this->register_routes() );
	}

	private function get_repository() {
		if ( ! $this->repository ) {
			$this->repository = new Global_Classes_Repository();
		}
		return $this->repository;
	}

	private function register_routes() {
		register_rest_route( self::API_NAMESPACE, '/' . self::API_BASE, array(
			array(
				'callback' => fn( $request ) => $this->route_wrapper( fn() => $this->all( $request ) ),
				'permission_callback' => fn() => true,
				'args' => array(
					'context' => array(
						'type' => 'string',
						'required' => false,
						'default' => Global_Classes_Repository::CONTEXT_FRONTEND,
						'enum' => array(
							Global_Classes_Repository::CONTEXT_FRONTEND,
							Global_Classes_Repository::CONTEXT_PREVIEW,
						),
					),
				),
				'callback' => fn( $request ) => $this->route_wrapper( fn() => $this->all( $request ) ),
				'permission_callback' => fn() => true,
				'args' => array(),
			),
		) );

		register_rest_route( self::API_NAMESPACE, '/' . self::API_BASE_USAGE, array(
			array(
				'callback' => fn( $request ) => $this->route_wrapper( fn() => $this->get_usage( $request ) ),
				'permission_callback' => fn() => current_user_can( 'manage_options' ),
				'args' => array(
					'context' => array(
						'type' => 'string',
						'required' => false,
						'default' => Global_Classes_Repository::CONTEXT_FRONTEND,
						'enum' => array(
							Global_Classes_Repository::CONTEXT_FRONTEND,
							Global_Classes_Repository::CONTEXT_PREVIEW,
						),
					),
				),
			),
		) );

		register_rest_route( self::API_NAMESPACE, '/' . self::API_BASE, array(
			array(
				'callback' => fn( $request ) => $this->route_wrapper( fn() => $this->put( $request ) ),
				'permission_callback' => fn() => current_user_can( Add_Capabilities::UPDATE_CLASS ),
				'args' => array(
					'context' => array(
						'type' => 'string',
						'required' => false,
						'default' => Global_Classes_Repository::CONTEXT_FRONTEND,
						'enum' => array(
							Global_Classes_Repository::CONTEXT_FRONTEND,
							Global_Classes_Repository::CONTEXT_PREVIEW,
						),
					),
					'changes' => array(
						'type' => 'object',
						'required' => true,
						'additionalProperties' => false,
						'properties' => array(
							'added' => array(
								'type' => 'array',
								'required' => true,
								'items' => array( 'type' => 'string' ),
							),
							'deleted' => array(
								'type' => 'array',
								'required' => true,
								'items' => array( 'type' => 'string' ),
							),
							'modified' => array(
								'type' => 'array',
								'required' => true,
								'items' => array( 'type' => 'string' ),
							),
						),
					),
					'items' => array(
						'required' => true,
						'type' => 'object',
						'additionalProperties' => array(
							'type' => 'object',
							'properties' => array(
								'id' => array(
									'type' => 'string',
									'required' => true,
								),
								'variants' => array(
									'type' => 'array',
									'required' => true,
								),
								'type' => array(
									'type' => 'string',
									'enum' => array( 'class' ),
									'required' => true,
								),
								'label' => array(
									'type' => 'string',
									'required' => true,
								),
							),
						),
					),
					'order' => array(
						'required' => true,
						'type' => 'array',
						'items' => array( 'type' => 'string' ),
					),
				),
			),
		) );
	}

	private function all( \WP_REST_Request $request ) {
		$context = $request->get_param( 'context' );
		$classes = $this->get_repository()->context( $context )->all();
		return Response_Builder::make( (object) $classes->get_items()->all() )
								->set_meta( array( 'order' => $classes->get_order()->all() ) )
								->build();
	}

	private function get_usage( \WP_REST_Request $request ) {
		$with_page_info = filter_var( $request->get_param( 'with_page_info' ), FILTER_VALIDATE_BOOLEAN );
		$classes_usage = ( new Applied_Global_Classes_Usage() )->get_detailed_usage( $with_page_info );
		return Response_Builder::make( (object) $classes_usage )->build();
	}

	private function put( \WP_REST_Request $request ) {
		$parser = Global_Classes_Parser::make();
		$items_result = $parser->parse_items( $request->get_param( 'items' ) );
		$items_count = count( $items_result->unwrap() );

		if ( $items_count >= static::MAX_ITEMS ) {
			return Error_Builder::make( 'global_classes_limit_exceeded' )
								->set_status( 400 )
								->set_message( sprintf( __( 'Global classes limit exceeded. Maximum allowed: %d', 'elementor' ), static::MAX_ITEMS ) )
								->build();
		}

		if ( ! $items_result->is_valid() ) {
			return Error_Builder::make( 'invalid_items' )
								->set_status( 400 )
								->set_message( 'Invalid items: ' . $items_result->errors()->to_string() )
								->build();
		}

		$order_result = $parser->parse_order( $request->get_param( 'order' ), $items_result->unwrap() );

		if ( ! $order_result->is_valid() ) {
			return Error_Builder::make( 'invalid_order' )
								->set_status( 400 )
								->set_message( 'Invalid order: ' . $order_result->errors()->to_string() )
								->build();
		}

		$repository = $this->get_repository()->context( $request->get_param( 'context' ) );

		$changes_resolver = Global_Classes_Changes_Resolver::make(
			$repository,
			$request->get_param( 'changes' ) ?? array()
		);

		$repository->put(
			$changes_resolver->resolve_items( $items_result->unwrap() ),
			$changes_resolver->resolve_order( $order_result->unwrap() )
		);

		return Response_Builder::make()->no_content()->build();
	}

	private function route_wrapper( callable $cb ) {
		try {
			$response = $cb();
		} catch ( \Exception $e ) {
			return Error_Builder::make( 'unexpected_error' )
								->set_message( __( 'Something went wrong', 'elementor' ) )
								->build();
		}
		return $response;
	}
}
