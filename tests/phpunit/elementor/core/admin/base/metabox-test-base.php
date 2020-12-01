<?php
namespace Elementor\Tests\Phpunit\Elementor\Core\Admin\Base;

use Elementor\DB;
use Elementor\Testing\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

abstract class Metabox_Test_Base extends Elementor_Test_Base {
	/**
	 * @var Mock_Test_Metabox|\Elementor\Core\Admin\Base\Metabox_Base
	 */
	protected $metabox;

	/**
	 * @var \WP_Screen
	 */
	protected $screen;

	/**
	 * @var \WP_Post
	 */
	protected $post;

	public function setUp() {
		parent::setUp();

		// Set admin.
		wp_set_current_user( $this->factory()->create_and_get_administrator_user()->ID );

		$this->metabox = $this->get_metabox_instance();

		$cpt = $this->metabox->get_type();

		// Register test CPT.
		register_post_type( $cpt ,[
			'public' => true,
			'capability_type' => 'post',
		] ) ;

		// Set screen.
		$this->screen = \WP_Screen::get( 'post-new.php' );
		$this->screen->id = $cpt;

		set_current_screen( $this->screen );

		// Register metabox.
		do_action( 'add_meta_boxes_' . $cpt );

		// Create post - with status = 'publish'.
		$this->post = get_default_post_to_edit( $cpt, true );
		$this->post->post_status = DB::STATUS_PUBLISH;

		wp_update_post( $this->post );
	}

	abstract protected function get_metabox_instance();
}
