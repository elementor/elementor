<?php

namespace Elementor\Modules\Mcp\Abilities\Appliers;

use Elementor\Modules\Mcp\Abilities\Utils\Warnings_Bag;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Editor_Settings_Applier {

	const BOOLEAN_KEYS = [ 'decorative' ];

	public static function get_settings_schema(): array {
		return [
			'type' => 'object',
			'properties' => [
				'decorative' => [
					'type' => 'boolean',
					'description' => 'Container only. true marks a visual-only container that will have no children (a shape, glow or other CSS composition), so the editor does not force its empty-container placeholder height on it. Give it an explicit width and height in style.',
				],
			],
		];
	}

	/**
	 * @param array<string, array&> $index           Index of subtree refs.
	 * @param array<string, mixed>  $editor_settings Per-config-id map of editor settings.
	 *
	 * @return array{error: null, warnings: Warnings_Bag}
	 */
	public function apply( array &$index, array $editor_settings ): array {
		$warnings = Warnings_Bag::make();

		foreach ( $editor_settings as $config_id => $settings ) {
			if ( ! isset( $index[ $config_id ] ) ) {
				continue;
			}

			if ( is_object( $settings ) ) {
				$settings = (array) $settings;
			}

			if ( ! is_array( $settings ) ) {
				$warnings->add(
					'editor_settings_invalid',
					'editor_settings must be an object such as { "decorative": true }.',
					(string) $config_id
				);
				continue;
			}

			$this->apply_to_element( $index[ $config_id ], $settings, (string) $config_id, $warnings );
		}

		return [
			'error' => null,
			'warnings' => $warnings,
		];
	}

	private function apply_to_element( array &$element, array $settings, string $config_id, Warnings_Bag $warnings ): void {
		$element['editor_settings'] = $element['editor_settings'] ?? [];

		foreach ( $settings as $key => $value ) {
			if ( ! in_array( $key, self::BOOLEAN_KEYS, true ) ) {
				$warnings->add(
					'editor_setting_unknown',
					sprintf( 'Unknown editor setting "%s" was skipped. Supported: %s.', $key, implode( ', ', self::BOOLEAN_KEYS ) ),
					$config_id
				);
				continue;
			}

			if ( ! is_bool( $value ) ) {
				$warnings->add(
					'editor_setting_invalid',
					sprintf( 'Editor setting "%s" must be a boolean and was skipped.', $key ),
					$config_id
				);
				continue;
			}

			$element['editor_settings'][ $key ] = $value;
		}
	}
}
