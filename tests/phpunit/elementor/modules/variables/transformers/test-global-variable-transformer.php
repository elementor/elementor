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

	public function test_transform__returns_var_reference_for_non_grid_property() {
		$this->set_up_variables( [
			'e-gv-1' => [ 'label' => 'spacing', 'value' => '10px' ],
		] );

		$this->assertSame( 'var(--spacing)', $this->transform( 'e-gv-1', 'gap' ) );
		$this->assertSame( 'var(--spacing)', $this->transform( 'e-gv-1', 'padding' ) );
		$this->assertSame( 'var(--spacing)', $this->transform( 'e-gv-1', 'color' ) );
	}

	public function test_transform__bakes_repeat_for_grid_template_columns_with_fr_value() {
		$this->set_up_variables( [
			'e-gv-2' => [ 'label' => '2-column', 'value' => '2fr' ],
		] );

		$this->assertSame( 'repeat(2, 1fr)', $this->transform( 'e-gv-2', 'grid-template-columns' ) );
	}

	public function test_transform__bakes_repeat_for_grid_template_columns_with_unitless_integer() {
		$this->set_up_variables( [
			'e-gv-3' => [ 'label' => 'cols', 'value' => '3' ],
		] );

		$this->assertSame( 'repeat(3, 1fr)', $this->transform( 'e-gv-3', 'grid-template-columns' ) );
	}

	public function test_transform__bakes_repeat_for_grid_template_rows() {
		$this->set_up_variables( [
			'e-gv-4' => [ 'label' => 'rows', 'value' => '5fr' ],
		] );

		$this->assertSame( 'repeat(5, 1fr)', $this->transform( 'e-gv-4', 'grid-template-rows' ) );
	}

	public function test_transform__falls_back_to_var_for_non_integer_fr_in_grid_track() {
		$this->set_up_variables( [
			'e-gv-5' => [ 'label' => 'decimal', 'value' => '1.5fr' ],
		] );

		$this->assertSame( 'var(--decimal)', $this->transform( 'e-gv-5', 'grid-template-columns' ) );
	}

	public function test_transform__falls_back_to_var_for_length_value_in_grid_track() {
		$this->set_up_variables( [
			'e-gv-6' => [ 'label' => 'px-value', 'value' => '10px' ],
		] );

		$this->assertSame( 'var(--px-value)', $this->transform( 'e-gv-6', 'grid-template-columns' ) );
	}

	public function test_transform__rejects_zero_count() {
		$this->set_up_variables( [
			'e-gv-7' => [ 'label' => 'zero', 'value' => '0fr' ],
		] );

		$this->assertSame( 'var(--zero)', $this->transform( 'e-gv-7', 'grid-template-columns' ) );
	}

	public function test_transform__rejects_multi_token_values() {
		$this->set_up_variables( [
			'e-gv-8' => [ 'label' => 'multi', 'value' => '1fr 2fr' ],
		] );

		$this->assertSame( 'var(--multi)', $this->transform( 'e-gv-8', 'grid-template-columns' ) );
	}

	public function test_transform__deleted_variable_still_bakes_repeat_for_grid_track() {
		$this->set_up_variables( [
			'e-gv-9' => [
				'label' => '2-column',
				'value' => '2fr',
				'deleted' => true,
				'deleted_at' => '2025-01-01 00:00:00',
			],
		] );

		$this->assertSame( 'repeat(2, 1fr)', $this->transform( 'e-gv-9', 'grid-template-columns' ) );
	}

	public function test_transform__deleted_variable_falls_back_to_uuid_var_for_non_matching_values() {
		$this->set_up_variables( [
			'e-gv-10' => [
				'label' => 'spacing',
				'value' => '10px',
				'deleted' => true,
				'deleted_at' => '2025-01-01 00:00:00',
			],
		] );

		$this->assertSame( 'var(--e-gv-10)', $this->transform( 'e-gv-10', 'gap' ) );
	}

	public function test_transform__returns_null_for_unknown_variable_id() {
		$this->set_up_variables( [] );

		$this->assertNull( $this->transform( 'missing', 'grid-template-columns' ) );
		$this->assertNull( $this->transform( 'missing', 'gap' ) );
	}

	public function test_transform__returns_null_when_label_is_empty_and_value_is_not_grid_match() {
		$this->set_up_variables( [
			'e-gv-11' => [ 'label' => '', 'value' => '10px' ],
		] );

		$this->assertNull( $this->transform( 'e-gv-11', 'gap' ) );
	}
}
