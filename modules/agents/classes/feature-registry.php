<?php

namespace Elementor\Modules\Agents\Classes;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Feature_Registry {

	/** @var Feature_Component[] */
	private array $features = [];

	/**
	 * Register a feature component.
	 */
	public function register( Feature_Component $component ): void {
		$this->features[ $component->get_id() ] = $component;
	}

	/**
	 * Return all registered feature components.
	 * Applies elementor/agents/features filter for third-party contribution.
	 *
	 * @return Feature_Component[]
	 */
	public function get_features(): array {
		return apply_filters( 'elementor/agents/features', $this->features );
	}

	/**
	 * Return a single registered feature by ID, or null if not found.
	 */
	public function get_feature( string $id ): ?Feature_Component {
		return $this->features[ $id ] ?? null;
	}

	/**
	 * Return whether a feature is registered and enabled.
	 */
	public function is_enabled( string $id ): bool {
		$feature = $this->get_feature( $id );
		return $feature && $feature->is_enabled();
	}
}
