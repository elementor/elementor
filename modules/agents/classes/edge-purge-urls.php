<?php

namespace Elementor\Modules\Agents\Classes;

use Elementor\Modules\Agents\Components\Discovery\Link_Headers;
use Elementor\Modules\Agents\Components\Discovery\Openapi_Spec;
use Elementor\Modules\Agents\Components\Discovery\Well_Known\Well_Known_Router;
use Elementor\Modules\Agents\Module;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Edge_Purge_Urls {

	const LLMS_FULL_FILENAME = 'llms-full.txt';

	const ROBOTS_FILENAME = 'robots.txt';

	private Well_Known_Router $well_known_router;

	public function __construct( Well_Known_Router $well_known_router ) {
		$this->well_known_router = $well_known_router;
	}

	/**
	 * @return string[]
	 */
	public function get_urls(): array {
		$paths = array_merge(
			[
				Module::LLMS_FILENAME,
				self::LLMS_FULL_FILENAME,
				self::ROBOTS_FILENAME,
				Openapi_Spec::ENDPOINT_SLUG,
				ltrim( Link_Headers::HOMEPAGE_MARKDOWN_PATH, '/' ),
			],
			$this->get_well_known_paths()
		);

		return array_map( fn( string $path ) => home_url( '/' . $path ), $paths );
	}

	private function get_well_known_paths(): array {
		$prefix = ltrim( Well_Known_Router::WELL_KNOWN_PREFIX, '/' );

		return array_map(
			fn( string $slug ) => $prefix . $slug,
			array_keys( $this->well_known_router->get_all_endpoints() )
		);
	}
}
