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
	 * @param array<string, mixed>                                    $settings          Node settings before the style patch.
	 * @param array<string, array{value: mixed, declaration: string}> $required_settings
	 */
	public static function report( Warnings_Bag $warnings, string $config_id, array $settings, array $required_settings ): void {
		foreach ( $required_settings as $setting => $requirement ) {
			$current = $settings[ $setting ] ?? null;

			if ( ! is_scalar( $current ) || '' === (string) $current || (string) $current === (string) $requirement['value'] ) {
				continue;
			}

			$warnings->add( self::WARNING_CODE, self::message( (string) $setting, (string) $current, (string) $requirement['value'], $requirement['declaration'] ), $config_id );
		}
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
