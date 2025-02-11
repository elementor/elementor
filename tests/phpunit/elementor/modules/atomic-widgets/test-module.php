<?php
namespace Elementor\Testing\Modules\AtomicWidgets;

use Elementor\Core\Experiments\Manager as Experiments_Manager;
use Elementor\Elements_Manager;
use Elementor\Widgets_Manager;
use Elementor\Frontend;
use Elementor\Modules\AtomicWidgets\PropTypes\Primitives\String_Prop_Type;
use Elementor\Modules\AtomicWidgets\Styles\Style_Definition;
use Elementor\Modules\AtomicWidgets\Styles\Style_Variant;
use Elementor\Core\Files\CSS\Post as Post_CSS;
use Elementor\Modules\AtomicWidgets\Module;
use Elementor\Plugin;
use ElementorEditorTesting\Elementor_Test_Base;
use PHPUnit\Framework\MockObject\MockBuilder;
use PHPUnit\Framework\MockObject\MockObject;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

require_once __DIR__ . '/mock-widget.php';

class Test_Atomic_Module extends Elementor_Test_Base {
	private $experiment_default_state;
	private Frontend $frontend;
	private MockObject $frontend_mock;
	private Widgets_Manager $widgets_manager;
	private MockObject $widgets_manager_mock;
	private Elements_Manager $elements_manager;
	private MockObject $elements_manager_mock;

	public function set_up(): void {
		parent::set_up();

		$this->experiment_default_state = Plugin::instance()->experiments->get_features( Module::EXPERIMENT_NAME )[ 'default' ];

		$this->frontend = Plugin::$instance->frontend;
		$this->frontend_mock = $this->createMock( Frontend::class );
		Plugin::$instance->frontend = $this->frontend_mock;

		$this->widgets_manager = Plugin::$instance->widgets_manager;
		$this->widgets_manager_mock = $this->getMockBuilder( Widgets_Manager::class )->disableOriginalConstructor()->onlyMethods( [ 'get_widget_types' ] )->getMock();
		Plugin::$instance->widgets_manager = $this->widgets_manager_mock;

		$this->elements_manager = Plugin::$instance->elements_manager;
		$this->elements_manager_mock = $this->getMockBuilder( Elements_Manager::class )->disableOriginalConstructor()->onlyMethods( [ 'get_element_types' ] )->getMock();
		Plugin::$instance->elements_manager = $this->elements_manager_mock;

		$this->elements_manager = Plugin::$instance->elements_manager;

		remove_all_filters( 'elementor/editor/v2/packages' );
		remove_all_filters( 'elementor/editor/v2/styles' );
		remove_all_filters( 'elementor/editor/localize_settings' );
		remove_all_filters( 'elementor/widgets/register' );

		remove_all_actions( 'elementor/atomic-widgets/settings/transformers/register' );
		remove_all_actions( 'elementor/atomic-widgets/styles/transformers/register' );
		remove_all_actions( 'elementor/elements/elements_registered' );
		remove_all_actions( 'elementor/css-file/post/parse' );
		remove_all_actions( 'elementor/editor/after_enqueue_scripts' );
		remove_all_actions( 'elementor/frontend/after_register_styles' );
	}

	public function tear_down() {
		parent::tear_down();

		Plugin::instance()->experiments->set_feature_default_state( Module::EXPERIMENT_NAME, $this->experiment_default_state );
		Plugin::$instance->frontend = $this->frontend;
		Plugin::$instance->widgets_manager = $this->widgets_manager;
		Plugin::$instance->elements_manager = $this->elements_manager;
	}

	public function test_it__enqueues_packages_when_experiment_on() {
		// Arrange
		$this->experiment_on();

		// Act
		new Module();

		// Assert
		$packages = apply_filters( 'elementor/editor/v2/packages', [] );
		$this->assertEquals( Module::PACKAGES, $packages );
	}

	public function test_it__does_not_enqueue_packages_and_styles_when_experiment_off() {
		// Arrange
		$this->experiment_off();

		// Act
		new Module();

		// Assert
		$packages = apply_filters( 'elementor/editor/v2/packages', [] );
		$this->assertEmpty( $packages );
	}

	public function test_it__inject_base_styles() {
		// Arrange
		$this->experiment_on();

		new Module();

		$widget = Mock_Widget::make( [
			'base_styles' => [
				'base' => Style_Definition::make()
					->add_variant(
						Style_Variant::make()
							->add_prop( 'color', String_Prop_Type::generate( 'red' ) )
							->add_prop( 'font-family', String_Prop_Type::generate( 'Poppins' ) )
					)
			]
		] );

		$this->widgets_manager_mock->method( 'get_widget_types' )->willReturn( [ $widget ] );
		$this->elements_manager_mock->method( 'get_element_types' )->willReturn( [] );

		Plugin::$instance->kits_manager->create_new_kit( 'kit' );
		$kit = Plugin::$instance->kits_manager->get_active_kit();

		$this->frontend_mock->expects( $this->once() )->method( 'enqueue_font' )->with( 'Poppins' );

		// Act
		$post_css = Post_CSS::create( $kit->get_id() );

		// Assert
		$css = $post_css->get_content();
		$this->assertStringContainsString( '.elementor .test-widget-base{font-family:Poppins;color:red;}', $css );
	}


	private function experiment_on() {
		Plugin::instance()->experiments->set_feature_default_state( Module::EXPERIMENT_NAME, Experiments_Manager::STATE_ACTIVE );
	}

	private function experiment_off() {
		Plugin::instance()->experiments->set_feature_default_state( Module::EXPERIMENT_NAME, Experiments_Manager::STATE_INACTIVE );
	}
}
