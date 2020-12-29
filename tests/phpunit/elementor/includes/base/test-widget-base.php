<?php
namespace Elementor\Tests\Phpunit\Includes\Base;

use Elementor\Plugin;
use Elementor\Testing\Elementor_Test_Base;
use Elementor\Core\Frontend\Render_Mode_Manager;
use Elementor\Core\Frontend\RenderModes\Render_Mode_Base;
use Elementor\Tests\Phpunit\Includes\Base\Mock\Mock_Skin;
use Elementor\Tests\Phpunit\Includes\Base\Mock\Mock_Widget;
use Elementor\Tests\Phpunit\Includes\Base\Mock\Mock_Static_Render_Mode;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Test_Widget_Base extends Elementor_Test_Base {
	/**
	 * @var Render_Mode_Base
	 */
	protected $default_render_mode;

	public function setUp() {
		parent::setUp();

		$this->default_render_mode = Plugin::$instance->frontend->render_mode_manager;
	}

	public function tearDown() {
		parent::tearDown();

		Plugin::$instance->frontend->render_mode_manager = $this->default_render_mode;
	}

	public function test_render_content__should_render_static() {
		require_once __DIR__ . '/mock/mock-widget.php';

		$this->arrange_static_render_mode();

		$widget = new Mock_Widget( [ 'settings' => [], 'id' => '1' ], [] );

		ob_start();

		$widget->render_content();

		$this->assertRegExp( '/render_static/', ob_get_clean() );
	}

	public function test_render_content__should_render_normally() {
		require_once __DIR__ . '/mock/mock-widget.php';

		$widget = new Mock_Widget( [ 'settings' => [], 'id' => '1' ], [] );

		ob_start();

		$widget->render_content();

		$this->assertRegExp( '/render/', ob_get_clean() );
	}

	public function test_render_content__should_render_skin_static() {
		require_once __DIR__ . '/mock/mock-widget.php';
		require_once __DIR__ . '/mock/mock-skin.php';

		$this->arrange_static_render_mode();

		$widget = new Mock_Widget( [ 'settings' => ['_skin' => 'mock-skin'], 'id' => '1' ], [] );

		Plugin::$instance->skins_manager->add_skin($widget, new Mock_Skin($widget));

		ob_start();

		$widget->render_content();

		$this->assertRegExp( '/render_skin_static/', ob_get_clean() );
	}

	public function test_render_content__should_render_skin_normally() {
		require_once __DIR__ . '/mock/mock-widget.php';
		require_once __DIR__ . '/mock/mock-skin.php';

		$widget = new Mock_Widget( [ 'settings' => ['_skin' => 'mock-skin'], 'id' => '1' ], [] );

		Plugin::$instance->skins_manager->add_skin($widget, new Mock_Skin($widget));

		ob_start();

		$widget->render_content();

		$this->assertRegExp( '/render_skin/', ob_get_clean() );
	}

	protected function arrange_static_render_mode() {
		require_once __DIR__ . '/mock/mock-static-render-mode.php';

		$post = $this->factory()->create_and_get_default_post();

		// Prepare static mode render mode
		add_action( 'elementor/frontend/render_mode/register', function ( Render_Mode_Manager $manager ) {
			$manager->register_render_mode( Mock_Static_Render_Mode::class );
		} );

		$_GET[ Render_Mode_Manager::QUERY_STRING_POST_ID ] = $post->ID;
		$_GET[ Render_Mode_Manager::QUERY_STRING_PARAM_NAME ] = Mock_Static_Render_Mode::get_name();
		$_GET[ Render_Mode_Manager::QUERY_STRING_NONCE_PARAM_NAME ] = wp_create_nonce( Render_Mode_Manager::get_nonce_action( $post->ID ) );

		Plugin::$instance->frontend->render_mode_manager = new Render_Mode_Manager();
	}
}
