<?php

namespace Elementor\Tests\Phpunit\Elementor\Modules\Agents;

use Elementor\Modules\Agents\Agent_Ready_Settings;
use Elementor\Modules\Agents\Content_Generator;
use Elementor\Modules\Agents\Prompt_Injection_Sanitizer;
use Elementor\Modules\Agents\Robots_Txt_Handler;
use ElementorEditorTesting\Elementor_Test_Base;

class Test_Robots_Txt_Handler extends Elementor_Test_Base {

	private ?string $created_robots_path = null;

	private Agent_Ready_Settings $settings;

	public function setUp(): void {
		parent::setUp();

		delete_option( Agent_Ready_Settings::OPTION );

		$this->settings = new Agent_Ready_Settings( new Content_Generator( new Prompt_Injection_Sanitizer() ) );
	}

	public function tearDown(): void {
		delete_option( Agent_Ready_Settings::OPTION );

		if ( null !== $this->created_robots_path && file_exists( $this->created_robots_path ) ) {
			unlink( $this->created_robots_path );
		}

		remove_all_filters( 'robots_txt' );

		parent::tearDown();
	}

	public function test_add_rules__appends_managed_block() {
		// Arrange
		$handler = new Robots_Txt_Handler( $this->settings );

		// Act
		$output = $handler->add_rules( "User-agent: *\nDisallow: /wp-admin/\n", true );

		// Assert
		$this->assertStringContainsString( Robots_Txt_Handler::BLOCK_BEGIN, $output );
		$this->assertStringContainsString( Robots_Txt_Handler::BLOCK_END, $output );
		$this->assertStringContainsString( 'User-agent: GPTBot', $output );
		$this->assertStringContainsString( 'Content-Signal: search=yes, ai-input=yes, ai-train=no', $output );
	}

	public function test_add_rules__returns_output_unchanged_when_module_is_disabled() {
		// Arrange
		$this->settings->set_server_value( Agent_Ready_Settings::MODULE_BOT_ACCESS_CONTROL, 'enabled', false );
		$handler = new Robots_Txt_Handler( $this->settings );
		$input   = "User-agent: *\nDisallow: /wp-admin/\n";

		// Act
		$output = $handler->add_rules( $input, true );

		// Assert
		$this->assertSame( $input, $output );
	}

	public function test_add_rules__strips_existing_block_when_module_is_disabled() {
		// Arrange
		$handler = new Robots_Txt_Handler( $this->settings );
		$core    = "User-agent: *\nDisallow: /wp-admin/\n";
		$input   = $handler->add_rules( $core, true );
		$this->settings->set_server_value( Agent_Ready_Settings::MODULE_BOT_ACCESS_CONTROL, 'enabled', false );

		// Act
		$output = $handler->add_rules( $input, true );

		// Assert
		$this->assertSame( $core, $output );
		$this->assertStringNotContainsString( Robots_Txt_Handler::BLOCK_BEGIN, $output );
	}

	public function test_add_rules__writes_content_signal_per_managed_bot() {
		// Arrange
		$this->settings->set_server_value( Agent_Ready_Settings::MODULE_BOT_ACCESS_CONTROL, 'bots', [
			'GPTBot' => [ 'search' => false, 'ai_input' => true, 'ai_train' => true ],
		] );
		$handler = new Robots_Txt_Handler( $this->settings );

		// Act
		$output = $handler->add_rules( '', true );

		// Assert
		$this->assertStringContainsString( "User-agent: GPTBot\nAllow: /\nContent-Signal: search=no, ai-input=yes, ai-train=yes", $output );
		$this->assertStringNotContainsString( 'User-agent: ClaudeBot', $output );
		$this->assertStringContainsString( "User-agent: *\nContent-Signal: search=yes, ai-input=yes, ai-train=no", $output );
	}

	public function test_add_rules__omits_unmanaged_bots_until_they_are_added() {
		// Arrange
		$handler = new Robots_Txt_Handler( $this->settings );
		$before  = $handler->add_rules( '', true );

		// Act
		$this->settings->set_server_value( Agent_Ready_Settings::MODULE_BOT_ACCESS_CONTROL, 'bots', [
			'CCBot' => [ 'search' => true, 'ai_input' => true, 'ai_train' => false ],
		] );
		$after = $handler->add_rules( '', true );

		// Assert
		$this->assertStringNotContainsString( 'User-agent: CCBot', $before );
		$this->assertStringContainsString( 'User-agent: CCBot', $after );
	}

	public function test_add_rules__returns_output_unchanged_when_site_is_not_public() {
		// Arrange
		$handler = new Robots_Txt_Handler( $this->settings );
		$input   = "User-agent: *\nDisallow: /\n";

		// Act
		$output = $handler->add_rules( $input, false );

		// Assert
		$this->assertSame( $input, $output );
		$this->assertStringNotContainsString( Robots_Txt_Handler::BLOCK_BEGIN, $output );
	}

	public function test_add_rules__strips_existing_block_when_site_is_not_public() {
		// Arrange
		$handler = new Robots_Txt_Handler( $this->settings );
		$core    = "User-agent: *\nDisallow: /\n";
		$input   = $handler->add_rules( $core, true );

		// Act
		$output = $handler->add_rules( $input, false );

		// Assert
		$this->assertSame( $core, $output );
		$this->assertStringNotContainsString( Robots_Txt_Handler::BLOCK_BEGIN, $output );
	}

	public function test_add_rules__replaces_existing_block_idempotently() {
		// Arrange
		$handler = new Robots_Txt_Handler( $this->settings );
		$first   = $handler->add_rules( "User-agent: *\n", true );
		$second  = $handler->add_rules( $first, true );

		// Assert
		$this->assertSame( 1, substr_count( $second, Robots_Txt_Handler::BLOCK_BEGIN ) );
		$this->assertSame( 1, substr_count( $second, Robots_Txt_Handler::BLOCK_END ) );
	}

	public function test_register__adds_robots_txt_filter_when_no_physical_file() {
		// Arrange
		if ( file_exists( ABSPATH . 'robots.txt' ) ) {
			$this->markTestSkipped( 'Physical robots.txt already exists in the test environment.' );
		}

		$handler = new Robots_Txt_Handler( $this->settings );

		// Act
		$handler->register();

		// Assert
		$this->assertNotFalse( has_filter( 'robots_txt', [ $handler, 'add_rules' ] ) );
		$this->assertFalse( $handler->get_status()['physical_file_exists'] );
	}

	public function test_register__skips_filter_when_physical_robots_txt_exists() {
		// Arrange
		$robots_path = ABSPATH . 'robots.txt';

		if ( ! file_exists( $robots_path ) ) {
			file_put_contents( $robots_path, "User-agent: *\n" );
			$this->created_robots_path = $robots_path;
		}

		$handler = new Robots_Txt_Handler( $this->settings );

		// Act
		$handler->register();

		// Assert
		$this->assertTrue( $handler->get_status()['physical_file_exists'] );
		$this->assertFalse( has_filter( 'robots_txt', [ $handler, 'add_rules' ] ) );
	}

	public function test_has_physical_robots_txt__matches_file_presence() {
		// Arrange
		$handler = new Robots_Txt_Handler( $this->settings );

		// Act & Assert
		$this->assertSame( file_exists( ABSPATH . 'robots.txt' ), $handler->has_physical_robots_txt() );
	}
}
