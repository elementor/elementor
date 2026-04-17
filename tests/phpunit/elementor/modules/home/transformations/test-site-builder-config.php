<?php
namespace Elementor\Tests\Phpunit\Elementor\Modules\Home\Transformations;

use Elementor\Core\Isolation\Wordpress_Adapter_Interface;
use Elementor\Modules\Home\Transformations\Site_Builder_Config;
use Elementor\Plugin;
use PHPUnit\Framework\TestCase as PHPUnit_TestCase;

class Test_Site_Builder_Config extends PHPUnit_TestCase {

	private const OPTION_KEY = 'elementor_site_builder_snapshot';

	public function tearDown(): void {
		Plugin::$instance->app->add_component( 'site-builder', null );
		parent::tearDown();
	}

	public function test_transform__returns_original_data_when_site_builder_component_missing() {
		Plugin::$instance->app->add_component( 'site-builder', null );

		$transformation = new Site_Builder_Config( [
			'wordpress_adapter' => $this->mock_wordpress_adapter(),
		] );

		$result = $transformation->transform( [ 'hello' => 'world' ] );

		$this->assertSame( [ 'hello' => 'world' ], $result );
	}

	public function test_transform__returns_original_data_when_config_is_null() {
		$site_builder = new class {
			public function get_config(): ?array {
				return null;
			}
		};

		Plugin::$instance->app->add_component( 'site-builder', $site_builder );

		$transformation = new Site_Builder_Config( [
			'wordpress_adapter' => $this->mock_wordpress_adapter(),
		] );

		$result = $transformation->transform( [ 'hello' => 'world' ] );

		$this->assertSame( [ 'hello' => 'world' ], $result );
	}

	public function test_transform__merges_site_builder_config_and_snapshot() {
		$site_builder = new class {
			public function get_config(): array {
				return [
					'iframeUrl' => 'https://planner.test/chat.html',
					'connectAuth' => [ 'siteKey' => 'abc' ],
				];
			}
		};

		Plugin::$instance->app->add_component( 'site-builder', $site_builder );

		$snapshot = [ 'abc' => [ 'step' => 3, 'pageSuggestions' => [ 'Home' ] ] ];

		$transformation = new Site_Builder_Config( [
			'wordpress_adapter' => $this->mock_wordpress_adapter( $snapshot ),
		] );

		$result = $transformation->transform( [] );

		$this->assertSame( 'https://planner.test/chat.html', $result['site_builder']['iframeUrl'] );
		$this->assertSame( 'https://planner.test/chat.html', $result['site_builder']['siteBuilderUrl'] );
		$this->assertSame( [ 'siteKey' => 'abc' ], $result['site_builder']['connectAuth'] );
		$this->assertStringContainsString( 'site-planner-01.jpg', $result['site_builder']['previewImage1'] );
		$this->assertStringContainsString( 'site-planner-02.jpg', $result['site_builder']['previewImage2'] );
		$this->assertStringContainsString( 'site-planner-bg.jpg', $result['site_builder']['bgImage'] );
		$this->assertSame( $snapshot, $result['siteBuilderSnapshot'] );
	}

	public function test_transform__snapshot_defaults_to_empty_array_when_option_missing() {
		$site_builder = new class {
			public function get_config(): array {
				return [ 'iframeUrl' => 'https://planner.test/' ];
			}
		};

		Plugin::$instance->app->add_component( 'site-builder', $site_builder );

		$transformation = new Site_Builder_Config( [
			'wordpress_adapter' => $this->mock_wordpress_adapter( false ),
		] );

		$result = $transformation->transform( [] );

		$this->assertSame( [], $result['siteBuilderSnapshot'] );
	}

	public function test_transform__api_origin_uses_constant_when_defined() {
		if ( ! defined( 'ELEMENTOR_SITE_PLANNER_API_ORIGIN' ) ) {
			define( 'ELEMENTOR_SITE_PLANNER_API_ORIGIN', 'https://planner.test/api/v2/ai' );
		}

		$site_builder = new class {
			public function get_config(): array {
				return [ 'iframeUrl' => 'https://planner.test/' ];
			}
		};

		Plugin::$instance->app->add_component( 'site-builder', $site_builder );

		$transformation = new Site_Builder_Config( [
			'wordpress_adapter' => $this->mock_wordpress_adapter(),
		] );

		$result = $transformation->transform( [] );

		$this->assertSame( ELEMENTOR_SITE_PLANNER_API_ORIGIN, $result['site_builder']['apiOrigin'] );
	}

	private function mock_wordpress_adapter( $snapshot = [] ): Wordpress_Adapter_Interface {
		$mock = $this->getMockBuilder( Wordpress_Adapter_Interface::class )
			->disableOriginalConstructor()
			->getMock();

		$mock->method( 'get_option' )
			->with( self::OPTION_KEY )
			->willReturn( $snapshot );

		return $mock;
	}
}
