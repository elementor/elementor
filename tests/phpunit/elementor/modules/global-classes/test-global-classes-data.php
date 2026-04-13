<?php

namespace Elementor\Testing\Modules\GlobalClasses;

use Elementor\Modules\GlobalClasses\Global_Classes_Data;
use ElementorEditorTesting\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Test_Global_Classes_Data extends Elementor_Test_Base {

	public function test_sync_order_with_items__removes_orphans_and_appends_missing() {
		$items = [
			'a' => [ 'id' => 'a' ],
			'b' => [ 'id' => 'b' ],
			'c' => [ 'id' => 'c' ],
		];
		$order = [ 'c', 'ghost', 'c', 'a' ];

		$result = Global_Classes_Data::sanitize_order( $items, $order );

		$this->assertSame( [ 'c', 'a', 'b' ], $result['order'] );
		$this->assertSame( $items, $result['items'] );
	}

	public function test_sync_order_with_items__fast_path_unchanged() {
		$items = [
			'x' => [ 'id' => 'x' ],
		];
		$order = [ 'x' ];

		$result = Global_Classes_Data::sanitize_order( $items, $order );

		$this->assertSame( [ 'x' ], $result['order'] );
		$this->assertSame( $items, $result['items'] );
	}

	public function test_sync_order_with_items__empty_items() {
		$result = Global_Classes_Data::sanitize_order( [], [ 'a', 'b' ] );

		$this->assertSame( [], $result['order'] );
		$this->assertSame( [], $result['items'] );
	}
}
