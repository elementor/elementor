<?php

namespace Elementor\Tests\Phpunit\Elementor\Core\Kits\Documents\Tabs;

use Elementor\Core\Files\CSS\Post as Post_CSS;
use Elementor\Core\Kits\Documents\Tabs\Theme_Style_Buttons;
use Elementor\Plugin;
use ElementorEditorTesting\Elementor_Test_Base;

class Test_Theme_Style_Buttons extends Elementor_Test_Base {

	const BUTTON_ELEMENTS = [ 'button', 'input[type="button"]', 'input[type="submit"]', '.elementor-button' ];

	/**
	 * @var \Elementor\Core\Kits\Documents\Kit
	 */
	private $kit;

	public function setUp(): void {
		parent::setUp();

		wp_set_current_user( $this->factory()->get_administrator_user()->ID );

		$kit = Plugin::$instance->kits_manager->get_active_kit();
		$this->kit = Plugin::$instance->documents->get( $kit->get_id(), false );

		// In the production environment 'JS' sends empty array, do the same.
		add_post_meta( $kit->get_main_id(), '_elementor_data', '[]' );
	}

	public function tearDown(): void {
		$this->flush_documents_cache();

		parent::tearDown();
	}

	public function test_linear_gradient__excludes_atomic_elements() {
		// Arrange.
		$this->save_kit_settings( [
			'button_background_background' => 'gradient',
			'button_background_gradient_type' => 'linear',
			'button_background_color' => '#2B00FF',
			'button_background_color_b' => '#00FFD0',
		] );

		// Act.
		$selectors = $this->get_selectors_of_rules_containing( 'background' );

		// Assert.
		$this->assertSame( $this->get_expected_selectors( self::BUTTON_ELEMENTS ), $selectors );
	}

	public function test_radial_gradient__excludes_atomic_elements() {
		// Arrange.
		$this->save_kit_settings( [
			'button_background_background' => 'gradient',
			'button_background_gradient_type' => 'radial',
			'button_background_color' => '#2B00FF',
			'button_background_color_b' => '#00FFD0',
		] );

		// Act.
		$selectors = $this->get_selectors_of_rules_containing( 'radial-gradient(' );

		// Assert.
		$this->assertSame( $this->get_expected_selectors( self::BUTTON_ELEMENTS ), $selectors );
	}

	public function test_gradient__overrides_its_own_first_color_with_transparent() {
		// Arrange.
		$this->save_kit_settings( [
			'button_background_background' => 'gradient',
			'button_background_gradient_type' => 'linear',
			'button_background_color' => '#2B00FF',
			'button_background_color_b' => '#00FFD0',
			'button_background_gradient_angle' => [
				'unit' => 'deg',
				'size' => 90,
			],
		] );

		// Act.
		$css = $this->get_kit_css();

		// Assert.
		$this->assertStringContainsString(
			'background-color:transparent;background-image:linear-gradient(90deg, #2B00FF 0%, #00FFD0 100%)',
			$css
		);
		$this->assertStringNotContainsString( 'background-color:#2B00FF', $css );
	}

	public function test_hover_gradient__excludes_atomic_elements_including_its_first_color() {
		// Arrange.
		$this->save_kit_settings( [
			'button_hover_background_background' => 'gradient',
			'button_hover_background_gradient_type' => 'linear',
			'button_hover_background_color' => '#00A32A',
			'button_hover_background_color_b' => '#FFEE00',
		] );

		// Act.
		$selectors = $this->get_selectors_of_rules_containing( 'background' );

		// Assert.
		$this->assertSame( $this->get_expected_selectors( $this->get_hover_elements() ), $selectors );
		$this->assertStringNotContainsString( 'background-color:#00A32A', $this->get_kit_css() );
	}

	public function test_classic_background_color__excludes_atomic_elements() {
		// Arrange.
		$this->save_kit_settings( [
			'button_background_background' => 'classic',
			'button_background_color' => '#2B00FF',
			'button_hover_background_background' => 'classic',
			'button_hover_background_color' => '#00A32A',
		] );

		// Act.
		$selectors = $this->get_selectors_of_rules_containing( 'background-color:#2B00FF' );
		$hover_selectors = $this->get_selectors_of_rules_containing( 'background-color:#00A32A' );

		// Assert.
		$this->assertSame( $this->get_expected_selectors( self::BUTTON_ELEMENTS ), $selectors );
		$this->assertSame( $this->get_expected_selectors( $this->get_hover_elements() ), $hover_selectors );
	}

	public function test_non_background_styles__still_apply_to_atomic_elements() {
		// Arrange.
		$this->save_kit_settings( [
			'button_background_background' => 'gradient',
			'button_background_color' => '#2B00FF',
			'button_background_color_b' => '#00FFD0',
			'button_text_color' => '#123456',
		] );

		// Act.
		$selectors = $this->get_selectors_of_rules_containing( 'color:#123456' );

		// Assert.
		$wrapper = $this->get_wrapper();
		$expected = array_map( fn( $element ) => "{$wrapper} {$element}", self::BUTTON_ELEMENTS );

		$this->assertSame( $expected, $selectors );
	}

	private function save_kit_settings( array $settings ): void {
		$kit_id = $this->kit->get_id();

		$this->kit->save( [ 'settings' => array_merge( $this->kit->get_settings(), $settings ) ] );

		$this->flush_documents_cache();
		$this->kit = Plugin::$instance->documents->get( $kit_id, false );
	}

	private function get_kit_css(): string {
		return ( new Post_CSS( $this->kit->get_id() ) )->get_content();
	}

	/**
	 * Returns the selectors of every rule whose declarations contain `$needle`, in order.
	 */
	private function get_selectors_of_rules_containing( string $needle ): array {
		preg_match_all( '/([^{}]+)\{([^{}]*)\}/', $this->get_kit_css(), $rules, PREG_SET_ORDER );

		$selectors = [];

		foreach ( $rules as [ , $selector_list, $declarations ] ) {
			if ( false === strpos( $declarations, $needle ) ) {
				continue;
			}

			// Split on commas outside of parentheses, so `:where(a, b)` stays intact.
			foreach ( preg_split( '/,(?![^(]*\))/', $selector_list ) as $selector ) {
				$selectors[] = trim( $selector );
			}
		}

		return $selectors;
	}

	private function get_expected_selectors( array $elements ): array {
		$wrapper = $this->get_wrapper();

		return array_map(
			fn( $element ) => "{$wrapper} {$element}" . Theme_Style_Buttons::ATOMIC_ELEMENTS_EXCLUSION,
			$elements
		);
	}

	private function get_hover_elements(): array {
		$hover_elements = [];

		foreach ( self::BUTTON_ELEMENTS as $element ) {
			$hover_elements[] = $element . ':hover';
			$hover_elements[] = $element . ':focus';
		}

		return $hover_elements;
	}

	private function get_wrapper(): string {
		return '.elementor-kit-' . $this->kit->get_id();
	}
}
