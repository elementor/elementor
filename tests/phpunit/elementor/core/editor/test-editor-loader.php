<?php
namespace Elementor\Tests\Phpunit\Elementor\Core\Editor;

use Elementor\Core\Common\App as CommonApp;
use Elementor\Core\Editor\Config_Providers\Config_Provider_Interface;
use Elementor\Core\Editor\Editor_Loader;
use Elementor\Plugin;
use ElementorEditorTesting\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}

class Test_Editor_Loader extends Elementor_Test_Base {
	private $mock_config_provider;

	public function setUp() {
		parent::setUp();

		$this->mock_config_provider = $this->createMock( Config_Provider_Interface::class );
	}

	public function tearDown() {
		// Clean up all the scripts and styles that were registered.
		wp_deregister_script( 'test-script' );
		wp_deregister_script( 'script-with-translations' );
		wp_deregister_script( 'script-with-another-domain' );
		wp_deregister_script( 'script-without-translations' );
		wp_deregister_script( 'script-minified' );
		wp_deregister_script( 'script-not-minified' );
		wp_deregister_script( 'script-with-replace-requested-file-callback' );
		wp_deregister_script( 'script-without-replace-requested-file' );

		wp_deregister_style( 'test-style' );

		parent::tearDown();
	}

	public function test_register_scripts() {
		// Arrange
		global $wp_scripts;

		$this->mock_config_provider->method( 'get_script_configs' )->willReturn( [
			[
				'handle' => 'test-script',
				'src' => '{{ELEMENTOR_ASSETS_URL}}js/test-script{{MIN_SUFFIX}}.js',
				'deps' => [ 'test-dep' ],
				'version' => '1.1.1',
			],
		] );

		$editor_loader = new Editor_Loader( $this->mock_config_provider );

		// Act
		$editor_loader->register_scripts();

		// Assert
		$this->assertArrayHasKey( 'test-script', $wp_scripts->registered );
		$this->assertEqualSets( [ 'test-dep' ], $wp_scripts->registered['test-script']->deps );
		$this->assertEquals( ELEMENTOR_ASSETS_URL . 'js/test-script.js', $wp_scripts->registered['test-script']->src );
		$this->assertEquals( '1.1.1', $wp_scripts->registered['test-script']->ver );
	}

	public function test_register_styles() {
		// Arrange
		global $wp_styles;

		$this->mock_config_provider->method( 'get_style_configs' )->willReturn( [
			[
				'handle' => 'test-style',
				'src' => '{{ELEMENTOR_ASSETS_URL}}js/test-style{{MIN_SUFFIX}}.js',
				'deps' => [ 'test-dep' ],
				'version' => '1.1.1',
			],
		] );

		$editor_loader = new Editor_Loader( $this->mock_config_provider );

		// Act
		$editor_loader->register_styles();

		// Assert
		$this->assertArrayHasKey( 'test-style', $wp_styles->registered );
		$this->assertEqualSets( [ 'test-dep' ], $wp_styles->registered['test-style']->deps );
		$this->assertEquals( ELEMENTOR_ASSETS_URL . 'js/test-style.js', $wp_styles->registered['test-style']->src );
		$this->assertEquals( '1.1.1', $wp_styles->registered['test-style']->ver );
	}

	public function test_load_script_translations() {
		// Arrange
		global $wp_scripts;

		$this->mock_config_provider->method( 'get_script_configs' )
			->willReturn( [
				[
					'handle' => 'script-with-translations',
					'src' => 'http://localhost',
					'deps' => [ 'some-dep' ],
					'i18n' => [
						'domain' => 'elementor',
					]
				],
				[
					'handle' => 'script-with-another-domain',
					'src' => 'http://localhost',
					'i18n' => [
						'domain' => 'another-domain',
					]
				],
				[
					'handle' => 'script-without-translations',
					'src' => 'http://localhost',
				],
			] );

		$loader = new Editor_Loader( $this->mock_config_provider );
		$loader->register_scripts();

		// Act
		$loader->load_scripts_translations();

		// Assert
		$this->assertEquals( $wp_scripts->registered['script-with-translations']->textdomain, 'elementor' );
		$this->assertEquals( $wp_scripts->registered['script-with-another-domain']->textdomain, 'another-domain' );
		$this->assertEquals( $wp_scripts->registered['script-without-translations']->textdomain, null );
		$this->assertEqualSets(
			$wp_scripts->registered['script-with-translations']->deps,
			[
				'some-dep',
				'wp-i18n',
			]
		);
	}

