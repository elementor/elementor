<?php
/**
 * Template: hero-banner
 *
 * Produces a single container with an h1 heading, a paragraph, and a button.
 *
 * Params:
 *   heading    (string) — heading text. Default: 'Welcome'.
 *   subheading (string) — paragraph text. Default: 'Add your description here.'.
 *   cta_text   (string) — button label. Default: 'Get Started'.
 *   classes    (array)  — class IDs to apply to the outer container.
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

return function ( array $params ): array {
	$uid = fn() => sprintf( '%08x', mt_rand() );

	$heading    = $params['heading']    ?? 'Welcome';
	$subheading = $params['subheading'] ?? 'Add your description here.';
	$cta_text   = $params['cta_text']   ?? 'Get Started';
	$classes    = $params['classes']    ?? [];

	return [
		[
			'id'       => $uid(),
			'elType'   => 'container',
			'settings' => [
				'classes' => [
					'$$type' => 'classes',
					'value'  => $classes,
				],
			],
			'elements' => [
				[
					'id'         => $uid(),
					'elType'     => 'widget',
					'widgetType' => 'e-heading',
					'settings'   => [
						'tag'   => [
							'$$type' => 'string',
							'value'  => 'h1',
						],
						'title' => [
							'$$type' => 'html-v3',
							'value'  => [
								'content'  => [
									'$$type' => 'string',
									'value'  => $heading,
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
									'value'  => $subheading,
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
					'widgetType' => 'e-button',
					'settings'   => [
						'text' => [
							'$$type' => 'html-v3',
							'value'  => [
								'content'  => [
									'$$type' => 'string',
									'value'  => $cta_text,
								],
								'children' => [],
							],
						],
					],
					'elements'   => [],
				],
			],
		],
	];
};
