<?php

namespace Elementor\Tests\Phpunit\Elementor\Modules\AtomicWidgets\Abilities;

use Elementor\Core\Breakpoints\Manager as Breakpoints_Manager;
use Elementor\Modules\AtomicWidgets\Abilities\V4_Styles_Ability;
use PHPUnit\Framework\TestCase;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * @group Elementor\Modules
 * @group Elementor\Modules\AtomicWidgets
 */
class Test_V4_Styles_Ability extends TestCase {

	private Breakpoints_Manager $breakpoints_manager;
	private V4_Styles_Ability $ability;

	protected function setUp(): void {
		parent::setUp();

		$this->breakpoints_manager = $this->createMock( Breakpoints_Manager::class );
		$this->breakpoints_manager->method( 'get_breakpoints_config' )->willReturn( [
			'desktop' => [ 'label' => 'Desktop', 'value' => 0, 'direction' => 'min', 'is_enabled' => true ],
			'mobile'  => [ 'label' => 'Mobile',  'value' => 767, 'direction' => 'max', 'is_enabled' => true ],
		] );

		$this->ability = new V4_Styles_Ability( $this->breakpoints_manager );
	}

	public function test_execute__returns_all_top_level_keys(): void {
		// Act
		$result = $this->ability->execute( [] );

		// Assert
		$this->assertArrayHasKey( 'critical_rules', $result );
		$this->assertArrayHasKey( 'prop_types', $result );
		$this->assertArrayHasKey( 'style_schema', $result );
		$this->assertArrayHasKey( 'element_structure', $result );
		$this->assertArrayHasKey( 'breakpoints', $result );
	}

	public function test_execute__omits_validation_key_when_validate_props_not_provided(): void {
		// Act
		$result = $this->ability->execute( [] );

		// Assert
		$this->assertArrayNotHasKey( 'validation', $result );
	}

	public function test_execute__omits_validation_key_when_validate_props_is_empty(): void {
		// Act
		$result = $this->ability->execute( [ 'validate_props' => [] ] );

		// Assert
		$this->assertArrayNotHasKey( 'validation', $result );
	}

	public function test_execute__includes_validation_key_when_validate_props_provided(): void {
		// Act
		$result = $this->ability->execute( [
			'validate_props' => [
				'color' => [ '$$type' => 'color', 'value' => '#FF0000' ],
			],
		] );

		// Assert
		$this->assertArrayHasKey( 'validation', $result );
		$this->assertArrayHasKey( 'valid', $result['validation'] );
		$this->assertArrayHasKey( 'css', $result['validation'] );
		$this->assertArrayHasKey( 'warnings', $result['validation'] );
	}

	public function test_get_critical_rules__contains_double_dollar_sign_rule(): void {
		// Act
		$result = $this->ability->execute( [] );

		// Assert — at least one rule must mention $$type
		$mentions_double_dollar = array_filter(
			$result['critical_rules'],
			fn( $rule ) => str_contains( $rule, '$$type' )
		);

		$this->assertNotEmpty( $mentions_double_dollar, 'Expected at least one critical rule mentioning $$type' );
	}

	public function test_breakpoints_reference__includes_active_config(): void {
		// Act
		$result = $this->ability->execute( [] );

		// Assert
		$this->assertArrayHasKey( 'active_config', $result['breakpoints'] );
		$this->assertArrayHasKey( 'desktop', $result['breakpoints']['active_config'] );
		$this->assertArrayHasKey( 'mobile', $result['breakpoints']['active_config'] );
	}

	public function test_execute__prop_types_reference_contains_expected_types(): void {
		// Act
		$result = $this->ability->execute( [] );

		// Assert
		foreach ( [ 'string', 'number', 'size', 'color', 'dimensions', 'box-shadow', 'background' ] as $type ) {
			$this->assertArrayHasKey( $type, $result['prop_types'], "Missing prop type: {$type}" );
		}
	}
}