	/**
	 * @dataProvider print_client_settings_data_provider
	 */
	public function test_print_client_settings( $is_registered, $client_settings, $expected ) {
		// Arrange
		$script_config = $is_registered
			? [
				'handle' => $client_settings['handle'],
				'src' => 'source.js',
				'deps' => [],
				'version' => '1.0.0',
			]
			: [];

		$this->mock_config_provider->method( 'get_script_configs' )->willReturn( [ $script_config ] );

		$this->mock_config_provider->method( 'get_client_settings' )->willReturn( [ $client_settings ] );

		$editor_loader = new Editor_Loader( $this->mock_config_provider );
		$editor_loader->register_scripts();

		// Act
		$editor_loader->print_client_settings();

		// Assert
		$this->assertEquals(
			$expected,
			wp_scripts()->get_data( $client_settings['handle'] ?? null, 'before' )
		);
	}

	public function print_client_settings_data_provider() {
		return [
			// Non registered script, should not print anything.
			[
				'is_registered' => false,
				'client_settings' => [
					'handle' => 'not-registered',
					'name' => 'notRegistered',
					'settings' => [
						'test' => 'not-registered',
					],
				],
				'expected' => false,
			],
			// Registered script, should print settings in a global variable.
			[
				'is_registered' => true,
				'client_settings' => [
					'handle' => 'existing-handle',
					'name' => 'existingHandle',
					'settings' => [
						'test' => 'existing-handle',
					],
				],
				'expected' => [
					0 => '',
					1 => 'var existingHandle = {"test":"existing-handle"};',
				],
			],
			// Config without settings, should not print anything.
			[
				'is_registered' => true,
				'client_settings' => [
					'handle' => 'no-settings',
					'name' => 'noSettings',
				],
				'expected' => false,
			],
			// Config without name, should not print anything.
			[
				'is_registered' => true,
				'client_settings' => [
					'handle' => 'no-name',
					'settings' => [
						'test' => 'no-name',
					],
				],
				'expected' => false,
			],
			// Config without handle, should not print anything.
			[
				'is_registered' => false,
				'client_settings' => [
					'name' => 'noHandle',
					'settings' => [
						'test' => 'no-handle',
					],
				],
				'expected' => false,
			],
		];
	}

	/** @dataProvider load_script_translations__with_replace_requested_file__data_provider */
	public function load_script_translations__with_replace_requested_file( $script_config, $expected_relative_path ) {
		// Arrange
		remove_all_filters( 'load_script_textdomain_relative_path' );

		$this->mock_config_provider->method( 'get_script_configs' )
			->willReturn( [ $script_config ] );

		$loader = new Editor_Loader( $this->mock_config_provider );
		$loader->register_hooks();

		// Act
		$result = apply_filters(
			'load_script_textdomain_relative_path',
			str_replace( 'http://localhost/', '', $script_config['src'] ),
			$script_config['src']
		);

		// Assert
		$this->assertEquals( $expected_relative_path, $result );
	}

	public function load_script_translations__with_replace_requested_file__data_provider() {
		return [
			[
				[
					'handle' => 'script-minified',
					'src' => 'http://localhost/assets/js/script-minified.min.js',
					'i18n' => [
						'domain' => 'elementor',
						'replace_requested_file' => true,
					],
				],
				'assets/js/script-minified.strings.js',
			],
			[
				[
					'handle' => 'script-not-minified',
					'src' => 'http://localhost/assets/js/script-not-minified.js',
					'i18n' => [
						'domain' => 'elementor',
						'replace_requested_file' => true,
					]
				],
				'assets/js/script-not-minified.strings.js',
			],
			[
				[
					'handle' => 'script-with-replace-requested-file-callback',
					'src' => 'http://localhost/assets/js/script-with-replace-requested-file-callback.js',
					'i18n' => [
						'domain' => 'elementor',
						'replace_requested_file' => true,
						'replace_requested_file_callback' => function ( $relative_path ) {
							return 'translations/' . $relative_path;
						}
					],
				],
				'translations/assets/js/script-with-replace-requested-file-callback.js',
			],
			[
				[
					'handle' => 'script-without-replace-requested-file',
					'src' => 'http://localhost/assets/js/script-without-replace-requested-file.js',
					'i18n' => [
						'domain' => 'elementor',
					]
				],
				'assets/js/script-without-replace-requested-file.js',
			],
		];
	}

	public function test_register_additional_templates() {
		// Arrange.
		$original_common = Plugin::$instance->common;

		Plugin::$instance->common = $this->createMock( CommonApp::class );

		$this->mock_config_provider
			->method( 'get_additional_template_paths' )
			->willReturn( [
				'path/to/file-1.php',
				'path/to/file-2.php',
			] );

		// Expect.
		Plugin::$instance->common
			->expects( $this->exactly( 2 ) )
			->method( 'add_template' )
			->withConsecutive(
				[ 'path/to/file-1.php' ],
				[ 'path/to/file-2.php' ]
			);

		// Act.
		$loader = new Editor_Loader( $this->mock_config_provider );

		$loader->register_additional_templates();

		// Cleanup.
		Plugin::$instance->common = $original_common;
	}
}
