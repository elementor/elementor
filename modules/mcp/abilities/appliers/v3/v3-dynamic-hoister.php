<?php

namespace Elementor\Modules\Mcp\Abilities\Appliers\V3;

use Elementor\Core\DynamicTags\Manager;
use Elementor\Plugin;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class V3_Dynamic_Hoister {

	private Manager $manager;

	public function __construct( ?Manager $manager = null ) {
		$this->manager = $manager ?? Plugin::$instance->dynamic_tags;
	}

	/**
	 * @param string                              $widget_type
	 * @param array<string, mixed>                $allowed
	 * @param array<string, array<string, mixed>> $controls
	 *
	 * @return array{primitives: array<string, mixed>, shortcodes: array<string, string>, errors: string[]}
	 */
	public function hoist( string $widget_type, array $allowed, array $controls ): array {
		$primitives = [];
		$shortcodes = [];
		$errors = [];

		foreach ( $allowed as $key => $value ) {
			$control = is_array( $controls[ $key ] ?? null ) ? $controls[ $key ] : [];

			if ( ! V3_Dynamic_Resolver::is_dynamic_capable( $control ) ) {
				$primitives[ $key ] = $value;
				continue;
			}

			$input = V3_Dynamic_Resolver::extract_input( $value, $control['dynamic']['property'] ?? null );
			if ( null === $input ) {
				$primitives[ $key ] = $value;
				continue;
			}

			$tag = $this->manager->create_tag( $this->generate_tag_id(), $input['name'], $input['settings'] );
			if ( ! $tag ) {
				$errors[] = sprintf(
					'V3 widget "%s" property "%s": dynamic tag "%s" is not registered.',
					$widget_type,
					$key,
					$input['name']
				);
				continue;
			}

			$control_categories = $control['dynamic']['categories'] ?? [];
			if ( ! empty( $control_categories ) && empty( array_intersect( $tag->get_categories(), $control_categories ) ) ) {
				$errors[] = sprintf(
					'V3 widget "%s" property "%s": dynamic tag "%s" (categories: [%s]) is not compatible with field "%s" (allowed categories: [%s]).',
					$widget_type,
					$key,
					$input['name'],
					implode( ', ', $tag->get_categories() ),
					$key,
					implode( ', ', $control_categories )
				);
				continue;
			}

			$shortcode = $this->manager->tag_to_text( $tag );
			if ( '' === $shortcode ) {
				$errors[] = sprintf(
					'V3 widget "%s" property "%s": failed to serialize dynamic tag "%s".',
					$widget_type,
					$key,
					$input['name']
				);
				continue;
			}

			$shortcodes[ $key ] = $shortcode;
		}

		return [
			'primitives' => $primitives,
			'shortcodes' => $shortcodes,
			'errors' => $errors,
		];
	}

	private function generate_tag_id(): string {
		return substr( md5( uniqid( 'mcp-v3-dyn', true ) ), 0, 7 );
	}
}
