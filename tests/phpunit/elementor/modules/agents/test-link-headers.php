<?php

namespace Elementor\Tests\Phpunit\Elementor\Modules\Agents;

use Elementor\Core\Experiments\Manager as Experiments_Manager;
use Elementor\Modules\Agents\Components\Discovery\Link_Headers;
use Elementor\Modules\Agents\Module;
use Elementor\Plugin;
use ElementorEditorTesting\Elementor_Test_Base;

class Test_Link_Headers extends Elementor_Test_Base {

	private Link_Headers $link_headers;

	private $original_experiment_default_state;

	public function setUp(): void {
		parent::setUp();

		$this->original_experiment_default_state = Plugin::$instance->experiments
			->get_features( Module::EXPERIMENT_NAME )['default'];

		Plugin::$instance->experiments->set_feature_default_state(
			Module::EXPERIMENT_NAME,
			Experiments_Manager::STATE_ACTIVE
		);

		$this->link_headers = new Link_Headers();
	}

	public function tearDown(): void {
		Plugin::$instance->experiments->set_feature_default_state(
			Module::EXPERIMENT_NAME,
			$this->original_experiment_default_state
		);

		parent::tearDown();
	}

	public function test_build_site_links__includes_api_catalog_and_service_doc() {
		// Arrange
		$home = untrailingslashit( home_url() );

		// Act
		$links = $this->invoke_build_site_links();

		// Assert
		$this->assertContains(
			'<' . $home . '/.well-known/api-catalog>; rel="api-catalog"; type="application/json"',
			$links
		);
		$this->assertContains(
			'<' . $home . '/.well-known/auth.md>; rel="service-doc"; type="text/markdown"',
			$links
		);
		$this->assertContains(
			'<' . $home . '/llms.txt>; rel="llms-txt"; type="text/plain"',
			$links
		);
	}

	public function test_build_site_links__includes_mcp_card_when_filter_enabled() {
		// Arrange
		$home = untrailingslashit( home_url() );
		add_filter( 'elementor/agents/link_headers/emit_mcp_card', '__return_true' );

		// Act
		$links = $this->invoke_build_site_links();

		// Assert
		$this->assertContains(
			'<' . $home . '/.well-known/mcp/server-card.json>; rel="mcp-server-card"; type="application/json"',
			$links
		);

		remove_filter( 'elementor/agents/link_headers/emit_mcp_card', '__return_true' );
	}

	public function test_is_enabled__follows_agent_ready_experiment() {
		// Arrange
		Plugin::$instance->experiments->set_feature_default_state(
			Module::EXPERIMENT_NAME,
			Experiments_Manager::STATE_INACTIVE
		);

		// Act & Assert
		$this->assertFalse( $this->link_headers->is_enabled() );

		Plugin::$instance->experiments->set_feature_default_state(
			Module::EXPERIMENT_NAME,
			Experiments_Manager::STATE_ACTIVE
		);

		$this->assertTrue( $this->link_headers->is_enabled() );
	}

	/**
	 * @return string[]
	 */
	private function invoke_build_site_links(): array {
		$method = new \ReflectionMethod( Link_Headers::class, 'build_site_links' );
		$method->setAccessible( true );

		return $method->invoke( $this->link_headers );
	}
}
