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
					'label' => 'primary-font',
					'value' => 'Montserrat',
					'type' => Font_Variable_Prop_Type::get_key(),
				],
				'gr-roboto' => [
					'label' => 'secondary-font',
					'value' => 'Roboto',
					'type' => Font_Variable_Prop_Type::get_key(),
				],
			] );

		// Act.
		$raw_css = $this->css_renderer()->raw_css();

		// Assert.
		$this->assertEquals(':root { --primary-font:Montserrat; --secondary-font:Roboto; }', $raw_css );
	}

	public function test_list_of_variables__generates_entries_for_root_pseudo_element() {
		// Arrange.
		$this->repository->method( 'variables' )
			->willReturn( [
				'a-01' => [
					'label' => 'color-black',
					'value' => '#000',
					'type' => Color_Variable_Prop_Type::get_key(),
				],
				'a-02' => [
					'label' => 'color-white',
					'value' => '#fff',
					'type' => Color_Variable_Prop_Type::get_key(),
				],
			] );

		// Act.
		$raw_css = $this->css_renderer()->raw_css();

		// Assert.
		$this->assertEquals(':root { --color-black:#000; --color-white:#fff; }', $raw_css );
	}

	public function list_of_variables_with_deleted_entries__will_print_ids_instead_of_labels() {
		// Arrange.
		$this->repository->method( 'variables' )
			->willReturn( [
				'a-01' => [
					'label' => 'color-black',
					'value' => '#000',
					'type' => Color_Variable_Prop_Type::get_key(),
				],
				'a-02' => [
					'label' => 'color-black',
					'value' => '#000',
					'type' => Color_Variable_Prop_Type::get_key(),
					'deleted' => true,
					'deleted_at' => '2025-01-01 00:00:00',
				],
			] );

		// Act.
		$raw_css = $this->css_renderer()->raw_css();

		// Assert.
		$this->assertEquals(':root { --color-black:#000; --a-02:#000; }', $raw_css );
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
					'deleted' => true,
					'deleted_at' => '2025-01-01 00:00:00',
				],
				'a-02' => [
					'label' => 'Font 1',
					'value' => '<style>color: red;</style>',
					'type' => Font_Variable_Prop_Type::get_key(),
				],
				'a-03' => [
					'label' => '<script>alert("font 3")</script>',
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
