<?php

namespace Elementor\Testing\Modules\DefaultStyles;

use Elementor\Modules\DefaultStyles\Default_Style_Post_Type;
use Elementor\Modules\DefaultStyles\Default_Styles_Repository;
use Elementor\Modules\DefaultStyles\Atomic_Default_Styles;
use Elementor\Modules\AtomicWidgets\Styles\Atomic_Styles_Manager;
use Elementor\Plugin;
use ElementorEditorTesting\Elementor_Test_Base;
use PHPUnit\Framework\MockObject\MockObject;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Test_Default_Styles_Repository extends Elementor_Test_Base {
	private ?\Elementor\Core\Kits\Documents\Kit $kit = null;

	public function setUp(): void {
		parent::setUp();

		Default_Style_Post_Type::ensure_registered();

		$this->kit = Plugin::$instance->kits_manager->get_active_kit();
	}

	public function test_put_and_get_style() {
		$repository = Default_Styles_Repository::make( $this->kit );

		$repository->put( 'h1', [
			'type' => 'class',
			'variants' => [
				[
					'props' => [ 'color' => 'red' ],
					'meta' => [ 'breakpoint' => null, 'state' => null ],
				],
			],
		] );

		$item = $repository->get( 'h1' );

		$this->assertNotNull( $item );
		$this->assertSame( 'h1', $item['id'] );
		$this->assertSame( 'class', $item['type'] );
		$this->assertCount( 1, $item['variants'] );
	}

	public function test_is_allowed_tag_rejects_invalid_tag() {
		$this->assertTrue( Default_Styles_Repository::is_allowed_tag( 'h1' ) );
		$this->assertFalse( Default_Styles_Repository::is_allowed_tag( 'script' ) );
	}
}

class Test_Default_Styles_Rendering extends Elementor_Test_Base {
	private ?\Elementor\Core\Kits\Documents\Kit $kit = null;

	public function setUp(): void {
		parent::setUp();

		Default_Style_Post_Type::ensure_registered();

		$this->kit = Plugin::$instance->kits_manager->get_active_kit();
	}

	public function test_default_styles_use_prefixed_css_class_in_selector() {
		$repository = Default_Styles_Repository::make( $this->kit );

		$repository->put( 'h2', [
			'type' => 'class',
			'variants' => [
				[
					'props' => [
						'color' => [
							'$$type' => 'color',
							'value' => 'red',
						],
					],
					'meta' => [ 'breakpoint' => 'desktop', 'state' => null ],
				],
			],
		] );

		$item = $repository->get( 'h2' );

		$this->assertSame( 'e-default-h2', $item['cssName'] );

		$css = \Elementor\Modules\AtomicWidgets\Styles\Styles_Renderer::make(
			Plugin::$instance->breakpoints->get_breakpoints_config()
		)->render( [ $item ] );

		$this->assertStringContainsString( '.elementor .e-default-h2', $css );
		$this->assertStringNotContainsString( '.elementor .h2', $css );
	}
}

class Test_Atomic_Default_Styles extends Elementor_Test_Base {
	private MockObject $mock_styles_manager;

	public function setUp(): void {
		parent::setUp();

		$this->mock_styles_manager = $this->createMock( Atomic_Styles_Manager::class );
		remove_all_actions( 'elementor/atomic-widgets/styles/register' );
	}

	public function test_register_styles__uses_default_path_without_post_id() {
		( new Atomic_Default_Styles() )->register_hooks();

		$this->mock_styles_manager
			->expects( $this->once() )
			->method( 'register' )
			->with(
				[ Atomic_Default_Styles::STYLES_KEY ],
				$this->isType( 'callable' )
			);

		do_action( 'elementor/atomic-widgets/styles/register', $this->mock_styles_manager, [] );
	}
}
