<?php
namespace Elementor\Modules\CssConverter\Tests\AtomicWidgetsV2;

use Elementor\Modules\CssConverter\Services\AtomicWidgetsV2\Atomic_Widgets_Orchestrator;

class EndToEndIntegrationTest extends AtomicWidgetV2TestCase {

	private Atomic_Widgets_Orchestrator $orchestrator;

	protected function setUp(): void {
		parent::setUp();
		$this->orchestrator = new Atomic_Widgets_Orchestrator( true, true ); // Enable debug and performance monitoring
	}

	public function test_complete_blog_post_conversion(): void {
		$html = '<article style="max-width: 800px; margin: 0 auto; padding: 40px;">
					<header style="margin-bottom: 30px;">
						<h1 style="font-size: 48px; font-weight: 700; color: #1a1a1a; line-height: 1.2;">Complete Guide to Web Development</h1>
						<div style="display: flex; align-items: center; gap: 15px; margin-top: 20px;">
							<span style="color: #666; font-size: 14px;">Published on March 15, 2024</span>
							<span style="color: #666; font-size: 14px;">•</span>
							<span style="color: #666; font-size: 14px;">10 min read</span>
						</div>
					</header>
					
					<section style="margin-bottom: 40px;">
						<h2 style="font-size: 32px; font-weight: 600; color: #2c3e50; margin-bottom: 20px;">Introduction</h2>
						<p style="font-size: 18px; line-height: 1.7; color: #444; margin-bottom: 20px;">
							Web development has evolved significantly over the past decade. This comprehensive guide will walk you through the essential concepts and technologies you need to know.
						</p>
						<p style="font-size: 18px; line-height: 1.7; color: #444; margin-bottom: 20px;">
							Whether you\'re a beginner or looking to expand your skills, this article covers everything from basic HTML to advanced frameworks.
						</p>
					</section>

					<section style="margin-bottom: 40px;">
						<h2 style="font-size: 32px; font-weight: 600; color: #2c3e50; margin-bottom: 20px;">Key Technologies</h2>
						<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 30px; margin-top: 30px;">
							<div style="background: #f8f9fa; border: 1px solid #e9ecef; border-radius: 12px; padding: 30px;">
								<h3 style="font-size: 24px; font-weight: 600; color: #495057; margin-bottom: 15px;">Frontend Development</h3>
								<p style="font-size: 16px; line-height: 1.6; color: #6c757d; margin-bottom: 20px;">
									Master HTML, CSS, and JavaScript to create engaging user interfaces.
								</p>
								<ul style="list-style: none; padding: 0;">
									<li style="padding: 8px 0; border-bottom: 1px solid #dee2e6;">HTML5 & Semantic Markup</li>
									<li style="padding: 8px 0; border-bottom: 1px solid #dee2e6;">CSS3 & Responsive Design</li>
									<li style="padding: 8px 0;">JavaScript & Modern Frameworks</li>
								</ul>
							</div>
							
							<div style="background: #f8f9fa; border: 1px solid #e9ecef; border-radius: 12px; padding: 30px;">
								<h3 style="font-size: 24px; font-weight: 600; color: #495057; margin-bottom: 15px;">Backend Development</h3>
								<p style="font-size: 16px; line-height: 1.6; color: #6c757d; margin-bottom: 20px;">
									Build robust server-side applications and APIs.
								</p>
								<ul style="list-style: none; padding: 0;">
									<li style="padding: 8px 0; border-bottom: 1px solid #dee2e6;">Server Architecture</li>
									<li style="padding: 8px 0; border-bottom: 1px solid #dee2e6;">Database Design</li>
									<li style="padding: 8px 0;">API Development</li>
								</ul>
							</div>
						</div>
					</section>

					<footer style="border-top: 2px solid #e9ecef; padding-top: 30px; text-align: center;">
						<div style="margin-bottom: 20px;">
							<a href="#share" style="display: inline-block; background: #007bff; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: 500; margin: 0 10px;">Share Article</a>
							<a href="#comments" style="display: inline-block; background: #28a745; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: 500; margin: 0 10px;">Leave Comment</a>
						</div>
						<p style="color: #6c757d; font-size: 14px;">© 2024 Web Development Guide. All rights reserved.</p>
					</footer>
				</article>';

		$result = $this->orchestrator->convert_html_to_atomic_widgets( $html );

		$this->assertTrue( $result['success'], 'Blog post conversion should succeed' );
		$this->assertNotEmpty( $result['widgets'], 'Should create widgets from blog post' );

		// Verify comprehensive stats
		$stats = $result['stats'];
		$this->assertGreaterThan( 15, $stats['total_elements_parsed'], 'Should parse many elements' );
		$this->assertGreaterThan( 10, $stats['total_widgets_created'], 'Should create many widgets' );
		$this->assertGreaterThan( 80, $stats['conversion_success_rate'], 'Should have high success rate' );

		// Verify widget types diversity
		$widget_types = $stats['widget_types_created'];
		$this->assertArrayHasKey( 'e-flexbox', $widget_types, 'Should create container widgets' );
		$this->assertArrayHasKey( 'e-heading', $widget_types, 'Should create heading widgets' );
		$this->assertArrayHasKey( 'e-paragraph', $widget_types, 'Should create paragraph widgets' );
		$this->assertArrayHasKey( 'e-button', $widget_types, 'Should create button widgets' );

		// Verify performance is acceptable
		$this->assertTrue( 
			$this->orchestrator->is_performance_acceptable(),
			'Performance should be within acceptable limits'
		);

		// Verify styles integration
		$this->assertGreaterThan( 0, $stats['styles_created'], 'Should create styles' );
	}

