<?php

namespace Elementor\Tests\Phpunit\Elementor\Core\Utils;

use Elementor\Core\Utils\Template_Library_Element_Iterator;
use Elementor\Core\Utils\Template_Library_Import_Export_Utils;
use ElementorEditorTesting\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Test_Template_Library_Utils extends Elementor_Test_Base {

	public function test_filter_items_by_ids_returns_matching_items() {
		$items = [
			'a' => [ 'id' => 'a' ],
			'b' => [ 'id' => 'b' ],
		];

		$result = Template_Library_Import_Export_Utils::filter_items_by_ids( $items, [ 'b', 'missing' ] );

		$this->assertSame( [ 'b' => [ 'id' => 'b' ] ], $result );
	}

	public function test_build_filtered_order_appends_missing_ids() {
		$order = [ 'b' ];
		$items = [
			'a' => [ 'id' => 'a' ],
			'b' => [ 'id' => 'b' ],
		];

		$result = Template_Library_Import_Export_Utils::build_filtered_order( $order, $items );

		$this->assertSame( [ 'b', 'a' ], $result );
	}

	public function test_iterate_applies_callback() {
		$elements = [
			[
				'id' => 'el-1',
				'elType' => 'widget',
				'settings' => [],
				'elements' => [],
			],
		];

		$result = Template_Library_Element_Iterator::iterate(
			$elements,
			function ( $element_data ) {
				$element_data['settings']['flag'] = 'ok';
				return $element_data;
			}
		);

		$this->assertSame( 'ok', $result[0]['settings']['flag'] );
	}
}
