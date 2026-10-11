<?php

namespace Elementor\Modules\Mcp\Utils;

use Elementor\Modules\Mcp\Abilities\Abstract_Ability;
use Elementor\Modules\Mcp\Abilities\Utils\Document_Revision_Snapshots;
use Elementor\Modules\Mcp\Module;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Revision_Snapshot_Hooks {

	public function register_hooks(): void {
		add_filter( 'elementor/mcp/ability_executor', [ $this, 'wrap_executor' ], 10, 2 );
	}

	public function wrap_executor( callable $executor, Abstract_Ability $ability ): callable {
		return function ( $input ) use ( $executor, $ability ) {
			$post_id = is_array( $input ) ? $ability->get_snapshot_post_id( $input ) : 0;

			if ( $post_id <= 0 || ! $this->is_enabled( $ability, $post_id ) ) {
				return $executor( $input );
			}

			return Document_Revision_Snapshots::record(
				$post_id,
				$ability->get_id(),
				fn() => $executor( $input )
			)->to_response();
		};
	}

	private function is_enabled( Abstract_Ability $ability, int $post_id ): bool {
		/**
		 * Filters whether an MCP write saves a revision of the document first, so it can be undone.
		 *
		 * @param bool   $is_enabled Whether the revision snapshots experiment is active.
		 * @param string $ability_id The ability being executed.
		 * @param int    $post_id    The document the ability writes to.
		 */
		return (bool) apply_filters(
			'elementor/mcp/revision_snapshots/enabled',
			Module::is_revision_snapshots_active(),
			$ability->get_id(),
			$post_id
		);
	}
}
