<?php

namespace Elementor\Tests\Phpunit\Modules\Mcp;

use Elementor\Modules\Mcp\Abilities\Show_Suggested_Actions_Ability;
use Elementor\Modules\Mcp\Abilities\Suggested_Actions_Ui_Ability;
use PHPUnit\Framework\TestCase;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * @group Elementor\Modules\Mcp
 */
class Test_Show_Suggested_Actions_Ability extends TestCase {

	public function test_ability_id_and_ui_resource_uri_meta() {
		// Arrange
		$ability = new Show_Suggested_Actions_Ability();

		// Act
		$definition = $this->get_definition( $ability );

		// Assert
		$this->assertSame( 'elementor/show-suggested-actions', $this->get_ability_id( $ability ) );
		$this->assertSame(
			Suggested_Actions_Ui_Ability::URI,
			$definition->meta['mcp']['_meta']['ui']['resourceUri']
		);
	}

	public function test_execute_returns_normalized_actions_for_valid_input() {
		// Arrange
		$ability = new Show_Suggested_Actions_Ability();
		$input   = [
			'actions' => [
				[
					'label'  => 'Add heading',
					'prompt' => 'Add a heading to this section',
					'icon'   => 'sparkles',
				],
				[
					'label'  => 'Change layout',
					'prompt' => 'Suggest a better layout',
					'icon'   => 'grid',
				],
			],
		];

		// Act
		$result = $ability->execute( $input );

		// Assert
		$this->assertSame(
			[
				'actions' => [
					[
						'label'  => 'Add heading',
						'prompt' => 'Add a heading to this section',
						'icon'   => 'sparkles',
					],
					[
						'label'  => 'Change layout',
						'prompt' => 'Suggest a better layout',
						'icon'   => 'grid',
					],
				],
			],
			$result
		);
	}

	public function test_execute_returns_wp_error_when_actions_empty() {
		// Arrange
		$ability = new Show_Suggested_Actions_Ability();

		// Act
		$result = $ability->execute( [ 'actions' => [] ] );

		// Assert
		$this->assertInstanceOf( \WP_Error::class, $result );
		$this->assertSame( 'invalid_actions', $result->get_error_code() );
		$this->assertSame( \WP_Http::BAD_REQUEST, $result->get_error_data( 'invalid_actions' )['status'] );
	}

	public function test_execute_returns_wp_error_when_actions_exceed_max() {
		// Arrange
		$ability = new Show_Suggested_Actions_Ability();
		$actions = array_fill(
			0,
			Show_Suggested_Actions_Ability::MAX_ACTIONS + 1,
			[
				'label'  => 'Action',
				'prompt' => 'Do something',
			]
		);

		// Act
		$result = $ability->execute( [ 'actions' => $actions ] );

		// Assert
		$this->assertInstanceOf( \WP_Error::class, $result );
		$this->assertSame( 'invalid_actions', $result->get_error_code() );
		$this->assertSame( \WP_Http::BAD_REQUEST, $result->get_error_data( 'invalid_actions' )['status'] );
	}

	public function test_execute_returns_wp_error_when_action_is_not_an_object() {
		// Arrange
		$ability = new Show_Suggested_Actions_Ability();

		// Act
		$result = $ability->execute( [ 'actions' => [ 'not-an-object' ] ] );

		// Assert
		$this->assertInstanceOf( \WP_Error::class, $result );
		$this->assertSame( 'invalid_actions', $result->get_error_code() );
		$this->assertSame( \WP_Http::BAD_REQUEST, $result->get_error_data( 'invalid_actions' )['status'] );
	}

	public function test_execute_returns_wp_error_when_label_or_prompt_is_blank() {
		// Arrange
		$ability = new Show_Suggested_Actions_Ability();

		// Act
		$result = $ability->execute( [
			'actions' => [
				[
					'label'  => '   ',
					'prompt' => 'Do something',
				],
			],
		] );

		// Assert
		$this->assertInstanceOf( \WP_Error::class, $result );
		$this->assertSame( 'invalid_actions', $result->get_error_code() );
		$this->assertSame( \WP_Http::BAD_REQUEST, $result->get_error_data( 'invalid_actions' )['status'] );
	}

	public function test_execute_strips_unknown_icon_values() {
		// Arrange
		$ability = new Show_Suggested_Actions_Ability();
		$input   = [
			'actions' => [
				[
					'label'  => 'Add heading',
					'prompt' => 'Add a heading to this section',
					'icon'   => 'unknown-icon',
				],
			],
		];

		// Act
		$result = $ability->execute( $input );

		// Assert
		$this->assertSame(
			[
				'actions' => [
					[
						'label'  => 'Add heading',
						'prompt' => 'Add a heading to this section',
					],
				],
			],
			$result
		);
	}

	private function get_ability_id( Show_Suggested_Actions_Ability $ability ): string {
		$reflection = new \ReflectionMethod( $ability, 'get_ability_id' );
		$reflection->setAccessible( true );
		return $reflection->invoke( $ability );
	}

	private function get_definition( Show_Suggested_Actions_Ability $ability ) {
		$reflection = new \ReflectionMethod( $ability, 'get_definition' );
		$reflection->setAccessible( true );
		return $reflection->invoke( $ability );
	}
}
