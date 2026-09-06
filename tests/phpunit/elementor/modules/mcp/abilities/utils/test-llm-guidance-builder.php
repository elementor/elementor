<?php

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

use Elementor\Modules\Mcp\Abilities\Utils\Llm_Guidance_Builder;
use PHPUnit\Framework\TestCase;

class Test_Llm_Guidance_Builder extends TestCase {

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
