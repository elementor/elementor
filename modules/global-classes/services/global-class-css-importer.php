<?php

namespace Elementor\Modules\GlobalClasses\Services;

use Elementor\Core\Files\CSS\Post as Post_CSS;
use Elementor\Modules\AtomicWidgets\Services\CssPropConverter\Conversion_Result;
use Elementor\Modules\AtomicWidgets\Services\CssPropConverter\Css_Prop_Converter;
use Elementor\Modules\AtomicWidgets\Utils\Utils as AtomicUtils;
use Elementor\Modules\GlobalClasses\Classes\Global_Class_Css_Renderer;
use Elementor\Modules\GlobalClasses\Global_Classes_Repository;
use Elementor\Plugin;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Global_Class_Css_Importer {

	private const DEFAULT_BREAKPOINT = 'desktop';
	private const MAX_LABEL_LENGTH = 50;

	public static function make(): self {
		return new self();
	}

	public function import_from_css( string $css, string $duplicate_strategy = 'update' ): array {
		$blocks = $this->parse_blocks( $css );

		$repository = $this->get_repository();
		$existing = $repository->all()->get();
		$existing_items = $existing['items'];
		$existing_order = $existing['order'];

		$label_to_id = [];
		foreach ( $existing_items as $id => $item ) {
			if ( isset( $item['label'] ) ) {
				$label_to_id[ strtolower( $item['label'] ) ] = $id;
			}
		}

		$touched_items = [];
		$added_ids = [];
		$modified_ids = [];
		$errors = [];
		$css_unconverted = [];
		$results = [];
		$next_order = $existing_order;

		foreach ( $blocks as $block ) {
			$label_validation = $this->validate_label( $block['label'] );

			if ( null !== $label_validation ) {
				$errors[] = [
					'label' => $block['label'],
					'code' => $label_validation['code'],
					'message' => $label_validation['message'],
				];
				$results[] = [
					'label' => $block['label'],
					'action' => 'error',
					'code' => $label_validation['code'],
					'message' => $label_validation['message'],
				];
				continue;
			}

			$label = $block['label'];
			$lookup = strtolower( $label );
			$existing_id = $label_to_id[ $lookup ] ?? null;

			if ( $existing_id && 'skip' === $duplicate_strategy ) {
				$results[] = [
					'label' => $label,
					'id' => $existing_id,
					'action' => 'skipped',
				];
				continue;
			}

			$resolved_label = $label;

			if ( $existing_id && 'rename' === $duplicate_strategy ) {
				$resolved_label = $this->rename_label( $label, $label_to_id );
				$existing_id = null;
			}

			$conversion = Css_Prop_Converter::make()->convert( $block['css'] );

			foreach ( $conversion->get_unconverted() as $unconverted ) {
				$css_unconverted[] = array_merge(
					[ 'label' => $resolved_label ],
					$unconverted
				);
			}

			if ( empty( $conversion->get_props() ) && '' === $conversion->get_custom_css() ) {
				$results[] = [
					'label' => $resolved_label,
					'action' => 'skipped',
					'code' => 'empty_block',
				];
				continue;
			}

			if ( $existing_id ) {
				$id = $existing_id;
				$action = 'updated';
				$modified_ids[] = $id;
			} else {
				$id = $this->generate_id( array_merge( array_keys( $existing_items ), array_keys( $touched_items ) ) );
				$action = 'created';
				$added_ids[] = $id;
				$next_order[] = $id;
				$label_to_id[ strtolower( $resolved_label ) ] = $id;
			}

			$touched_items[ $id ] = $this->build_class_record( $id, $resolved_label, $conversion );

			$results[] = [
				'label' => $resolved_label,
				'id' => $id,
				'action' => $action,
				'variants_applied' => 1,
			];
		}

		if ( ! empty( $touched_items ) ) {
			$repository->apply_changes(
				$touched_items,
				[
					'added' => $added_ids,
					'deleted' => [],
					'modified' => $modified_ids,
					'order' => false,
				],
				$next_order
			);

			$this->regenerate_kit_css();
		}

		return [
			'css' => $this->render_all(),
			'watermark' => $this->get_watermark(),
			'errors' => $errors,
			'css_unconverted' => $css_unconverted,
			'results' => $results,
		];
	}

	public function delete_by_css( string $css ): array {
		$blocks = $this->parse_blocks( $css );
		$labels = array_unique( array_column( $blocks, 'label' ) );

		$repository = $this->get_repository();
		$existing = $repository->all()->get();
		$existing_items = $existing['items'];
		$existing_order = $existing['order'];

		$deleted_ids = [];
		$deleted_labels = [];

		foreach ( $existing_items as $id => $item ) {
			$label = $item['label'] ?? '';

			if ( in_array( strtolower( $label ), array_map( 'strtolower', $labels ), true ) ) {
				$deleted_ids[] = $id;
				$deleted_labels[] = $label;
			}
		}

		if ( ! empty( $deleted_ids ) ) {
			$next_items = array_diff_key( $existing_items, array_flip( $deleted_ids ) );
			$next_order = array_values( array_diff( $existing_order, $deleted_ids ) );

			$repository->apply_changes(
				[],
				[
					'added' => [],
					'deleted' => $deleted_ids,
					'modified' => [],
					'order' => false,
				],
				$next_order
			);

			unset( $next_items );

			$this->regenerate_kit_css();
		}

		return [
			'css' => $this->render_all(),
			'watermark' => $this->get_watermark(),
			'deleted_labels' => $deleted_labels,
		];
	}

	public function to_css(): string {
		return $this->render_all();
	}

	private function parse_blocks( string $css ): array {
		$css = preg_replace( '#/\*.*?\*/#s', '', $css );
		$css = preg_replace( '/<\/?style[^>]*>/i', '', $css );

		$blocks = [];

		preg_match_all( '/(?P<selector>[^{}]+)\{(?P<body>[^{}]*)\}/s', $css, $matches, PREG_SET_ORDER );

		foreach ( $matches as $match ) {
			$selector = trim( $match['selector'] );
			$body = trim( $match['body'] );

			if ( '' === $selector || '' === $body ) {
				continue;
			}

			if ( ! preg_match( '/^\.([a-zA-Z0-9_-]+)$/', $selector, $name_match ) ) {
				continue;
			}

			$blocks[] = [
				'label' => $name_match[1],
				'css' => $body,
			];
		}

		return $blocks;
	}

	private function build_class_record( string $id, string $label, Conversion_Result $conversion ): array {
		$variant = [
			'meta' => [
				'state' => null,
				'breakpoint' => self::DEFAULT_BREAKPOINT,
			],
			'props' => $conversion->get_props(),
		];

		$custom_css = $conversion->get_custom_css();

		if ( '' !== $custom_css ) {
			$variant['custom_css'] = [ 'raw' => $custom_css ];
		}

		return [
			'id' => $id,
			'type' => 'class',
			'label' => $label,
			'variants' => [ $variant ],
		];
	}

	private function validate_label( string $label ): ?array {
		if ( strlen( $label ) > self::MAX_LABEL_LENGTH ) {
			return [
				'code' => 'label_too_long',
				'message' => 'Label exceeds 50 characters.',
			];
		}

		if ( strlen( $label ) < 2 ) {
			return [
				'code' => 'label_too_short',
				'message' => 'Label must be at least 2 characters.',
			];
		}

		if ( ! preg_match( '/^[a-zA-Z][a-zA-Z0-9_-]*$/', $label ) ) {
			return [
				'code' => 'label_invalid_chars',
				'message' => 'Label must start with a letter and contain only [a-zA-Z0-9_-].',
			];
		}

		return null;
	}

	private function rename_label( string $label, array $label_to_id ): string {
		$suffix = 1;
		$candidate = $label . '-import';

		while ( isset( $label_to_id[ strtolower( $candidate ) ] ) ) {
			$suffix++;
			$candidate = $label . '-import-' . $suffix;
		}

		return $candidate;
	}

	private function generate_id( array $existing_ids ): string {
		return AtomicUtils::generate_id( 'g-', $existing_ids );
	}

	private function get_repository(): Global_Classes_Repository {
		return Global_Classes_Repository::make( Plugin::$instance->kits_manager->get_active_kit() );
	}

	private function render_all(): string {
		$snapshot = $this->get_repository()->all( true )->get();

		return Global_Class_Css_Renderer::make()->render( $snapshot['items'], $snapshot['order'] );
	}

	private function get_watermark(): int {
		$kit = Plugin::$instance->kits_manager->get_active_kit();
		$kit_id = $kit ? $kit->get_id() : 0;

		return (int) get_post_modified_time( 'U', true, $kit_id );
	}

	private function regenerate_kit_css(): void {
		$kit = Plugin::$instance->kits_manager->get_active_kit();

		if ( ! $kit ) {
			return;
		}

		Post_CSS::create( $kit->get_id() )->update();
	}
}
