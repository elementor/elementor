<?php
namespace Elementor\Testing;

use Elementor\Plugin;
use Elementor\Utils;
use ElementorEditorTesting\Elementor_Test_Base;

class Elementor_Test_Find_Element_In_Document_Tree extends Elementor_Test_Base {

	private $original_documents;

	public function set_up(): void {
		parent::set_up();

		$this->original_documents = Plugin::$instance->documents;
	}

	public function tear_down(): void {
		Plugin::$instance->documents = $this->original_documents;

		parent::tear_down();
	}

	private function make_document( $post_id, array $elements, $built_with_elementor = true ) {
		$document = $this->getMockBuilder( \Elementor\Core\Base\Document::class )
			->setMethods( [ 'get_elements_data', 'is_built_with_elementor' ] )
			->disableOriginalConstructor()
			->getMock();

		$document->method( 'get_elements_data' )->willReturn( $elements );
		$document->method( 'is_built_with_elementor' )->willReturn( $built_with_elementor );

		return $document;
	}

	private function mock_documents_manager( $documents_by_id ) {
		$manager = $this->getMockBuilder( \Elementor\Core\Documents_Manager::class )
			->setMethods( [ 'get_doc_for_frontend' ] )
			->disableOriginalConstructor()
			->getMock();

		$manager->method( 'get_doc_for_frontend' )->willReturnCallback(
			function ( $post_id ) use ( $documents_by_id ) {
				return $documents_by_id[ (int) $post_id ] ?? null;
			}
		);

		Plugin::$instance->documents = $manager;
	}

	private function host_elements_with_template( $template_id, $loop_grid_id ) {
		return [
			[
				'id' => 'host_section',
				'widgetType' => 'section',
				'elements' => [
					[
						'id' => 'template_widget',
						'widgetType' => 'template',
						'settings' => [ 'template_id' => $template_id ],
						'elements' => [],
					],
				],
			],
			[
				'id' => $loop_grid_id,
				'widgetType' => 'loop-grid',
				'settings' => [ 'posts_per_page' => 3 ],
				'elements' => [],
			],
		];
	}

	public function test_finds_element_in_host_document() {
		$host = $this->make_document( 100, $this->host_elements_with_template( 200, 'grid_host' ) );
		$this->mock_documents_manager( [ 100 => $host ] );

		$found = Utils::find_element_in_document_tree( 100, 'grid_host' );

		$this->assertIsArray( $found );
		$this->assertEquals( 'grid_host', $found['id'] );
	}

	public function test_finds_element_in_embedded_template() {
		$host = $this->make_document( 100, $this->host_elements_with_template( 200, 'grid_host' ) );
		$template = $this->make_document(
			200,
			[
				[
					'id' => 'grid_nested',
					'widgetType' => 'loop-grid',
					'settings' => [ 'posts_per_page' => 3 ],
					'elements' => [],
				],
			]
		);

		$this->mock_documents_manager( [ 100 => $host, 200 => $template ] );

		$found = Utils::find_element_in_document_tree( 100, 'grid_nested' );

		$this->assertIsArray( $found );
		$this->assertEquals( 'grid_nested', $found['id'] );
	}

	public function test_finds_element_in_global_widget() {
		$host = $this->make_document(
			100,
			[
				[
					'id' => 'gw',
					'widgetType' => 'global',
					'settings' => [ 'globalWidgetId' => 300 ],
					'elements' => [],
				],
			]
		);
		$global = $this->make_document(
			300,
			[
				[
					'id' => 'grid_global',
					'widgetType' => 'loop-grid',
					'settings' => [ 'posts_per_page' => 3 ],
					'elements' => [],
				],
			]
		);

		$this->mock_documents_manager( [ 100 => $host, 300 => $global ] );

		$found = Utils::find_element_in_document_tree( 100, 'grid_global' );

		$this->assertIsArray( $found );
		$this->assertEquals( 'grid_global', $found['id'] );
	}

	public function test_returns_false_when_not_found() {
		$host = $this->make_document( 100, $this->host_elements_with_template( 200, 'grid_host' ) );
		$template = $this->make_document( 200, [] );

		$this->mock_documents_manager( [ 100 => $host, 200 => $template ] );

		$this->assertFalse( Utils::find_element_in_document_tree( 100, 'missing_id' ) );
	}

	public function test_no_infinite_recursion_on_circular_template() {
		// Template 200 embeds itself; lookup of a missing id must terminate.
		$host = $this->make_document( 100, $this->host_elements_with_template( 200, 'grid_host' ) );
		$template = $this->make_document(
			200,
			[
				[
					'id' => 'tpl_section',
					'widgetType' => 'section',
					'elements' => [
						[
							'id' => 'tpl_template',
							'widgetType' => 'template',
							'settings' => [ 'template_id' => 200 ],
							'elements' => [],
						],
					],
				],
			]
		);

		$this->mock_documents_manager( [ 100 => $host, 200 => $template ] );

		$this->assertFalse( Utils::find_element_in_document_tree( 100, 'missing_id' ) );
	}

	public function test_no_infinite_recursion_on_two_document_cycle() {
		// Template 200 embeds template 300, and template 300 embeds template 200.
		// A lookup of a missing id must descend the cycle once and terminate.
		$host = $this->make_document( 100, $this->host_elements_with_template( 200, 'grid_host' ) );
		$doc200 = $this->make_document(
			200,
			[
				[
					'id' => 'tpl_section_200',
					'widgetType' => 'section',
					'elements' => [
						[
							'id' => 'tpl_template_200',
							'widgetType' => 'template',
							'settings' => [ 'template_id' => 300 ],
							'elements' => [],
						],
					],
				],
			]
		);
		$doc300 = $this->make_document(
			300,
			[
				[
					'id' => 'tpl_section_300',
					'widgetType' => 'section',
					'elements' => [
						[
							'id' => 'tpl_template_300',
							'widgetType' => 'template',
							'settings' => [ 'template_id' => 200 ],
							'elements' => [],
						],
					],
				],
			]
		);

		$this->mock_documents_manager( [ 100 => $host, 200 => $doc200, 300 => $doc300 ] );

		$this->assertFalse( Utils::find_element_in_document_tree( 100, 'missing_id' ) );
	}
}
