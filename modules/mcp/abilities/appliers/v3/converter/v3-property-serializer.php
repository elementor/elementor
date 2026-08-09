<?php

namespace Elementor\Modules\Mcp\Abilities\Appliers\V3\Converter;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Inverse of {@see V3_Property_Converter}: reads V3 legacy settings and emits CSS
 * declarations into a {@see V3_Block_Accumulator} grouped by breakpoint / pseudo-state.
 *
 * Each serializer owns a single override shape (typography_prefix, border_prefix,
 * box_shadow_prefix, setting+resolver, or generic index fallback).
 */
interface V3_Property_Serializer {

	public function is_supported( array $entry, string $property, ?string $state ): bool;

	public function emit( V3_Block_Accumulator $blocks, array $settings, array $entry, string $property, ?string $state ): void;
}
