<?php

namespace Elementor\Testing\Modules\AtomicWidgets\DynamicTags;

use Elementor\Modules\AtomicWidgets\DynamicTags\Dynamic_Style_Policy;
use ElementorEditorTesting\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Test_Dynamic_Style_Policy extends Elementor_Test_Base {
	private Dynamic_Style_Policy $policy;

	public function setUp(): void {
		parent::setUp();
		$this->policy = new Dynamic_Style_Policy();
	}

	private function dynamic_node(): array {
		return [
			'$$type' => 'dynamic',
			'value' => [
				'name' => 'fake-tag',
				'settings' => [],
			],
		];
	}

	public function test_resolve_delivery_mode__static_when_no_dynamic_props() {
		$definitions = [
			'my-class' => [
				'id' => 'my-class',
				'type' => 'class',
				'variants' => [
					[
						'meta' => [],
						'props' => [ 'color' => 'red' ],
					],
				],
			],
		];

		$this->assertSame( Dynamic_Style_Policy::DELIVERY_STATIC, $this->policy->resolve_delivery_mode( $definitions ) );
	}

	public function test_resolve_delivery_mode__page_inline_when_dynamic_without_scoped_meta() {
		$definitions = [
			'my-class' => [
				'id' => 'my-class',
				'type' => 'class',
				'variants' => [
					[
						'meta' => [],
						'props' => [ 'background-image' => $this->dynamic_node() ],
					],
				],
			],
		];

		$this->assertSame( Dynamic_Style_Policy::DELIVERY_PAGE_INLINE, $this->policy->resolve_delivery_mode( $definitions ) );
	}

	public function test_resolve_delivery_mode__scoped_when_is_scoped_meta_set() {
		$definitions = [
			'my-class' => [
				'id' => 'my-class',
				'type' => 'class',
				'variants' => [
					[
						'meta' => [ 'is_scoped' => true ],
						'props' => [ 'z-index' => $this->dynamic_node() ],
					],
				],
			],
		];

		$this->assertSame( Dynamic_Style_Policy::DELIVERY_SCOPED, $this->policy->resolve_delivery_mode( $definitions ) );
	}

	public function test_requires_page_inline_delivery__false_when_only_scoped_dynamic() {
		$definitions = [
			'my-class' => [
				'id' => 'my-class',
				'type' => 'class',
				'variants' => [
					[
						'meta' => [ 'is_scoped' => true ],
						'props' => [ 'z-index' => $this->dynamic_node() ],
					],
				],
			],
		];

		$this->assertFalse( $this->policy->requires_page_inline_delivery( $definitions ) );
	}
}
