<?php

namespace Elementor\Tests\Phpunit\Modules\Mcp\Events;

use Elementor\Modules\Mcp\Abilities\Build_Composition_Ability;
use Elementor\Modules\Mcp\Abilities\List_Site_Parts_Pro_Features_Discovery_Ability;
use Elementor\Modules\Mcp\Abilities\Manage_Site_Parts_Pro_Features_Discovery_Ability;
use Elementor\Modules\Mcp\Abilities\Manage_Variable_Ability;
use Elementor\Modules\Mcp\Abilities\Utils\Components_Pro_Features_Discovery;
use Elementor\Modules\Mcp\Abilities\Utils\Forms_Pro_Features_Discovery;
use Elementor\Modules\Mcp\Abilities\Utils\Site_Parts_Pro_Features_Discovery;
use Elementor\Modules\Mcp\Abilities\Utils\Variables_Pro_Features_Discovery;
use Elementor\Modules\Mcp\Events\Mcp_Event_Dispatcher;
use Elementor\Modules\Mcp\Events\Pro_Feature_Suggestion_Tracker;
use Elementor\Modules\Mcp\Utils\Pro_Features_Discovery;
use Elementor\Modules\Variables\Services\Variables_Service;
use Elementor\Utils;
use ElementorEditorTesting\Elementor_Test_Base;
use Mock_Pro_License_API;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * @group Elementor\Modules\Mcp
 */
class Test_Pro_Feature_Suggested_Event extends Elementor_Test_Base {

	const SESSION_ID = 'session-123';

	private array $emitted_events = [];

	public function setUp(): void {
		parent::setUp();

		if ( Utils::has_pro() ) {
			$this->markTestSkipped( 'Requires Elementor Pro to be inactive.' );
		}

		Mock_Pro_License_API::set_license_state( false, false );
		add_filter( 'elementor/mcp/gated_ability_ids', '__return_empty_array' );
		$this->act_as_admin();

		Mcp_Event_Dispatcher::set_interceptor( function ( string $name, array $payload ) {
			$this->emitted_events[ $name ][] = $payload;
		} );
	}

	public function tearDown(): void {
		unset( $_SERVER[ Pro_Feature_Suggestion_Tracker::SESSION_ID_SERVER_KEY ] );
		remove_filter( 'elementor/mcp/gated_ability_ids', '__return_empty_array' );
		Mcp_Event_Dispatcher::set_interceptor( null );
		Mock_Pro_License_API::reset();

		parent::tearDown();
	}

	public function test_manage_site_parts__fires_once_with_feature_document_types_and_url() {
		// Arrange
		$ability = new Manage_Site_Parts_Pro_Features_Discovery_Ability();

		// Act
		$ability->execute_guarded( [
			'operations' => [
				[ 'action' => 'create', 'type' => 'header' ],
				[ 'action' => 'create', 'type' => 'popup' ],
			],
		] );

		// Assert
		$events = $this->suggestion_events();
		$this->assertCount( 1, $events );
		$this->assertSame( 'elementor/manage-site-parts', $events[0]['tool_name'] );
		$this->assertSame( Site_Parts_Pro_Features_Discovery::PRO_FEATURE, $events[0]['pro_feature'] );
		$this->assertSame( [ 'header', 'popup' ], $events[0]['document_types'] );
		$this->assertSame( Site_Parts_Pro_Features_Discovery::UPGRADE_URL, $events[0]['upgrade_url'] );
		$this->assertSame( 'free', $events[0]['license_tier'] );
		$this->assertSame( Mcp_Event_Dispatcher::EXECUTED_BY, $events[0]['executed_by'] );
		$this->assertSame( Mcp_Event_Dispatcher::INTERACTION_TYPE, $events[0]['interaction_type'] );
	}

	public function test_list_site_parts__does_not_fire() {
		// Arrange
		$ability = new List_Site_Parts_Pro_Features_Discovery_Ability();

		// Act
		$ability->execute_guarded( [] );

		// Assert
		$this->assertSame( [], $this->suggestion_events() );
	}

	public function test_build_composition__fires_once_for_a_successful_build_with_skipped_features() {
		// Arrange
		$post_id = $this->factory()->create_and_get_custom_post( [ 'post_status' => 'draft' ] )->ID;
		$xml = '<e-div-block configuration-id="section"><e-heading configuration-id="title"/><e-form configuration-id="form-1"><e-form-input configuration-id="input-1"/></e-form><e-component configuration-id="card"/></e-div-block>';

		// Act
		$result = ( new Build_Composition_Ability() )->execute_guarded( [ 'post_id' => $post_id, 'dry_run' => true, 'xml_structure' => $xml ] );

		// Assert
		$this->assertIsArray( $result );
		$events = $this->suggestion_events();
		$this->assertCount( 1, $events );
		$this->assertSame( 'elementor/build-composition', $events[0]['tool_name'] );
		$this->assertSame( Forms_Pro_Features_Discovery::PRO_FEATURE, $events[0]['pro_feature'] );
		$this->assertSame( [ Forms_Pro_Features_Discovery::PRO_FEATURE, Components_Pro_Features_Discovery::PRO_FEATURE ], $events[0]['pro_features'] );
		$this->assertSame( Forms_Pro_Features_Discovery::UPGRADE_URL, $events[0]['upgrade_url'] );
		$this->assertArrayNotHasKey( 'document_types', $events[0] );
	}

