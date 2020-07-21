<?php

namespace Elementor\Data\Common\Bulk\Endpoints;

use Elementor\Data\Base\Endpoint;
use Elementor\Data\Manager;
use WP_Error;

class Index extends Endpoint {

	public function get_name() {
		return 'index';
	}

	public function get_items( $request ) {
		$result = [];
		$commands = $request->get_param( 'commands' );

		if ( ! $commands || ! is_array( $commands ) ) {
			return new WP_Error( 'invalid_query_param', "Invalid query parameter: 'commands'.", [ 'status' => 400 ] );
		}

		foreach ( $commands as $command ) {
			$command = explode( ':', $command );
			$command_namespace = $command[0];
			$command_query = $command[1];

			$query = wp_parse_url( $command_query, PHP_URL_QUERY );

			if ( $query ) {
				$command = str_replace( $query, '', $command_query );
			} else {
				$command = $command_query;
			}

			$command = str_replace( '?', '', $command );
			$command = str_replace( '/index', '', $command );

			$args = [];

			parse_str( $query, $args );

			$result[ $command_namespace ] = Manager::instance()->run( $command, $args );
		}

		return $result;
	}

	public function get_permission_callback( $request ) {
		// TODO: Backup by tests, ensure who is the current user.
		// Since handled by `Manager::instance()->run`.
		return true;
	}
}
