<?php
namespace Elementor\Testing\Modules\AtomicWidgets\Elements;

use Elementor\Modules\AtomicWidgets\Elements\Base\Decorative_Prop;
use Elementor\Modules\AtomicWidgets\Elements\Div_Block\Div_Block;
use Elementor\Modules\AtomicWidgets\Elements\Flexbox\Flexbox;
use Elementor\Modules\AtomicWidgets\Elements\Grid\Grid;
use Elementor\Modules\AtomicWidgets\PropTypes\Primitives\Boolean_Prop_Type;
use ElementorEditorTesting\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Test_Decorative_Prop extends Elementor_Test_Base {

	public function container_classes_provider(): array {
		return [
			'div block' => [ Div_Block::class ],
			'flexbox' => [ Flexbox::class ],
			'grid' => [ Grid::class ],
		];
	}

	/**
	 * @dataProvider container_classes_provider
	 */
	public function test_get_props_schema__containers_expose_editor_only_decorative_prop( string $container_class ) {
		// Act.
		$schema = $container_class::get_props_schema();

		// Assert.
		$decorative = $schema[ Decorative_Prop::KEY ] ?? null;
		$this->assertInstanceOf( Boolean_Prop_Type::class, $decorative );
		$this->assertSame( [ '$$type' => 'boolean', 'value' => false ], $decorative->get_default() );
		$this->assertStringStartsWith( 'Editor only', $decorative->get_meta_item( 'description' ) );
	}
}
