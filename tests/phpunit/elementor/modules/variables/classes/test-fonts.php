<?php

namespace Elementor\Modules\Variables\Classes;

use Elementor\Plugin;
use Elementor\Core\Files\CSS\Post as Post_CSS;
use ElementorEditorTesting\Elementor_Test_Base;
use Elementor\Modules\Variables\Storage\Repository as Variables_Repository;

/**
 * @group Elementor\Modules
 * @group Elementor\Modules\Variables
 */
class Test_Fonts extends Elementor_Test_Base {
	private $repository;
	private $post_css;

	public function setUp(): void {
		parent::setUp();

		$this->repository = $this->createMock( Variables_Repository::class );

		$this->post_css = $this->createMock( Post_CSS::class );
	}

	public function test_append_to__will_skip_regular_post_css() {
		// Arrange.
		$this->repository->method( 'variables' )->willReturn( [
			'e-gv-a01' => [
				'type' => 'global-font-variable',
				'label' => 'primary-font',
				'value' => 'Roboto',
			],
		] );

		$this->post_css->method( 'get_post_id' )->willReturnCallback( function () {
			return -50;
		} );

		$this->post_css->expects( $this->never() )
			->method( 'add_font' );

		// Act.
		( new Fonts( $this->repository ) )->append_to( $this->post_css );
	}

	public function test_append_to__will_add_font_variable_to_the_active_kit() {
		// Arrange.
		$this->repository->method( 'variables' )->willReturn( [
			'e-gv-a01' => [
				'type' => 'global-font-variable',
				'label' => 'primary-font',
				'value' => 'Roboto',
			],
		] );

		$this->post_css->method( 'get_post_id' )->willReturnCallback( function () {
			return Plugin::$instance->kits_manager->get_active_id();
		} );

		$this->post_css->expects( $this->once() )
			->method( 'add_font' )
			->with( 'Roboto' );

		// Act.
		( new Fonts( $this->repository ) )->append_to( $this->post_css );
	}
}