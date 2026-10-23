<?php

namespace Elementor\Modules\Agents\Classes;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

abstract class Feature_Component {

	/**
	 * Stable string identifier, e.g. 'markdown_endpoint'.
	 * Used as the registry key and audit-log channel.
	 */
	abstract public function get_id(): string;

	/**
	 * Layer this component belongs to.
	 * One of: 'discovery' | 'readability' | 'mcp' | 'governance'
	 */
	abstract public function get_layer(): string;

	/**
	 * Whether this component overlaps with SEO plugin functionality.
	 * Default false; override in discovery components where relevant.
	 */
	public function has_seo_overlap(): bool {
		return false;
	}

	/**
	 * Whether this component is enabled.
	 *
	 * Subclasses override ONLY to express additional hard dependency gates
	 * (e.g. mcp-adapter present). Per-module toggles are enforced at runtime.
	 */
	public function is_enabled(): bool {
		return true;
	}

	/**
	 * Wire hooks. Called by the module only when is_enabled() returns true.
	 */
	abstract public function register(): void;
}
