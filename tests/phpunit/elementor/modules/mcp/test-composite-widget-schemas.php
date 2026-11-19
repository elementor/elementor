<?php

namespace Elementor\Tests\Phpunit\Modules\Mcp;

use Elementor\Modules\CompositeWidgets\Definitions\Widgets_Definitions_Registry;
use Elementor\Modules\CompositeWidgets\Site\Site_Widgets_Access_Controller;
use Elementor\Modules\Mcp\Abilities\Get_Widget_Schema_Ability;
use Elementor\Modules\Mcp\Abilities\List_Widget_Schemas_Ability;
use Elementor\Modules\Mcp\Utils\Pro_Features_Discovery;
use Elementor\Tests\Phpunit\Modules\Mcp\Fixtures\Composite_Widgets_Registry_Factory;
use ElementorEditorTesting\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

require_once __DIR__ . '/fixtures/composite-widgets-registry-factory.php';

/**
 * @group Elementor\Modules\Mcp
 */
class Test_Composite_Widget_Schemas extends Elementor_Test_Base {

	private Widgets_Definitions_Registry $registry;

	public function setUp(): void {
		parent::setUp();

		$this->registry = Composite_Widgets_Registry_Factory::make();
	}

	public function tearDown(): void {
		remove_all_filters( Site_Widgets_Access_Controller::ACCESS_FILTER );

		parent::tearDown();
	}

	public function test_get_widget_schemas__returns_a_composite_widget_schema() {
		// Arrange.
		$this->act_as_admin();

		// Act.
		$result = ( new Get_Widget_Schema_Ability( $this->registry ) )->execute( [
			'widget_type' => [ Composite_Widgets_Registry_Factory::CODE_WIDGET_ID ],
		] );

		// Assert.
		$this->assertSame( [], $result['errors'] );

		$schema = $result['schemas'][ Composite_Widgets_Registry_Factory::CODE_WIDGET_ID ];
		$this->assertSame( [
			'root' => [ 'type' => 'e-flexbox' ],
			'title' => [ 'type' => 'e-heading' ],
			'content' => [
				'type' => 'e-flexbox',
				'slot' => true,
			],
		], $schema['parts'] );
		$this->assertTrue( $schema['insertable'] );
		$this->assertFalse( $schema['archived'] );
		$this->assertContains( 'e-heading', $schema['allowed_part_types'] );
		$this->assertSame( 'my-widget.content', $schema['usage']['part_key'] );

		$this->assertCount( 1, $schema['fields'] );
		$this->assertSame( [
			'part' => 'title',
			'prop' => 'title',
		], $schema['fields'][0]['target'] );
		$this->assertIsArray( $schema['fields'][0]['schema'] );
	}

	/**
	 * @dataProvider site_widget_insertable_provider
	 */
	public function test_get_widget_schemas__flags_site_widgets_that_cant_be_inserted( string $widget_id, string $access, bool $expected_insertable ) {
		// Arrange.
		$this->act_as_admin();
		add_filter( Site_Widgets_Access_Controller::ACCESS_FILTER, fn () => $access );

		// Act.
		$result = ( new Get_Widget_Schema_Ability( $this->registry ) )->execute( [ 'widget_type' => [ $widget_id ] ] );

		// Assert.
		$this->assertSame( $expected_insertable, $result['schemas'][ $widget_id ]['insertable'] );
	}

	public function site_widget_insertable_provider(): array {
		return [
			'active license' => [ Composite_Widgets_Registry_Factory::SITE_WIDGET_ID, Site_Widgets_Access_Controller::ACCESS_ACTIVE, true ],
			'expired license' => [ Composite_Widgets_Registry_Factory::SITE_WIDGET_ID, Site_Widgets_Access_Controller::ACCESS_EXPIRED, false ],
			'archived' => [ Composite_Widgets_Registry_Factory::ARCHIVED_SITE_WIDGET_ID, Site_Widgets_Access_Controller::ACCESS_ACTIVE, false ],
		];
	}

	/**
	 * @dataProvider missing_widget_provider
	 */
	public function test_get_widget_schemas__reports_a_missing_composite_widget( string $widget_id, string $access, string $expected_code ) {
		// Arrange.
		$this->act_as_admin();
		add_filter( Site_Widgets_Access_Controller::ACCESS_FILTER, fn () => $access );

		// Act.
		$result = ( new Get_Widget_Schema_Ability( $this->registry ) )->execute( [ 'widget_type' => [ $widget_id ] ] );

		// Assert.
		$this->assertSame( [], $result['schemas'] );
		$this->assertSame( $expected_code, $result['errors'][ $widget_id ]['code'] );
	}

	public function missing_widget_provider(): array {
		return [
			'unknown code widget' => [ 'test/missing', Site_Widgets_Access_Controller::ACCESS_ACTIVE, 'elementor_not_found' ],
			'unknown site widget with access' => [ 'site/missing', Site_Widgets_Access_Controller::ACCESS_ACTIVE, 'elementor_not_found' ],
			'site widget without access' => [ 'site/missing', Site_Widgets_Access_Controller::ACCESS_NONE, Pro_Features_Discovery::ERROR_CODE ],
		];
	}

	/**
	 * @dataProvider listed_widgets_provider
	 */
	public function test_list_widget_schemas__lists_insertable_composite_widgets_in_the_summary( string $access, array $expected_ids ) {
		// Arrange.
		$this->act_as_admin();
		add_filter( Site_Widgets_Access_Controller::ACCESS_FILTER, fn () => $access );

		// Act.
		$result = ( new List_Widget_Schemas_Ability( $this->registry ) )->execute( [ 'summary' => true ] );

		// Assert.
		$this->assertSame( $expected_ids, array_column( $result['composite_widgets'], 'id' ) );
	}

	public function listed_widgets_provider(): array {
		return [
			'active license' => [
				Site_Widgets_Access_Controller::ACCESS_ACTIVE,
				[ Composite_Widgets_Registry_Factory::SITE_WIDGET_ID, Composite_Widgets_Registry_Factory::CODE_WIDGET_ID ],
			],
			'expired license' => [
				Site_Widgets_Access_Controller::ACCESS_EXPIRED,
				[ Composite_Widgets_Registry_Factory::CODE_WIDGET_ID ],
			],
		];
	}
}
