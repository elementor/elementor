<?php

namespace Elementor\Testing\Modules\CompositeWidgets\Site;

use Elementor\Modules\CompositeWidgets\Site\Site_Widget_Instances;
use PHPUnit\Framework\TestCase;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Test_Site_Widget_Instances extends TestCase {
	public function test_remove__drops_site_widget_copies_at_any_depth() {
		// Arrange.
		$elements = [
			[
				'id' => 'section',
				'elType' => 'e-flexbox',
				'elements' => [
					$this->widget_root( 'nested-site', 'site/promo-card' ),
					[
						'id' => 'heading',
						'elType' => 'widget',
						'widgetType' => 'e-heading',
					],
				],
			],
			$this->widget_root( 'top-site', 'site/badge' ),
		];

		// Act.
		$result = Site_Widget_Instances::remove( $elements );

		// Assert.
		$this->assertCount( 1, $result );
		$this->assertSame( [ 'heading' ], array_column( $result[0]['elements'], 'id' ) );
	}

	public function test_remove__keeps_code_widget_copies() {
		// Arrange.
		$elements = [ $this->widget_root( 'code', 'elementor/icon-button' ) ];

		// Act.
		$result = Site_Widget_Instances::remove( $elements );

		// Assert.
		$this->assertSame( $elements, $result );
	}

	private function widget_root( string $id, string $widget_id ): array {
		return [
			'id' => $id,
			'elType' => 'e-flexbox',
			'part' => 'root',
			'widget' => [
				'id' => $widget_id,
				'version' => 1,
			],
			'elements' => [],
		];
	}
}
