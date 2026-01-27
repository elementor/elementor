<?php

namespace Elementor\Modules\DesignSystemSync;

use WP_REST_Request;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Hooks {
	public function register() {
		add_filter(
			'elementor/variables/entity/allowed_fields',
			[ $this, 'add_sync_field' ]
		);

		add_filter(
			'elementor/variables/rest-api/update/args',
			[ $this, 'add_sync_api_arg' ]
		);

		add_filter(
			'elementor/variables/rest-api/update/data',
			[ $this, 'save_sync_flag' ],
			10,
			2
		);
	}

	public function add_sync_field( array $fields ): array {
		$fields[] = 'sync_to_v3';

		return $fields;
	}

	public function add_sync_api_arg( array $args ): array {
		$args['sync_to_v3'] = [
			'required' => false,
			'type' => 'boolean',
		];

		return $args;
	}

	public function save_sync_flag( array $data, WP_REST_Request $request ): array {
		$sync_to_v3 = $request->get_param( 'sync_to_v3' );

		if ( null !== $sync_to_v3 ) {
			$data['sync_to_v3'] = $sync_to_v3;
		}

		return $data;
	}
}
