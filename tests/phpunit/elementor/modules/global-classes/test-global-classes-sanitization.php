<?php

namespace Elementor\Testing\Modules\GlobalClasses;

use Elementor\Modules\GlobalClasses\Utils\Global_Classes_Sanitization;
use ElementorEditorTesting\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Test_Global_Classes_Sanitization extends Elementor_Test_Base {

	public function test_sync_order_with_items__removes_orphans_and_appends_missing() {
		$items = [
			'a' => [ 'id' => 'a' ],
			'b' => [ 'id' => 'b' ],
			'c' => [ 'id' => 'c' ],
		];
		$order = [ 'c', 'ghost', 'c', 'a' ];

		$order = Global_Classes_Sanitization::order( $items, $order );

		$this->assertSame( [ 'c', 'a', 'b' ], $order );
	}

	public function test_order__empty_items() {
		$order = Global_Classes_Sanitization::order( [], [ 'a', 'b' ] );

		$this->assertSame( [], $order );
	}
}
