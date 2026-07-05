<?php
namespace Elementor\Testing;

use Elementor\Core\Editor\Editor;
use ElementorEditorTesting\Elementor_Test_Base;

class Elementor_Test_Editor extends Elementor_Test_Base {

	/**
	 * Original $_SERVER values, restored in tearDown.
	 *
	 * @var array
	 */
	private $original_server = [];

	public function setUp(): void {
		parent::setUp();

		wp_set_current_user( $this->factory()->get_administrator_user()->ID );

		$GLOBALS['post'] = $this->factory()->create_and_get_default_post()->IDs;

		$this->original_server = [
			'HTTPS' => $_SERVER['HTTPS'] ?? null,
			'HTTP_HOST' => $_SERVER['HTTP_HOST'] ?? null,
		];
	}

	public function tearDown(): void {
		foreach ( $this->original_server as $key => $value ) {
			if ( null === $value ) {
				unset( $_SERVER[ $key ] );
			} else {
				$_SERVER[ $key ] = $value;
			}
		}

		parent::tearDown();
	}

	public function test_getInstance() {
		$this->assertInstanceOf( '\Elementor\Core\Editor\Editor', $this->elementor()->editor );
	}

	/*
	public function test_enqueueScripts() {
		ini_set( 'memory_limit', '85M' );

		ob_start();
		Elementor\ $this->plugin()->editor->enqueue_scripts();
		ob_end_clean();

		$scripts = [
			'wp-auth-check',
			'jquery-ui-sortable',
			'jquery-ui-resizable',
			'backbone-marionette',
			'backbone-radio',
			'perfect-scrollbar',
			'nprogress',
			'tipsy',
			'imagesloaded',
			'heartbeat',
			'jquery-select2',
			'flatpickr',
			'elementor-dialog',
			'ace',
			'ace-language-tools',
			'elementor-editor',
		];

		foreach ( $scripts as $script ) {
			$this->assertTrue( wp_script_is( $script ) );
		}
	}*/

	public function test_enqueueStyles() {
		$this->elementor()->editor->enqueue_styles();

		$styles = [
			'elementor-select2',
			'elementor-icons',
			'wp-auth-check',
			'google-font-roboto',

			'elementor-editor',
		];

		foreach ( $styles as $style ) {
			$this->assertTrue( wp_style_is( $style ) );
		}
	}

	/*public function test_renderFooter() {
		ob_start();
		Elementor\ $this->plugin()->editor->wp_footer();
		$buffer = ob_get_clean();

		$this->assertNotEmpty( $buffer );
	}*/

	public function test_should_use_document_isolation_policy__https() {
		$_SERVER['HTTPS'] = 'on';
		$_SERVER['HTTP_HOST'] = 'example.com';

		$this->assertTrue( Editor::should_use_document_isolation_policy() );
	}

	public function test_should_use_document_isolation_policy__localhost() {
		unset( $_SERVER['HTTPS'] );
		$_SERVER['HTTP_HOST'] = 'localhost';

		$this->assertTrue( Editor::should_use_document_isolation_policy() );
	}

	public function test_should_use_document_isolation_policy__localhost_subdomain() {
		unset( $_SERVER['HTTPS'] );
		$_SERVER['HTTP_HOST'] = 'site.localhost';

		$this->assertTrue( Editor::should_use_document_isolation_policy() );
	}

	public function test_should_use_document_isolation_policy__localhost_with_port() {
		unset( $_SERVER['HTTPS'] );
		$_SERVER['HTTP_HOST'] = 'localhost:8888';

		$this->assertTrue( Editor::should_use_document_isolation_policy() );
	}

	public function test_should_use_document_isolation_policy__insecure() {
		unset( $_SERVER['HTTPS'] );
		$_SERVER['HTTP_HOST'] = 'example.com';

		$this->assertFalse( Editor::should_use_document_isolation_policy() );
	}

	public function test_should_use_document_isolation_policy__filter_can_disable() {
		$_SERVER['HTTPS'] = 'on';
		$_SERVER['HTTP_HOST'] = 'example.com';

		add_filter( 'elementor/editor/use_document_isolation_policy', '__return_false' );

		$this->assertFalse( Editor::should_use_document_isolation_policy() );

		remove_filter( 'elementor/editor/use_document_isolation_policy', '__return_false' );
	}

	public function test_should_use_document_isolation_policy__filter_cannot_force_on_insecure() {
		unset( $_SERVER['HTTPS'] );
		$_SERVER['HTTP_HOST'] = 'example.com';

		add_filter( 'elementor/editor/use_document_isolation_policy', '__return_true' );

		$this->assertFalse(
			Editor::should_use_document_isolation_policy(),
			'Filter should not bypass the secure-context requirement.'
		);

		remove_filter( 'elementor/editor/use_document_isolation_policy', '__return_true' );
	}
}
