<?php
/*
 * Template: two-column-hero
 *
 * Produces an outer row e-flexbox with two column e-flexbox containers.
 * Left column: heading + paragraph + button. Right column: image.
 *
 * Params:
 *   heading    (string) — left-column heading text. Default: 'Your Headline Here'.
 *   subheading (string) — left-column paragraph text. Default: 'Add your description.'.
 *   cta_text   (string) — left-column button label. Default: 'Learn More'.
 *   classes    (array)  — class IDs to apply to the outer container.
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

return function ( array $params ): array {
	$uid = fn() => sprintf( '%08x', wp_rand() );

	$heading    = $params['heading'] ?? 'Your Headline Here';
	$subheading = $params['subheading'] ?? 'Add your description.';
	$cta_text   = $params['cta_text'] ?? 'Learn More';
	$classes    = $params['classes'] ?? [];

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
			'elements' => [
				[
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
				[
					'id'       => $uid(),
					'elType'   => 'e-flexbox',
					'settings' => [],
					'elements' => [
						[
							'id'         => $uid(),
							'elType'     => 'widget',
							'widgetType' => 'e-image',
							'settings'   => [],
							'elements'   => [],
						],
					],
				],
			],
		],
	];
};
