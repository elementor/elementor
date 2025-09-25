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
			Post_Query::INCLUDED_POST_TYPE_KEY => $config[ Post_Query::INCLUDED_POST_TYPE_KEY ] ?? null,
			Post_Query::EXCLUDED_POST_TYPE_KEYS => $config[ Post_Query::EXCLUDED_POST_TYPE_KEYS ] ?? null,
			Post_Query::META_QUERY_KEY => $config[ Post_Query::META_QUERY_KEY ] ?? null,
			Post_Query::IS_PUBLIC_KEY => $config[ Post_Query::IS_PUBLIC_KEY ] ?? null,
			Post_Query::POSTS_PER_PAGE_KEY => $config[ Post_Query::POSTS_PER_PAGE_KEY ] ?? null,
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
