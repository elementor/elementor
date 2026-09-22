<?php

namespace Elementor\Testing\Modules\AtomicWidgets;

use Elementor\Modules\AtomicWidgets\Icon_Library_Editor_Config;
use ElementorEditorTesting\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Test_Icon_Library_Editor_Config extends Elementor_Test_Base {
	public function tearDown(): void {
		remove_all_filters( 'elementor/icons_manager/additional_tabs' );

		parent::tearDown();
	}

	public function test_get__includes_font_awesome_filter_items_without_my_libraries_group() {
		// Act.
		$config = Icon_Library_Editor_Config::get();
		$filter_types = array_column( $config['filter'], 'type' );
		$filter_values = array_column( $config['filter'], 'value' );

		// Assert.
		$this->assertContains( Icon_Library_Editor_Config::FILTER_TYPE_ALL, $filter_types );
		$this->assertContains( 'fa-regular', $filter_values );
		$this->assertContains( 'fa-solid', $filter_values );
		$this->assertContains( 'fa-brands', $filter_values );
		$this->assertNotContains( Icon_Library_Editor_Config::FILTER_TYPE_GROUP, $filter_types );
	}

	public function test_get__adds_my_libraries_group_when_additional_tabs_exist() {
		// Arrange.
		add_filter(
			'elementor/icons_manager/additional_tabs',
			static function ( $tabs ) {
				$tabs['nehama-1'] = [
					'name' => 'nehama-1',
					'label' => 'Nehama 1',
					'prefix' => 'nehama-',
					'native' => false,
				];

				return $tabs;
			}
		);

		// Act.
		$config = Icon_Library_Editor_Config::get();
		$labels = array_column( $config['filter'], 'label' );
		$values = array_column( $config['filter'], 'value' );

		// Assert.
		$this->assertContains( 'My libraries', $labels );
		$this->assertContains( 'Nehama 1', $labels );
		$this->assertContains( 'nehama-1', $values );
	}
}
