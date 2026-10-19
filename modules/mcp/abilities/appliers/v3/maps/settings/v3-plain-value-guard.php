<?php

namespace Elementor\Modules\Mcp\Abilities\Appliers\V3\Maps\Settings;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Optional contract for a setting adapter that must vet the raw plain value before the shared
 * plain-values resolver sees it, because the resolver coerces (for example any truthy value to
 * `true`) or the stored control would accept values that break the widget.
 */
interface V3_Plain_Value_Guard {

	/**
	 * @param mixed                $plain   Raw value sent by the caller. Dynamic tags arrive as arrays.
	 * @param array<string, mixed> $control
	 * @return string|null Rejection reason that completes the sentence `Property "x" on "y" <reason> and was skipped.`, or null to accept.
	 */
	public function reject_reason( $plain, array $control ): ?string;
}
