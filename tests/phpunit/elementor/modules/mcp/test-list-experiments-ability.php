<?php

namespace Elementor\Tests\Phpunit\Modules\Mcp;

use Elementor\Core\Experiments\Manager as Experiments_Manager;
use Elementor\Modules\Mcp\Abilities\List_Experiments_Ability;
use Elementor\Plugin;
use ElementorEditorTesting\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * @group Elementor\Modules\Mcp
 */
class Test_List_Experiments_Ability extends Elementor_Test_Base {

	private const TEST_FEATURES = [
		'test_mcp_visible',
		'test_mcp_hidden',
		'test_mcp_immutable',
		'test_mcp_orphan_dependency',
	];

	private List_Experiments_Ability $ability;

	public function setUp(): void {
		parent::setUp();
		$this->ability = new List_Experiments_Ability();
		$this->act_as_admin();
	}

	public function tearDown(): void {
		foreach ( self::TEST_FEATURES as $name ) {
			Plugin::$instance->experiments->remove_feature( $name );
		}

		parent::tearDown();
	}

	public function test_execute__lists_only_experiments_shown_on_the_settings_page() {
		// Arrange
		if ( defined( 'WP_DEBUG' ) && WP_DEBUG ) {
			$this->expect_doing_it_wrong( 'Elementor\Core\Experiments\Manager::warn_removed_or_hidden_dependency' );
		}

		$this->add_feature( 'test_mcp_visible' );
		$this->add_feature( 'test_mcp_hidden', [ 'hidden' => true ] );
		$this->add_feature( 'test_mcp_immutable', [ 'mutable' => false ] );
		$this->add_feature( 'test_mcp_orphan_dependency', [ 'dependencies' => [ 'feature-that-does-not-exist' ] ] );

		// Act
		$names = array_column( $this->ability->execute()['experiments'], 'name' );

		// Assert
		$this->assertContains( 'test_mcp_visible', $names );
		$this->assertNotContains( 'test_mcp_hidden', $names );
		$this->assertNotContains( 'test_mcp_immutable', $names );
		$this->assertNotContains( 'test_mcp_orphan_dependency', $names );
	}

	public function test_execute__strips_html_from_title_and_description() {
		// Arrange
		$this->add_feature( 'test_mcp_visible', [
			'title' => '<b>Visible</b> feature',
			'description' => 'Read <a href="https://example.com">more</a>',
		] );

		// Act
		$experiment = $this->find_experiment( 'test_mcp_visible' );

		// Assert
		$this->assertSame( 'Visible feature', $experiment['title'] );
		$this->assertSame( 'Read more', $experiment['description'] );
	}

	public function test_execute__decodes_html_entities_in_title_description_and_warning() {
		// Arrange
		$this->add_feature( 'test_mcp_visible', [
			'title' => esc_html( 'Header & Footer' ),
			'description' => esc_html( 'Uses "Site Settings" & more' ),
			'messages' => [ 'on_deactivate' => esc_html( 'Headers & footers will be hidden' ) ],
		] );

		// Act
		$experiment = $this->find_experiment( 'test_mcp_visible' );

		// Assert
		$this->assertSame( 'Header & Footer', $experiment['title'] );
		$this->assertSame( 'Uses "Site Settings" & more', $experiment['description'] );
		$this->assertSame( 'Headers & footers will be hidden', $experiment['deactivation_warning'] );
	}

	public function test_execute__reports_effective_state_separately_from_saved_state() {
		// Arrange
		$this->add_feature( 'test_mcp_visible', [ 'default' => Experiments_Manager::STATE_ACTIVE ] );

		// Act
		$experiment = $this->find_experiment( 'test_mcp_visible' );

		// Assert
		$this->assertSame( Experiments_Manager::STATE_DEFAULT, $experiment['state'] );
		$this->assertTrue( $experiment['active'] );
	}

	public function test_check_permission__rejects_non_admin() {
		// Arrange
		$this->act_as_editor();

		// Act & Assert
		$this->assertFalse( $this->ability->check_permission() );
	}

	private function add_feature( string $name, array $args = [] ): void {
		Plugin::$instance->experiments->add_feature( array_merge( [
			'name' => $name,
			'title' => $name,
		], $args ) );
	}

	private function find_experiment( string $name ): ?array {
		foreach ( $this->ability->execute()['experiments'] as $experiment ) {
			if ( $name === $experiment['name'] ) {
				return $experiment;
			}
		}

		return null;
	}
}
