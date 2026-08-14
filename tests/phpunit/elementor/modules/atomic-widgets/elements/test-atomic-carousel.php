<?php

use Elementor\Modules\AtomicWidgets\Elements\Atomic_Carousel\Atomic_Carousel;
use Elementor\Modules\AtomicWidgets\Elements\Atomic_Carousel\Atomic_Carousel_Arrow_Next\Atomic_Carousel_Arrow_Next;
use Elementor\Modules\AtomicWidgets\Elements\Atomic_Carousel\Atomic_Carousel_Arrow_Prev\Atomic_Carousel_Arrow_Prev;
use Elementor\Modules\AtomicWidgets\Elements\Atomic_Carousel\Atomic_Carousel_Container\Atomic_Carousel_Container;
use Elementor\Modules\AtomicWidgets\Elements\Atomic_Carousel\Atomic_Carousel_Pagination\Atomic_Carousel_Pagination;
use Elementor\Modules\AtomicWidgets\Elements\Atomic_Carousel\Atomic_Carousel_Slide\Atomic_Carousel_Slide;
use Elementor\Modules\AtomicWidgets\Elements\Atomic_Carousel\Atomic_Carousel_Viewport\Atomic_Carousel_Viewport;
use Elementor\Plugin;
use ElementorEditorTesting\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

/**
 * The frontend handler finds its parts with `:scope > [data-e-type="..."]` and reads its
 * configuration from `data-e-settings`, so these tests pin the markup contract between the two.
 */
class Test_Atomic_Carousel extends Elementor_Test_Base {

	public function setUp(): void {
		parent::setUp();

		$elements_manager = Plugin::$instance->elements_manager;

		foreach ( [
			Atomic_Carousel::class,
			Atomic_Carousel_Viewport::class,
			Atomic_Carousel_Container::class,
			Atomic_Carousel_Slide::class,
			Atomic_Carousel_Arrow_Prev::class,
			Atomic_Carousel_Arrow_Next::class,
			Atomic_Carousel_Pagination::class,
		] as $class ) {
			$elements_manager->register_element_type( new $class() );
		}
	}

	public function test_render__exposes_the_structure_the_handler_walks() {
		// Arrange.
		$instance = $this->create_carousel();

		// Act.
		$html = $this->render( $instance );

		// Assert.
		$this->assertStringContainsString( 'data-e-type="e-carousel"', $html );
		$this->assertStringContainsString( 'data-e-type="e-carousel-viewport"', $html );
		$this->assertStringContainsString( 'data-e-type="e-carousel-container"', $html );
		$this->assertSame( 4, substr_count( $html, 'data-element_type="e-carousel-slide"' ) );
		$this->assertMatchesRegularExpression( '/<button[^>]*data-e-type="e-carousel-arrow-prev"/', $html );
		$this->assertMatchesRegularExpression( '/<button[^>]*data-e-type="e-carousel-arrow-next"/', $html );
	}

	public function test_render__pagination_is_left_empty_for_the_handler() {
		// The dots depend on the number of reachable snap positions, which only the browser can
		// measure, so PHP must not guess at them.

		// Arrange.
		$instance = $this->create_carousel();

		// Act.
		$html = $this->render( $instance );

		// Assert.
		$this->assertMatchesRegularExpression( '/data-e-type="e-carousel-pagination"[^>]*>\s*<\/div>/', $html );
	}

	public function test_render__announces_the_carousel_and_its_slides() {
		// Arrange.
		$instance = $this->create_carousel();

		// Act.
		$html = $this->render( $instance );

		// Assert.
		$this->assertStringContainsString( 'role="region"', $html );
		$this->assertStringContainsString( 'aria-roledescription="carousel"', $html );
		$this->assertSame( 4, substr_count( $html, 'aria-roledescription="slide"' ) );

		// Autoplay moves slides without being asked, so the track must not be a live region.
		$this->assertStringContainsString( 'aria-live="off"', $html );
	}

	public function test_render__transition_speed_reaches_the_handler_in_milliseconds() {
		// Embla's `duration` is a spring constant. Persisting it would make the engine part of the
		// saved data, so the panel stores milliseconds and the handler converts.

		// Arrange.
		$instance = $this->create_carousel( [
			'transition_speed' => [
				'$$type' => 'number',
				'value' => 900,
			],
		] );

		// Act.
		$settings = $this->rendered_settings( $this->render( $instance ) );

		// Assert.
		$this->assertSame( 900, $settings['transition_speed'] );
	}

	public function test_render__slides_per_view_becomes_a_css_variable() {
		// Arrange.
		$instance = $this->create_carousel( [
			'slides_per_view' => [
				'$$type' => 'number',
				'value' => 5,
			],
		] );

		// Act.
		$html = $this->render( $instance );

		// Assert.
		$this->assertStringContainsString( '--e-carousel-slides-per-view: 5', $html );
	}

	public function test_render__fade_collapses_to_a_single_slide_per_view() {
		// Arrange.
		$instance = $this->create_carousel( [
			'transition_type' => [
				'$$type' => 'string',
				'value' => 'fade',
			],
			'slides_per_view' => [
				'$$type' => 'number',
				'value' => 3,
			],
		] );

		// Act.
		$html = $this->render( $instance );

		// Assert.
		$this->assertStringContainsString( '--e-carousel-slides-per-view: 1', $html );
	}

	public function test_base_styles__slide_width_comes_from_the_css_variable() {
		// Arrange.
		$slide = new Atomic_Carousel_Slide();

		// Act.
		$styles = $this->base_styles( $slide );

		// Assert.
		$this->assertStringContainsString( 'calc(100% / var(--e-carousel-slides-per-view, 1))', $styles );
	}

