<?php

namespace Elementor\Modules\Mcp\Utils;

use Elementor\Modules\AtomicWidgets\Module as Atomic_Widgets_Module;
use Elementor\Plugin;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Mcp_V4_Gate {

	const GATED_IDS = [
		'elementor/build-composition',
		'elementor/create-preview-link',
		'elementor/get-default-styles',
		'elementor/get-widget-schema',
		'elementor/global-classes-resource',
		'elementor/global-variables-resource',
		'elementor/interactions-schema-resource',
		'elementor/list-components',
		'elementor/list-dynamic-tags',
		'elementor/list-widget-schemas',
		'elementor/manage-classes',
		'elementor/manage-component',
		'elementor/manage-default-styles',
		'elementor/manage-elements',
		'elementor/manage-global-variable',
		'elementor/manage-global-variable-guide',
		'elementor/reorder-classes',
	];

	public static function is_atomic_editor_active(): bool {
		return Plugin::$instance->experiments->is_feature_active( Atomic_Widgets_Module::EXPERIMENT_NAME );
	}

	public static function is_gated( string $id ): bool {
		return in_array( $id, self::gated_ids(), true );
	}

	/**
	 * @return true|\WP_Error true when the ability may run, or an error explaining why not.
	 */
	public static function is_available( string $id ) {
		if ( self::is_gated( $id ) && ! self::is_atomic_editor_active() ) {
			return self::v4_required_error();
		}

		return true;
	}

	private static function v4_required_error(): \WP_Error {
		return new \WP_Error(
			'elementor_v4_required',
			__( 'This site needs the Atomic Editor turned on before this can be built. Turn it on in WP Admin → Elementor → Settings → Atomic Editor, then try again.', 'elementor' ),
			[
				'status' => 403,
				'description_notice' => __( 'Note: needs Atomic Editor (currently off for this site).', 'elementor' ),
			]
		);
	}

	private static function gated_ids(): array {
		$ids = apply_filters( 'elementor/mcp/gated_ability_ids', self::GATED_IDS );

		if ( ! is_array( $ids ) ) {
			return self::GATED_IDS;
		}

		return array_values( array_unique( array_filter( $ids, 'is_string' ) ) );
	}
}
