<?php
namespace Elementor\Testing\Modules\CssConverter\Services;

use Elementor\Modules\CssConverter\Services\Widget\Widget_Hierarchy_Processor;
use ElementorEditorTesting\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * @group css-converter
 * @group widget-converter
 * @group hierarchy-processor
 */
class Test_Widget_Hierarchy_Processor extends Elementor_Test_Base {

	private $hierarchy_processor;

	public function setUp(): void {
		parent::setUp();
		$this->hierarchy_processor = new Widget_Hierarchy_Processor();
	}

	public function test_processes_flat_widget_list() {
		$widgets = [
			[
				'id' => 'widget-1',
				'widget_type' => 'e-flexbox',
				'element_data' => [ 'tag' => 'div' ],
			],
			[
				'id' => 'widget-2',
				'widget_type' => 'e-heading',
				'element_data' => [ 'tag' => 'h1', 'content' => 'Title' ],
				'parent_id' => 'widget-1',
			],
		];
		
		$result = $this->hierarchy_processor->process_widget_hierarchy( $widgets );
		
		$this->assertIsArray( $result );
		$this->assertArrayHasKey( 'widgets', $result );
		$this->assertArrayHasKey( 'stats', $result );
		$this->assertArrayHasKey( 'errors', $result );
		
		// Should have processed widgets in hierarchy
		$processed_widgets = $result['widgets'];
		$this->assertCount( 1, $processed_widgets ); // Only root widget
		$this->assertEquals( 'e-flexbox', $processed_widgets[0]['widget_type'] );
		$this->assertArrayHasKey( 'elements', $processed_widgets[0] );
		$this->assertCount( 1, $processed_widgets[0]['elements'] ); // Child widget
	}

	public function test_builds_correct_hierarchy_tree() {
		$widgets = [
			[
				'id' => 'container',
				'widget_type' => 'e-flexbox',
				'element_data' => [ 'tag' => 'div' ],
			],
			[
				'id' => 'header',
				'widget_type' => 'e-flexbox',
				'element_data' => [ 'tag' => 'header' ],
				'parent_id' => 'container',
			],
			[
				'id' => 'title',
				'widget_type' => 'e-heading',
				'element_data' => [ 'tag' => 'h1', 'content' => 'Main Title' ],
				'parent_id' => 'header',
			],
			[
				'id' => 'subtitle',
				'widget_type' => 'e-heading',
				'element_data' => [ 'tag' => 'h2', 'content' => 'Subtitle' ],
				'parent_id' => 'header',
			],
		];
		
		$result = $this->hierarchy_processor->process_widget_hierarchy( $widgets );
		$processed_widgets = $result['widgets'];
		
		// Verify hierarchy structure
		$this->assertCount( 1, $processed_widgets ); // Root container
		$container = $processed_widgets[0];
		$this->assertEquals( 'container', $container['id'] );
		
		// Verify header is child of container
		$this->assertCount( 1, $container['elements'] );
		$header = $container['elements'][0];
		$this->assertEquals( 'header', $header['id'] );
		
		// Verify title and subtitle are children of header
		$this->assertCount( 2, $header['elements'] );
		$this->assertEquals( 'title', $header['elements'][0]['id'] );
		$this->assertEquals( 'subtitle', $header['elements'][1]['id'] );
	}

	public function test_handles_orphaned_widgets() {
		$widgets = [
			[
				'id' => 'orphan',
				'widget_type' => 'e-heading',
				'element_data' => [ 'tag' => 'h1', 'content' => 'Orphaned Title' ],
				'parent_id' => 'missing-parent',
			],
			[
				'id' => 'root',
				'widget_type' => 'e-flexbox',
				'element_data' => [ 'tag' => 'div' ],
			],
		];
		
		$result = $this->hierarchy_processor->process_widget_hierarchy( $widgets );
		
		// Should have 2 root widgets (orphan moved to root level)
		$this->assertCount( 2, $result['widgets'] );
		
		// Should have error logged for orphaned widget
		$this->assertNotEmpty( $result['errors'] );
		$error = $result['errors'][0];
		$this->assertEquals( 'orphaned_widget', $error['type'] );
		$this->assertEquals( 'orphan', $error['widget_id'] );
		$this->assertEquals( 'missing-parent', $error['missing_parent_id'] );
	}

	public function test_applies_hierarchy_metadata() {
		$widgets = [
			[
				'id' => 'parent',
				'widget_type' => 'e-flexbox',
				'element_data' => [ 'tag' => 'div' ],
			],
			[
				'id' => 'child',
				'widget_type' => 'e-heading',
				'element_data' => [ 'tag' => 'h1', 'content' => 'Child Title' ],
				'parent_id' => 'parent',
			],
		];
		
		$result = $this->hierarchy_processor->process_widget_hierarchy( $widgets );
		$parent = $result['widgets'][0];
		$child = $parent['elements'][0];
		
		// Check hierarchy metadata
		$this->assertEquals( 0, $parent['hierarchy_depth'] );
		$this->assertTrue( $parent['is_parent'] );
		
		$this->assertEquals( 1, $child['hierarchy_depth'] );
		$this->assertFalse( $child['is_parent'] );
	}

