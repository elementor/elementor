<?php
namespace Elementor\Testing\Modules\MarkdownRender;

use Elementor\Core\Experiments\Manager as Experiments_Manager;
use Elementor\Modules\Agents\Module as Agents_Module;
use Elementor\Modules\MarkdownRender\Agent_Link_Relations;
use Elementor\Modules\MarkdownRender\Markdown_Url;
use Elementor\Plugin;
use ElementorEditorTesting\Elementor_Test_Base;

class Test_Agent_Link_Relations extends Elementor_Test_Base {

	private $original_agents_experiment_default_state;

	public function setUp(): void {
		parent::setUp();

		$this->original_agents_experiment_default_state = Plugin::$instance->experiments
			->get_features( Agents_Module::EXPERIMENT_NAME )['default'];
	}

	public function tearDown(): void {
		Plugin::$instance->experiments->set_feature_default_state(
			Agents_Module::EXPERIMENT_NAME,
			$this->original_agents_experiment_default_state
		);

		parent::tearDown();
	}

	public function test_for_post__includes_alternate_link() {
		// Arrange
		update_option( 'permalink_structure', '/%postname%/' );
		$post = $this->factory()->create_and_get_default_post();
		$this->set_post_built_with_elementor( $post->ID );

		// Act
		$relations = Agent_Link_Relations::for_post( $post->ID );

		// Assert
		$this->assertNotNull( $relations );
		$this->assertTrue( $relations->has_alternate() );
		$this->assertSame(
			Markdown_Url::get_url_for_post( $post->ID ),
			$this->get_private_property( $relations, 'alternate_url' )
		);
	}

	public function test_for_post__includes_describedby_when_llms_txt_is_configured() {
		// Arrange
		update_option( 'permalink_structure', '/%postname%/' );
		Plugin::$instance->experiments->set_feature_default_state(
			Agents_Module::EXPERIMENT_NAME,
			Experiments_Manager::STATE_ACTIVE
		);

		$post = $this->factory()->create_and_get_default_post();
		$this->set_post_built_with_elementor( $post->ID );

		$kit_id = Plugin::$instance->kits_manager->get_active_id();
		$kit = Plugin::$instance->documents->get( $kit_id );
		$kit->update_settings( [
			'agents' => [
				'llms' => '# Example llms.txt',
			],
		] );
		$this->flush_documents_cache();

		// Act
		$relations = Agent_Link_Relations::for_post( $post->ID );

		// Assert
		$this->assertNotNull( $relations );
		$this->assertTrue( $relations->has_describedby() );
		$this->assertSame(
			home_url( '/llms.txt' ),
			$this->get_private_property( $relations, 'describedby_url' )
		);
	}

	public function test_for_post__omits_describedby_when_llms_txt_is_empty() {
		// Arrange
		update_option( 'permalink_structure', '/%postname%/' );
		Plugin::$instance->experiments->set_feature_default_state(
			Agents_Module::EXPERIMENT_NAME,
			Experiments_Manager::STATE_ACTIVE
		);

		$post = $this->factory()->create_and_get_default_post();
		$this->set_post_built_with_elementor( $post->ID );

		// Act
		$relations = Agent_Link_Relations::for_post( $post->ID );

		// Assert
		$this->assertNotNull( $relations );
		$this->assertTrue( $relations->has_alternate() );
		$this->assertFalse( $relations->has_describedby() );
	}

	public function test_get_markdown_response_link_header_value__includes_only_describedby() {
		// Arrange
		$relations = new Agent_Link_Relations(
			home_url( '/about/index.md' ),
			home_url( '/llms.txt' )
		);

		// Act
		$header = $relations->get_markdown_response_link_header_value();

		// Assert
		$this->assertStringContainsString( 'rel="describedby"', $header );
		$this->assertStringContainsString( '/llms.txt', $header );
		$this->assertStringNotContainsString( 'rel="alternate"', $header );
	}

	private function get_private_property( object $object, string $property ) {
		$reflection = new \ReflectionProperty( $object, $property );
		$reflection->setAccessible( true );

		return $reflection->getValue( $object );
	}

	private function set_post_built_with_elementor( int $post_id ): void {
		update_post_meta( $post_id, '_elementor_edit_mode', 'builder' );
		update_post_meta( $post_id, '_elementor_data', wp_json_encode( [
			[
				'id' => 'section-1',
				'elType' => 'section',
				'elements' => [
					[
						'id' => 'column-1',
						'elType' => 'column',
						'elements' => [
							[
								'id' => 'heading-1',
								'elType' => 'widget',
								'widgetType' => 'heading',
								'settings' => [
									'title' => 'Hello',
								],
							],
						],
					],
				],
			],
		] ) );
		$this->flush_documents_cache();
	}

	private function flush_documents_cache(): void {
		$reflection = new \ReflectionProperty( Plugin::$instance->documents, 'documents' );
		$reflection->setAccessible( true );
		$reflection->setValue( Plugin::$instance->documents, [] );
	}
}
