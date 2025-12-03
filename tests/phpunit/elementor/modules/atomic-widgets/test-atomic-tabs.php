<?php

use Elementor\Modules\AtomicWidgets\Elements\Atomic_Tabs\Atomic_Tabs;
use Elementor\Modules\AtomicWidgets\Elements\Atomic_Tabs\Atomic_Tab;
use Elementor\Modules\AtomicWidgets\Elements\Atomic_Tabs\Atomic_Tab_Content;
use Elementor\Modules\AtomicWidgets\Elements\Atomic_Tabs\Atomic_Tabs_Menu;
use Elementor\Modules\AtomicWidgets\Elements\Atomic_Tabs\Atomic_Tabs_Content_Area;
use Elementor\Plugin;
use ElementorEditorTesting\Elementor_Test_Base;
use Spatie\Snapshots\MatchesSnapshots;

class Test_Atomic_Tabs extends Elementor_Test_Base {
	use MatchesSnapshots;

	const TAB_ID_1 = 'tab1';
	const TAB_ID_2 = 'tab2';
	const TAB_CONTENT_ID_1 = 'content1';
	const TAB_CONTENT_ID_2 = 'content2';
	const TABS_CONTAINER_ID = 'tabscontainer';
	const NESTED_TABS_CONTAINER_ID = 'nestedtabscontainer';
	const NESTED_TAB_ID_1 = 'nestedtab1';
	const NESTED_TAB_ID_2 = 'nestedtab2';
	const NESTED_TAB_CONTENT_ID_1 = 'nestedcontent1';
	const NESTED_TAB_CONTENT_ID_2 = 'nestedcontent2';

	protected $instance;

	public function setUp(): void {
		parent::setUp();
	}

	public function test__render_atomic_tabs_with_active_tab(): void {
		// Arrange.
		$this->instance = $this->create_tabs_instance( [
			'default-active-tab' => self::TAB_ID_1,
		] );

		// Act.
		ob_start();
		$this->instance->print_element();
		$rendered_output = ob_get_clean();

		// Assert.
		$this->assertMatchesSnapshot( $rendered_output );
	}

	public function test__render_atomic_tabs_with_nested_context(): void {
		// Arrange.
		$this->instance = $this->create_nested_tabs_instance();

		// Act.
		ob_start();
		$this->instance->print_element();
		$rendered_output = ob_get_clean();

		// Assert.
		$this->assertMatchesSnapshot( $rendered_output );
	}

	public function test__render_atomic_tabs_with_interactions(): void {
		// Arrange.
		$this->instance = $this->create_tabs_instance( [], [
			'version' => 1,
			'items' => [
				[
					'animation' => [
						'animation_type' => 'full-preset',
						'animation_id' => 'load-fade-in--300-0',
					],
				],
			],
		] );

		// Act.
		ob_start();
		$this->instance->print_element();
		$rendered_output = ob_get_clean();

		// Assert.
		$this->assertMatchesSnapshot( $rendered_output );
	}

	private function create_tabs_instance( array $settings, array $interactions = [] ): object {
		$tab_1 = [
			'id' => self::TAB_ID_1,
			'elType' => Atomic_Tab::get_element_type(),
			'settings' => [],
			'widgetType' => Atomic_Tab::get_element_type(),
		];

		$tab_2 = [
			'id' => self::TAB_ID_2,
			'elType' => Atomic_Tab::get_element_type(),
			'settings' => [],
			'widgetType' => Atomic_Tab::get_element_type(),
		];

		$tab_content_1 = [
			'id' => self::TAB_CONTENT_ID_1,
			'elType' => Atomic_Tab_Content::get_element_type(),
			'settings' => [
				'tab-id' => self::TAB_ID_1,
			],
			'widgetType' => Atomic_Tab_Content::get_element_type(),
		];

		$tab_content_2 = [
			'id' => self::TAB_CONTENT_ID_2,
			'elType' => Atomic_Tab_Content::get_element_type(),
			'settings' => [
				'tab-id' => self::TAB_ID_2,
			],
			'widgetType' => Atomic_Tab_Content::get_element_type(),
		];

		$tabs_list = [
			'id' => 'tabs-list',
			'elType' => Atomic_Tabs_Menu::get_element_type(),
			'settings' => [],
			'widgetType' => Atomic_Tabs_Menu::get_element_type(),
			'elements' => [ $tab_1, $tab_2 ],
		];

		$tabs_content = [
			'id' => 'tabs-content',
			'elType' => Atomic_Tabs_Content_Area::get_element_type(),
			'settings' => [],
			'widgetType' => Atomic_Tabs_Content_Area::get_element_type(),
			'elements' => [ $tab_content_1, $tab_content_2 ],
		];

		$mock = [
			'id' => self::TABS_CONTAINER_ID,
			'elType' => Atomic_Tabs::get_element_type(),
			'settings' => $settings,
			'widgetType' => Atomic_Tabs::get_element_type(),
			'elements' => [ $tabs_list, $tabs_content ],
		];

		if ( ! empty( $interactions ) ) {
			$mock['interactions'] = $interactions;
		}

		return Plugin::$instance->elements_manager->create_element_instance( $mock );
	}