	public function test_ecommerce_product_page_conversion(): void {
		$html = '<div style="max-width: 1200px; margin: 0 auto; padding: 20px;">
					<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 60px; margin-bottom: 60px;">
						<div style="position: relative;">
							<img src="/product-image.jpg" alt="Premium Headphones" style="width: 100%; border-radius: 12px; box-shadow: 0 10px 30px rgba(0,0,0,0.1);">
						</div>
						
						<div style="padding: 20px 0;">
							<h1 style="font-size: 36px; font-weight: 700; color: #1a1a1a; margin-bottom: 10px;">Premium Wireless Headphones</h1>
							<p style="font-size: 18px; color: #666; margin-bottom: 20px;">Professional grade audio experience</p>
							
							<div style="display: flex; align-items: center; gap: 15px; margin-bottom: 30px;">
								<span style="font-size: 32px; font-weight: 700; color: #e74c3c;">$299.99</span>
								<span style="font-size: 20px; color: #95a5a6; text-decoration: line-through;">$399.99</span>
								<span style="background: #e74c3c; color: white; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: 600;">25% OFF</span>
							</div>

							<div style="margin-bottom: 30px;">
								<h3 style="font-size: 18px; font-weight: 600; margin-bottom: 15px;">Key Features:</h3>
								<ul style="list-style: none; padding: 0;">
									<li style="padding: 8px 0; border-bottom: 1px solid #eee;">✓ 40-hour battery life</li>
									<li style="padding: 8px 0; border-bottom: 1px solid #eee;">✓ Active noise cancellation</li>
									<li style="padding: 8px 0; border-bottom: 1px solid #eee;">✓ Premium leather comfort</li>
									<li style="padding: 8px 0;">✓ Wireless & wired connectivity</li>
								</ul>
							</div>

							<div style="display: flex; gap: 15px; margin-bottom: 30px;">
								<button style="flex: 1; background: #e74c3c; color: white; border: none; padding: 15px 30px; border-radius: 8px; font-size: 16px; font-weight: 600; cursor: pointer;">Add to Cart</button>
								<button style="background: transparent; color: #e74c3c; border: 2px solid #e74c3c; padding: 15px 30px; border-radius: 8px; font-size: 16px; font-weight: 600; cursor: pointer;">♡ Wishlist</button>
							</div>

							<div style="background: #f8f9fa; padding: 20px; border-radius: 8px;">
								<h4 style="font-size: 16px; font-weight: 600; margin-bottom: 10px;">Free Shipping & Returns</h4>
								<p style="font-size: 14px; color: #666; margin: 0;">Free shipping on orders over $50. 30-day return policy.</p>
							</div>
						</div>
					</div>

					<section style="margin-bottom: 60px;">
						<h2 style="font-size: 28px; font-weight: 600; margin-bottom: 30px; text-align: center;">Customer Reviews</h2>
						<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 30px;">
							<div style="background: white; border: 1px solid #eee; border-radius: 12px; padding: 25px; box-shadow: 0 2px 10px rgba(0,0,0,0.05);">
								<div style="display: flex; align-items: center; margin-bottom: 15px;">
									<div style="width: 40px; height: 40px; background: #007bff; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-weight: 600; margin-right: 15px;">JD</div>
									<div>
										<h5 style="font-size: 16px; font-weight: 600; margin: 0;">John Doe</h5>
										<div style="color: #ffc107; font-size: 14px;">★★★★★</div>
									</div>
								</div>
								<p style="font-size: 14px; line-height: 1.6; color: #666; margin: 0;">Amazing sound quality and comfort. Best headphones I\'ve ever owned!</p>
							</div>
						</div>
					</section>
				</div>';

		$result = $this->orchestrator->convert_with_validation( $html );

		$this->assertTrue( $result['success'], 'E-commerce page conversion should succeed' );
		$this->assertNotEmpty( $result['widgets'], 'Should create widgets from product page' );

		// Should have no validation errors for well-formed HTML
		$this->assertArrayNotHasKey( 'validation_errors', $result, 'Should have no validation errors' );

		// Verify complex structure handling
		$stats = $result['stats'];
		$this->assertGreaterThan( 20, $stats['total_elements_parsed'], 'Should handle complex structure' );
		$this->assertGreaterThan( 0, $stats['atomic_props_converted'], 'Should convert many CSS properties' );

		// Verify performance with complex content
		$performance = $result['performance'];
		$this->assertArrayHasKey( 'total_duration', $performance );
		$this->assertLessThan( 2000, $performance['total_duration'], 'Should complete within 2 seconds' );
	}

