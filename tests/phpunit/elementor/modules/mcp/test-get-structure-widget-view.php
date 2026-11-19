<?php

namespace Elementor\Tests\Phpunit\Modules\Mcp;

use Elementor\Modules\CompositeWidgets\Site\Site_Widgets_Access_Controller;
use Elementor\Modules\Mcp\Abilities\Get_Structure_Ability;
use Elementor\Plugin;
use Elementor\Tests\Phpunit\Modules\Mcp\Fixtures\Composite_Widgets_Registry_Factory;
use ElementorEditorTesting\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

require_once __DIR__ . '/fixtures/composite-widgets-registry-factory.php';

/**
 * @group Elementor\Modules\Mcp
 */
class Test_Get_Structure_Widget_View extends Elementor_Test_Base {

	public function setUp(): void {
		parent::setUp();

		Plugin::$instance->kits_manager->create_new_kit( 'Widget view', [], true );
	}

	public function tearDown(): void {
		remove_all_filters( Site_Widgets_Access_Controller::ACCESS_FILTER );

		parent::tearDown();
	}

	public function test_execute__returns_the_widget_markers() {
		// Arrange.
		$this->act_as_admin();
		$post_id = $this->given_document_with_widget( Composite_Widgets_Registry_Factory::CODE_WIDGET_ID );

		// Act.
		$result = $this->make_ability()->execute( [ 'post_id' => $post_id ] );

		// Assert.
		$root = $result['elements'][0];
		[ $title, $slot ] = $root['elements'];

		$this->assertSame( [
			'id' => Composite_Widgets_Registry_Factory::CODE_WIDGET_ID,
			'version' => Composite_Widgets_Registry_Factory::WIDGET_VERSION,
		], $root['widget'] );
		$this->assertSame( 'root', $root['part'] );
		$this->assertSame( 'title', $title['part'] );
		$this->assertArrayNotHasKey( 'slot', $title );
		$this->assertSame( 'content', $slot['part'] );
		$this->assertTrue( $slot['slot'] );
		$this->assertSame( 'slot-child', $slot['elements'][0]['id'] );
	}

	/**
	 * @dataProvider site_widget_access_provider
	 */
	public function test_execute__returns_only_the_root_of_a_hidden_site_widget( string $access, bool $is_hidden ) {
		// Arrange.
		$this->act_as_admin();
		add_filter( Site_Widgets_Access_Controller::ACCESS_FILTER, fn () => $access );
		$post_id = $this->given_document_with_widget( Composite_Widgets_Registry_Factory::SITE_WIDGET_ID );

		// Act.
		$result = $this->make_ability()->execute( [
			'post_id' => $post_id,
			'element_id' => 'widget-root',
			'include_content' => true,
		] );

		// Assert.
		$root = $result['elements'][0];

		if ( ! $is_hidden ) {
			$this->assertCount( 2, $root['elements'] );
			$this->assertArrayHasKey( 'settings', $root );
			return;
		}

		$this->assertSame( [
			'id' => 'widget-root',
			'elType' => 'e-flexbox',
			'widget' => [
				'id' => Composite_Widgets_Registry_Factory::SITE_WIDGET_ID,
				'unavailable' => 'pro_required',
			],
		], $root );
	}

	public function site_widget_access_provider(): array {
		return [
			'active license' => [ Site_Widgets_Access_Controller::ACCESS_ACTIVE, false ],
			'expired license' => [ Site_Widgets_Access_Controller::ACCESS_EXPIRED, false ],
			'no license' => [ Site_Widgets_Access_Controller::ACCESS_NONE, true ],
		];
	}

	private function make_ability(): Get_Structure_Ability {
		return new Get_Structure_Ability();
	}

	private function given_document_with_widget( string $widget_id ): int {
		$post_id = $this->factory()->create_and_get_custom_post( [ 'post_status' => 'draft' ] )->ID;
		$elements = [
			[
				'id' => 'widget-root',
				'elType' => 'e-flexbox',
				'settings' => [],
				'part' => 'root',
				'widget' => [
					'id' => $widget_id,
					'version' => Composite_Widgets_Registry_Factory::WIDGET_VERSION,
				],
				'elements' => [
					[
						'id' => 'widget-title',
						'elType' => 'widget',
						'widgetType' => 'e-heading',
						'settings' => [],
						'part' => 'title',
						'isLocked' => true,
						'elements' => [],
					],
					[
						'id' => 'widget-slot',
						'elType' => 'e-flexbox',
						'settings' => [],
						'part' => 'content',
						'slot' => true,
						'elements' => [
							[
								'id' => 'slot-child',
								'elType' => 'widget',
								'widgetType' => 'e-heading',
								'settings' => [],
								'elements' => [],
							],
						],
					],
				],
			],
		];

		$document = Plugin::$instance->documents->get( $post_id, false );
		$document->set_is_built_with_elementor( true );
		$document->save( [ 'elements' => $elements ] );

		return $post_id;
	}
}
