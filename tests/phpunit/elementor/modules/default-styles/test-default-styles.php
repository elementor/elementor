<?php

namespace Elementor\Testing\Modules\DefaultStyles;

use Elementor\Modules\DefaultStyles\Default_Style_Post;
use Elementor\Modules\DefaultStyles\Default_Style_Post_Type;
use Elementor\Modules\DefaultStyles\Default_Styles_Repository;
use Elementor\Modules\DefaultStyles\Default_Styles_Tag_Post_IDs;
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

	public function set_up() {
		parent::set_up();

		Default_Style_Post_Type::ensure_registered();

		$this->kit = Plugin::$instance->kits_manager->get_active_kit();
	}

	public function test_put_and_get_preview_style() {
		$repository = Default_Styles_Repository::make( $this->kit )->set_preview( true );

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
		$this->assertSame( 'tag', $item['type'] );
		$this->assertCount( 1, $item['variants'] );
	}

	public function test_publish_copies_preview_to_frontend() {
		$repository = Default_Styles_Repository::make( $this->kit )->set_preview( true );

		$repository->put( 'p', [
			'type' => 'class',
			'variants' => [
				[
					'props' => [ 'font-size' => '18px' ],
					'meta' => [ 'breakpoint' => null, 'state' => null ],
				],
			],
		] );

		$repository->publish_all();

		$frontend = Default_Styles_Repository::make( $this->kit )->set_preview( false )->get( 'p' );

		$this->assertNotNull( $frontend );
		$this->assertSame( '18px', $frontend['variants'][0]['props']['font-size'] );
	}

	public function test_is_allowed_tag_rejects_invalid_tag() {
		$this->assertTrue( Default_Styles_Repository::is_allowed_tag( 'h1' ) );
		$this->assertFalse( Default_Styles_Repository::is_allowed_tag( 'script' ) );
	}
}

class Test_Atomic_Default_Styles extends Elementor_Test_Base {
	private MockObject $mock_styles_manager;

	public function set_up() {
		parent::set_up();

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
				$this->isCallable()
			);

		do_action( 'elementor/atomic-widgets/styles/register', $this->mock_styles_manager, [] );
	}
}