	public function test_error_handling_with_malformed_html(): void {
		$malformed_html = '<div style="color: red;"><p>Unclosed paragraph<div>Nested incorrectly</p></div>';

		$result = $this->orchestrator->convert_html_to_atomic_widgets( $malformed_html );

		// Should still attempt conversion and provide useful error information
		$this->assertArrayHasKey( 'success', $result );
		
		if ( ! $result['success'] ) {
			$this->assertArrayHasKey( 'error', $result );
			$this->assertArrayHasKey( 'errors', $result );
		}

		// Should have performance data even for failed conversions
		$this->assertArrayHasKey( 'performance', $result );
	}

	public function test_performance_monitoring_detailed_metrics(): void {
		$html = '<div style="padding: 20px;">
					<h1 style="font-size: 32px;">Performance Test</h1>
					<p style="font-size: 16px;">Testing performance monitoring capabilities.</p>
				</div>';

		$result = $this->orchestrator->convert_html_to_atomic_widgets( $html );

		$this->assertTrue( $result['success'] );

		// Verify detailed performance metrics
		$detailed_metrics = $this->orchestrator->get_detailed_performance_metrics();
		$this->assertIsArray( $detailed_metrics );

		// Should have metrics for each phase
		$expected_phases = ['total_conversion', 'html_parsing', 'widget_creation', 'styles_integration', 'stats_calculation'];
		
		foreach ( $expected_phases as $phase ) {
			$this->assertArrayHasKey( $phase, $detailed_metrics, "Should have metrics for {$phase}" );
			
			$metric = $detailed_metrics[ $phase ];
			$this->assertArrayHasKey( 'duration_ms', $metric );
			$this->assertArrayHasKey( 'memory_used', $metric );
			$this->assertIsNumeric( $metric['duration_ms'] );
		}
	}

	public function test_large_content_performance(): void {
		// Generate large HTML content
		$large_html = '<div style="max-width: 1200px; margin: 0 auto;">';
		
		for ( $i = 0; $i < 50; $i++ ) {
			$large_html .= "<section style=\"margin-bottom: 30px; padding: 20px; background: #f8f9fa;\">
								<h2 style=\"font-size: 24px; color: #333;\">Section {$i}</h2>
								<p style=\"font-size: 16px; line-height: 1.6;\">This is paragraph {$i} with some content to test performance with larger HTML structures.</p>
								<div style=\"display: flex; gap: 15px;\">
									<button style=\"background: #007bff; color: white; padding: 10px 20px; border-radius: 5px;\">Button {$i}</button>
									<a href=\"#link{$i}\" style=\"color: #007bff; text-decoration: none;\">Link {$i}</a>
								</div>
							</section>";
		}
		
		$large_html .= '</div>';

		$result = $this->orchestrator->convert_html_to_atomic_widgets( $large_html );

		$this->assertTrue( $result['success'], 'Large content conversion should succeed' );

		// Verify performance is still acceptable
		$performance = $result['performance'];
		$this->assertLessThan( 5000, $performance['total_duration'], 'Should complete large content within 5 seconds' );

		// Verify stats for large content
		$stats = $result['stats'];
		$this->assertGreaterThan( 150, $stats['total_elements_parsed'], 'Should parse many elements' );
		$this->assertGreaterThan( 100, $stats['total_widgets_created'], 'Should create many widgets' );
		$this->assertGreaterThan( 70, $stats['conversion_success_rate'], 'Should maintain good success rate' );
	}

