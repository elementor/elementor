<?php
namespace Elementor\Tests\Phpunit\Elementor\Core\Editor;

use ElementorEditorTesting\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Test_Editor_Media_Templates extends Elementor_Test_Base {

	/**
	 * @var array<string, \WP_Hook>|null
	 */
	private $hooks_snapshot;

	/**
	 * @var array<string, int>|null
	 */
	private $actions_snapshot;

	public function tearDown(): void {
		$this->restore_hook_snapshot();
		unset( $_REQUEST['post'], $_REQUEST['action'] );
		$this->elementor()->editor->set_edit_mode( null );

		parent::tearDown();
	}

	public function test_init__reattaches_media_templates_after_wiping_wp_footer() {
		// Arrange.
		$this->act_as_admin();
		$post_id = $this->factory()->create_and_get_default_post()->ID;

		$_REQUEST['post'] = $post_id;
		$_REQUEST['action'] = 'elementor';

		add_action( 'wp_footer', 'wp_print_media_templates', 10 );
		$this->assertNotFalse(
			has_action( 'wp_footer', 'wp_print_media_templates' ),
			'Precondition: media templates are hooked before the editor wipes wp_footer.'
		);

		$this->snapshot_hooks();

		// Act.
		ob_start();
		$this->elementor()->editor->init( false );
		ob_end_clean();

		// Assert.
		$this->assertSame(
			10,
			has_action( 'wp_footer', 'wp_print_media_templates' ),
			'Editor must re-hook wp_print_media_templates after remove_all_actions( wp_footer ).'
		);
		$this->assertSame( 20, has_action( 'wp_footer', 'wp_print_footer_scripts' ) );
	}

	private function snapshot_hooks() {
		global $wp_filter, $wp_actions;

		$this->hooks_snapshot = [];
		foreach ( $wp_filter as $tag => $hook ) {
			$this->hooks_snapshot[ $tag ] = clone $hook;
		}
		$this->actions_snapshot = $wp_actions;
	}

	private function restore_hook_snapshot() {
		global $wp_filter, $wp_actions;

		if ( null === $this->hooks_snapshot ) {
			return;
		}

		$wp_filter = $this->hooks_snapshot;
		$wp_actions = $this->actions_snapshot;
		$this->hooks_snapshot = null;
		$this->actions_snapshot = null;
	}
}
