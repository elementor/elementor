<?php

namespace Elementor\Tests\Phpunit\Modules\Mcp;

use Elementor\Modules\Mcp\Abilities\List_Global_Variables_Ability;
use Elementor\Modules\Variables\Services\Variables_Service;
use ElementorEditorTesting\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * @group Elementor\Modules\Mcp
 */
class Test_List_Global_Variables_Ability extends Elementor_Test_Base {

	public function test_execute__returns_403_for_subscriber() {
		// Arrange
		$user_id = $this->factory()->user->create( [ 'role' => 'subscriber' ] );
		wp_set_current_user( $user_id );
		$ability = new List_Global_Variables_Ability( $this->createMock( Variables_Service::class ) );

		// Act
		$result = $ability->execute( [] );

		// Assert
		$this->assertWPError( $result );
		$this->assertSame( 'rest_forbidden', $result->get_error_code() );
		$this->assertSame( \WP_Http::FORBIDDEN, $result->get_error_data()['status'] );
	}

	public function test_execute__per_page_is_clamped_to_maximum() {
		// Arrange
		$this->act_as_admin();
		$ability = new List_Global_Variables_Ability( $this->mock_service_with_variables( [] ) );

		// Act
		$result = $ability->execute( [ 'per_page' => 9999 ] );

		// Assert
		$this->assertSame( List_Global_Variables_Ability::MAX_PER_PAGE, $result['per_page'] );
	}

	public function test_execute__paginates_and_reports_total() {
		// Arrange
		$this->act_as_admin();
		$ability = new List_Global_Variables_Ability( $this->mock_service_with_variables( [
			'a' => [ 'type' => 'global-color-variable', 'label' => 'color-a', 'value' => '#111', 'order' => 1 ],
			'b' => [ 'type' => 'global-color-variable', 'label' => 'color-b', 'value' => '#222', 'order' => 2 ],
			'c' => [ 'type' => 'global-color-variable', 'label' => 'color-c', 'value' => '#333', 'order' => 3 ],
		] ) );

		// Act
		$first_page = $ability->execute( [ 'per_page' => 2, 'page' => 1 ] );
		$second_page = $ability->execute( [ 'per_page' => 2, 'page' => 2 ] );

		// Assert
		$this->assertSame( 3, $first_page['total'] );
		$this->assertCount( 2, $first_page['variables'] );
		$this->assertSame( 1, $first_page['page'] );
		$this->assertSame( 2, $second_page['page'] );
		$this->assertCount( 1, $second_page['variables'] );
		$this->assertSame( 'color-a', $first_page['variables'][0]['label'] );
		$this->assertSame( 'color-c', $second_page['variables'][0]['label'] );
	}

	public function test_execute__search_matches_label_substring() {
		// Arrange
		$this->act_as_admin();
		$ability = new List_Global_Variables_Ability( $this->mock_service_with_variables( [
			'a' => [ 'type' => 'global-color-variable', 'label' => 'brand-primary', 'value' => '#111', 'order' => 1 ],
			'b' => [ 'type' => 'global-font-variable', 'label' => 'font-heading', 'value' => 'Arial', 'order' => 2 ],
		] ) );

		// Act
		$result = $ability->execute( [ 'search' => 'Brand' ] );

		// Assert
		$this->assertSame( 1, $result['total'] );
		$this->assertSame( 'brand-primary', $result['variables'][0]['label'] );
		$this->assertSame( 'a', $result['variables'][0]['id'] );
	}

	public function test_execute__filters_by_type() {
		// Arrange
		$this->act_as_admin();
		$ability = new List_Global_Variables_Ability( $this->mock_service_with_variables( [
			'a' => [ 'type' => 'global-color-variable', 'label' => 'brand-primary', 'value' => '#111', 'order' => 1 ],
			'b' => [ 'type' => 'global-font-variable', 'label' => 'font-heading', 'value' => 'Arial', 'order' => 2 ],
		] ) );

		// Act
		$result = $ability->execute( [ 'type' => 'global-font-variable' ] );

		// Assert
		$this->assertSame( 1, $result['total'] );
		$this->assertSame( 'global-font-variable', $result['variables'][0]['type'] );
	}

	public function test_execute__includes_watermark() {
		// Arrange
		$this->act_as_admin();
		$ability = new List_Global_Variables_Ability( $this->mock_service_with_variables( [], 7 ) );

		// Act
		$result = $ability->execute( [] );

		// Assert
		$this->assertSame( 7, $result['watermark'] );
	}

	private function mock_service_with_variables( array $data, $watermark = null ): Variables_Service {
		$service = $this->createMock( Variables_Service::class );
		$service->method( 'load' )->willReturn( [
			'data' => $data,
			'watermark' => $watermark,
		] );

		return $service;
	}
}
