<?php

namespace Elementor\Modules\Mcp\Abilities\Utils;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Woocommerce_Settings_Schema {

	const ACTION_GET = 'get';
	const ACTION_UPDATE = 'update';

	const ACTIONS = [ self::ACTION_GET, self::ACTION_UPDATE ];

	const PAGES = [ 'cart', 'checkout', 'my_account', 'terms', 'shop', 'purchase_summary' ];

	public static function manage_input(): array {
		return [
			'type' => 'object',
			'required' => [ 'action' ],
			'properties' => [
				'action' => [
					'type' => 'string',
					'enum' => self::ACTIONS,
					'description' => '"get" reads the current store pages. "update" assigns the pages in "pages".',
				],
				'pages' => [
					'type' => 'object',
					'description' => 'update only. Map of store page to a published page ID, for example { "cart": 12, "checkout": 13 }. Pass only the pages to change.',
					'properties' => array_fill_keys( self::PAGES, [ 'type' => 'integer' ] ),
					'additionalProperties' => false,
				],
			],
		];
	}
}
