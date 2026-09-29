<?php

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

use Elementor\Modules\Mcp\Abilities\Utils\Atomic_Shell_Styles;
use Elementor\Modules\Mcp\Abilities\Utils\Llm_Guidance_Builder;
use PHPUnit\Framework\TestCase;

class Test_Llm_Guidance_Builder extends TestCase {

	public function setUp(): void {
		parent::setUp();
		Atomic_Shell_Styles::set_instance( new Atomic_Shell_Styles( [], [] ) );
	}

	public function tearDown(): void {
		Atomic_Shell_Styles::set_instance( null );
		parent::tearDown();
	}

	public function test_build__omits_allowed_parents_for_panel_visible_widgets() {
		$config = [
			'show_in_panel' => true,
			'meta' => [ 'is_container' => false ],
		];
		$parents_index = [
			'e-paragraph' => [ 'e-form-success-message', 'e-form-error-message' ],
		];

		$guidance = Llm_Guidance_Builder::build( $config, 'e-paragraph', $parents_index );

		$this->assertArrayNotHasKey( 'nesting', $guidance );
	}

	public function test_build__includes_allowed_parents_for_panel_hidden_structural_children() {
		$config = [
			'show_in_panel' => false,
			'meta' => [ 'is_container' => false ],
		];
		$parents_index = [
			'e-list-item' => [ 'e-list' ],
		];

		$guidance = Llm_Guidance_Builder::build( $config, 'e-list-item', $parents_index );

		$this->assertSame( [ 'e-list' ], $guidance['nesting']['allowed_parents'] );
	}

	public function test_build__container_default_styles_include_e_con_shell_width() {
		$config = [
			'elType' => 'e-flexbox',
			'atomic' => true,
			'show_in_panel' => true,
			'meta' => [ 'is_container' => true ],
		];

		$guidance = Llm_Guidance_Builder::build( $config, 'e-flexbox', [] );

		$this->assertSame( '100%', $guidance['default_styles']['width'] );
	}

	public function test_build__structural_atomic_element_default_styles_include_e_con_shell_width() {
		$config = [
			'elType' => 'e-tab',
			'atomic' => true,
			'show_in_panel' => false,
			'meta' => [ 'is_container' => false ],
		];

		$guidance = Llm_Guidance_Builder::build( $config, 'e-tab', [] );

		$this->assertSame( '100%', $guidance['default_styles']['width'] );
	}

	public function test_build__atomic_widget_default_styles_exclude_e_con_shell_width() {
		$config = [
			'elType' => 'widget',
			'atomic' => true,
			'show_in_panel' => true,
			'meta' => [ 'is_container' => false ],
		];

		$guidance = Llm_Guidance_Builder::build( $config, 'e-heading', [] );

		$this->assertArrayNotHasKey( 'default_styles', $guidance );
	}

	public function test_build__includes_allowed_child_types_for_containers() {
		$config = [
			'show_in_panel' => true,
			'meta' => [ 'is_container' => true ],
			'allowed_child_types' => [ 'e-list-item' ],
		];

		$guidance = Llm_Guidance_Builder::build( $config, 'e-list', [] );

		$this->assertTrue( $guidance['can_have_children'] );
		$this->assertSame( [ 'e-list-item' ], $guidance['nesting']['allowed_child_types'] );
		$this->assertArrayNotHasKey( 'allowed_parents', $guidance['nesting'] );
	}
}
