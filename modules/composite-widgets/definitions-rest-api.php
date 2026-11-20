<?php

namespace Elementor\Modules\CompositeWidgets;

use Elementor\Core\Utils\Api\Response_Builder;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Definitions_REST_API {
	const API_NAMESPACE = 'elementor/v1';
	const API_BASE = 'composite-widgets';

	/** @var callable(): array */
	private $get_definitions;

	public function __construct( callable $get_definitions ) {
		$this->get_definitions = $get_definitions;
	}

	public function register_hooks(): void {
		add_action( 'rest_api_init', fn () => $this->register_routes() );
	}

	private function register_routes(): void {
		register_rest_route( self::API_NAMESPACE, '/' . self::API_BASE, [
			[
				'methods' => \WP_REST_Server::READABLE,
				'callback' => fn () => Response_Builder::make( ( $this->get_definitions )() )->build(),
				'permission_callback' => fn () => current_user_can( 'edit_posts' ),
			],
		] );
	}
}
