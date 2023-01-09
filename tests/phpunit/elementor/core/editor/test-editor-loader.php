<?php
namespace Elementor\Tests\Phpunit\Elementor\Core\Editor;

use Elementor\Core\Editor\Config_Providers\Config_Provider_Interface;
use Elementor\Core\Editor\Editor_Loader;
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

	public function test_load_script_translations() {
		// Arrange
		global $wp_scripts;

		$this->mock_config_provider->method( 'get_script_configs' )
			->willReturn( [
				 [
				     'handle' => 'script-with-translations',
				     'src' => 'http://localhost',
					 'deps' => [ 'some-dep' ],
				     'translations' => [
				         'active' => true,
				     ]
				 ],
				[
					'handle' => 'script-with-another-domain',
					'src' => 'http://localhost',
					'translations' => [
						'active' => true,
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

		// Cleanup
		wp_deregister_script( 'script-with-translations' );
		wp_deregister_script( 'script-with-another-domain' );
		wp_deregister_script( 'script-without-translations' );
	}

	public function test_load_script_translations__with_path_suffix() {
		// Arrange
		remove_all_filters( 'load_script_textdomain_relative_path' );

		$this->mock_config_provider->method( 'get_script_configs' )
			->willReturn( [
				[
				   'handle' => 'script-minified',
				   'src' => 'http://localhost/assets/js/script-minified.min.js',
					'translations' => [
						'active' => true,
						'path_suffix' => 'strings',
					]
				],
				[
					'handle' => 'script-not-minified',
					'src' => 'http://localhost/assets/js/script-not-minified.js',
					'translations' => [
						'active' => true,
						'path_suffix' => 'strings',
					]
				],
				[
					'handle' => 'script-without-path-suffix',
					'src' => 'http://localhost/assets/js/script-without-path-suffix.js',
					'translations' => [
						'active' => true,
					]
				],
			] );

		$loader = new Editor_Loader( $this->mock_config_provider );
		$loader->register_scripts();
		$loader->load_scripts_translations();

		// Act
		$script_minified_result = apply_filters(
			'load_script_textdomain_relative_path',
			'assets/js/script-minified.min.js',
			'http://localhost/assets/js/script-minified.min.js'
		);

		$script_not_minified_result = apply_filters(
			'load_script_textdomain_relative_path',
			'assets/js/script-not-minified.js',
			'http://localhost/assets/js/script-not-minified.js'
		);

		$script_without_path_suffix_result = apply_filters(
			'load_script_textdomain_relative_path',
			'assets/js/script-without-path-suffix.js',
			'http://localhost/assets/js/script-without-path-suffix.js'
		);

		// Assert
		$this->assertEquals( 'assets/js/script-minified.strings.js', $script_minified_result );
		$this->assertEquals( 'assets/js/script-not-minified.strings.js', $script_not_minified_result );
		$this->assertEquals( 'assets/js/script-without-path-suffix.js', $script_without_path_suffix_result );

		// Cleanup
		wp_deregister_script( 'script-minified' );
		wp_deregister_script( 'script-not-minified' );
		wp_deregister_script( 'script-without-path-suffix' );
	}
}
