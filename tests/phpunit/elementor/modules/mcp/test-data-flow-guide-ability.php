<?php

namespace Elementor\Tests\Phpunit\Modules\Mcp;

use Elementor\Modules\DataFlow\Actions_Registry;
use Elementor\Modules\DataFlow\Custom_Actions;
use Elementor\Modules\DataFlow\Page_State;
use Elementor\Modules\DataFlow\Props\Event_Action_Prop_Type;
use Elementor\Modules\DataFlow\Props\State_Write_Prop_Type;
use Elementor\Modules\Mcp\Abilities\Data_Flow_Guide_Ability;
use ElementorEditorTesting\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * @group Elementor\Modules\Mcp
 */
class Test_Data_Flow_Guide_Ability extends Elementor_Test_Base {

	public function setUp(): void {
		parent::setUp();

		Custom_Actions::register_post_type();
		Custom_Actions::reset();
		Actions_Registry::reset();
	}

	public function test_execute__documents_every_event_built_in_action_and_input() {
		// Act
		$content = ( new Data_Flow_Guide_Ability() )->execute();

		// Assert
		$this->assertIsString( $content );

		$documented = array_merge(
			Event_Action_Prop_Type::EVENTS,
			array_keys( Actions_Registry::instance()->all() ),
			array_keys( State_Write_Prop_Type::INPUT_VALUES ),
			State_Write_Prop_Type::all_input_values()
		);

		foreach ( $documented as $fragment ) {
			$this->assertStringContainsString( "`{$fragment}`", $content );
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

	public function test_execute__lists_the_custom_actions_with_code_for_administrators() {
		// Arrange
		$this->act_as_admin();
		Custom_Actions::instance()->save( [
			'name' => 'acme/ping',
			'code' => '() => {}',
		] );

		// Act
		$content = ( new Data_Flow_Guide_Ability() )->execute();

		// Assert
		$this->assertStringContainsString( '"name": "acme/ping"', $content );
		$this->assertStringContainsString( '"code": "() => {}"', $content );

		Custom_Actions::instance()->delete( 'acme/ping' );
	}
}
