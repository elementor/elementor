<?php

use Elementor\Modules\AtomicWidgets\Elements\Atomic_Tabs\Atomic_Tabs;
use Elementor\Modules\AtomicWidgets\Elements\Atomic_Tabs\Atomic_Tab;
use Elementor\Modules\AtomicWidgets\Elements\Atomic_Tabs\Atomic_Tab_Panel;
use Elementor\Modules\AtomicWidgets\Elements\Atomic_Tabs\Atomic_Tabs_List;
use Elementor\Modules\AtomicWidgets\Elements\Atomic_Tabs\Atomic_Tabs_Content;
use Elementor\Plugin;
use ElementorEditorTesting\Elementor_Test_Base;
use Spatie\Snapshots\MatchesSnapshots;

class Test_Atomic_Tabs extends Elementor_Test_Base {
	use MatchesSnapshots;

	const TAB_ID_1 = 'tab-1';
	const TAB_ID_2 = 'tab-2';
	const TAB_PANEL_ID_1 = 'panel-1';
	const TAB_PANEL_ID_2 = 'panel-2';
	const TABS_CONTAINER_ID = 'tabs-container';
	const NESTED_TABS_CONTAINER_ID = 'nested-tabs-container';
	const NESTED_TAB_ID_1 = 'nested-tab-1';
	const NESTED_TAB_ID_2 = 'nested-tab-2';
	const NESTED_TAB_PANEL_ID_1 = 'nested-panel-1';
	const NESTED_TAB_PANEL_ID_2 = 'nested-panel-2';

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

	private function create_tabs_instance( array $settings ): object {
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

		$tab_panel_1 = [
			'id' => self::TAB_PANEL_ID_1,
			'elType' => Atomic_Tab_Panel::get_element_type(),
			'settings' => [
				'tab-id' => self::TAB_ID_1,
			],
			'widgetType' => Atomic_Tab_Panel::get_element_type(),
		];

		$tab_panel_2 = [
			'id' => self::TAB_PANEL_ID_2,
			'elType' => Atomic_Tab_Panel::get_element_type(),
			'settings' => [
				'tab-id' => self::TAB_ID_2,
			],
			'widgetType' => Atomic_Tab_Panel::get_element_type(),
		];

		$tabs_list = [
			'id' => 'tabs-list',
			'elType' => Atomic_Tabs_List::get_element_type(),
			'settings' => [],
			'widgetType' => Atomic_Tabs_List::get_element_type(),
			'elements' => [ $tab_1, $tab_2 ],
		];

		$tabs_content = [
			'id' => 'tabs-content',
			'elType' => Atomic_Tabs_Content::get_element_type(),
			'settings' => [],
			'widgetType' => Atomic_Tabs_Content::get_element_type(),
			'elements' => [ $tab_panel_1, $tab_panel_2 ],
		];

		$mock = [
			'id' => self::TABS_CONTAINER_ID,
			'elType' => Atomic_Tabs::get_element_type(),
			'settings' => $settings,
			'widgetType' => Atomic_Tabs::get_element_type(),
			'elements' => [ $tabs_list, $tabs_content ],
		];

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

		$nested_tab_panel_1 = [
			'id' => self::NESTED_TAB_PANEL_ID_1,
			'elType' => Atomic_Tab_Panel::get_element_type(),
			'settings' => [
				'tab-id' => self::NESTED_TAB_ID_1,
			],
			'widgetType' => Atomic_Tab_Panel::get_element_type(),
		];

		$nested_tab_panel_2 = [
			'id' => self::NESTED_TAB_PANEL_ID_2,
			'elType' => Atomic_Tab_Panel::get_element_type(),
			'settings' => [
				'tab-id' => self::NESTED_TAB_ID_2,
			],
			'widgetType' => Atomic_Tab_Panel::get_element_type(),
		];

		$nested_tabs_list = [
			'id' => 'nested-tabs-list',
			'elType' => Atomic_Tabs_List::get_element_type(),
			'settings' => [],
			'widgetType' => Atomic_Tabs_List::get_element_type(),
			'elements' => [ $nested_tab_1, $nested_tab_2 ],
		];

		$nested_tabs_content = [
			'id' => 'nested-tabs-content',
			'elType' => Atomic_Tabs_Content::get_element_type(),
			'settings' => [],
			'widgetType' => Atomic_Tabs_Content::get_element_type(),
			'elements' => [ $nested_tab_panel_1, $nested_tab_panel_2 ],
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

		$outer_tab_panel = [
			'id' => self::TAB_PANEL_ID_1,
			'elType' => Atomic_Tab_Panel::get_element_type(),
			'settings' => [
				'tab-id' => self::TAB_ID_1,
			],
			'widgetType' => Atomic_Tab_Panel::get_element_type(),
			'elements' => [ $nested_tabs ],
		];

		$outer_tabs_list = [
			'id' => 'outer-tabs-list',
			'elType' => Atomic_Tabs_List::get_element_type(),
			'settings' => [],
			'widgetType' => Atomic_Tabs_List::get_element_type(),
			'elements' => [ $outer_tab ],
		];

		$outer_tabs_content = [
			'id' => 'outer-tabs-content',
			'elType' => Atomic_Tabs_Content::get_element_type(),
			'settings' => [],
			'widgetType' => Atomic_Tabs_Content::get_element_type(),
			'elements' => [ $outer_tab_panel ],
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

