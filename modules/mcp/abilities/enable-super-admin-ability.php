<?php

namespace Elementor\Modules\Mcp\Abilities;

use Elementor\Modules\Mcp\Abilities\Utils\Prompt_Loader;
use Elementor\Modules\Mcp\Super_Admin\Super_Admin_Settings;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Enable_Super_Admin_Ability extends Abstract_Ability {

	protected function get_ability_id(): string {
		return 'elementor/enable-super-admin';
	}

	public function is_exposed_via_proxy(): bool {
		return false;
	}

	protected function get_definition(): Ability_Definition {
		return new Ability_Definition(
			__( 'Enable Super Admin', 'elementor' ),
			Prompt_Loader::load( 'enable-super-admin' ),
			'elementor',
			[
				'type' => 'object',
				'properties' => [
					'status' => [ 'type' => 'string' ],
					'message' => [ 'type' => 'string' ],
					'reload_tools' => [ 'type' => 'boolean' ],
				],
				'required' => [ 'status', 'message', 'reload_tools' ],
			],
			[
				'annotations' => [
					'readonly' => false,
					'idempotent' => false,
					'destructive' => true,
				],
				'mutates_page' => false,
			],
			fn() => Super_Admin_Settings::current_user_can_use(),
			[
				'type' => 'object',
				'properties' => [
					'consent' => [
						'type' => 'boolean',
						'description' => __( 'Set to true only after the user explicitly agreed, in this chat, to enabling Super Admin.', 'elementor' ),
					],
				],
				'required' => [ 'consent' ],
				'additionalProperties' => false,
			]
		);
	}

	public function execute( $input = [] ) {
		if ( ! Super_Admin_Settings::current_user_can_use() ) {
			return $this->error( 'rest_forbidden', __( 'Sorry, you are not allowed to do that.', 'elementor' ), \WP_Http::FORBIDDEN );
		}

		if ( Super_Admin_Settings::is_enabled() ) {
			return $this->error(
				'already_enabled',
				__( 'Super Admin is already enabled.', 'elementor' ),
				\WP_Http::CONFLICT
			);
		}

		if ( ! is_array( $input ) || ! array_key_exists( 'consent', $input ) || true !== $input['consent'] ) {
			return $this->error(
				'consent_required',
				__( 'Nothing was changed. Ask the user whether to enable Super Admin, then call this tool again with consent set to true.', 'elementor' ),
				\WP_Http::BAD_REQUEST
			);
		}

		Super_Admin_Settings::set_enabled( true );

		return [
			'status' => 'enabled',
			'message' => __( 'Super Admin is now enabled. Reload your tool list to see the new tools; this tool will no longer be listed.', 'elementor' ),
			'reload_tools' => true,
		];
	}

	private function error( string $code, string $message, int $status ): \WP_Error {
		return new \WP_Error( $code, $message, [ 'status' => $status ] );
	}
}
