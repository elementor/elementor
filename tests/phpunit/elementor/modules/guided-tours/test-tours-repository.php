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
	}

	public function tearDown(): void {
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

	public function test_get_eligible_tour__caches_cdn_responses(): void {
		// Arrange
		$repository = new Tours_Repository();

		// Act
		$first_result = $repository->get_eligible_tour( 'dashboard', [ 'administrator' ] );
		$second_result = $repository->get_eligible_tour( 'dashboard', [ 'administrator' ] );

		// Assert
		$this->assertSame( 'admin-navigation', $first_result['id'] );
		$this->assertSame( $first_result, $second_result );
		$this->assertCount( 2, $this->requests );
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

	/**
	 * @dataProvider provide_next_urls
	 */
	public function test_get_eligible_tour__normalizes_next_url( string $next_url, ?string $expected ): void {
		// Arrange
		$tour = $this->get_tour();
		$tour['steps'][0]['next_url'] = $next_url;
		$this->responses[ EditorAssetsAPI::PRODUCTION_URL . '/tours/admin-navigation.json' ] = $tour;

		// Act
		$result = ( new Tours_Repository() )->get_eligible_tour( 'dashboard', [ 'administrator' ] );

		// Assert
		$this->assertSame( $expected, $result['steps'][0]['next_url'] ?? null );
	}

	public function provide_next_urls(): array {
		return [
			'admin script' => [ 'options-general.php', 'options-general.php' ],
			'admin script with query' => [ 'admin.php?page=elementor-templates', 'admin.php?page=elementor-templates' ],
			'parent directory' => [ '..', null ],
			'current directory' => [ '.', null ],
			'absolute url' => [ 'https://example.com/wp-admin/index.php', null ],
		];
	}

	public function test_get_eligible_tour__keeps_valid_step_url_and_drops_invalid_one(): void {
		// Arrange
		$tour = $this->get_tour();
		$tour['steps'][] = array_merge( $tour['steps'][0], [ 'id' => 'second', 'url' => 'admin.php?page=elementor-home' ] );
		$tour['steps'][] = array_merge( $tour['steps'][0], [ 'id' => 'third', 'url' => '..' ] );
		$this->responses[ EditorAssetsAPI::PRODUCTION_URL . '/tours/admin-navigation.json' ] = $tour;

		// Act
		$steps = ( new Tours_Repository() )->get_eligible_tour( 'dashboard', [ 'administrator' ] )['steps'];

		// Assert
		$this->assertArrayNotHasKey( 'url', $steps[0] );
		$this->assertSame( 'admin.php?page=elementor-home', $steps[1]['url'] );
		$this->assertArrayNotHasKey( 'url', $steps[2] );
	}

	public function test_get_eligible_tour__caches_failed_fetch(): void {
		// Arrange
		$this->responses = [];
		$repository = new Tours_Repository();

		// Act
		$repository->get_eligible_tour( 'dashboard', [ 'administrator' ] );
		$repository->get_eligible_tour( 'dashboard', [ 'administrator' ] );

		// Assert
		$this->assertCount( 1, $this->requests );
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
					'screen' => 'dashboard',
					'selector' => '#menu-dashboard',
					'title' => 'Dashboard',
					'description' => 'Start here.',
					'side' => 'right',
				],
			],
		];
	}
}
