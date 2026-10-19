<?php

namespace Elementor\Modules\Mcp\Abilities;

use Elementor\Core\Common\Modules\Connect\Module as ConnectModule;
use Elementor\Modules\Mcp\Abilities\Utils\Prompt_Loader;
use Elementor\Plugin;
use Elementor\Utils;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Get_License_Status_Ability extends Abstract_Ability {

	const STATUS_ACTIVE = 'active';
	const STATUS_EXPIRED = 'expired';
	const STATUS_INACTIVE = 'inactive';
	const STATUS_PRO_NOT_INSTALLED = 'pro_not_installed';

	const PLANS_CONTEXT = 'mcp';

	protected function get_ability_id(): string {
		return 'elementor/get-license-status';
	}

	protected function get_definition(): Ability_Definition {
		return new Ability_Definition(
			__( 'Get Elementor License Status', 'elementor' ),
			Prompt_Loader::load( 'get-license-status' ),
			'elementor',
			[
				'type' => 'object',
				'properties' => [
					'status' => [
						'type' => 'string',
						'enum' => [
							self::STATUS_ACTIVE,
							self::STATUS_EXPIRED,
							self::STATUS_INACTIVE,
							self::STATUS_PRO_NOT_INSTALLED,
						],
						'description' => 'Elementor Pro license state.',
					],
					'tier' => [
						'type' => 'string',
						'description' => 'Plan tier id. Always "free" unless status is "active".',
					],
					'label' => [
						'type' => 'string',
						'description' => 'Human readable plan name.',
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
			fn() => current_user_can( 'manage_options' )
		);
	}

	public function execute( $input = [] ) {
		$tier = Utils::get_license_access_tier();

		return [
			'status' => $this->resolve_status(),
			'tier' => $tier,
			'label' => $this->resolve_label( $tier ),
		];
	}

	private function resolve_status(): string {
		if ( Utils::is_license_active() ) {
			return self::STATUS_ACTIVE;
		}

		if ( Utils::is_license_expired() ) {
			return self::STATUS_EXPIRED;
		}

		return Utils::has_pro() ? self::STATUS_INACTIVE : self::STATUS_PRO_NOT_INSTALLED;
	}

	private function resolve_label( string $tier ): string {
		/** @var ConnectModule $connect */
		$connect = Plugin::$instance->common->get_component( 'connect' );
		$plans = $connect->get_subscription_plans( self::PLANS_CONTEXT );

		return $plans[ $tier ]['label'] ?? ucfirst( $tier );
	}
}
