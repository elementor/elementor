<?php

namespace Elementor\Modules\Mcp\Abilities;

use Elementor\Modules\Mcp\Abilities\Appliers\V3\Maps\Kit_Settings_Host;
use Elementor\Modules\Mcp\Events\Pro_Feature_Suggestion_Tracker;
use Elementor\Modules\Mcp\Site_Flag;
use Elementor\Modules\Mcp\Utils\Editor_Sync_State;
use Elementor\Modules\Mcp\Utils\Mcp_V4_Gate;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Ability_Hooks {

	public function register_hooks(): void {
		add_filter( 'elementor/mcp/ability/is_available', [ $this, 'filter_is_available' ], 10, 3 );
		add_action( 'elementor/mcp/ability/before_execute', [ $this, 'before_execute' ] );
		add_action( 'elementor/mcp/ability/after_execute', [ $this, 'after_execute' ], 10, 4 );
	}

	public function filter_is_available( $available, string $ability_id, $ability ) {
		if ( true !== $available || ! $ability instanceof Abstract_Ability ) {
			return $available;
		}

		return Mcp_V4_Gate::is_available( $ability_id );
	}

	public function before_execute( $ability ): void {
		if ( ! $ability instanceof Abstract_Ability ) {
			return;
		}

		Pro_Feature_Suggestion_Tracker::reset();
	}

	public function after_execute( $ability, $input, $result, array $context ): void {
		if ( ! $ability instanceof Abstract_Ability ) {
			return;
		}

		Pro_Feature_Suggestion_Tracker::flush( $ability->get_id(), $result );
		Kit_Settings_Host::discard_pending();

		$post_id = (int) ( $context['post_id'] ?? 0 );

		if ( ! empty( $context['is_mutating'] ) && $post_id > 0 && empty( $context['is_failed'] ) ) {
			Editor_Sync_State::set_mcp_mutation( $post_id );
		}

		if ( empty( $context['record_capability'] ) ) {
			return;
		}

		$capability = Site_Flag::capability_for_ability( $ability->get_id() );

		if ( $capability ) {
			Site_Flag::mark( $capability );
		}
	}
}