	public function test_applies_container_defaults() {
		$widgets = [
			[
				'id' => 'container',
				'widget_type' => 'e-flexbox',
				'element_data' => [ 'tag' => 'div' ],
				'settings' => [],
			],
		];
		
		$result = $this->hierarchy_processor->process_widget_hierarchy( $widgets );
		$container = $result['widgets'][0];
		
		// Should have container defaults applied
		$settings = $container['settings'];
		$this->assertEquals( 'boxed', $settings['content_width'] );
		$this->assertEquals( 'column', $settings['flex_direction'] );
		$this->assertEquals( 'nowrap', $settings['flex_wrap'] );
		$this->assertEquals( 'stretch', $settings['align_items'] );
		$this->assertEquals( 'flex-start', $settings['justify_content'] );
	}

	public function test_applies_content_defaults() {
		$widgets = [
			[
				'id' => 'heading',
				'widget_type' => 'e-heading',
				'element_data' => [ 'tag' => 'h1', 'content' => 'Test Title' ],
				'settings' => [],
			],
			[
				'id' => 'text',
				'widget_type' => 'e-text',
				'element_data' => [ 'tag' => 'p', 'content' => 'Test paragraph' ],
				'settings' => [],
			],
		];
		
		$result = $this->hierarchy_processor->process_widget_hierarchy( $widgets );
		
		// Check heading defaults
		$heading = $result['widgets'][0];
		$this->assertEquals( 'Test Title', $heading['settings']['title'] );
		$this->assertEquals( 'xxl', $heading['settings']['size'] );
		$this->assertEquals( '1', $heading['settings']['header_size'] );
		
		// Check text defaults
		$text = $result['widgets'][1];
		$this->assertEquals( 'Test paragraph', $text['settings']['editor'] );
	}

	public function test_processes_css_styles_for_containers() {
		$widgets = [
			[
				'id' => 'flex-container',
				'widget_type' => 'e-flexbox',
				'element_data' => [ 'tag' => 'div' ],
				'applied_styles' => [
					'computed_styles' => [
						'display' => [ 'value' => 'flex' ],
						'flex-direction' => [ 'value' => 'row' ],
						'justify-content' => [ 'value' => 'center' ],
						'align-items' => [ 'value' => 'flex-start' ],
						'gap' => [ 'value' => '20px' ],
						'padding' => [ 'value' => '10px 20px' ],
					],
				],
				'settings' => [],
			],
		];
		
		$result = $this->hierarchy_processor->process_widget_hierarchy( $widgets );
		$container = $result['widgets'][0];
		$settings = $container['settings'];
		
		// Check CSS styles were applied to container settings
		$this->assertEquals( 'row', $settings['flex_direction'] );
		$this->assertEquals( 'center', $settings['justify_content'] );
		$this->assertEquals( 'flex-start', $settings['align_items'] );
		$this->assertEquals( '20px', $settings['gap'] );
		
		// Check padding was parsed correctly
		$this->assertIsArray( $settings['padding'] );
		$this->assertEquals( '10px', $settings['padding']['top'] );
		$this->assertEquals( '20px', $settings['padding']['right'] );
	}

	public function test_processes_css_styles_for_content_widgets() {
		$widgets = [
			[
				'id' => 'styled-heading',
				'widget_type' => 'e-heading',
				'element_data' => [ 'tag' => 'h1', 'content' => 'Styled Title' ],
				'applied_styles' => [
					'computed_styles' => [
						'color' => [ 'value' => '#ff0000' ],
						'font-size' => [ 'value' => '24px' ],
						'font-weight' => [ 'value' => 'bold' ],
						'text-align' => [ 'value' => 'center' ],
						'line-height' => [ 'value' => '1.5' ],
					],
				],
				'settings' => [],
			],
		];
		
		$result = $this->hierarchy_processor->process_widget_hierarchy( $widgets );
		$heading = $result['widgets'][0];
		$settings = $heading['settings'];
		
		// Check CSS styles were applied to content widget settings
		$this->assertEquals( '#ff0000', $settings['title_color'] );
		$this->assertEquals( 'center', $settings['align'] );
		$this->assertEquals( 'bold', $settings['title_weight'] );
		
		// Check size was parsed correctly
		$this->assertIsArray( $settings['title_size'] );
		$this->assertEquals( 24, $settings['title_size']['size'] );
		$this->assertEquals( 'px', $settings['title_size']['unit'] );
		
		// Check line height was parsed correctly
		$this->assertIsArray( $settings['title_line_height'] );
		$this->assertEquals( 1.5, $settings['title_line_height']['size'] );
	}

	public function test_validates_widget_structure() {
		$invalid_widgets = [
			[
				'id' => 'invalid',
				// Missing widget_type and element_data
			],
		];
		
		$result = $this->hierarchy_processor->process_widget_hierarchy( $invalid_widgets );
		
		// Should have errors for invalid widget structure
		$this->assertNotEmpty( $result['errors'] );
		$this->assertGreaterThan( 0, $result['stats']['hierarchy_errors'] );
	}

