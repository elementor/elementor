<?php

namespace Elementor\Modules\Mcp\Abilities\Appliers\V3\Converter;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Mutable per-node conversion state: accumulates the settings patch that will be
 * merged into the V3 widget, the unmapped CSS chunks (destined for `custom_css`),
 * warnings, and typography-group buckets which are finalized in one pass at the end.
 */
class V3_Conversion_Context {

	/** @var array<string, mixed> */
	private array $settings_patch = [];

	/** @var string[] */
	private array $unmapped_parts = [];

	/** @var string[] */
	private array $warnings = [];

	/**
	 * @var array<int, array{code: string, style_target: ?string, property: ?string, state: ?string, reason: string}>
	 */
	private array $warning_details = [];

	/**
	 * @var array<string, array{
	 *     prefix: string,
	 *     breakpoint: string,
	 *     state: ?string,
	 *     responsive: bool,
	 *     declarations: array<string, string>
	 * }>
	 */
	private array $typography_buckets = [];

	/**
	 * @param array<string, mixed> $patch
	 */
	public function merge_patch( array $patch ): void {
		if ( empty( $patch ) ) {
			return;
		}

		$this->settings_patch = array_merge( $this->settings_patch, $patch );
	}

	public function add_typography_declaration( string $prefix, string $breakpoint, ?string $state, bool $responsive, string $property, string $value ): void {
		$bucket_key = $breakpoint . '|' . ( $state ?? '' ) . '|' . $prefix;

		if ( ! isset( $this->typography_buckets[ $bucket_key ] ) ) {
			$this->typography_buckets[ $bucket_key ] = [
				'prefix' => $prefix,
				'breakpoint' => $breakpoint,
				'state' => $state,
				'responsive' => $responsive,
				'declarations' => [],
			];
		}

		$this->typography_buckets[ $bucket_key ]['declarations'][ $property ] = $value;
	}

	public function mark_unmapped( string $original_css ): void {
		$trimmed = trim( $original_css );
		if ( '' === $trimmed ) {
			return;
		}

		$this->unmapped_parts[] = $trimmed;
	}

	public function warn( string $message ): void {
		if ( '' === $message ) {
			return;
		}

		$this->warnings[] = $message;
	}

	/**
	 * Records a structured warning alongside its human-readable message. Used by the
	 * map-driven path to emit `invalid_resolved_value` / `unsupported_css_property`
	 * details that {@see \Elementor\Modules\Mcp\Abilities\Build_Composition_Ability}
	 * and {@see \Elementor\Modules\Mcp\Abilities\Manage_Elements_Ability} propagate
	 * to callers in the `warning_details` field.
	 *
	 * @param array{code: string, style_target?: ?string, property?: ?string, state?: ?string, reason: string} $detail
	 */
	public function warn_structured( string $message, array $detail ): void {
		if ( '' !== $message ) {
			$this->warnings[] = $message;
		}

		$this->warning_details[] = [
			'code' => (string) ( $detail['code'] ?? '' ),
			'style_target' => $detail['style_target'] ?? null,
			'property' => $detail['property'] ?? null,
			'state' => $detail['state'] ?? null,
			'reason' => (string) ( $detail['reason'] ?? '' ),
		];
	}

	public function settings_patch(): array {
		return $this->settings_patch;
	}

	/**
	 * @return string[]
	 */
	public function unmapped_parts(): array {
		return $this->unmapped_parts;
	}

	/**
	 * @return string[]
	 */
	public function warnings(): array {
		return $this->warnings;
	}

	/**
	 * @return array<int, array{code: string, style_target: ?string, property: ?string, state: ?string, reason: string}>
	 */
	public function warning_details(): array {
		return $this->warning_details;
	}

	/**
	 * @return array<string, array>
	 */
	public function typography_buckets(): array {
		return $this->typography_buckets;
	}
}
