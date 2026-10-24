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

	public function test_transform__bakes_repeat_for_unitless_and_decimal_counts() {
		$this->set_up_variables( [
			'e-gv-unitless' => [ 'label' => 'cols', 'value' => ' 4 ' ],
			'e-gv-decimal' => [ 'label' => 'cols-decimal', 'value' => '2.5fr' ],
		] );

		$this->assertSame( 'repeat(4, 1fr)', $this->transform( 'e-gv-unitless', 'grid-template-columns' ) );
		$this->assertSame( 'repeat(2, 1fr)', $this->transform( 'e-gv-decimal', 'grid-template-columns' ) );
	}

	public function test_transform__returns_null_for_zero_count() {
		$this->set_up_variables( [
			'e-gv-zero' => [ 'label' => 'zero', 'value' => '0fr' ],
		] );

		$this->assertNull( $this->transform( 'e-gv-zero', 'grid-template-columns' ) );
	}

	public function test_transform__uses_css_variable_for_grid_track_list() {
		$this->set_up_variables( [
			'e-gv-ratio' => [ 'label' => 'my-grid-1-2', 'value' => 'minmax(0, 1fr) minmax(0, 2fr)' ],
			'e-gv-auto' => [ 'label' => 'auto-grid', 'value' => 'repeat(auto-fit, minmax(250px, 1fr))' ],
			'e-gv-list' => [ 'label' => 'two-tracks', 'value' => '1fr 2fr' ],
		] );

		$this->assertSame( 'var(--my-grid-1-2)', $this->transform( 'e-gv-ratio', 'grid-template-columns' ) );
		$this->assertSame( 'var(--auto-grid)', $this->transform( 'e-gv-auto', 'grid-template-rows' ) );
		$this->assertSame( 'var(--two-tracks)', $this->transform( 'e-gv-list', 'grid-template-columns' ) );
	}

	public function test_transform__uses_id_for_deleted_grid_track_list() {
		$this->set_up_variables( [
			'e-gv-deleted' => [ 'label' => 'old-grid', 'value' => '1fr 2fr', 'deleted' => true ],
		] );

		$this->assertSame( 'var(--e-gv-deleted)', $this->transform( 'e-gv-deleted', 'grid-template-columns' ) );
	}

	public function test_transform__uses_css_variable_for_non_grid_property() {
		$this->set_up_variables( [
			'e-gv-gap' => [ 'label' => 'spacing', 'value' => '3fr' ],
		] );

		$this->assertSame( 'var(--spacing)', $this->transform( 'e-gv-gap', 'gap' ) );
	}
}