	public function test_build_composition__fires_once_when_the_whole_composition_is_rejected() {
		// Arrange
		$post_id = $this->factory()->create_and_get_custom_post( [ 'post_status' => 'draft' ] )->ID;
		$xml = '<e-form configuration-id="form-1"><e-form-input configuration-id="input-1"/></e-form>';

		// Act
		$result = ( new Build_Composition_Ability() )->execute_guarded( [ 'post_id' => $post_id, 'dry_run' => true, 'xml_structure' => $xml ] );

		// Assert
		$this->assertWPError( $result );
		$this->assertCount( 1, $this->suggestion_events() );
	}

	public function test_build_composition__does_not_fire_without_pro_elements() {
		// Arrange
		$post_id = $this->factory()->create_and_get_custom_post( [ 'post_status' => 'draft' ] )->ID;
		$xml = '<e-div-block configuration-id="section"><e-heading configuration-id="title"/></e-div-block>';

		// Act
		( new Build_Composition_Ability() )->execute_guarded( [ 'post_id' => $post_id, 'dry_run' => true, 'xml_structure' => $xml ] );

		// Assert
		$this->assertSame( [], $this->suggestion_events() );
	}

	public function test_manage_variable__fires_once_for_a_batch_of_size_operations() {
		// Arrange
		$size_operation = [ 'action' => 'create', 'type' => Manage_Variable_Ability::TYPE_SIZE, 'label' => 'spacing', 'value' => '16px' ];
		$ability = new Manage_Variable_Ability( $this->createMock( Variables_Service::class ) );

		// Act
		$ability->execute_guarded( [ 'operations' => [ $size_operation, $size_operation ] ] );

		// Assert
		$events = $this->suggestion_events();
		$this->assertCount( 1, $events );
		$this->assertSame( 'elementor/manage-global-variable', $events[0]['tool_name'] );
		$this->assertSame( Variables_Pro_Features_Discovery::PRO_FEATURE, $events[0]['pro_feature'] );
	}

	public function test_flush__does_not_fire_when_the_agent_received_a_different_error() {
		// Arrange
		Variables_Pro_Features_Discovery::for_size_variables();

		// Act
		Pro_Feature_Suggestion_Tracker::flush( 'elementor/any-tool', new \WP_Error( 'invalid_input', 'Bad input.' ) );

		// Assert
		$this->assertSame( [], $this->suggestion_events() );
	}

	public function test_flush__reports_only_the_returned_error_when_a_pro_error_is_the_result() {
		// Arrange
		Variables_Pro_Features_Discovery::for_size_variables();
		$returned_error = Forms_Pro_Features_Discovery::for_widget();

		// Act
		Pro_Feature_Suggestion_Tracker::flush( 'elementor/any-tool', $returned_error );

		// Assert
		$events = $this->suggestion_events();
		$this->assertCount( 1, $events );
		$this->assertSame( [ Forms_Pro_Features_Discovery::PRO_FEATURE ], $events[0]['pro_features'] );
	}

	public function test_flush__falls_back_to_empty_values_when_the_error_has_no_data() {
		// Arrange
		$error_without_data = new \WP_Error( Pro_Features_Discovery::ERROR_CODE, 'Pro feature required.' );

		// Act
		Pro_Feature_Suggestion_Tracker::flush( 'elementor/any-tool', $error_without_data );

		// Assert
		$events = $this->suggestion_events();
		$this->assertCount( 1, $events );
		$this->assertSame( '', $events[0]['pro_feature'] );
		$this->assertSame( [], $events[0]['pro_features'] );
		$this->assertSame( '', $events[0]['upgrade_url'] );
		$this->assertArrayNotHasKey( 'document_types', $events[0] );
	}

	public function test_execute_guarded__does_not_leak_suggestions_into_the_next_call() {
		// Arrange
		Variables_Pro_Features_Discovery::for_size_variables();

		// Act
		( new List_Site_Parts_Pro_Features_Discovery_Ability() )->execute_guarded( [] );

		// Assert
		$this->assertSame( [], $this->suggestion_events() );
	}

	public function test_manage_site_parts__includes_the_mcp_session_id_when_present() {
		// Arrange
		$_SERVER[ Pro_Feature_Suggestion_Tracker::SESSION_ID_SERVER_KEY ] = self::SESSION_ID;

		// Act
		( new Manage_Site_Parts_Pro_Features_Discovery_Ability() )->execute_guarded( [ 'operations' => [ [ 'action' => 'create', 'type' => 'header' ] ] ] );

		// Assert
		$this->assertSame( self::SESSION_ID, $this->suggestion_events()[0]['mcp_session_id'] );
	}

	public function test_manage_site_parts__omits_the_mcp_session_id_when_absent() {
		// Act
		( new Manage_Site_Parts_Pro_Features_Discovery_Ability() )->execute_guarded( [ 'operations' => [ [ 'action' => 'create', 'type' => 'header' ] ] ] );

		// Assert
		$this->assertArrayNotHasKey( 'mcp_session_id', $this->suggestion_events()[0] );
	}

	private function suggestion_events(): array {
		return $this->emitted_events[ Pro_Feature_Suggestion_Tracker::EVENT_NAME ] ?? [];
	}
}
