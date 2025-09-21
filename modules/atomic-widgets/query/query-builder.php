<?php

namespace Elementor\Modules\AtomicWidgets\Query;

use Elementor\Modules\WpRest\Base\Query as Query_Base;
use Elementor\Modules\WpRest\Classes\Post_Query;
use Elementor\Modules\WpRest\Classes\Term_Query;
use Elementor\Modules\WpRest\Classes\User_Query;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Query_Builder {
	const QUERY_TYPE_KEY = 'query_type';

	public static function build( ?array $config = [] ): array {
		$map = [
			Post_Query::ENDPOINT => [ self::class, 'build_post_query' ],
			Term_Query::ENDPOINT => [ self::class, 'build_term_query' ],
			User_Query::ENDPOINT => [ self::class, 'build_user_query' ],
		];

		$query_type = $config[ self::QUERY_TYPE_KEY ] ?? Post_Query::ENDPOINT;

		if ( ! isset( $map[ $query_type ] ) ) {
			throw new \Exception( 'Query type is not supported' );
		}

		return $map[ $query_type ]( $config );
	}

	private static function build_post_query( ?array $config = [] ): array {
		$params = Post_Query::build_query_params( [
			Post_Query::KEYS_CONVERSION_MAP_KEY => $config[ Query_Base::KEYS_CONVERSION_MAP_KEY ] ?? null,
			Post_Query::INCLUDED_TYPE_KEY => $config[ Query_Base::INCLUDED_TYPE_KEY ] ?? null,
			Post_Query::EXCLUDED_TYPE_KEY => $config[ Query_Base::EXCLUDED_TYPE_KEY ] ?? null,
			Post_Query::META_QUERY_KEY => $config[ Query_Base::META_QUERY_KEY ] ?? null,
			Post_Query::IS_PUBLIC_KEY => $config[ Query_Base::IS_PUBLIC_KEY ] ?? null,
			Post_Query::ITEMS_COUNT_KEY => $config[ Query_Base::ITEMS_COUNT_KEY ] ?? null,
		] );

		$endpoint = $config['endpoint'] ?? Post_Query::ENDPOINT;
		$namespace = $config['namespace'] ?? Post_Query::NAMESPACE;
		$url = $namespace . '/' . $endpoint;

		return [
			'params' => $params,
			'url' => $url,
		];
	}

	private static function build_term_query( ?array $config = [] ): array {
		$params = Term_Query::build_query_params( [
			Term_Query::KEYS_CONVERSION_MAP_KEY => $config[ Query_Base::KEYS_CONVERSION_MAP_KEY ] ?? null,
			Term_Query::INCLUDED_TYPE_KEY => $config[ Query_Base::INCLUDED_TYPE_KEY ] ?? null,
			Term_Query::EXCLUDED_TYPE_KEY => $config[ Query_Base::EXCLUDED_TYPE_KEY ] ?? null,
			Term_Query::META_QUERY_KEY => $config[ Query_Base::META_QUERY_KEY ] ?? null,
			Term_Query::IS_PUBLIC_KEY => $config[ Query_Base::IS_PUBLIC_KEY ] ?? null,
			Term_Query::HIDE_EMPTY_KEY => $config[ Query_Base::HIDE_EMPTY_KEY ] ?? null,
			Term_Query::FIELDS_KEY => $config[ Query_Base::FIELDS_KEY ] ?? null,
			Term_Query::ITEMS_COUNT_KEY => $config[ Query_Base::ITEMS_COUNT_KEY ] ?? null,
		] );

		$endpoint = $config['endpoint'] ?? Term_Query::ENDPOINT;
		$namespace = $config['namespace'] ?? Term_Query::NAMESPACE;
		$url = $namespace . '/' . $endpoint;

		return [
			'params' => $params,
			'url' => $url,
		];
	}

	private static function build_user_query( ?array $config = [] ): array {
		$params = User_Query::build_query_params( [
			User_Query::KEYS_CONVERSION_MAP_KEY => $config[ Query_Base::KEYS_CONVERSION_MAP_KEY ] ?? null,
			User_Query::INCLUDED_TYPE_KEY => $config[ Query_Base::INCLUDED_TYPE_KEY ] ?? null,
			User_Query::EXCLUDED_TYPE_KEY => $config[ Query_Base::EXCLUDED_TYPE_KEY ] ?? null,
			User_Query::META_QUERY_KEY => $config[ Query_Base::META_QUERY_KEY ] ?? null,
			User_Query::FIELDS_KEY => $config[ Query_Base::FIELDS_KEY ] ?? null,
			User_Query::ITEMS_COUNT_KEY => $config[ Query_Base::ITEMS_COUNT_KEY ] ?? null,
		] );

		$endpoint = $config['endpoint'] ?? User_Query::ENDPOINT;
		$namespace = $config['namespace'] ?? User_Query::NAMESPACE;
		$url = $namespace . '/' . $endpoint;

		return [
			'params' => $params,
			'url' => $url,
		];
	}
}
