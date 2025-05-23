<?php

namespace Elementor\Testing\Modules\KitElementsDefaults;

use Elementor\Modules\KitElementsDefaults\Module;
use Elementor\Modules\KitElementsDefaults\Usage;
use Elementor\Plugin;
use ElementorEditorTesting\Elementor_Test_Base;

class Test_Usage extends Elementor_Test_Base {

	private $kit;

	public function setUp() {
		parent::setUp();

		$this->kit = Plugin::$instance->kits_manager->get_active_kit();
	}

	public function test_get_usage_data() {
		// Arrange.
		remove_all_filters( 'elementor/tracker/send_tracking_data_params' );

		$this->kit->update_meta( Module::META_KEY, json_encode( [
			'section' => [
				'color' => '#FFF',
				'background_color' => 'red',
			],
			'column' => [
				'width' => [
					'size' => 50,
					'unit' => '%',
				],
			],
		] ) );

		// Act.
		( new Usage() )->register();

		$usage = apply_filters( 'elementor/tracker/send_tracking_data_params', [
			'usages' => [
				'kit' => [
					'some_usage' => 'that_should_be_preserved',
				],
				'other_usage' => 'that_should_be_preserved',
			],
		] );

		// Assert.
		$this->assertEqualSets( [
			'usages' => [
				'kit' => [
					'some_usage' => 'that_should_be_preserved',
					'defaults' => [
						'count' => 2,
						'elements' => [
							'section',
							'column',
						],
					],
				],
				'other_usage' => 'that_should_be_preserved',
			],
		], $usage );
	}
}
