<?php
/*
 * Template: card-grid
 *
 * Produces an outer e-flexbox container containing card e-flexbox containers,
 * each with a heading and a paragraph.
 *
 * Params:
 *   cards   (array) — array of { heading, body }. Default: 3 placeholder cards. Max 6.
 *   classes (array) — class IDs to apply to the outer container.
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

return function ( array $params ): array {
	$uid = fn() => sprintf( '%08x', wp_rand() );

	$classes = $params['classes'] ?? [];
	$default_cards = [
		[
			'heading' => 'Feature One',
			'body'    => 'Describe this feature or benefit in a short sentence.',
		],
		[
			'heading' => 'Feature Two',
			'body'    => 'Describe this feature or benefit in a short sentence.',
		],
		[
			'heading' => 'Feature Three',
			'body'    => 'Describe this feature or benefit in a short sentence.',
		],
	];

	$cards = $params['cards'] ?? $default_cards;
	$cards = array_slice( (array) $cards, 0, 6 );

	$card_elements = [];
	foreach ( $cards as $card ) {
		$card_heading = $card['heading'] ?? 'Card Heading';
		$card_body    = $card['body'] ?? 'Card body text goes here.';

		$card_elements[] = [
			'id'       => $uid(),
			'elType'   => 'e-flexbox',
			'settings' => [],
			'elements' => [
				[
					'id'         => $uid(),
					'elType'     => 'widget',
					'widgetType' => 'e-heading',
					'settings'   => [
						'tag'   => [
							'$$type' => 'string',
							'value'  => 'h3',
						],
						'title' => [
							'$$type' => 'html-v3',
							'value'  => [
								'content'  => [
									'$$type' => 'string',
									'value'  => $card_heading,
								],
								'children' => [],
							],
						],
					],
					'elements'   => [],
				],
				[
					'id'         => $uid(),
					'elType'     => 'widget',
					'widgetType' => 'e-paragraph',
					'settings'   => [
						'paragraph' => [
							'$$type' => 'html-v3',
							'value'  => [
								'content'  => [
									'$$type' => 'string',
									'value'  => $card_body,
								],
								'children' => [],
							],
						],
					],
					'elements'   => [],
				],
			],
		];
	}

	return [
		[
			'id'       => $uid(),
			'elType'   => 'e-flexbox',
			'settings' => [
				'classes' => [
					'$$type' => 'classes',
					'value'  => $classes,
				],
			],
			'elements' => $card_elements,
		],
	];
};
