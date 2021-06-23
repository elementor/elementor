<?php
namespace Elementor\Modules\Presets\Data\Endpoints;

use Elementor\Data\Base\Endpoint;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Index extends Endpoint {
	public function get_name() {
		return 'index';
	}

	protected function register() {
		$this->register_route(
			'',
			\WP_REST_Server::READABLE,
			function ( $request ) {
				return $this->base_callback( \WP_REST_Server::READABLE, $request, true );
			},
			[]
		);

		$this->register_route(
			'',
			\WP_REST_Server::CREATABLE,
			function ( $request ) {
				return $this->base_callback( \WP_REST_Server::CREATABLE, $request, true );
			},
			[
				'element_type' => [
					'type' => 'string',
					'description' => 'The type of the element (section, column, widget, etc...)',
					'enum' => [
						'section',
						'column',
						'widget',
					],
					'required' => true,
				],
				'widget_type' => [
					'type' => 'string',
					'description' => 'When the element_type is widget',
					'default' => null,
					'required' => false,
				],
				'settings' => [
					'type' => 'object',
					'description' => 'The settings object',
					'required' => true,
				],
				'is_default' => [
					'type' => 'boolean',
					'description' => 'is the preset default',
					'default' => null,
					'required' => false,
				],
			]
		);

//		$this->register_route(
//			'(?P<id>[\d]+)/',
//			\WP_REST_Server::EDITABLE,
//			function ( $request ) {
//				return $this->base_callback( \WP_REST_Server::DELETABLE, $request );
//			},
//			[
//				'id' => [
//					'description' => 'Unique identifier for the object.',
//					'type' => 'string',
//					'required' => true,
//				],
//			]
//		);

//		$this->register_route(
//			'(?P<id>[\d]+)/',
//			\WP_REST_Server::DELETABLE,
//			function ( $request ) {
//				return $this->base_callback( \WP_REST_Server::DELETABLE, $request );
//			},
//			[
//				'id' => [
//					'description' => 'Unique identifier for the object.',
//					'type' => 'string',
//					'required' => true,
//				],
//			]
//		);
	}
}
