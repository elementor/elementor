<?php

namespace Elementor\Modules\Mcp\Abilities\Appliers\V3;

use Elementor\Modules\Mcp\Abilities\Utils\Warnings_Bag;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * A style that needs another setting to take effect (e.g. a hover background needs
 * `pointer: background`) wins over the value the node already had, so the caller is told.
 */
class V3_Overridden_Setting_Warnings {

	const WARNING_CODE = 'setting_overridden_by_style';

	/**
	 * @param Warnings_Bag                                            $warnings
	 * @param string                                                  $config_id
	 * Elementor only stores a setting that differs from its default, so a stored empty value
	 * is a switcher the user turned off, while a missing key was never touched.
	 *
	 * @param array<string, mixed>                                    $settings          Node settings before the style patch, including settings written in the same operation.
	 * @param array<string, array{value: mixed, declaration: string}> $required_settings
	 */
	public static function report( Warnings_Bag $warnings, string $config_id, array $settings, array $required_settings ): void {
		foreach ( $required_settings as $setting => $requirement ) {
			$current = $settings[ $setting ] ?? null;

			if ( ! is_scalar( $current ) || (string) $current === (string) $requirement['value'] ) {
				continue;
			}

			$message = '' === (string) $current
				? self::turned_on_message( (string) $setting, (string) $requirement['value'], $requirement['declaration'] )
				: self::message( (string) $setting, (string) $current, (string) $requirement['value'], $requirement['declaration'] );

			$warnings->add( self::WARNING_CODE, $message, $config_id );
		}
	}

	private static function turned_on_message( string $setting, string $required, string $declaration ): string {
		return sprintf(
			/* translators: 1: Setting name, 2: New value, 3: CSS property (and state) */
			__( "Setting %1\$s was off and was set to '%2\$s' because the CSS property %3\$s only works with it. Remove that declaration to keep it off.", 'elementor' ),
			$setting,
			$required,
			$declaration
		);
	}

	private static function message( string $setting, string $current, string $required, string $declaration ): string {
		return sprintf(
			/* translators: 1: Setting name, 2: Previous value, 3: New value, 4: CSS property (and state), 5: Previous value */
			__( "Setting %1\$s was changed from '%2\$s' to '%3\$s' because the CSS property %4\$s only works with it. Remove that declaration to keep '%5\$s'.", 'elementor' ),
			$setting,
			$current,
			$required,
			$declaration,
			$current
		);
	}
}
