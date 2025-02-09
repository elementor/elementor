<?php
namespace Elementor\Testing\Modules\AtomicWidgets;

use Elementor\Core\Experiments\Manager as Experiments_Manager;
use Elementor\Frontend;
use Elementor\Modules\AtomicWidgets\PropTypes\Color_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Primitives\String_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Size_Prop_Type;
use Elementor\Modules\AtomicWidgets\Styles\Style_Definition;
use Elementor\Modules\AtomicWidgets\Styles\Style_Variant;
use Elementor\Testing\Modules\AtomicWidgets\Mock_Widget;
use Elementor\Core\Files\CSS\Post as Post_CSS;
use Elementor\Modules\AtomicWidgets\Module;
use Elementor\Plugin;
use ElementorEditorTesting\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

require_once __DIR__ . '/mock-widget.php';

class Test_Module extends Elementor_Test_Base {
	private $experiment_default_state;
	private Frontend $frontend;
	private Frontend $frontend_mock;

	public function set_up(): void {
		parent::set_up();

		$this->experiment_default_state = Plugin::instance()->experiments->get_features( Module::EXPERIMENT_NAME )[ 'default' ];
		$this->frontend = Plugin::$instance->frontend;
		$this->frontend_mock = $this->createMock( Frontend::class );
		Plugin::$instance->frontend = $this->frontend_mock;

		remove_all_actions( 'elementor/css-file/post/parse' );
		remove_all_filters( 'elementor/editor/v2/packages' );
		remove_all_filters( 'elementor/editor/v2/styles' );
	}

	public function tear_down() {
		parent::tear_down();

		Plugin::instance()->experiments->set_feature_default_state( Module::EXPERIMENT_NAME, $this->experiment_default_state );
		Plugin::$instance->frontend = $this->frontend;
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
		$widget = Mock_Widget::make( [
			'base_styles' => [
				'base' => Style_Definition::make()
					->add_variant(
						Style_Variant::make()
							->add_prop( 'color', String_Prop_Type::generate( 'red' ) )
							->add_prop( 'font-family', String_Prop_Type::generate( 'Roboto' ) )
					)
			]
		] );


		Plugin::$instance->kits_manager->create_new_kit( 'kit' );
		$kit = Plugin::$instance->kits_manager->get_active_kit();

		// Assert
		$this->frontend_mock->expects( $this->once() )
			->method( 'enqueue_font' )
			->with( 'Roboto' );

		// Act
		$post_css = Post_CSS::create( $kit->get_id() );
		Module::instance()->inject_base_styles( $post_css, [ $widget ] );

		// Assert
		$css = $post_css->get_content();
		$this->assertStringContainsString( '.elementor .test-widget-base{font-family:Roboto;color:red;}', $css );
	}


	private function experiment_on() {
		Plugin::instance()->experiments->set_feature_default_state( Module::EXPERIMENT_NAME, Experiments_Manager::STATE_ACTIVE );
	}

	private function experiment_off() {
		Plugin::instance()->experiments->set_feature_default_state( Module::EXPERIMENT_NAME, Experiments_Manager::STATE_INACTIVE );
	}
}
