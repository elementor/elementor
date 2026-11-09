<?php

namespace Elementor\Tests\Phpunit\Elementor\Modules\GuidedTours;

use Elementor\Includes\EditorAssetsAPI;
use Elementor\Modules\GuidedTours\Tours_Repository;
use ElementorEditorTesting\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Test_Tours_Repository extends Elementor_Test_Base {
	private array $requests = [];
	private array $responses = [];

	public function setUp(): void {
		parent::setUp();

		$this->responses = [
			Tours_Repository::INDEX_URL => [
				'version' => 1,
				'tours' => [
					'admin-navigation' => [
						'file' => 'tours/admin-navigation.json',
						'is_active' => true,
					],
				],
			],
			EditorAssetsAPI::PRODUCTION_URL . '/tours/admin-navigation.json' => $this->get_tour(),
		];

		add_filter( 'pre_http_request', [ $this, 'mock_http_request' ], 10, 3 );
		add_filter( 'elementor/guided-tours/use_local_assets', '__return_false' );
	}

	public function tearDown(): void {
		remove_filter( 'elementor/guided-tours/use_local_assets', '__return_false' );
		remove_filter( 'pre_http_request', [ $this, 'mock_http_request' ], 10 );

		parent::tearDown();
	}

	public function mock_http_request( $preempt, $args, $url ) {
		$this->requests[] = $url;

		if ( ! isset( $this->responses[ $url ] ) ) {
			return new \WP_Error( 'not_found', 'No response configured.' );
		}

		return [
			'body' => wp_json_encode( $this->responses[ $url ] ),
			'response' => [ 'code' => \WP_Http::OK ],
		];
	}

	public function test_get_eligible_tour__returns_tour_without_caching(): void {
		// Arrange
		$repository = new Tours_Repository();

		// Act
		$first_result = $repository->get_eligible_tour( 'dashboard', [ 'administrator' ] );
		$second_result = $repository->get_eligible_tour( 'dashboard', [ 'administrator' ] );

		// Assert
		$this->assertSame( 'admin-navigation', $first_result['id'] );
		$this->assertSame( $first_result, $second_result );
		$this->assertCount( 4, $this->requests );
	}

	public function test_get_eligible_tour__returns_empty_when_index_is_inactive(): void {
		// Arrange
		$this->responses[ Tours_Repository::INDEX_URL ]['tours']['admin-navigation']['is_active'] = false;

		// Act
		$result = ( new Tours_Repository() )->get_eligible_tour( 'dashboard', [ 'administrator' ] );

		// Assert
		$this->assertSame( [], $result );
		$this->assertCount( 1, $this->requests );
	}

	public function test_get_eligible_tour__does_not_treat_string_false_as_active(): void {
		// Arrange
		$this->responses[ Tours_Repository::INDEX_URL ]['tours']['admin-navigation']['is_active'] = 'false';

		// Act
		$result = ( new Tours_Repository() )->get_eligible_tour( 'dashboard', [ 'administrator' ] );

		// Assert
		$this->assertSame( [], $result );
	}

	public function test_get_eligible_tour__returns_empty_when_flow_is_inactive(): void {
		// Arrange
		$this->responses[ EditorAssetsAPI::PRODUCTION_URL . '/tours/admin-navigation.json' ]['is_active'] = false;

		// Act
		$result = ( new Tours_Repository() )->get_eligible_tour( 'dashboard', [ 'administrator' ] );

		// Assert
		$this->assertSame( [], $result );
	}

	/**
	 * @dataProvider ineligible_context_provider
	 */
	public function test_get_eligible_tour__returns_empty_for_ineligible_context( string $screen, array $roles ): void {
		// Arrange
		$repository = new Tours_Repository();

		// Act
		$result = $repository->get_eligible_tour( $screen, $roles );

		// Assert
		$this->assertSame( [], $result );
	}

	public function ineligible_context_provider(): array {
		return [
			'wrong screen' => [ 'plugins', [ 'administrator' ] ],
			'wrong role' => [ 'dashboard', [ 'editor' ] ],
		];
	}

	private function get_tour(): array {
		return [
			'id' => 'admin-navigation',
			'version' => 1,
			'is_active' => true,
			'screens' => [ 'dashboard' ],
			'roles' => [ 'administrator' ],
			'steps' => [
				[
					'id' => 'dashboard',
					'selector' => '#menu-dashboard',
					'title' => 'Dashboard',
					'description' => 'Start here.',
					'side' => 'right',
				],
			],
		];
	}
}
