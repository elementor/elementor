<?php

namespace Elementor\Testing\Modules\CompositeWidgets\Site;

use Elementor\Modules\CompositeWidgets\Site\Site_Widgets_Access_Controller;
use ElementorEditorTesting\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

require_once __DIR__ . '/../../components/mocks/mock-pro-license-api.php';

class Test_Site_Widgets_Access_Controller extends Elementor_Test_Base {
	public function tearDown(): void {
		\Mock_Pro_License_API::reset();

		parent::tearDown();
	}

	/**
	 * @dataProvider tiers_provider
	 */
	public function test_access__follows_the_license_tier( bool $is_active, bool $is_expired, array $expected ) {
		// Arrange.
		\Mock_Pro_License_API::set_license_state( $is_active, $is_expired );

		// Act.
		$access = [
			'add_to_page' => Site_Widgets_Access_Controller::can_add_to_page(),
			'display' => Site_Widgets_Access_Controller::can_display(),
		];

		// Assert.
		$this->assertSame( $expected, $access );
	}

	public function tiers_provider(): array {
		return [
			'active license' => [ true, false, [
				'add_to_page' => true,
				'display' => true,
			] ],
			'expired license' => [ false, true, [
				'add_to_page' => false,
				'display' => true,
			] ],
			'no license' => [ false, false, [
				'add_to_page' => false,
				'display' => false,
			] ],
		];
	}
}
