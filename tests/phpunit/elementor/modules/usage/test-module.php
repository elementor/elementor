<?php
namespace Elementor\Tests\Phpunit\Elementor\Modules\Usage;

use Elementor\Modules\Usage\Module;
use Elementor\Plugin;
use ElementorEditorTesting\Elementor_Test_Base;
use Elementor\Tests\Phpunit\Elementor\Modules\Usage\DynamicTags\Link;
use Elementor\Tests\Phpunit\Elementor\Modules\Usage\DynamicTags\Title;
use ElementorEditorTesting\Factories\Documents;

class Test_Module extends Elementor_Test_Base {
	/**
	 * TODO: Remove - Backwards compatibility.
	 *
	 * @var array
	 */
	static $document_mock_default = [
		'settings' => [
			'post_status' => 'publish',
		],
		'elements' => [
			[
				'id' => 'd50d8c5',
				'elType' => 'section',
				'isInner' => false,
				'settings' => [],
				'elements' => [
					[
						'id' => 'a2e9b68',
						'elType' => 'column',
						'isInner' => false,
						'settings' => [ '_column_size' => 100, ],
						'elements' => [
							[
								'id' => '5a1e8e5',
								'elType' => 'widget',
								'isInner' => false,
								'settings' => [ 'text' => 'I\'m not a default', ],
								'elements' => [],
								'widgetType' => 'button',
							],
						],
					],
				],
			],
		],
	];

	public function test() {
		$this->assertTrue( true );
	}
}
