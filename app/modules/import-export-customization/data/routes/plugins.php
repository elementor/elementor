<?php
namespace Elementor\App\Modules\ImportExportCustomization\Data\Routes;

use Elementor\Plugin;
use Elementor\App\Modules\ImportExportCustomization\Data\Response;
use Elementor\Utils as ElementorUtils;


if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Plugins extends Base_Route {

	protected function get_route(): string {
		return 'plugins';
	}

	protected function get_method(): string {
		return \WP_REST_Server::READABLE;
	}

	protected function callback( $request ): \WP_REST_Response {
		$installed_plugins = Plugin::$instance->wp->get_plugins();

		$result = $installed_plugins->map( function ( $item, $key ) {
			return [
				'name' => $item['Name'],
				'plugin' => $key,
				'pluginUri' => $item['PluginURI'],
				'version' => $item['Version'],
			];
		} )->all();

		return Response::success( $result );
	}

	protected function get_args(): array {
		return [];
	}
}
