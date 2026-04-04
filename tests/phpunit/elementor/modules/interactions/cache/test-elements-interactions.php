<?php

use Elementor\Modules\Interactions\Cache\Elements_Interactions;
use PHPUnit\Framework\TestCase;

require_once __DIR__ . '/../utils.php';

/**
 * @group Elementor\Modules
 * @group Elementor\Modules\Interactions
 * @group Elementor\Modules\Interactions\Cache
 */
class Test_Elements_Interactions extends TestCase {
	use Interactions_Utils;

	// ------------------------------------------------------------------------

	public function test_parse_from__with_no_interactions() {
		$parser = new Elements_Interactions();
		$parser->parse_from( $this->sample_payload_with_no_interactions() );
		$this->assertEquals( [], $parser->all() );
	}

	private function sample_payload_with_no_interactions() {
		return [
			'elements' => [
				[
					'id' => '1',
					'elType' => 'e-flexbox',
					'settings' => [],
					'elements' => [
						[
							'id' => '2',
							'elType' => 'widget',
							'widgetType' => 'e-heading',
							'settings' => [],
							'elements' => [],
						],
					],
				],
			],
		];
	}

	// ------------------------------------------------------------------------

	public function test_parse_from__with_interactions() {
		$parser = new Elements_Interactions();
		$parser->parse_from( $this->sample_payload_with_interactions() );
		$this->assertEquals( [
			'element-1' => [
				$this->create_interaction_item( 'id-1', [
					'trigger' => $this->create_trigger(),
					'animation' => $this->create_animation(),
				] ),
			],
		], $parser->all() );
	}

	private function sample_payload_with_interactions() {
		return [
			'elements' => [
				[
					'id' => 'element-1',
					'elType' => 'e-flexbox',
					'settings' => [],
					'interactions' => $this->create_interactions_list( [
						$this->create_interaction_item( 'id-1', [
							'trigger' => $this->create_trigger(),
							'animation' => $this->create_animation(),
						] ),
					] ),
				],
			],
		];
	}

	// ------------------------------------------------------------------------

	public function test_parse_from__with_nested_interactions() {
		$parser = new Elements_Interactions();
		$parser->parse_from( $this->sample_payload_with_nested_interactions() );
		$this->assertEquals( [
			'element-2' => [
				$this->create_interaction_item( 'id-1', [
					'trigger' => $this->create_trigger(),
					'animation' => $this->create_animation(),
				] ),
			],
		], $parser->all() );
	}

	private function sample_payload_with_nested_interactions() {
		return [
			'elements' => [
				[
					'id' => 'element-1',
					'elType' => 'e-flexbox',
					'settings' => [],
					'elements' => [
						[
							'id' => 'element-2',
							'elType' => 'widget',
							'widgetType' => 'e-heading',
							'settings' => [],
							'interactions' => $this->create_interactions_list( [
								$this->create_interaction_item( 'id-1', [
									'trigger' => $this->create_trigger(),
									'animation' => $this->create_animation(),
								] ),
							] ),
						],
					],
				],
			],
		];
	}
}