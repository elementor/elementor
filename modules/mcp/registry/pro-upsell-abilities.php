<?php

namespace Elementor\Modules\Mcp\Registry;

use Elementor\Modules\Mcp\Abilities\Pro_Upsell_Ability;
use Elementor\Modules\Mcp\Abilities\Utils\Prompt_Loader;
use Elementor\Modules\Mcp\Abilities\Utils\Site_Parts_Schema;
use Elementor\Modules\Mcp\Module as Mcp_Module;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Pro_Upsell_Abilities {

	const SITE_PARTS_UPGRADE_URL = 'https://go.elementor.com/go-pro-mcp-upgrade-site-parts/';

	const MANAGE_SITE_PARTS_ID = 'elementor/manage-site-parts';
	const LIST_SITE_PARTS_ID = 'elementor/list-site-parts';

	/** @return Pro_Upsell_Ability[] */
	public static function create( bool $has_pro ): array {
		if ( $has_pro ) {
			return [];
		}

		$upgrade_url = Mcp_Module::get_promotion_upgrade_url( self::SITE_PARTS_UPGRADE_URL );

		return array_map(
			fn( array $row ) => new Pro_Upsell_Ability(
				$row['id'],
				$row['label'],
				Prompt_Loader::load( basename( $row['id'] ) ),
				$row['feature_name'],
				$upgrade_url,
				$row['input_schema']
			),
			self::definitions()
		);
	}

	private static function definitions(): array {
		return [
			[
				'id' => self::MANAGE_SITE_PARTS_ID,
				'label' => __( 'Manage Elementor Site Parts', 'elementor' ),
				'feature_name' => __( 'Managing site parts', 'elementor' ),
				'input_schema' => Site_Parts_Schema::manage_input(),
			],
			[
				'id' => self::LIST_SITE_PARTS_ID,
				'label' => __( 'List Site Parts', 'elementor' ),
				'feature_name' => __( 'Listing site parts', 'elementor' ),
				'input_schema' => Site_Parts_Schema::list_input(),
			],
		];
	}
}
