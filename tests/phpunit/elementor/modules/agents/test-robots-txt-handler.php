<?php

namespace Elementor\Tests\Phpunit\Elementor\Modules\Agents;

use Elementor\Modules\Agents\Robots_Txt_Handler;
use ElementorEditorTesting\Elementor_Test_Base;

class Test_Robots_Txt_Handler extends Elementor_Test_Base {

	private ?string $created_robots_path = null;

	public function tearDown(): void {
		if ( null !== $this->created_robots_path && file_exists( $this->created_robots_path ) ) {
			unlink( $this->created_robots_path );
		}

		remove_all_filters( 'robots_txt' );

		parent::tearDown();
	}

	public function test_add_rules__appends_managed_block() {
		// Arrange
		$handler = new Robots_Txt_Handler();

		// Act
		$output = $handler->add_rules( "User-agent: *\nDisallow: /wp-admin/\n", true );

		// Assert
		$this->assertStringContainsString( Robots_Txt_Handler::BLOCK_BEGIN, $output );
		$this->assertStringContainsString( Robots_Txt_Handler::BLOCK_END, $output );
		$this->assertStringContainsString( 'User-agent: GPTBot', $output );
		$this->assertStringContainsString( 'Content-Signal: search=yes, ai-input=yes, ai-train=no', $output );
	}

	public function test_add_rules__replaces_existing_block_idempotently() {
		// Arrange
		$handler = new Robots_Txt_Handler();
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

		$handler = new Robots_Txt_Handler();

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

		$handler = new Robots_Txt_Handler();

		// Act
		$handler->register();

		// Assert
		$this->assertTrue( $handler->get_status()['physical_file_exists'] );
		$this->assertFalse( has_filter( 'robots_txt', [ $handler, 'add_rules' ] ) );
	}

	public function test_has_physical_robots_txt__matches_file_presence() {
		// Arrange
		$handler = new Robots_Txt_Handler();

		// Act & Assert
		$this->assertSame( file_exists( ABSPATH . 'robots.txt' ), $handler->has_physical_robots_txt() );
	}
}
