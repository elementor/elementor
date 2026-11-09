<?php

namespace Elementor\Modules\Mcp\Abilities;

use Elementor\Modules\Mcp\Abilities\Utils\Prompt_Loader;
use Elementor\Modules\Mcp\Super_Admin\Super_Admin_Settings;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Get_Super_Admin_Status_Ability extends Abstract_Ability {

	protected function get_ability_id(): string {
		return 'elementor/get-super-admin-status';
	}

	public function is_exposed_via_proxy(): bool {
		return false;
	}

	protected function get_definition(): Ability_Definition {
		return new Ability_Definition(
			__( 'Get Super Admin Status', 'elementor' ),
			Prompt_Loader::load( 'get-super-admin-status' ),
			'elementor',
			[
				'type' => 'object',
				'properties' => [
					'enabled' => [ 'type' => 'boolean' ],
				],
			],
			[
				'annotations' => [
					'readonly' => true,
					'idempotent' => true,
					'destructive' => false,
				],
				'mutates_page' => false,
			],
			fn() => Super_Admin_Settings::current_user_can_use()
		);
	}

	public function execute( $input = [] ) {
		if ( ! Super_Admin_Settings::current_user_can_use() ) {
			return $this->error( 'rest_forbidden', __( 'Sorry, you are not allowed to do that.', 'elementor' ), \WP_Http::FORBIDDEN );
		}

		return [
			'enabled' => Super_Admin_Settings::is_enabled(),
		];
	}

	private function error( string $code, string $message, int $status ): \WP_Error {
		return new \WP_Error( $code, $message, [ 'status' => $status ] );
	}
}
