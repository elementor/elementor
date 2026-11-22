<?php

namespace Elementor\Testing\Modules\CompositeWidgets\Mcp;

use Elementor\Core\Experiments\Manager as Experiments_Manager;
use Elementor\Modules\CompositeWidgets\Definitions\Widgets_Definitions_Registry;
use Elementor\Modules\CompositeWidgets\Mcp\Composite_Widgets_Resource_Ability;
use Elementor\Modules\CompositeWidgets\Module as Composite_Widgets_Module;
use Elementor\Modules\CompositeWidgets\Site\Site_Widgets_Access_Controller;
use Elementor\Modules\Mcp\Module as Mcp_Module;
use Elementor\Plugin;
use Elementor\Testing\Modules\CompositeWidgets\Fixtures\Composite_Widgets_Registry_Factory;
use ElementorEditorTesting\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

require_once __DIR__ . '/../fixtures/composite-widgets-registry-factory.php';

class Test_Composite_Widgets_Resource_Ability extends Elementor_Test_Base {

	private Widgets_Definitions_Registry $registry;

	public function setUp(): void {
		parent::setUp();

		$this->registry = Composite_Widgets_Registry_Factory::make();
	}

	public function tearDown(): void {
		remove_all_filters( Site_Widgets_Access_Controller::ACCESS_FILTER );

		parent::tearDown();
	}

	public function test_execute__describes_each_widget_with_its_parts_and_fields() {
		// Arrange.
		$this->act_as_admin();

		// Act.
		$resource = $this->read_resource();

		// Assert.
		$widget = $resource['widgets'][ Composite_Widgets_Registry_Factory::CODE_WIDGET_ID ];

		$this->assertSame( [
			'root' => [ 'type' => 'e-flexbox' ],
			'title' => [ 'type' => 'e-heading' ],
			'content' => [
				'type' => 'e-flexbox',
				'slot' => true,
			],
		], $widget['parts'] );
		$this->assertTrue( $widget['insertable'] );
		$this->assertFalse( $widget['archived'] );
		$this->assertCount( 1, $widget['fields'] );
		$this->assertSame( [
			'part' => 'title',
			'prop' => 'title',
		], $widget['fields'][0]['target'] );
		$this->assertIsArray( $widget['fields'][0]['schema'] );
		$this->assertContains( 'e-heading', $resource['allowed_part_types'] );
		$this->assertStringContainsString( '<e-widget', implode( ' ', $resource['usage'] ) );
	}

	/**
	 * @dataProvider experiment_states_provider
	 */
	public function test_get_composite_widgets_abilities__adds_the_resource_only_with_the_experiment( string $state, bool $expected_registered ) {
		// Arrange.
		$original_state = Plugin::$instance->experiments->get_features( Composite_Widgets_Module::EXPERIMENT_NAME )['default'];
		Plugin::$instance->experiments->set_feature_default_state( Composite_Widgets_Module::EXPERIMENT_NAME, $state );

		// Act.
		$abilities = Mcp_Module::get_composite_widgets_abilities();

		// Assert.
		Plugin::$instance->experiments->set_feature_default_state( Composite_Widgets_Module::EXPERIMENT_NAME, $original_state );
		$this->assertSame( $expected_registered, ! empty( $abilities ) && $abilities[0] instanceof Composite_Widgets_Resource_Ability );
	}

	public function experiment_states_provider(): array {
		return [
			'active' => [ Experiments_Manager::STATE_ACTIVE, true ],
			'inactive' => [ Experiments_Manager::STATE_INACTIVE, false ],
		];
	}

	/**
	 * @dataProvider insertable_provider
	 */
	public function test_execute__flags_site_widgets_that_cant_be_inserted( string $widget_id, string $access, bool $expected_insertable ) {
		// Arrange.
		$this->act_as_admin();
		add_filter( Site_Widgets_Access_Controller::ACCESS_FILTER, fn () => $access );

		// Act.
		$resource = $this->read_resource();

		// Assert.
		$this->assertSame( $expected_insertable, $resource['widgets'][ $widget_id ]['insertable'] );
	}

	public function insertable_provider(): array {
		return [
			'active license' => [ Composite_Widgets_Registry_Factory::SITE_WIDGET_ID, Site_Widgets_Access_Controller::ACCESS_ACTIVE, true ],
			'expired license' => [ Composite_Widgets_Registry_Factory::SITE_WIDGET_ID, Site_Widgets_Access_Controller::ACCESS_EXPIRED, false ],
			'archived' => [ Composite_Widgets_Registry_Factory::ARCHIVED_SITE_WIDGET_ID, Site_Widgets_Access_Controller::ACCESS_ACTIVE, false ],
		];
	}

	/**
	 * @return array{widgets: array<string, array>, allowed_part_types: string[]}
	 */
	private function read_resource(): array {
		$resource = json_decode( ( new Composite_Widgets_Resource_Ability( $this->registry ) )->execute(), true );
		$resource['widgets'] = array_column( $resource['widgets'], null, 'id' );

		return $resource;
	}
}
