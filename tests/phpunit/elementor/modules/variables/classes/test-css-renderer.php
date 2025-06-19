<?php

namespace Elementor\Modules\Variables\Classes;

use Elementor\Modules\Variables\PropTypes\Color_Variable_Prop_Type;
use Elementor\Modules\Variables\PropTypes\Font_Variable_Prop_Type;
use Elementor\Modules\Variables\Storage\Repository as Variables_Repository;
use PHPUnit\Framework\TestCase;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

/**
 * @gorup Elementor\Modules
 * @group Elementor\Modules\Variables
 */
class Test_CSS_Renderer extends TestCase {
	private $repository;

	public function setUp(): void {
		parent::setUp();

		$this->repository = $this->createMock( Variables_Repository::class );
	}

	private function css_renderer() {
		return new CSS_Renderer(
			$this->repository
		);
	}

	public function test_empty_list_of_variables__generates_empty_css_entry() {
		// Arrange.
		$this->repository->method( 'variables' )
			->willReturn( [] );

		// Act.
		$raw_css = $this->css_renderer()->raw_css();

		// Assert.
		$this->assertEquals('', $raw_css );
	}

	public function test_list_of_font_variables__generates_entries_for_root_pseudo_element() {
		// Arrange.
		$this->repository->method( 'variables' )
			->willReturn( [
				'gf-045' => [
					'label' => 'Main: Montserrat',
					'value' => 'Montserrat',
					'type' => Font_Variable_Prop_Type::get_key(),
				],
				'gr-roboto' => [
					'label' => 'Global Roboto',
					'value' => 'Roboto',
					'type' => Font_Variable_Prop_Type::get_key(),
				],
			] );

		// Act.
		$raw_css = $this->css_renderer()->raw_css();

		// Assert.
		$this->assertEquals(':root { --gf-045:Montserrat; --gr-roboto:Roboto; }', $raw_css );
	}

	public function test_list_of_variables__generates_entries_for_root_pseudo_element() {
		// Arrange.
		$this->repository->method( 'variables' )
			->willReturn( [
				'a-01' => [
					'label' => 'Black',
					'value' => '#000',
					'type' => Color_Variable_Prop_Type::get_key(),
				],
				'a-02' => [
					'label' => 'Border Width',
					'value' => '6px',
					'type' => Color_Variable_Prop_Type::get_key(),
				],
			] );

		// Act.
		$raw_css = $this->css_renderer()->raw_css();

		// Assert.
		$this->assertEquals(':root { --a-01:#000; --a-02:6px; }', $raw_css );
	}

	public function test_list_of_variables__will_sanitize_the_input() {
		// Arrange,
		$this->repository->method( 'variables' )
			->willReturn( [
				'a-01' => [
					'label' => 'a-width',
					'value' => '<script type="text/javascript">alert("here");</script>',
					'type' => Color_Variable_Prop_Type::get_key(),
				],
				'<script>alert("there")</script>' => [
					'label' => 'a-height',
					'value' => '2rem',
					'type' => Color_Variable_Prop_Type::get_key(),
				],
				'a-01' => [
					'label' => 'Font 1',
					'value' => '<style>color: red;</style>',
					'type' => Font_Variable_Prop_Type::get_key(),
				],
				'<script>alert("font here")</script>' => [
					'label' => 'Font 3',
					'value' => '2rem',
					'type' => Font_Variable_Prop_Type::get_key(),
				],
			] );

		// Act.
		$raw_css = $this->css_renderer()->raw_css();

		// Assert.
		$this->assertEquals('', $raw_css );
	}
}
