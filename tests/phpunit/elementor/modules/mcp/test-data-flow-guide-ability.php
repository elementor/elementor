<?php

namespace Elementor\Tests\Phpunit\Modules\Mcp;

use Elementor\Modules\DataFlow\Handlers_Parser;
use Elementor\Modules\DataFlow\Page_State;
use Elementor\Modules\Mcp\Abilities\Data_Flow_Guide_Ability;
use PHPUnit\Framework\TestCase;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * @group Elementor\Modules\Mcp
 */
class Test_Data_Flow_Guide_Ability extends TestCase {

	public function test_execute__documents_every_allowed_handler_event() {
		// Act
		$content = ( new Data_Flow_Guide_Ability() )->execute();

		// Assert
		$this->assertIsString( $content );
		foreach ( Handlers_Parser::ALLOWED_EVENTS as $event ) {
			$this->assertStringContainsString( "`{$event}`", $content );
		}
	}

	public function test_execute__documents_page_state_settings_and_sources() {
		// Act
		$content = ( new Data_Flow_Guide_Ability() )->execute();

		// Assert
		$this->assertStringContainsString( Page_State::STATIC_STATE_SETTING, $content );
		$this->assertStringContainsString( Page_State::SOURCES_SETTING, $content );
		foreach ( array_keys( Page_State::get_source_options() ) as $source ) {
			$this->assertStringContainsString( "`{$source}`", $content );
		}
	}

	public function test_execute__documents_handler_context_and_bindings() {
		// Act
		$content = ( new Data_Flow_Guide_Ability() )->execute();

		// Assert
		foreach ( [ 'element', 'event', 'state', 'getState', 'setState', 'subscribe', '{{state.' ] as $fragment ) {
			$this->assertStringContainsString( $fragment, $content );
		}
	}
}
