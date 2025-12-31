<?php
namespace Elementor\Tests\Phpunit\Elementor\Core\Admin;

use Elementor\Core\Experiments\Manager as Experiments_Manager;
use Elementor\Core\Experiments\Wrap_Core_Dependency;
use Elementor\Plugin;
use Elementor\Core\Admin\Admin;
use Elementor\Core\Base\Document;
use Elementor\Core\DocumentTypes\Page;
use ElementorEditorTesting\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Test_Admin extends Elementor_Test_Base {
	/**
	 * @var string
	 */
	private $pagenow;

	public function setUp(): void {
		global $pagenow;

		parent::setUp();

		$this->pagenow = $pagenow;
	}

	public function tearDown(): void {
		global $pagenow;

		parent::tearDown();

		$pagenow = $this->pagenow;

		unset( $_GET['action'] );
		unset( $_GET['active-tab'] );
		unset( $_GET['active_tab'] );
		unset( $_GET['_wpnonce'] );
		unset( $_REQUEST['_wpnonce'] );
	}

	public function test_save_post() {
		// Arrange
		$admin = new Admin();
		$post = $this->factory()->create_and_get_custom_post( [] );
		$_POST['_elementor_edit_mode_nonce'] = wp_create_nonce( 'admin.php' );
		$_POST['_elementor_post_mode'] = 1;

		// Act
		$admin->save_post( $post->ID );

		// Assert
		$this->assertEquals( 'builder', get_post_meta( $post->ID, Document::BUILT_WITH_ELEMENTOR_META_KEY, true ) );
	}

	public function test_save_post__when_saved_outside_of_elementor_it_will_not_change() {
		// Arrange
		$admin = new Admin();
		$post = $this->factory()->create_and_get_custom_post( [] );

		// Act
		$admin->save_post( $post->ID );

		// Assert
		$this->assertEmpty( get_post_meta( $post->ID, Document::BUILT_WITH_ELEMENTOR_META_KEY, true ) );
	}

	public function test_add_elementor_post_state() {
		// Arrange
		$this->act_as_admin();

		$admin = new Admin();
		$document = $this->factory()->documents->create_and_get();

		// Act
		$result = $admin->add_elementor_post_state( [], $document->get_post() );

		// Assert
		$this->assertArrayHasKey( 'elementor', $result );
	}

	public function test_add_elementor_post_state__should_no_add_elementor() {
		// Arrange
		$this->act_as_admin();

		$admin = new Admin();
		$post = $this->factory()->post->create_and_get();

		// Act
		$result = $admin->add_elementor_post_state( [], $post );

		// Assert
		$this->assertArrayNotHasKey( 'elementor', $result );
	}

	public function test_add_elementor_post_state__should_not_add_elementor_without_permissions() {
		// Arrange
		$this->act_as_subscriber();

		$admin = new Admin();
		$document = $this->factory()->documents->create_and_get();

		// Act
		$result = $admin->add_elementor_post_state( [], $document->get_post() );

		// Assert
		$this->assertArrayNotHasKey( 'elementor', $result );
	}

	public function test_body_statues_classes() {
		// Arrange
		global $pagenow;
		$pagenow = 'post.php';

		new Admin();
		$post = $this->factory()->post->create_and_get();

		Plugin::$instance->db->switch_to_post( $post->ID );

		// Act
		$result = apply_filters( 'admin_body_class', '' );

		// Assert
		$this->assertMatchesRegularExpression( '/elementor-editor-inactive/', $result );
	}

	public function test_body_statues_classes__when_edit_with_elementor() {
		// Arrange
		global $pagenow;
		$pagenow = 'post.php';

		new Admin();
		$document = $this->factory()->documents->create_and_get();

		Plugin::$instance->db->switch_to_post( $document->get_id() );

		// Act
		$result = apply_filters( 'admin_body_class', '' );

		// Assert
		$this->assertMatchesRegularExpression( '/elementor-editor-active/', $result );
	}

	public function test_get_init_settings__returns_experiments_config() {
		// Arrange.
		$admin = new Admin();

		$original_experiments = Plugin::$instance->experiments;

		$mock_experiments = $this
			->getMockBuilder( Experiments_Manager::class )
			->setMethods( [ 'get_features' ] )
			->getMock();

		$experiment1 = [
			'name' => 'experiment-1',
			'default' => Experiments_Manager::STATE_ACTIVE,
			'title' => 'Experiment 1',
			'state' => Experiments_Manager::STATE_ACTIVE,
			'other-prop' => 'some-value',
			'messages' => [
				'on_deactivate' => 'test-message',
			],
		];

		$experiment2 = [
			'name' => 'experiment-2',
			'default' => Experiments_Manager::STATE_INACTIVE,
			'title' => 'Experiment 2',
			'state' => Experiments_Manager::STATE_ACTIVE,
			'other-prop-2' => 'some-value-2',
			'dependencies' => [
				new Wrap_Core_Dependency( $experiment1 ),
			],
		];

		$mock_experiments->method( 'get_features' )->willReturn( [ $experiment1, $experiment2 ] );

		Plugin::$instance->experiments = $mock_experiments;

		// Act.
		$settings = $admin->get_settings();

		// Assert.
		$this->assertEqualSets( [
			[
				'name' => 'experiment-1',
				'default' => Experiments_Manager::STATE_ACTIVE,
				'title' => 'Experiment 1',
				'state' => Experiments_Manager::STATE_ACTIVE,
				'dependencies' => [],
				'messages' => [
					'on_deactivate' => 'test-message',
				],

			],
			[
				'name' => 'experiment-2',
				'default' => Experiments_Manager::STATE_INACTIVE,
				'title' => 'Experiment 2',
				'state' => Experiments_Manager::STATE_ACTIVE,
				'dependencies' => [
					'experiment-1',
				],
				'messages' => [],
			],
		], $settings['experiments'] );

		// Cleanup.
		Plugin::$instance->experiments = $original_experiments;
	}

	public function test_get_site_settings_url_config__returns_valid_url_without_existing_page() {
		// Arrange
		$this->act_as_admin();
		
		$existing_pages = get_pages( [
			'meta_key' => Document::BUILT_WITH_ELEMENTOR_META_KEY,
			'number' => -1,
		] );
		
		foreach ( $existing_pages as $page ) {
			wp_delete_post( $page->ID, true );
		}

		// Act
		$config = Page::get_site_settings_url_config();

		// Assert
		$this->assertIsArray( $config );
		$this->assertArrayHasKey( 'url', $config );
		$this->assertArrayHasKey( 'new_page', $config );
		$this->assertArrayHasKey( 'type', $config );
		$this->assertNotEmpty( $config['url'] );
		$this->assertTrue( $config['new_page'] );
		$this->assertStringContainsString( 'edit.php', $config['url'] );
		$this->assertStringContainsString( 'action=elementor_new_post', $config['url'] );
		$this->assertEquals( 'site_settings', $config['type'] );
	}

	public function test_get_site_settings_url_config__returns_valid_url_with_existing_page() {
		// Arrange
		$this->act_as_admin();
		
		$document = $this->factory()->documents->create_and_get( [
			'post_type' => 'page',
			'post_status' => 'publish',
		] );

		// Act
		$config = Page::get_site_settings_url_config();

		// Assert
		$this->assertIsArray( $config );
		$this->assertArrayHasKey( 'url', $config );
		$this->assertArrayHasKey( 'new_page', $config );
		$this->assertArrayHasKey( 'type', $config );
		$this->assertNotEmpty( $config['url'] );
		$this->assertFalse( $config['new_page'] );
		$this->assertStringContainsString( 'post.php', $config['url'] );
		$this->assertStringContainsString( 'action=elementor', $config['url'] );
		$this->assertStringContainsString( 'post=' . $document->get_main_id(), $config['url'] );
		$this->assertEquals( 'site_settings', $config['type'] );
	}

	public function test_get_site_settings_url_config__with_active_tab() {
		// Arrange
		$this->act_as_admin();
		$active_tab = 'settings-site-identity';

		// Act
		$config = Page::get_site_settings_url_config( $active_tab );

		// Assert
		$this->assertIsArray( $config );
		$this->assertNotEmpty( $config['url'] );
		$this->assertStringContainsString( 'active-tab=' . $active_tab, $config['url'] );
	}

	public function test_get_site_settings_url_config__with_all_tabs() {
		// Arrange
		$this->act_as_admin();
		$tabs = [
			'global-colors',
			'global-typography',
			'theme-style-typography',
			'theme-style-buttons',
			'theme-style-images',
			'theme-style-form-fields',
			'settings-site-identity',
			'settings-background',
			'settings-layout',
			'settings-lightbox',
			'settings-page-transitions',
			'settings-custom-css',
		];

		// Act & Assert
		foreach ( $tabs as $tab ) {
			$config = Page::get_site_settings_url_config( $tab );
			$this->assertIsArray( $config );
			$this->assertNotEmpty( $config['url'] );
			$this->assertStringContainsString( 'active-tab=' . $tab, $config['url'], "Failed for tab: {$tab}" );
		}
	}

	public function test_admin_action_site_settings_redirect__requires_nonce() {
		// Arrange
		$this->act_as_admin();
		$admin = new Admin();
		$_GET['action'] = 'elementor_site_settings_redirect';
		unset( $_GET['_wpnonce'] );
		unset( $_REQUEST['_wpnonce'] );

		// Act & Assert
		$this->expectException( \WPDieException::class );
		$admin->admin_action_site_settings_redirect();
	}

	public function test_admin_action_site_settings_redirect__requires_capability() {
		// Arrange
		$this->act_as_subscriber();
		$admin = new Admin();
		$_GET['action'] = 'elementor_site_settings_redirect';
		$_GET['_wpnonce'] = wp_create_nonce( 'elementor_action_site_settings_redirect' );
		$_REQUEST['_wpnonce'] = $_GET['_wpnonce'];

		// Act & Assert
		$this->expectException( \WPDieException::class );
		$admin->admin_action_site_settings_redirect();
	}
}
