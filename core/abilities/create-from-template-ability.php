<?php

namespace Elementor\Core\Abilities;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Create_From_Template_Ability extends Abstract_Ability {

	const ALLOWED_TEMPLATES = [
		'hero-banner',
		'two-column-hero',
		'card-grid',
	];

	protected function get_name(): string {
		return 'elementor/create-from-template';
	}

	protected function get_config(): array {
		return [
			'label'       => 'Elementor Create From Template',
			'description' => 'Returns a ready-to-use element tree for a named layout pattern. Pass the result to set-post-content or append-elements.',
			'category'    => 'elementor',
			'input_schema' => [
				'type'       => 'object',
				'properties' => [
					'template' => [
						'type'        => 'string',
						'description' => 'Template name. One of: ' . implode( ', ', self::ALLOWED_TEMPLATES ) . '.',
						'enum'        => self::ALLOWED_TEMPLATES,
					],
					'params'   => [
						'type'        => 'object',
						'description' => 'Template-specific override parameters (all optional). See instructions for each template.',
					],
				],
				'required'             => [ 'template' ],
				'additionalProperties' => false,
			],
			'output_schema' => [
				'type'       => 'object',
				'properties' => [
					'template' => [ 'type' => 'string' ],
					'elements' => [
						'type'        => 'array',
						'description' => 'Element tree ready to pass to set-post-content or append-elements.',
					],
				],
			],
			'meta' => [
				'show_in_rest' => true,
				'mcp'          => [ 'public' => true ],
				'annotations'  => [
					'instructions' => implode( "\n", [
						'Returns a pre-built element tree for a named layout pattern.',
						'Pass elements directly to set-post-content or append-elements — no manual construction needed.',
						'',
						'hero-banner params: heading (string), subheading (string), cta_text (string), classes (array of class IDs).',
						'  Produces: one container with an h1 heading, a paragraph, and a button.',
						'',
						'two-column-hero params: heading (string), subheading (string), col2_text (string), classes (array of class IDs).',
						'  Produces: outer row container → two column containers. Left: heading + paragraph. Right: paragraph.',
						'',
						'card-grid params: cards (array of { heading, body }), classes (array of class IDs).',
						'  Produces: outer grid container → up to 6 card containers, each with a heading and paragraph.',
						'',
						'All IDs are freshly generated on every call — safe to call multiple times.',
						'All settings use the $$type wrapper format expected by Elementor v4.',
					] ),
					'readonly'    => true,
					'destructive' => false,
					'idempotent'  => false,
				],
			],
		];
	}

	public function execute( array $input ): array {
		$template_name = $input['template'];
		$params        = $input['params'] ?? [];

		if ( ! in_array( $template_name, self::ALLOWED_TEMPLATES, true ) ) {
			// phpcs:ignore WordPress.Security.EscapeOutput.ExceptionNotEscaped
			throw new \InvalidArgumentException( "Unknown template \"$template_name\". Allowed: " . implode( ', ', self::ALLOWED_TEMPLATES ) . '.' );
		}

		$template_file = __DIR__ . '/templates/' . $template_name . '.php';

		// phpcs:ignore WordPress.PHP.NoSilencedErrors.Discouraged
		$template_fn = require $template_file;

		$elements = $template_fn( $params );

		return [
			'template' => $template_name,
			'elements' => $elements,
		];
	}
}
