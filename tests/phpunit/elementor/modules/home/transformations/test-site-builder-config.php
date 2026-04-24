<?php
namespace Elementor\Tests\Phpunit\Elementor\Modules\Home\Transformations;

use Elementor\Core\Isolation\Wordpress_Adapter_Interface;
use Elementor\Modules\Home\Transformations\Site_Builder_Config;
use Elementor\Plugin;
use PHPUnit\Framework\TestCase as PHPUnit_TestCase;

class Test_Site_Builder_Config extends PHPUnit_TestCase {

	private const OPTION_KEY = 'elementor_site_builder_snapshot';

	private $original_site_builder_component;

	public function setUp(): void {
		parent::setUp();
		$this->original_site_builder_component = Plugin::$instance->app->get_component( 'site-builder' );
	}

	public function tearDown(): void {
		Plugin::$instance->app->add_component( 'site-builder', $this->original_site_builder_component );
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
				return [ 'siteKey' => 'abc' ];
			}
		};

		Plugin::$instance->app->add_component( 'site-builder', $site_builder );

		$snapshot = [ 'abc' => [ 'step' => 3, 'pageSuggestions' => [ 'Home' ] ] ];

		$transformation = new Site_Builder_Config( [
			'wordpress_adapter' => $this->mock_wordpress_adapter( $snapshot ),
		] );

		$result = $transformation->transform( [] );

		$this->assertSame( 'abc', $result['site_builder']['siteKey'] );
		$this->assertSame( Site_Builder_Config::SITE_BUILDER_URL, $result['site_builder']['siteBuilderUrl'] );
		$this->assertStringContainsString( 'site-planner-01.jpg', $result['site_builder']['previewImage1'] );
		$this->assertStringContainsString( 'site-planner-02.jpg', $result['site_builder']['previewImage2'] );
		$this->assertStringContainsString( 'site-planner-bg.jpg', $result['site_builder']['bgImage'] );
		$this->assertSame( $snapshot, $result['site_builder']['site_builder_snapshot'] );
	}

	public function test_transform__snapshot_defaults_to_empty_array_when_option_missing() {
		$site_builder = new class {
			public function get_config(): array {
				return [ 'siteKey' => 'test-key' ];
			}
		};

		Plugin::$instance->app->add_component( 'site-builder', $site_builder );

		$transformation = new Site_Builder_Config( [
			'wordpress_adapter' => $this->mock_wordpress_adapter( false ),
		] );

		$result = $transformation->transform( [] );

		$this->assertSame( [], $result['site_builder']['site_builder_snapshot'] );
	}

	public function test_transform__validates_and_sanitizes_step_config() {
		$site_builder = new class {
			public function get_config(): array {
				return [ 'siteKey' => 'test-key' ];
			}
		};

		Plugin::$instance->app->add_component( 'site-builder', $site_builder );

		$input_data = [
			'site_builder' => [
				0 => [
					'hasInput' => true,
					'title' => 'Build your website',
					'placeholder' => 'What site do you want to build?',
					'buttonLabel' => 'Create',
				],
				3 => [
					'hasInput' => false,
					'title' => 'Your design is ready',
					'text' => 'Review and publish your site.',
					'buttonLabel' => 'Review',
				],
			],
		];

		$transformation = new Site_Builder_Config( [
			'wordpress_adapter' => $this->mock_wordpress_adapter(),
		] );

		$result = $transformation->transform( $input_data );

		$this->assertSame( 'Build your website', $result['site_builder']['stepConfig'][0]['title'] );
		$this->assertTrue( $result['site_builder']['stepConfig'][0]['hasInput'] );
		$this->assertSame( 'What site do you want to build?', $result['site_builder']['stepConfig'][0]['placeholder'] );
		$this->assertSame( 'Create', $result['site_builder']['stepConfig'][0]['buttonLabel'] );

		$this->assertSame( 'Your design is ready', $result['site_builder']['stepConfig'][3]['title'] );
		$this->assertFalse( $result['site_builder']['stepConfig'][3]['hasInput'] );
		$this->assertSame( 'Review and publish your site.', $result['site_builder']['stepConfig'][3]['text'] );
		$this->assertSame( 'Review', $result['site_builder']['stepConfig'][3]['buttonLabel'] );
	}

	public function test_transform__strips_unknown_step_config_fields() {
		$site_builder = new class {
			public function get_config(): array {
				return [ 'siteKey' => 'test-key' ];
			}
		};

		Plugin::$instance->app->add_component( 'site-builder', $site_builder );

		$input_data = [
			'site_builder' => [
				0 => [
					'hasInput' => true,
					'title' => 'Valid title',
					'buttonLabel' => 'Go',
					'maliciousField' => '<script>alert("xss")</script>',
					'extraData' => [ 'nested' => 'data' ],
				],
			],
		];

		$transformation = new Site_Builder_Config( [
			'wordpress_adapter' => $this->mock_wordpress_adapter(),
		] );

		$result = $transformation->transform( $input_data );

		$this->assertArrayNotHasKey( 'maliciousField', $result['site_builder']['stepConfig'][0] );
		$this->assertArrayNotHasKey( 'extraData', $result['site_builder']['stepConfig'][0] );
		$this->assertArrayHasKey( 'title', $result['site_builder']['stepConfig'][0] );
		$this->assertArrayHasKey( 'hasInput', $result['site_builder']['stepConfig'][0] );
	}

	public function test_transform__sanitizes_html_in_step_config() {
		$site_builder = new class {
			public function get_config(): array {
				return [ 'siteKey' => 'test-key' ];
			}
		};

		Plugin::$instance->app->add_component( 'site-builder', $site_builder );

		$input_data = [
			'site_builder' => [
				0 => [
					'hasInput' => true,
					'title' => 'Title with <b>bold</b> text',
					'buttonLabel' => 'Label with <script>alert(1)</script> end',
					'placeholder' => '<a href="test">Link</a> here',
				],
			],
		];

		$transformation = new Site_Builder_Config( [
			'wordpress_adapter' => $this->mock_wordpress_adapter(),
		] );

		$result = $transformation->transform( $input_data );

		$this->assertSame( 'Title with bold text', $result['site_builder']['stepConfig'][0]['title'] );
		$this->assertSame( 'Label with end', $result['site_builder']['stepConfig'][0]['buttonLabel'] );
		$this->assertSame( 'Link here', $result['site_builder']['stepConfig'][0]['placeholder'] );
	}

	public function test_transform__ignores_invalid_step_keys() {
		$site_builder = new class {
			public function get_config(): array {
				return [ 'siteKey' => 'test-key' ];
			}
		};

		Plugin::$instance->app->add_component( 'site-builder', $site_builder );

		$input_data = [
			'site_builder' => [
				99 => [
					'hasInput' => true,
					'title' => 'Invalid step',
				],
				'invalid_key' => [
					'hasInput' => true,
					'title' => 'String key',
				],
				0 => [
					'hasInput' => true,
					'title' => 'Valid step',
					'buttonLabel' => 'Go',
				],
			],
		];

		$transformation = new Site_Builder_Config( [
			'wordpress_adapter' => $this->mock_wordpress_adapter(),
		] );

		$result = $transformation->transform( $input_data );

		$this->assertArrayNotHasKey( 99, $result['site_builder']['stepConfig'] );
		$this->assertArrayNotHasKey( 'invalid_key', $result['site_builder']['stepConfig'] );
		$this->assertArrayHasKey( 0, $result['site_builder']['stepConfig'] );
		$this->assertSame( 'Valid step', $result['site_builder']['stepConfig'][0]['title'] );
	}

	public function test_transform__enforces_max_length_on_step_config_strings() {
		$site_builder = new class {
			public function get_config(): array {
				return [ 'siteKey' => 'test-key' ];
			}
		};

		Plugin::$instance->app->add_component( 'site-builder', $site_builder );

		$long_title = str_repeat( 'a', 300 );
		$long_label = str_repeat( 'b', 150 );
		$long_text = str_repeat( 'c', 400 );

		$input_data = [
			'site_builder' => [
				0 => [
					'hasInput' => true,
					'title' => $long_title,
					'buttonLabel' => $long_label,
					'placeholder' => $long_title,
				],
				3 => [
					'hasInput' => false,
					'title' => $long_title,
					'text' => $long_text,
					'buttonLabel' => $long_label,
				],
			],
		];

		$transformation = new Site_Builder_Config( [
			'wordpress_adapter' => $this->mock_wordpress_adapter(),
		] );

		$result = $transformation->transform( $input_data );

		$this->assertLessThanOrEqual( 200, mb_strlen( $result['site_builder']['stepConfig'][0]['title'] ) );
		$this->assertLessThanOrEqual( 100, mb_strlen( $result['site_builder']['stepConfig'][0]['buttonLabel'] ) );
		$this->assertLessThanOrEqual( 200, mb_strlen( $result['site_builder']['stepConfig'][0]['placeholder'] ) );
		$this->assertLessThanOrEqual( 300, mb_strlen( $result['site_builder']['stepConfig'][3]['text'] ) );
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
