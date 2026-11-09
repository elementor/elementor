<?php

namespace Elementor\Modules\Mcp\Abilities;

use Elementor\Modules\Mcp\Abilities\Utils\Prompt_Loader;
use Elementor\Modules\Mcp\Super_Admin\Super_Admin_Access;
use Elementor\Modules\Mcp\Super_Admin\Super_Admin_Settings;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Disable_Super_Admin_Ability extends Abstract_Ability {

	use Super_Admin_Access;

	protected function get_ability_id(): string {
		return 'elementor/disable-super-admin';
	}

	public function is_exposed_via_proxy(): bool {
		return false;
	}

	protected function get_definition(): Ability_Definition {
		return new Ability_Definition(
			__( 'Disable Super Admin', 'elementor' ),
			Prompt_Loader::load( 'disable-super-admin' ),
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

		if ( ! Super_Admin_Settings::is_enabled() ) {
			return $this->error(
				'already_disabled',
				__( 'Super Admin is already disabled.', 'elementor' ),
				\WP_Http::CONFLICT
			);
		}

		Super_Admin_Settings::set_enabled( false );

		return [
			'status' => 'disabled',
			'message' => __( 'Super Admin is now disabled. Reload your tool list; execute-php, read-file, and list-directory will no longer be listed.', 'elementor' ),
			'reload_tools' => true,
		];
	}
}