	private function create_nested_tabs_instance(): object {
		$nested_tab_1 = [
			'id' => self::NESTED_TAB_ID_1,
			'elType' => Atomic_Tab::get_element_type(),
			'settings' => [],
			'widgetType' => Atomic_Tab::get_element_type(),
		];

		$nested_tab_2 = [
			'id' => self::NESTED_TAB_ID_2,
			'elType' => Atomic_Tab::get_element_type(),
			'settings' => [],
			'widgetType' => Atomic_Tab::get_element_type(),
		];

		$nested_tab_content_1 = [
			'id' => self::NESTED_TAB_CONTENT_ID_1,
			'elType' => Atomic_Tab_Content::get_element_type(),
			'settings' => [
				'tab-id' => self::NESTED_TAB_ID_1,
			],
			'widgetType' => Atomic_Tab_Content::get_element_type(),
		];

		$nested_tab_content_2 = [
			'id' => self::NESTED_TAB_CONTENT_ID_2,
			'elType' => Atomic_Tab_Content::get_element_type(),
			'settings' => [
				'tab-id' => self::NESTED_TAB_ID_2,
			],
			'widgetType' => Atomic_Tab_Content::get_element_type(),
		];

		$nested_tabs_list = [
			'id' => 'nested-tabs-list',
			'elType' => Atomic_Tabs_Menu::get_element_type(),
			'settings' => [],
			'widgetType' => Atomic_Tabs_Menu::get_element_type(),
			'elements' => [ $nested_tab_1, $nested_tab_2 ],
		];

		$nested_tabs_content = [
			'id' => 'nested-tabs-content',
			'elType' => Atomic_Tabs_Content_Area::get_element_type(),
			'settings' => [],
			'widgetType' => Atomic_Tabs_Content_Area::get_element_type(),
			'elements' => [ $nested_tab_content_1, $nested_tab_content_2 ],
		];

		$nested_tabs = [
			'id' => self::NESTED_TABS_CONTAINER_ID,
			'elType' => Atomic_Tabs::get_element_type(),
			'settings' => [
				'default-active-tab' => self::NESTED_TAB_ID_2,
			],
			'widgetType' => Atomic_Tabs::get_element_type(),
			'elements' => [ $nested_tabs_list, $nested_tabs_content ],
		];

		$outer_tab = [
			'id' => self::TAB_ID_1,
			'elType' => Atomic_Tab::get_element_type(),
			'settings' => [],
			'widgetType' => Atomic_Tab::get_element_type(),
		];

		$outer_tab_content = [
			'id' => self::TAB_CONTENT_ID_1,
			'elType' => Atomic_Tab_Content::get_element_type(),
			'settings' => [
				'tab-id' => self::TAB_ID_1,
			],
			'widgetType' => Atomic_Tab_Content::get_element_type(),
			'elements' => [ $nested_tabs ],
		];

		$outer_tabs_list = [
			'id' => 'outer-tabs-list',
			'elType' => Atomic_Tabs_Menu::get_element_type(),
			'settings' => [],
			'widgetType' => Atomic_Tabs_Menu::get_element_type(),
			'elements' => [ $outer_tab ],
		];

		$outer_tabs_content = [
			'id' => 'outer-tabs-content',
			'elType' => Atomic_Tabs_Content_Area::get_element_type(),
			'settings' => [],
			'widgetType' => Atomic_Tabs_Content_Area::get_element_type(),
			'elements' => [ $outer_tab_content ],
		];

		$mock = [
			'id' => self::TABS_CONTAINER_ID,
			'elType' => Atomic_Tabs::get_element_type(),
			'settings' => [
				'default-active-tab' => self::TAB_ID_1,
			],
			'widgetType' => Atomic_Tabs::get_element_type(),
			'elements' => [ $outer_tabs_list, $outer_tabs_content ],
		];

		return Plugin::$instance->elements_manager->create_element_instance( $mock );
	}
}

