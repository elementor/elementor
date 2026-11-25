<?php

namespace Elementor\Tests\Phpunit\Elementor\Modules\SiteNavigation;

use ElementorEditorTesting\Elementor_Test_Base;
use Elementor\Modules\SiteNavigation\Module as SiteNavigation;
use Elementor\Core\Experiments\Manager as Experiments_Manager;
use Elementor\Plugin;

class Elementor_Test_Module extends Elementor_Test_Base {
	private $original_experiment_default_state;

	public function setUp(): void {
		parent::setUp();

		remove_all_filters( 'elementor/editor/v2/scripts/env' );

		$this->original_experiment_default_state = Plugin::$instance->experiments
			->get_features( SiteNavigation::PAGES_PANEL_EXPERIMENT_NAME )['default'];
	}

	public function tearDown(): void {
		parent::tearDown();

		Plugin::$instance->experiments->set_feature_default_state(
			SiteNavigation::PAGES_PANEL_EXPERIMENT_NAME,
			$this->original_experiment_default_state
		);
	}


	public function test_construct_experiment_inactive() {
		// Arrange
		Plugin::$instance->experiments->set_feature_default_state(
			SiteNavigation::PAGES_PANEL_EXPERIMENT_NAME,
			Experiments_Manager::STATE_INACTIVE
		);

		// Act.
		$module = new SiteNavigation();

		// Assert.
		$env = apply_filters( 'elementor/editor/v2/scripts/env', [] );
		$this->assertFalse( $env['@elementor/editor-site-navigation']['is_pages_panel_active'] );
	}

	public function test_construct_experiment_active() {
		// Arrange
		Plugin::$instance->experiments->set_feature_default_state(
			SiteNavigation::PAGES_PANEL_EXPERIMENT_NAME,
			Experiments_Manager::STATE_ACTIVE
		);

		// Act.
		$module = new SiteNavigation();

		// Assert.
		$env = apply_filters( 'elementor/editor/v2/scripts/env', [] );
		$this->assertTrue( $env['@elementor/editor-site-navigation']['is_pages_panel_active'] );
	}

	public function test_can_access_site_content_panel_admin() {
		$this->act_as_admin();
		new SiteNavigation();

		$env = apply_filters( 'elementor/editor/v2/scripts/env', [] );

		$this->assertTrue( $env['@elementor/editor-site-navigation']['can_access_site_content_panel'] );
	}

	public function test_can_access_site_content_panel_author() {
		wp_set_current_user( self::factory()->user->create( [ 'role' => 'author' ] ) );
		new SiteNavigation();

		$env = apply_filters( 'elementor/editor/v2/scripts/env', [] );

		$this->assertTrue( $env['@elementor/editor-site-navigation']['can_access_site_content_panel'] );
	}

	public function test_can_access_site_content_panel_subscriber() {
		$this->act_as_subscriber();
		new SiteNavigation();

		$env = apply_filters( 'elementor/editor/v2/scripts/env', [] );

		$this->assertFalse( $env['@elementor/editor-site-navigation']['can_access_site_content_panel'] );
	}

	public function test_can_access_site_content_panel_pages_only_role() {
		$user_id = self::factory()->user->create();
		$user = new \WP_User( $user_id );
		$user->set_role( 'subscriber' );
		$user->add_cap( 'edit_pages' );
		wp_set_current_user( $user_id );
		new SiteNavigation();

		$env = apply_filters( 'elementor/editor/v2/scripts/env', [] );

		$this->assertTrue( $env['@elementor/editor-site-navigation']['can_access_site_content_panel'] );
		$this->assertFalse( $user->has_cap( 'edit_posts' ) );
	}

	public function test_can_access_site_content_panel_contributor() {
		wp_set_current_user( self::factory()->user->create( [ 'role' => 'contributor' ] ) );
		new SiteNavigation();

		$env = apply_filters( 'elementor/editor/v2/scripts/env', [] );

		$this->assertTrue( $env['@elementor/editor-site-navigation']['can_access_site_content_panel'] );
	}
}
