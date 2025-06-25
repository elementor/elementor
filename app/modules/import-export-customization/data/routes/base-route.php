<?php

namespace Elementor\App\Modules\ImportExportCustomization\Data\Routes;

abstract class Base_Route {
	public function __construct() {}

    abstract public function get_route(): string;

    abstract public function get_method(): string;

    abstract public function callback( $request ): \WP_REST_Response;

    public function get_permission_callback(): callable {
        return fn() => current_user_can( 'manage_options' );
    }

    abstract public function get_args(): array;
}
