<?php

namespace Elementor\Testing\Modules\CompositeWidgets\Site;

use Elementor\Modules\CompositeWidgets\Site\Site_Widget_Instances;
use PHPUnit\Framework\TestCase;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Test_Site_Widget_Instances extends TestCase {
	/**
	 * @dataProvider roots_provider
	 */
	public function test_is_site_widget_root__matches_only_the_site_namespace( array $element_data, bool $expected ) {
		// Act.
		$result = Site_Widget_Instances::is_site_widget_root( $element_data );

		// Assert.
		$this->assertSame( $expected, $result );
	}

	public function roots_provider(): array {
		return [
			'a site widget root' => [ $this->widget_root( 'site/promo-card' ), true ],
			'a code widget root' => [ $this->widget_root( 'elementor/icon-button' ), false ],
			'a namespace that only starts with site' => [ $this->widget_root( 'sitebuilder/card' ), false ],
			'an element without a marker' => [ [ 'elType' => 'e-flexbox' ], false ],
		];
	}

	private function widget_root( string $widget_id ): array {
		return [
			'elType' => 'e-flexbox',
			'part' => 'root',
			'widget' => [
				'id' => $widget_id,
				'version' => 1,
			],
		];
	}
}
