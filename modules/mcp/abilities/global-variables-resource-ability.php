<?php

namespace Elementor\Modules\Mcp\Abilities;

use Elementor\Modules\Variables\Services\Batch_Operations\Batch_Processor;
use Elementor\Modules\Variables\Services\Variables_Service;
use Elementor\Modules\Variables\Storage\Variables_Repository;
use Elementor\Plugin;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Global_Variables_Resource_Ability extends Abstract_Ability {
	const URI = 'elementor://global-variables';

	protected function get_ability_id(): string {
		return 'elementor/global-variables-resource';
	}

	protected function get_definition(): Ability_Definition {
		return new Ability_Definition(
			__( 'Global Variables', 'elementor' ),
			__( 'Design tokens (colors, fonts, sizes) from the active kit; check before styling with variables.', 'elementor' ),
			'elementor',
			[ 'type' => 'string' ],
			[
				'mcp' => [
					'type'        => 'resource',
					'uri'         => self::URI,
					'public'      => true,
					'mimeType'    => 'application/json',
					'description' => __( 'Variables list, total count, and watermark from the active kit.', 'elementor' ),
				],
			],
			fn() => current_user_can( 'edit_posts' )
		);
	}

	public function execute( $input = [] ) {
		$kit = Plugin::$instance->kits_manager->get_active_kit();

		$variables_service = new Variables_Service(
			new Variables_Repository( $kit ),
			new Batch_Processor()
		);

		$variables_payload = $variables_service->load();

		$data = $variables_payload['data'] ?? [];

		return wp_json_encode( [
			'variables' => $data,
			'total' => count( $data ),
			'watermark' => $variables_payload['watermark'] ?? null,
		] );
	}
}
