<?php

namespace Elementor\Testing\Modules\Favorites\Types;

use Elementor\Core\Utils\Collection;
use Elementor\Modules\Favorites\Types\Widgets;
use Elementor\Plugin;
use Elementor\Tests\Phpunit\Includes\Base\Mock\Mock_Widget;
use ElementorEditorTesting\Elementor_Test_Base;

class Test_Widgets extends Elementor_Test_Base {

	const FAVORITES_DATA = [ 'heading', 'image', 'button', 'not-really-a-widget' ];

	public function test_should_get_name() {
		$module = new Widgets();

		$this->assertEquals( 'widgets', $module->get_name() );
	}

	public function test_prepare() {
		$module = new Widgets();
		$unavailable_widget_index = 'not-really-a-widget';

		$this->assertEquals(
			array_diff( static::FAVORITES_DATA, [ $unavailable_widget_index ] ),
			$module->prepare( static::FAVORITES_DATA )
		);
	}

	public function test_update_widget_categories_given_existing_widget() {
		require_once __DIR__ . '/../../../includes/base/mock/mock-widget.php';

		$widget = new Mock_Widget( [ 'settings' => [], 'id' => '1' ], [] );
		$widget_type = $widget->get_name();

		Plugin::$instance->widgets_manager->register( $widget );

		$module = new Widgets();
		$module->merge( [ $widget_type ] );
		$module->update_widget_categories( Plugin::$instance->documents->get_current() );

		$this->assertContains(
			$module::CATEGORY_SLUG,
			Plugin::$instance->widgets_manager->get_widget_types( $widget_type )->get_config()[ 'categories' ]
		);

		// Cleanup
		Plugin::$instance->widgets_manager->unregister( 'mock-widget' );
	}

	/**
	 * @doesNotPerformAssertions
	 */
	public function test_update_widget_categories_not_fails_given_unavailable_widget() {
		$widget_type = 'unavailable_widget_type';

		$module = new Widgets();
		$module->merge( [ $widget_type ] );

		$module->update_widget_categories( Plugin::$instance->documents->get_current() );
	}
}
