<?php

namespace Elementor\Tests\Phpunit\Elementor\Modules\Agents;

use Elementor\Modules\Agents\Robots_Txt_Handler;
use ElementorEditorTesting\Elementor_Test_Base;

class Test_Robots_Txt_Handler extends Elementor_Test_Base {

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

	public function test_register__skips_filter_when_physical_robots_txt_exists() {
		// Arrange
		$handler = new Robots_Txt_Handler();
		$property = new \ReflectionProperty( Robots_Txt_Handler::class, 'physical_file_exists' );
		$property->setAccessible( true );
		$property->setValue( $handler, true );

		// Act
		$handler->register();

		// Assert
		$this->assertFalse( has_filter( 'robots_txt', [ $handler, 'add_rules' ] ) );
	}

	public function test_register__adds_filter_when_no_physical_robots_txt() {
		// Arrange
		$handler = new Robots_Txt_Handler();
		$property = new \ReflectionProperty( Robots_Txt_Handler::class, 'physical_file_exists' );
		$property->setAccessible( true );
		$property->setValue( $handler, false );

		// Act
		$handler->register();

		// Assert
		$this->assertNotFalse( has_filter( 'robots_txt', [ $handler, 'add_rules' ] ) );
	}

	public function test_get_status__reports_physical_file_flag() {
		// Arrange
		$handler = new Robots_Txt_Handler();
		$property = new \ReflectionProperty( Robots_Txt_Handler::class, 'physical_file_exists' );
		$property->setAccessible( true );
		$property->setValue( $handler, true );

		// Act
		$status = $handler->get_status();

		// Assert
		$this->assertTrue( $status['physical_file_exists'] );
	}
}
