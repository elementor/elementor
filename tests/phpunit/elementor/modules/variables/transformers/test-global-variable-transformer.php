<?php

namespace Elementor\Modules\Variables\Transformers;

use Elementor\Modules\AtomicWidgets\PropsResolver\Props_Resolver_Context;
use Elementor\Modules\Variables\Classes\Variables;
use Elementor\Modules\Variables\PropTypes\Size_Variable_Prop_Type;
use Elementor\Modules\Variables\Services\Variables_Service;
use \PHPUnit\Framework\TestCase;

/**
 * @group Elementor\Modules
 * @group Elementor\Modules\Variables
 * @group Elementor\Modules\Variables\Transformers
 */
class Test_Global_Variable_Transformer extends TestCase {
	private function set_up_variables( array $variables ): void {
		$service = $this->createMock( Variables_Service::class );
		$service->method( 'get_variables_list' )->willReturn( $variables );
		Variables::init( $service );
	}

	private function context( string $css_property ): Props_Resolver_Context {
		return Props_Resolver_Context::make()
			->set_key( $css_property )
			->set_prop_type( Size_Variable_Prop_Type::make() );
	}

	private function transform( string $variable_id, string $css_property ): ?string {
		return ( new Global_Variable_Transformer() )->transform(
			$variable_id,
			$this->context( $css_property )
		);
	}

	public function test_transform__bakes_repeat_for_grid_template_columns() {
		$this->set_up_variables( [
			'e-gv-cols' => [ 'label' => '2-column', 'value' => '2fr' ],
		] );

		$this->assertSame( 'repeat(2, 1fr)', $this->transform( 'e-gv-cols', 'grid-template-columns' ) );
	}

	public function test_transform__bakes_repeat_for_grid_template_rows() {
		$this->set_up_variables( [
			'e-gv-rows' => [ 'label' => '3-row', 'value' => '3fr' ],
		] );

		$this->assertSame( 'repeat(3, 1fr)', $this->transform( 'e-gv-rows', 'grid-template-rows' ) );
	}
}