	public function test_global_classes_generation_end_to_end(): void {
		$html = '<div style="background: #f8f9fa; padding: 40px;">
					<h1 style="font-size: 48px; color: #1a1a1a; text-align: center; margin-bottom: 30px;">Welcome</h1>
					<div style="max-width: 600px; margin: 0 auto;">
						<p style="font-size: 18px; line-height: 1.7; color: #666; text-align: center; margin-bottom: 30px;">
							This is a complete test of global classes generation from HTML to atomic widgets.
						</p>
						<div style="text-align: center;">
							<a href="#cta" style="display: inline-block; background: #007bff; color: white; padding: 15px 30px; border-radius: 8px; text-decoration: none; font-weight: 600;">Get Started</a>
						</div>
					</div>
				</div>';

		$result = $this->orchestrator->convert_html_to_global_classes( $html );

		$this->assertTrue( $result['success'], 'Global classes generation should succeed' );
		$this->assertArrayHasKey( 'global_classes', $result );

		$global_classes = $result['global_classes'];
		$this->assertArrayHasKey( 'items', $global_classes );
		$this->assertArrayHasKey( 'order', $global_classes );
		$this->assertNotEmpty( $global_classes['items'] );
		$this->assertNotEmpty( $global_classes['order'] );

		// Verify each global class structure
		foreach ( $global_classes['items'] as $class_id => $class_definition ) {
			$this->assertEquals( $class_id, $class_definition['id'] );
			$this->assertEquals( 'local', $class_definition['label'] );
			$this->assertEquals( 'class', $class_definition['type'] );
			$this->assertArrayHasKey( 'variants', $class_definition );
			$this->assertNotEmpty( $class_definition['variants'] );

			// Verify variant structure
			$variant = $class_definition['variants'][0];
			$this->assertArrayHasKey( 'meta', $variant );
			$this->assertArrayHasKey( 'props', $variant );
			$this->assertEquals( 'desktop', $variant['meta']['breakpoint'] );
			$this->assertIsArray( $variant['props'] );

			// Verify atomic props structure
			foreach ( $variant['props'] as $prop_name => $prop_value ) {
				$this->assertIsArray( $prop_value );
				$this->assertArrayHasKey( '$$type', $prop_value );
				$this->assertArrayHasKey( 'value', $prop_value );
			}
		}

		// Verify order matches items
		$this->assertEquals( count( $global_classes['items'] ), count( $global_classes['order'] ) );
		
		foreach ( $global_classes['order'] as $class_id ) {
			$this->assertArrayHasKey( $class_id, $global_classes['items'] );
		}
	}

	public function test_error_recovery_and_partial_success(): void {
		$mixed_html = '<div style="padding: 20px;">
						<h1 style="font-size: 32px;">Valid Heading</h1>
						<custom-invalid-element style="color: red;">Invalid Element</custom-invalid-element>
						<p style="font-size: 16px;">Valid Paragraph</p>
						<another-invalid style="background: blue;">Another Invalid</another-invalid>
						<button style="background: green; color: white; padding: 10px;">Valid Button</button>
					</div>';

		$result = $this->orchestrator->convert_html_to_atomic_widgets( $mixed_html );

		// Should succeed with warnings about unsupported elements
		$this->assertTrue( $result['success'], 'Should succeed despite invalid elements' );
		$this->assertNotEmpty( $result['widgets'], 'Should create widgets for valid elements' );

		// Should have warnings about unsupported elements
		if ( isset( $result['warnings'] ) ) {
			$this->assertNotEmpty( $result['warnings'], 'Should have warnings about invalid elements' );
		}

		// Verify that valid elements were processed
		$stats = $result['stats'];
		$this->assertGreaterThan( 0, $stats['supported_elements'], 'Should have supported elements' );
		$this->assertGreaterThan( 0, $stats['total_widgets_created'], 'Should create widgets for valid elements' );
	}
}
