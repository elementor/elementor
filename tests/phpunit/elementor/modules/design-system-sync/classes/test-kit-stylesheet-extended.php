<?php

namespace Elementor\Modules\DesignSystemSync\Classes;

use Elementor\Modules\Variables\PropTypes\Color_Variable_Prop_Type;
use Elementor\Modules\Variables\PropTypes\Font_Variable_Prop_Type;
use PHPUnit\Framework\TestCase;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * @group Elementor\Modules
 * @group Elementor\Modules\DesignSystemSync
 */
class Test_Kit_Stylesheet_Extended extends TestCase {
	private $handler;

	public function setUp(): void {
		parent::setUp();

		$this->handler = new Kit_Stylesheet_Extended();
	}

	public function test_add_v3_mapping_for_variable__returns_empty_when_sync_disabled() {
		// Arrange
		$variable = [
			'label' => 'Primary',
			'value' => '#ff0000',
			'type' => Color_Variable_Prop_Type::get_key(),
			'sync_to_v3' => false,
		];

		// Act
		$result = $this->handler->add_v3_mapping_for_variable( '', $variable, 'var-1' );

		// Assert
		$this->assertEquals( '', $result );
	}

	public function test_add_v3_mapping_for_variable__returns_empty_when_sync_missing() {
		// Arrange
		$variable = [
			'label' => 'Primary',
			'value' => '#ff0000',
			'type' => Color_Variable_Prop_Type::get_key(),
		];

		// Act
		$result = $this->handler->add_v3_mapping_for_variable( '', $variable, 'var-1' );

		// Assert
		$this->assertEquals( '', $result );
	}

	public function test_add_v3_mapping_for_variable__generates_v3_mapping_for_color() {
		// Arrange
		$variable = [
			'label' => 'Primary',
			'value' => '#ff0000',
			'type' => Color_Variable_Prop_Type::get_key(),
			'sync_to_v3' => true,
		];

		// Act
		$result = $this->handler->add_v3_mapping_for_variable( '', $variable, 'var-1' );

		// Assert
		$this->assertEquals( ' --e-global-color-v4-Primary:var(--Primary);', $result );
	}

	public function test_add_v3_mapping_for_variable__generates_v3_mapping_for_font() {
		// Arrange
		$variable = [
			'label' => 'Heading',
			'value' => 'Roboto',
			'type' => Font_Variable_Prop_Type::get_key(),
			'sync_to_v3' => true,
		];

		// Act
		$result = $this->handler->add_v3_mapping_for_variable( '', $variable, 'var-1' );

		// Assert
		$this->assertEquals( ' --e-global-typography-v4-Heading:var(--Heading);', $result );
	}

	public function test_add_v3_mapping_for_variable__appends_to_existing_css() {
		// Arrange
		$existing_css = '--Primary:#ff0000;';
		$variable = [
			'label' => 'Primary',
			'value' => '#ff0000',
			'type' => Color_Variable_Prop_Type::get_key(),
			'sync_to_v3' => true,
		];

		// Act
		$result = $this->handler->add_v3_mapping_for_variable( $existing_css, $variable, 'var-1' );

		// Assert
		$this->assertEquals( '--Primary:#ff0000; --e-global-color-v4-Primary:var(--Primary);', $result );
	}

	public function test_add_v3_mapping_for_variable__returns_empty_when_label_missing() {
		// Arrange
		$variable = [
			'value' => '#ff0000',
			'type' => Color_Variable_Prop_Type::get_key(),
			'sync_to_v3' => true,
		];

		// Act
		$result = $this->handler->add_v3_mapping_for_variable( '', $variable, 'var-1' );

		// Assert
		$this->assertEquals( '', $result );
	}

	public function test_add_v3_mapping_for_variable__sanitizes_label() {
		// Arrange
		$variable = [
			'label' => '<script>alert("xss")</script>',
			'value' => '#ff0000',
			'type' => Color_Variable_Prop_Type::get_key(),
			'sync_to_v3' => true,
		];

		// Act
		$result = $this->handler->add_v3_mapping_for_variable( '', $variable, 'var-1' );

		// Assert
		$this->assertEquals( '', $result );
	}
}

