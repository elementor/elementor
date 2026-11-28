<?php

namespace Elementor\Poc\EState;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

const OUTER_ROOT_ID = 'pocroot';
const INNER_ROOT_ID = 'pocinnr';
const MAX_QTY = 5;

function string_value( string $value ): array {
	return [
		'$$type' => 'string',
		'value' => $value,
	];
}

function number_value( $value ): array {
	return [
		'$$type' => 'number',
		'value' => $value,
	];
}

function dynamic_value( string $tag_name, array $settings = [] ): array {
	return [
		'$$type' => 'dynamic',
		'value' => [
			'name' => $tag_name,
			'settings' => $settings,
		],
	];
}

function state_text( string $key, string $pending_text = '' ): array {
	return dynamic_value( TAG_STATE_KEY, [
		'key' => string_value( $key ),
		'pending_text' => string_value( $pending_text ),
	] );
}

function paragraph( string $id, $paragraph ): array {
	return [
		'id' => $id,
		'elType' => 'widget',
		'widgetType' => 'e-paragraph',
		'settings' => [
			'paragraph' => is_string( $paragraph ) ? [
				'$$type' => 'escaped-html',
				'value' => $paragraph,
			] : $paragraph,
		],
		'elements' => [],
	];
}

function button( string $id, string $text ): array {
	return [
		'id' => $id,
		'elType' => 'widget',
		'widgetType' => 'e-button',
		'settings' => [
			'text' => [
				'$$type' => 'escaped-html',
				'value' => $text,
			],
		],
		'elements' => [],
	];
}

function flexbox( string $id, array $children ): array {
	return [
		'id' => $id,
		'elType' => 'e-flexbox',
		'settings' => [],
		'elements' => $children,
	];
}

function get_tree(): array {
	return flexbox( OUTER_ROOT_ID, [
		paragraph( 'pocqtyl', state_text( 'qty' ) ),
		paragraph( 'poctotl', state_text( 'total', '...' ) ),
		paragraph( 'poctitl', state_text( 'title' ) ),
		paragraph( 'pocstat', '<span data-e-state-key="qty">static marker</span>' ),
		button( 'pocplus', '+' ),
		button( 'pocmins', '-' ),
		flexbox( 'pocsz_s', [ paragraph( 'pocszst', 'S' ) ] ),
		flexbox( 'pocsz_m', [ paragraph( 'pocszmt', 'M' ) ] ),
		flexbox( 'pocsz_l', [ paragraph( 'pocszlt', 'L' ) ] ),
		flexbox( INNER_ROOT_ID, [
			paragraph( 'pocincl', state_text( 'count' ) ),
			button( 'pocincb', 'inner +' ),
		] ),
	] );
}

function get_state_map(): array {
	return [
		OUTER_ROOT_ID => [
			'root' => [
				'schema' => [
					'qty' => 'number',
					'price' => 'number',
					'selected' => 'string',
					'title' => 'string',
				],
				'stored' => [
					'qty' => number_value( 2 ),
					'price' => number_value( 10 ),
					'selected' => string_value( 'm' ),
					'title' => dynamic_value( TAG_SITE_NAME ),
				],
				'plain' => [
					'sizes' => [ 's', 'm', 'l' ],
				],
				'derived' => [
					'total' => [
						'deps' => [ 'qty', 'price' ],
						'selector' => 'total',
					],
					'isMax' => [
						'deps' => [ 'qty' ],
						'selector' => 'isMax',
					],
				],
				'actions' => [ 'increment', 'decrement', 'select', 'invalid' ],
				'max' => MAX_QTY,
			],
		],
		'pocplus' => [ 'on' => [ 'click' => 'increment' ], 'listen' => 'binding' ],
		'pocmins' => [ 'on' => [ 'click' => 'decrement' ], 'listen' => 'x-on' ],
		'pocsz_s' => [ 'item' => 's' ],
		'pocsz_m' => [ 'item' => 'm' ],
		'pocsz_l' => [ 'item' => 'l' ],
		INNER_ROOT_ID => [
			'root' => [
				'schema' => [ 'count' => 'number' ],
				'stored' => [ 'count' => number_value( 0 ) ],
				'plain' => [],
				'derived' => [],
				'actions' => [ 'incrementCount' ],
			],
		],
		'pocincb' => [ 'on' => [ 'click' => 'incrementCount' ], 'listen' => 'binding' ],
	];
}
