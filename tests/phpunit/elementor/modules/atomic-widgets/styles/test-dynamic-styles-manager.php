<?php

namespace Elementor\Testing\Modules\AtomicWidgets\Styles;

use Elementor\Modules\AtomicWidgets\Styles\Dynamic_Styles_Manager;
use ElementorEditorTesting\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Test_Dynamic_Styles_Manager extends Elementor_Test_Base {
	public function tearDown(): void {
		Dynamic_Styles_Manager::reset();
		parent::tearDown();
	}

	public function test_hydrate_from_sidecar__registers_definitions() {
		$dsm = Dynamic_Styles_Manager::instance();
		$placeholders = [
			'--e-dyn-demo-v0-z-index' => [
				'$$type' => 'dynamic',
				'value' => [
					'name' => 'fake-tag',
					'settings' => [],
				],
			],
		];

		$encoded = $dsm->definitions_to_sidecar_contents( $placeholders );
		$decoded = json_decode( $encoded, true );

		$dsm->hydrate_from_sidecar( $decoded );

		$definitions = $dsm->get_definitions();
		$this->assertArrayHasKey( '--e-dyn-demo-v0-z-index', $definitions );
	}
}
