<?php

namespace Elementor\Testing\Modules\AtomicWidgets\DynamicTags;

use Elementor\Modules\AtomicWidgets\DynamicTags\Dynamic_Prop_Type;
use Elementor\Modules\AtomicWidgets\DynamicTags\Styles_Dynamic_Transformer;
use Elementor\Modules\AtomicWidgets\PropsResolver\Props_Resolver_Context;
use Elementor\Modules\AtomicWidgets\Styles\Dynamic_Styles_Manager;
use ElementorEditorTesting\Elementor_Test_Base;

class Test_Styles_Dynamic_Transformer extends Elementor_Test_Base {

	private Styles_Dynamic_Transformer $transformer;

	public function setUp(): void {
		parent::setUp();

		Dynamic_Styles_Manager::reset();
		$this->transformer = new Styles_Dynamic_Transformer();
	}

	public function tearDown(): void {
		Dynamic_Styles_Manager::reset();

		parent::tearDown();
	}

	public function test_transform__registers_css_var_and_returns_var_reference() {
		// Arrange.
		$dynamic_value = [
			'name' => 'post-title',
			'group' => 'post',
			'settings' => [],
		];

		// Act.
		$result = $this->transformer->transform(
			$dynamic_value,
			Props_Resolver_Context::make()
		);

		// Assert.
		$this->assertMatchesRegularExpression( '/^var\(--e-dyn-[a-f0-9]{12}\)$/', $result );
		$this->assertNotSame( '', Dynamic_Styles_Manager::instance()->serialize() );
	}

	public function test_transform__returns_null_for_invalid_value() {
		// Act.
		$result = $this->transformer->transform(
			null,
			Props_Resolver_Context::make()
		);

		// Assert.
		$this->assertNull( $result );
	}
}
