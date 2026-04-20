<?php

namespace Elementor\Core\Abilities;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * One-shot widget-node builder. Takes a widget_type + text and returns a ready-to-paste
 * element node with classes pre-mirrored from the supplied style_id / classes list.
 *
 * Removes the need to hand-roll nested $$type payloads for the common widget shapes
 * (e-heading, e-paragraph, e-button, e-flexbox) on every call.
 */
class Make_Widget_Ability extends Abstract_Ability {

	protected function get_name(): string {
		return 'elementor/make-widget';
	}

	protected function get_config(): array {
		return [
			'label'       => 'Elementor Make Widget',
			'description' => 'Returns a ready-to-paste element node (widget or e-flexbox) with settings + classes pre-wired. Avoids hand-rolling $$type payloads for the common widget shapes.',
			'category'    => 'elementor',
			'input_schema' => [
				'type'       => 'object',
				'properties' => [
					'type' => [
						'type'        => 'string',
						'description' => 'Element type. Widgets: e-heading | e-paragraph | e-button | e-image. Container: e-flexbox.',
					],
					'id'       => [
						'type'        => 'string',
						'description' => 'Element ID. Recommended to pass one for determinism; auto-generated (8-char hex) when omitted.',
					],
					'text'     => [
						'type'        => 'string',
						'description' => 'Text content. Used by e-heading (title), e-paragraph (paragraph), e-button (text). Ignored for e-image / e-flexbox.',
					],
					'style_id' => [
						'type'        => 'string',
						'description' => 'Local style ID to attach. Added to settings.classes.value automatically. Omit if you only use global classes.',
					],
					'classes'  => [
						'type'        => 'array',
						'description' => 'Global class IDs or labels to attach. Merged with style_id (if any).',
						'items'       => [ 'type' => 'string' ],
					],
					'tag'      => [
						'type'        => 'string',
						'description' => 'HTML tag for e-heading (h1..h6, default h2) and e-button (a | button, default a).',
					],
					'children' => [
						'type'        => 'array',
						'description' => 'For e-flexbox only: array of children element nodes (build each child via make-widget and pass the full node).',
					],
				],
				'required'             => [ 'type' ],
				'additionalProperties' => false,
			],
			'output_schema' => [
				'type'       => 'object',
				'properties' => [
					'element' => [
						'type'        => 'object',
						'description' => 'Ready-to-paste element node. Drop into elements[] (top level) or into an e-flexbox.elements array.',
					],
				],
			],
			'meta' => [
				'show_in_rest' => true,
				'mcp'          => [ 'public' => true ],
				'annotations'  => [
					'instructions' => implode( "\n", [
						'Returns a fully-formed Elementor element node for the requested type — no more hand-rolling html-v3 + string $$type nesting per widget.',
						'Supported types: e-heading, e-paragraph, e-button, e-image, e-flexbox.',
						'classes + style_id are mirrored into settings.classes.value automatically. Labels are accepted (resolved downstream by set-post-content / build-page).',
						'For e-flexbox pass children[] — each child is itself a make-widget output (or any valid element node).',
						'For widgets that need richer settings (custom attributes, URLs, images), make-widget produces the base; extend element.settings before saving.',
					] ),
					'readonly'    => true,
					'destructive' => false,
					'idempotent'  => false,
				],
			],
		];
	}

	public function execute( array $input ): array {
		$type     = (string) $input['type'];
		$id       = isset( $input['id'] ) && is_string( $input['id'] ) && '' !== $input['id'] ? $input['id'] : $this->generate_id();
		$text     = $input['text'] ?? null;
		$style_id = $input['style_id'] ?? null;
		$classes  = $input['classes'] ?? [];
		$tag      = $input['tag'] ?? null;
		$children = $input['children'] ?? [];

		if ( is_string( $style_id ) && '' !== $style_id ) {
			array_unshift( $classes, $style_id );
		}
		$classes = array_values( array_unique( array_filter( $classes, 'is_string' ) ) );

		$settings = [];
		if ( ! empty( $classes ) ) {
			$settings['classes'] = [
				'$$type' => 'classes',
				'value'  => $classes,
			];
		}

		switch ( $type ) {
			case 'e-heading':
				$settings['title'] = $this->make_html_v3( $text ?? 'Heading' );
				$settings['tag']   = [
					'$$type' => 'string',
					'value' => is_string( $tag ) ? $tag : 'h2',
				];
				return [ 'element' => $this->widget_node( $id, 'e-heading', $settings ) ];

			case 'e-paragraph':
				$settings['paragraph'] = $this->make_html_v3( $text ?? 'Paragraph' );
				return [ 'element' => $this->widget_node( $id, 'e-paragraph', $settings ) ];

			case 'e-button':
				$settings['text'] = $this->make_html_v3( $text ?? 'Button' );
				$settings['tag']  = [
					'$$type' => 'string',
					'value' => is_string( $tag ) ? $tag : 'a',
				];
				return [ 'element' => $this->widget_node( $id, 'e-button', $settings ) ];

			case 'e-image':
				return [ 'element' => $this->widget_node( $id, 'e-image', $settings ) ];

			case 'e-flexbox':
				$node = [
					'id'       => $id,
					'elType'   => 'e-flexbox',
					'settings' => $settings,
					'elements' => is_array( $children ) ? array_values( $children ) : [],
				];
				return [ 'element' => $node ];
		}

		// phpcs:ignore WordPress.Security.EscapeOutput.ExceptionNotEscaped
		throw new \InvalidArgumentException( "Unsupported make-widget type \"$type\". Supported: e-heading, e-paragraph, e-button, e-image, e-flexbox." );
	}

	private function widget_node( string $id, string $widget_type, array $settings ): array {
		return [
			'id'         => $id,
			'elType'     => 'widget',
			'widgetType' => $widget_type,
			'settings'   => $settings,
		];
	}

	private function make_html_v3( string $text ): array {
		return [
			'$$type' => 'html-v3',
			'value'  => [
				'content'  => [
					'$$type' => 'string',
					'value' => $text,
				],
				'children' => [],
			],
		];
	}

	private function generate_id(): string {
		try {
			return substr( bin2hex( random_bytes( 4 ) ), 0, 8 );
		} catch ( \Throwable $e ) {
			return substr( md5( (string) microtime( true ) . wp_rand() ), 0, 8 );
		}
	}
}
