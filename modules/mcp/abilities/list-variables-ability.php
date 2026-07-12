<?php

namespace Elementor\Modules\Mcp\Abilities;

use Elementor\Modules\Variables\Services\Batch_Operations\Batch_Processor;
use Elementor\Modules\Variables\Services\Variables_Service;
use Elementor\Modules\Variables\Storage\Variables_Repository;
use Elementor\Plugin;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class List_Variables_Ability extends Abstract_Ability {
	const URI = 'elementor://global-variables';

	private ?Variables_Service $service;

	public function __construct( ?Variables_Service $service = null ) {
		$this->service = $service;
	}

	protected function get_ability_id(): string {
		return 'elementor/list-variables';
	}

	protected function get_definition(): Ability_Definition {
		return new Ability_Definition(
			__( 'List Global Variables', 'elementor' ),
			__( 'Returns the list of v4 global variables (colors, fonts, sizes) defined on the active kit.', 'elementor' ),
			'elementor',
			[ 'type' => 'object' ],
			[
				'mcp' => [
					'type' => 'resource',
					'uri' => self::URI,
					'public' => true,
					'mimeType' => 'application/json',
					'description' => __( 'Global variables available (v4)', 'elementor' ),
				],
			],
			fn() => current_user_can( 'edit_posts' )
		);
	}

	public function execute( $input = [] ) {
		$payload = $this->get_service()->load();

		return array_filter( $payload['data'] ?? [], fn( $variable ) => empty( $variable['deleted'] ) );
	}

	private function get_service(): Variables_Service {
		if ( $this->service ) {
			return $this->service;
		}

		$kit = Plugin::$instance->kits_manager->get_active_kit();

		return new Variables_Service(
			new Variables_Repository( $kit ),
			new Batch_Processor()
		);
	}
}
