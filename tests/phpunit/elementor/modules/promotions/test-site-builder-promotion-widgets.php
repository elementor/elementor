<?php
namespace Elementor\Tests\Phpunit\Elementor\Modules\Promotions;

use Elementor\Modules\Promotions\Site_Builder_Promotion_Widgets;
use ElementorEditorTesting\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Test_Site_Builder_Promotion_Widgets extends Elementor_Test_Base {

	public function test_merge_with_api_widgets_includes_nested_carousel() {
		$merged = Site_Builder_Promotion_Widgets::merge_with_api_widgets( [
			[ 'name' => 'form', 'title' => 'Form' ],
		] );

		$names = array_column( $merged, 'name' );

		$this->assertContains( 'form', $names );
		$this->assertContains( 'nested-carousel', $names );
	}

	public function test_merge_with_api_widgets_does_not_duplicate_widgets() {
		$merged = Site_Builder_Promotion_Widgets::merge_with_api_widgets( [
			[ 'name' => 'nested-carousel', 'title' => 'Remote Carousel' ],
		] );

		$carousel_entries = array_values( array_filter(
			$merged,
			static fn( array $widget ): bool => 'nested-carousel' === $widget['name']
		) );

		$this->assertCount( 1, $carousel_entries );
		$this->assertSame( 'Remote Carousel', $carousel_entries[0]['title'] );
	}
}
