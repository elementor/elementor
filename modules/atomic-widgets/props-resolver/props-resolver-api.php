<?php

namespace Elementor\Modules\AtomicWidgets\Props_Resolver;

use Elementor\Modules\AtomicWidgets\Elements\Atomic_Widget_Base;
use Elementor\Modules\AtomicWidgets\Parsers\Props_Parser;
use Elementor\Modules\AtomicWidgets\PropsResolver\Render_Props_Resolver;
use Elementor\Modules\AtomicWidgets\Utils;
use Elementor\Modules\GlobalClasses\Utils\Error_Builder;
use Elementor\Modules\GlobalClasses\Utils\Response_Builder;
use Elementor\Plugin;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Props_Resolver_API {
	public function register_hooks() {
		add_action( 'rest_api_init', fn() => $this->register_routes() );
	}

	private function register_routes() {
		register_rest_route( 'elementor/v1', '/resolve-props', [
			'methods' => 'POST',
			'callback' => fn( $request ) => $this->resolve_props( $request ),
			'permission_callback' => fn() => current_user_can( 'edit_posts' ),
			'args' => [
				'props' => [
					'type' => 'array',
					'required' => true,
					'items' => [
						'type' => 'object',
						'required' => true,
						'properties' => [
							'key' => [
								'type' => 'string',
								'required' => true,
							],
							'value' => [
								'type' => 'object',
								'required' => true,
								'properties' => [
									'key' => [
										'type' => 'string',
										'required' => true,
									],
									"elementType" => [
										'type' => 'string',
										'required' => false,
									],
									'value' => [
										'type' => 'object',
										'required' => true,
										'properties' => [
											'$$type' => [
												'type' => 'string',
												'required' => true,
											],
											'value' => [
												'type' => 'mixed',
												'required' => true,
											],
										],
									],
								],
							],
						],
					],
				],
				'context' => [
					'type' => 'string',
					'description' => __( 'The context in which the props are resolved.', 'elementor' ),
					'required' => true,
					'enum' => [
						'settings',
						'styles'
					],
				],
			],
		] );
	}

	private function resolve_props( \WP_REST_Request $request ) {
		$context = $request->get_param( 'context' );

		sleep(3);

		try {
			$props = $request->get_param('props') ?? [];

			// Resolve the props
			$resolver = $context === 'settings' ?
				Render_Props_Resolver::for_settings() :
				Render_Props_Resolver::for_styles();

			$final_result = [];

			foreach ( $props as $config ) {
				$key = $config['key'];
				$prop_key = $config['value']['key'];
				$value = $config['value']['value'];
				$element_type = $config['value']['elementType'] ?? null;

				// Get the prop type
				$element = Plugin::$instance->elements_manager->get_element_types( $element_type );
				$widget = Plugin::$instance->widgets_manager->get_widget_types( $element_type );

				$element_instance = $element ?? $widget;

				/** @var $element_instance Atomic_Widget_Base */
				if ( ! Utils::is_atomic( $element_instance ) ) {
					throw new \Exception( __( 'Element type is not atomic', 'elementor' ) );
				}

				$schema = $element_instance::get_props_schema();

				if ( ! array_key_exists( $prop_key, $schema ) ) {
					throw new \Exception( sprintf( __( 'Prop `%s` is not defined in the schema of `%s`.', 'elementor' ), $config['meta']['propKey'], $element_instance->get_name() ) );
				}

				$prop_type = $schema[ $prop_key ];

				$result = Props_Parser::make( [ $prop_key => $prop_type ] )->parse(
					[ $prop_key => $value ]
				);

				if ( ! $result->is_valid() ) {
					throw new \Exception( sprintf(
						__( 'Prop `%s` validation failed: %s', 'elementor' ),
						$prop_key,
						$result->errors()->to_string()
					) );
				}

				$result = $resolver->resolve( [ $prop_key => $prop_type ], [ $prop_key => $value ] );

				$final_result[ $key ] = $result[ $prop_key ];
			}

			return Response_Builder::make( [ 'props' => $final_result ] )->build();

		} catch ( \Exception $e ) {
			return Error_Builder::make( 'unexpected_error' )
				->set_message( __( 'Something went wrong', 'elementor' ) )
				->build();
		}
	}
}
