<?php

namespace Elementor\Tests\Phpunit\Modules\Mcp;

use Elementor\Core\Experiments\Manager as Experiments_Manager;
use Elementor\Core\Files\CSS\Post as Post_CSS;
use Elementor\Modules\Mcp\Abilities\Clear_Cache_Ability;
use Elementor\Modules\Mcp\Module;
use Elementor\Modules\Mcp\Utils\Mcp_V4_Gate;
use Elementor\Plugin;
use ElementorEditorTesting\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * @group Elementor\Modules\Mcp
 */
class Test_Clear_Cache_Ability extends Elementor_Test_Base {

	private const ABILITY_ID = 'elementor/clear-cache';
	private const CLEAR_CACHE_ACTION = 'elementor/core/files/clear_cache';
	private const OPTIMIZED_CSS_EXPERIMENT = 'e_optimized_css_files';

	private Clear_Cache_Ability $ability;

	private string $original_optimized_css_default_state;

	public function setUp(): void {
		parent::setUp();
		$this->ability = new Clear_Cache_Ability();
		$this->original_optimized_css_default_state = Plugin::$instance->experiments->get_features( self::OPTIMIZED_CSS_EXPERIMENT )['default'];
		Plugin::$instance->experiments->set_feature_default_state( self::OPTIMIZED_CSS_EXPERIMENT, Experiments_Manager::STATE_INACTIVE );
		$this->act_as_admin();
	}

	public function tearDown(): void {
		Plugin::$instance->experiments->set_feature_default_state( self::OPTIMIZED_CSS_EXPERIMENT, $this->original_optimized_css_default_state );

		parent::tearDown();
	}

	public function test_execute__purges_the_elementor_cache_once() {
		// Arrange
		$purges_before = did_action( self::CLEAR_CACHE_ACTION );

		// Act
		$this->ability->execute();

		// Assert
		$this->assertSame( $purges_before + 1, did_action( self::CLEAR_CACHE_ACTION ) );
	}

	public function test_execute__removes_post_css_meta() {
		// Arrange
		$post_id = self::factory()->post->create();
		add_post_meta( $post_id, Post_CSS::META_KEY, [ 'status' => 'file' ] );

		// Act
		$this->ability->execute();

		// Assert
		$this->assertSame( '', get_post_meta( $post_id, Post_CSS::META_KEY, true ) );
	}

	public function test_execute__returns_success_with_instructions_for_the_user() {
		// Act
		$result = $this->ability->execute();

		// Assert
		$this->assertTrue( $result['success'] );
		$this->assertNotEmpty( $result['llm_instructions'] );
	}

	public function test_check_permission__allows_administrator() {
		// Act & Assert
		$this->assertTrue( $this->ability->check_permission() );
	}

	public function test_check_permission__rejects_editor() {
		// Arrange
		$this->act_as_editor();

		// Act & Assert
		$this->assertFalse( $this->ability->check_permission() );
	}

	public function test_ability__is_available_without_the_atomic_editor() {
		// Act & Assert
		$this->assertFalse( Mcp_V4_Gate::is_gated( self::ABILITY_ID ) );
		$this->assertTrue( $this->ability->is_available() );
	}

	public function test_ability__is_not_exposed_through_the_editor_proxy() {
		// Arrange
		$registry = Module::build_core_registry();

		// Act & Assert
		$this->assertNotNull( $registry->find_by_id( self::ABILITY_ID ) );
		$this->assertNull( $registry->find_by_proxy_slug( 'clear-cache' ) );
	}
}
