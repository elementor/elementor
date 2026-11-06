<?php

namespace Elementor\Modules\Mcp\Abilities;

use Elementor\Modules\Mcp\Abilities\Utils\Prompt_Loader;
use Elementor\Modules\Mcp\Abilities\Utils\Woocommerce_Pro_Features_Discovery;
use Elementor\Modules\Mcp\Abilities\Utils\Woocommerce_Settings_Schema;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Manage_Woocommerce_Settings_Pro_Features_Discovery_Ability extends Abstract_Ability {

	protected function get_ability_id(): string {
		return 'elementor/manage-woocommerce-settings';
	}

	public function is_exposed_via_proxy(): bool {
		return false;
	}

	protected function get_definition(): Ability_Definition {
		return new Ability_Definition(
			__( 'Manage WooCommerce Settings', 'elementor' ),
			Prompt_Loader::load( 'manage-woocommerce-settings-pro-features-discovery' ),
			'elementor',
			[
				'type' => 'object',
				'properties' => [
					'success' => [ 'type' => 'boolean' ],
					'pages' => [ 'type' => 'object' ],
					'updated' => [ 'type' => 'object' ],
					'warnings' => [
						'type' => 'array',
						'items' => [ 'type' => 'string' ],
					],
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
			fn() => current_user_can( 'manage_options' ) || current_user_can( 'manage_woocommerce' ),
			Woocommerce_Settings_Schema::manage_input()
		);
	}

	public function execute( $input = [] ) {
		return Woocommerce_Pro_Features_Discovery::for_widget();
	}
}
