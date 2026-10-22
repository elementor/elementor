<?php

namespace Elementor\Modules\Mcp\Abilities\Appliers\V3\Converter;

use Elementor\Modules\Mcp\Abilities\Appliers\V3\Maps\V3_Settings_Patch;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Mutable per-node conversion state: accumulates the settings patch that will be
 * merged into the V3 widget, the custom CSS fallback rules and warnings.
 */
class V3_Conversion_Context {

	/** @var array<string, mixed> */
	private array $settings_patch = [];

	/** @var string[] */
	private array $warnings = [];

	/** @var array<int, array{target: string, state: string|null, breakpoint: string, media: string|null, declarations: array<string, string>}> */
	private array $fallback_rules = [];

	/** @var string[] */
	private array $fallback_notes = [];

	/** @var array<string, array{value: mixed, declaration: string}> */
	private array $required_settings = [];

	/** @var array<string, string> */
	private array $border_style_defaults = [];

	/** @var array<string, string[]> */
	private array $list_requirements = [];

	/**
	 * @param array<string, mixed> $patch
	 */
	public function merge_patch( array $patch ): void {
		if ( empty( $patch ) ) {
			return;
		}

		$this->settings_patch = V3_Settings_Patch::merge( $this->settings_patch, $patch );
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

	/**
	 * @param array<string, string> $defaults Border style setting => style to use while none is saved.
	 */
	public function add_border_style_defaults( array $defaults ): void {
		$this->border_style_defaults = array_merge( $this->border_style_defaults, $defaults );
	}

	/**
	 * @return array<string, string>
	 */
	public function border_style_defaults(): array {
		return $this->border_style_defaults;
	}

	/**
	 * @param array<string, string[]> $requirements Multi-select setting => values its list must contain.
	 */
	public function require_list_values( array $requirements ): void {
		foreach ( $requirements as $setting => $values ) {
			$this->list_requirements[ $setting ] = array_values( array_unique( array_merge( $this->list_requirements[ $setting ] ?? [], $values ) ) );
		}
	}

	/**
	 * @return array<string, string[]>
	 */
	public function list_requirements(): array {
		return $this->list_requirements;
	}

	public function warn( string $message ): void {
		if ( '' === $message ) {
			return;
		}

		$this->warnings[] = $message;
	}

	/**
	 * @param array{target: string, state: string|null, breakpoint: string, media: string|null, declarations: array<string, string>} $rule
	 */
	public function add_fallback_rule( array $rule ): void {
		$this->fallback_rules[] = $rule;
	}

	public function add_fallback_note( string $note ): void {
		$this->fallback_notes[] = $note;
	}

	/**
	 * @return array<int, array{target: string, state: string|null, breakpoint: string, media: string|null, declarations: array<string, string>}>
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
	public function warnings(): array {
		return $this->warnings;
	}
}
