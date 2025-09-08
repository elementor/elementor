<?php

namespace Elementor\Modules\AtomicWidgets\Query;

use Elementor\Modules\WpRest\Classes\Post_Query;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Query_Builder {
	public static function build( ?array $config = [] ): array {
		$params = Post_Query::build_query_params( [
			Post_Query::POST_KEYS_CONVERSION_MAP => [
				'ID' => 'id',
				'post_title' => 'label',
				'post_type' => 'groupLabel',
			],
			Post_Query::ALLOWED_POST_TYPES => $config[ 'post_types' ] ?? null,
		] );
		$endpoint = $config['endpoint'] ?? Post_Query::ENDPOINT;
		$namespace = $config['namespace'] ?? Post_Query::NAMESPACE;
		$url = $namespace . '/' . $endpoint;

		return [
			'params' => $params,
			'url' => $url,
		];
	}
}
