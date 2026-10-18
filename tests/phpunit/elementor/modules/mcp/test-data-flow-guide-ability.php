<?php

namespace Elementor\Tests\Phpunit\Modules\Mcp;

use Elementor\Modules\DataFlow\Page_State;
use Elementor\Modules\DataFlow\Snippets\Snippet_Validator;
use Elementor\Modules\Mcp\Abilities\Data_Flow_Guide_Ability;
use PHPUnit\Framework\TestCase;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * @group Elementor\Modules\Mcp
 */
class Test_Data_Flow_Guide_Ability extends TestCase {

	public function test_execute__documents_every_allowed_snippet_event() {
		// Act
		$content = ( new Data_Flow_Guide_Ability() )->execute();

		// Assert
		$this->assertIsString( $content );
		foreach ( Snippet_Validator::ALLOWED_EVENTS as $event ) {
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

	public function test_execute__documents_snippet_context_bindings_and_error_codes() {
		// Act
		$content = ( new Data_Flow_Guide_Ability() )->execute();

		// Assert
		foreach ( [ 'state', 'page', 'event', 'emit', 'e-state', 'elementor/manage-snippets', 'snippet_forbidden_api', 'snippet_code_too_large' ] as $fragment ) {
			$this->assertStringContainsString( $fragment, $content );
		}
	}
}
