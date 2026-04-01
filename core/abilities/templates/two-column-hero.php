<?php
/**
 * Template: two-column-hero
 *
 * Produces an outer row container with two column containers.
 * Left column: heading + paragraph. Right column: paragraph.
 *
 * Params:
 *   heading    (string) — left-column heading text. Default: 'Your Headline Here'.
 *   subheading (string) — left-column paragraph text. Default: 'Add your description.'.
 *   col2_text  (string) — right-column paragraph text. Default: 'Supporting content goes here.'.
 *   classes    (array)  — class IDs to apply to the outer container.
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

return function ( array $params ): array {
	$uid = fn() => sprintf( '%08x', mt_rand() );

	$heading    = $params['heading']    ?? 'Your Headline Here';
	$subheading = $params['subheading'] ?? 'Add your description.';
	$col2_text  = $params['col2_text']  ?? 'Supporting content goes here.';
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
					'id'       => $uid(),
					'elType'   => 'container',
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
					],
				],
				[
					'id'       => $uid(),
					'elType'   => 'container',
					'settings' => [],
					'elements' => [
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
											'value'  => $col2_text,
										],
										'children' => [],
									],
								],
							],
							'elements'   => [],
						],
					],
				],
			],
		],
	];
};
