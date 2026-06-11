<?php

namespace Elementor\Testing\Modules\AtomicWidgets\CssConverter\Expanders;

use Elementor\Modules\AtomicWidgets\CssConverter\Expanders\Physical_To_Logical_Expander;
use Elementor\Modules\AtomicWidgets\CssConverter\Variable_Prop_Value_Transformer;
use Elementor\Modules\AtomicWidgets\PropTypes\Size_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Union_Prop_Type;
use Elementor\Modules\Variables\PropTypes\Size_Variable_Prop_Type;
use Elementor\Modules\Variables\Services\Variables_Service;
use PHPUnit\Framework\TestCase;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Test_Physical_To_Logical_Expander extends TestCase {

	public function test_expand__rewrites_top_to_inset_block_start() {
		$rules = ( new Physical_To_Logical_Expander() )->expand( [
			'property' => 'top',
			'value' => 'var(--spacing-md)',
		] );

		$this->assertSame(
			[
				[
					'property' => 'inset-block-start',
					'value' => 'var(--spacing-md)',
					'declaration' => 'inset-block-start: var(--spacing-md)',
				],
			],
			$rules
		);
	}

	public function test_transform__promotes_logical_inset_size_var_reference() {
		$service = $this->createMock( Variables_Service::class );
		$service->method( 'find_by_label_or_id' )->with( 'spacing-md' )->willReturn( [
			'id' => 'e-gv-2',
			'type' => Size_Variable_Prop_Type::get_key(),
			'label' => 'spacing-md',
			'value' => '16px',
		] );

		$transformer = new Variable_Prop_Value_Transformer( $service );
		$schema = [
			'inset-block-start' => Union_Prop_Type::create_from( Size_Prop_Type::make() )
				->add_prop_type( Size_Variable_Prop_Type::make() ),
		];

		$result = $transformer->transform(
			[
				'inset-block-start' => [
					'$$type' => 'size',
					'value' => [
						'size' => 'var(--spacing-md)',
						'unit' => 'custom',
					],
				],
			],
			$schema
		);

		$this->assertSame(
			[
				'$$type' => Size_Variable_Prop_Type::get_key(),
				'value' => 'e-gv-2',
			],
			$result['inset-block-start']
		);
	}

}
