<?php

namespace Elementor\Modules\Mcp\Abilities\Appliers\V3\Maps\Settings;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Optional contract for a rule the published JSON schema cannot express, such as an attachment that
 * must exist or a date that must be real. It runs after the value passed the published schema, so it
 * never re-checks types, patterns, ranges or keys.
 */
interface V3_Plain_Value_Guard {

	/**
	 * @param mixed                $plain   Value that already passed the published schema, sanitized by it.
	 * @param array<string, mixed> $control
	 * @return string|null Rejection reason that completes the sentence `Property "x" on "y" <reason> and was skipped.`, or null to accept.
	 */
	public function reject_reason( $plain, array $control ): ?string;
}
