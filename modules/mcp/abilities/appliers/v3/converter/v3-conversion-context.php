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
	 * @var array<string, array{
	 *     prefix: string,
	 *     breakpoint: string,
	 *     state: ?string,
	 *     responsive: bool,
	 *     declarations: array<string, string>
	 * }>
	 */
	private array $typography_buckets = [];

	/** @var array<int, array{target: string, state: string|null, breakpoint: string, declarations: array<string, string>, replaces: string[]}> */
	private array $fallback_rules = [];

	/** @var string[] */
	private array $fallback_notes = [];

	/** @var array<string, array{value: mixed, declaration: string}> */
	private array $required_settings = [];

	/**
	 * @param array<string, mixed> $patch
	 */
	public function merge_patch( array $patch ): void {
		if ( empty( $patch ) ) {
			return;
		}

		$this->settings_patch = array_merge( $this->settings_patch, $patch );
	}

	/**
	 * @param array<string, mixed> $requirements Setting => value a bound control needs to take effect.
	 * @param string               $declaration  The CSS declaration that needs them, for warnings.
	 */
	public function require_settings( array $requirements, string $declaration ): void {
		foreach ( $requirements as $setting => $value ) {
			$this->required_settings[ $setting ] = [
				'value' => $value,
				'declaration' => $declaration,
			];
		}
	}

	/**
	 * @return array<string, array{value: mixed, declaration: string}>
	 */
	public function required_settings(): array {
		return $this->required_settings;
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
	 * @param array{target: string, state: string|null, breakpoint: string, declarations: array<string, string>, replaces: string[]} $rule
	 */
	public function add_fallback_rule( array $rule ): void {
		$this->fallback_rules[] = $rule;
	}

	public function add_fallback_note( string $note ): void {
		$this->fallback_notes[] = $note;
	}

	/**
	 * @return array<int, array{target: string, state: string|null, breakpoint: string, declarations: array<string, string>, replaces: string[]}>
	 */
	public function fallback_rules(): array {
		return $this->fallback_rules;
	}

	/**
	 * @return string[]
	 */
	public function fallback_notes(): array {
		return $this->fallback_notes;
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
	 * @return array<string, array>
	 */
	public function typography_buckets(): array {
		return $this->typography_buckets;
	}
}
