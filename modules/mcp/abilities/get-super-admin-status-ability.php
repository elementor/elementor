<?php

namespace Elementor\Modules\Mcp\Abilities;

use Elementor\Modules\Mcp\Abilities\Utils\Prompt_Loader;
use Elementor\Modules\Mcp\Super_Admin\Super_Admin_Access;
use Elementor\Modules\Mcp\Super_Admin\Super_Admin_Settings;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Get_Super_Admin_Status_Ability extends Abstract_Ability {

	use Super_Admin_Access;

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
		$forbidden = $this->forbidden_error();
		if ( $forbidden ) {
			return $forbidden;
		}

		return [
			'enabled' => Super_Admin_Settings::is_enabled(),
		];
	}
}