	public function test_base_styles__arrows_use_logical_inset_properties() {
		// Physical `left`/`right` do not follow `direction`, so the arrows would not swap in RTL.

		// Act.
		$prev = $this->base_styles( new Atomic_Carousel_Arrow_Prev() );
		$next = $this->base_styles( new Atomic_Carousel_Arrow_Next() );

		// Assert.
		$this->assertStringContainsString( 'inset-inline-start', $prev );
		$this->assertStringContainsString( 'inset-inline-end', $next );
		$this->assertStringNotContainsString( '"left"', $prev );
		$this->assertStringNotContainsString( '"right"', $next );
	}

	public function test_default_children__a_new_carousel_can_already_scroll() {
		// Four slides at three per view means the fourth is off-screen, so the arrows and dots are
		// live as soon as the element is dropped instead of looking broken.

		// Arrange.
		$carousel = new Atomic_Carousel();

		// Act.
		$children = $this->invoke( $carousel, 'define_default_children' );

		// Assert.
		$this->assertCount( 4, $children );
		$this->assertTrue( $children[0]['meta']['required'] );
		$this->assertCount( 4, $children[0]['elements'][0]['elements'] );
		$this->assertSame( 3, Atomic_Carousel::get_props_schema()['slides_per_view']->get_default()['value'] );
	}

	public function test_children_dependencies__arrows_and_pagination_detach_with_their_switches() {
		// Arrange.
		$carousel = new Atomic_Carousel();

		// Act.
		$dependencies = array_map(
			fn( $dependency ) => $dependency->build(),
			$this->invoke( $carousel, 'define_children_dependencies' )
		);

		// Assert.
		$this->assertCount( 3, $dependencies );

		$by_type = array_column( $dependencies, null, 'child_type' );

		foreach ( [ 'e-carousel-arrow-prev', 'e-carousel-arrow-next' ] as $type ) {
			$this->assertSame( 'show_arrows', $by_type[ $type ]['when']['terms'][0]['path'][0] );
			$this->assertNotEmpty( $by_type[ $type ]['default_model'] );
		}

		$this->assertSame( 'show_pagination', $by_type['e-carousel-pagination']['when']['terms'][0]['path'][0] );
	}

	public function test_allowed_children__arrows_are_siblings_of_the_viewport() {
		// An arrow inside the viewport would start a drag on pointer-down.

		// Act.
		$root_children = $this->invoke( new Atomic_Carousel(), 'define_allowed_child_types' );
		$viewport_children = $this->invoke( new Atomic_Carousel_Viewport(), 'define_allowed_child_types' );
		$container_children = $this->invoke( new Atomic_Carousel_Container(), 'define_allowed_child_types' );

		// Assert.
		$this->assertContains( 'e-carousel-arrow-prev', $root_children );
		$this->assertContains( 'e-carousel-pagination', $root_children );
		$this->assertSame( [ 'e-carousel-container' ], $viewport_children );
		$this->assertSame( [ 'e-carousel-slide' ], $container_children );
	}

	public function test_script_depends__the_handler_is_registered_and_required() {
		// Arrange.
		$carousel = new Atomic_Carousel();
		$carousel->register_frontend_handlers();

		// Assert.
		$this->assertContains( 'elementor-carousel-handler', $carousel->get_script_depends() );
		$this->assertTrue( wp_script_is( 'elementor-carousel-handler', 'registered' ) );
	}

	private function create_carousel( array $settings = [], int $slide_count = 4 ): object {
		$slides = [];

		foreach ( range( 1, $slide_count ) as $i ) {
			$slides[] = [
				'id' => 'slide' . $i,
				'elType' => Atomic_Carousel_Slide::get_element_type(),
				'settings' => [],
				'elements' => [],
			];
		}

		return Plugin::$instance->elements_manager->create_element_instance( [
			'id' => 'carousel1',
			'elType' => Atomic_Carousel::get_element_type(),
			'settings' => $settings,
			'elements' => [
				[
					'id' => 'viewport1',
					'elType' => Atomic_Carousel_Viewport::get_element_type(),
					'settings' => [],
					'elements' => [
						[
							'id' => 'track1',
							'elType' => Atomic_Carousel_Container::get_element_type(),
							'settings' => [],
							'elements' => $slides,
						],
					],
				],
				[
					'id' => 'prev1',
					'elType' => Atomic_Carousel_Arrow_Prev::get_element_type(),
					'settings' => [],
					'elements' => [],
				],
				[
					'id' => 'next1',
					'elType' => Atomic_Carousel_Arrow_Next::get_element_type(),
					'settings' => [],
					'elements' => [],
				],
				[
					'id' => 'dots1',
					'elType' => Atomic_Carousel_Pagination::get_element_type(),
					'settings' => [],
					'elements' => [],
				],
			],
		] );
	}

	private function render( object $instance ): string {
		ob_start();
		$instance->print_element();

		return ob_get_clean();
	}

	private function rendered_settings( string $html ): array {
		preg_match( '/data-e-settings="([^"]*)"/', $html, $matches );

		return json_decode( html_entity_decode( $matches[1] ?? '', ENT_QUOTES ), true ) ?? [];
	}

	private function base_styles( object $element ): string {
		$definitions = $this->invoke( $element, 'define_base_styles' );

		return wp_json_encode(
			array_map(
				fn( $key, $definition ) => $definition->build( $key ),
				array_keys( $definitions ),
				$definitions
			)
		);
	}

	private function invoke( object $element, string $method ) {
		$reflection = new ReflectionMethod( $element, $method );
		$reflection->setAccessible( true );

		return $reflection->invoke( $element );
	}
}