	public function test_validates_depth_limits() {
		// Create deeply nested structure
		$widgets = [];
		$parent_id = null;
		
		for ( $i = 0; $i < 15; $i++ ) { // Exceed max depth of 10
			$widget_id = "widget-{$i}";
			$widget = [
				'id' => $widget_id,
				'widget_type' => 'e-flexbox',
				'element_data' => [ 'tag' => 'div' ],
			];
			
			if ( $parent_id ) {
				$widget['parent_id'] = $parent_id;
			}
			
			$widgets[] = $widget;
			$parent_id = $widget_id;
		}
		
		$result = $this->hierarchy_processor->process_widget_hierarchy( $widgets );
		
		// Should have errors for exceeding depth limit
		$this->assertNotEmpty( $result['errors'] );
	}

	public function test_validates_parent_child_compatibility() {
		$widgets = [
			[
				'id' => 'invalid-parent',
				'widget_type' => 'e-heading', // Headings can't contain children
				'element_data' => [ 'tag' => 'h1', 'content' => 'Title' ],
			],
			[
				'id' => 'child',
				'widget_type' => 'e-text',
				'element_data' => [ 'tag' => 'p', 'content' => 'Text' ],
				'parent_id' => 'invalid-parent',
			],
		];
		
		$result = $this->hierarchy_processor->process_widget_hierarchy( $widgets );
		
		// Should have warnings about invalid parent-child relationships
		$this->assertNotEmpty( $result['errors'] );
		$invalid_relationship_errors = array_filter( $result['errors'], function( $error ) {
			return 'invalid_parent_child_relationship' === $error['type'];
		} );
		$this->assertNotEmpty( $invalid_relationship_errors );
	}

	public function test_provides_accurate_statistics() {
		$widgets = [
			[
				'id' => 'container',
				'widget_type' => 'e-flexbox',
				'element_data' => [ 'tag' => 'div' ],
			],
			[
				'id' => 'child1',
				'widget_type' => 'e-heading',
				'element_data' => [ 'tag' => 'h1', 'content' => 'Title' ],
				'parent_id' => 'container',
			],
			[
				'id' => 'child2',
				'widget_type' => 'e-text',
				'element_data' => [ 'tag' => 'p', 'content' => 'Text' ],
				'parent_id' => 'container',
			],
		];
		
		$result = $this->hierarchy_processor->process_widget_hierarchy( $widgets );
		$stats = $result['stats'];
		
		$this->assertEquals( 3, $stats['total_widgets'] );
		$this->assertEquals( 1, $stats['parent_widgets'] );
		$this->assertEquals( 2, $stats['child_widgets'] );
		$this->assertEquals( 1, $stats['depth_levels'] );
		$this->assertEquals( 0, $stats['hierarchy_errors'] );
	}

	public function test_handles_complex_nested_structure() {
		$widgets = [
			[
				'id' => 'page',
				'widget_type' => 'e-flexbox',
				'element_data' => [ 'tag' => 'div' ],
			],
			[
				'id' => 'header',
				'widget_type' => 'e-flexbox',
				'element_data' => [ 'tag' => 'header' ],
				'parent_id' => 'page',
			],
			[
				'id' => 'nav',
				'widget_type' => 'e-flexbox',
				'element_data' => [ 'tag' => 'nav' ],
				'parent_id' => 'header',
			],
			[
				'id' => 'logo',
				'widget_type' => 'e-image',
				'element_data' => [ 'tag' => 'img', 'attributes' => [ 'src' => 'logo.png' ] ],
				'parent_id' => 'nav',
			],
			[
				'id' => 'main',
				'widget_type' => 'e-flexbox',
				'element_data' => [ 'tag' => 'main' ],
				'parent_id' => 'page',
			],
			[
				'id' => 'content',
				'widget_type' => 'e-text',
				'element_data' => [ 'tag' => 'p', 'content' => 'Main content' ],
				'parent_id' => 'main',
			],
		];
		
		$result = $this->hierarchy_processor->process_widget_hierarchy( $widgets );
		
		// Should successfully process complex structure
		$this->assertCount( 1, $result['widgets'] ); // Root page
		$this->assertEquals( 'page', $result['widgets'][0]['id'] );
		
		// Verify nested structure
		$page = $result['widgets'][0];
		$this->assertCount( 2, $page['elements'] ); // header and main
		
		$header = $page['elements'][0];
		$this->assertEquals( 'header', $header['id'] );
		$this->assertCount( 1, $header['elements'] ); // nav
		
		$nav = $header['elements'][0];
		$this->assertEquals( 'nav', $nav['id'] );
		$this->assertCount( 1, $nav['elements'] ); // logo
		
		$main = $page['elements'][1];
		$this->assertEquals( 'main', $main['id'] );
		$this->assertCount( 1, $main['elements'] ); // content
	}
}
