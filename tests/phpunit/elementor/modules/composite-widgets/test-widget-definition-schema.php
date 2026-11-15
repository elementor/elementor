<?php

namespace Elementor\Testing\Modules\CompositeWidgets;

use JsonSchema\Validator;
use PHPUnit\Framework\TestCase;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Test_Widget_Definition_Schema extends TestCase {
	const SCHEMA_DIR = __DIR__ . '/../../../../../modules/composite-widgets/schema/';
	const SCHEMA_FILE = self::SCHEMA_DIR . 'widget-definition.schema.json';
	const EXAMPLES_DIR = self::SCHEMA_DIR . 'examples/';

	/**
	 * @dataProvider example_files_provider
	 */
	public function test_example__matches_schema( string $example_file ) {
		// Arrange.
		$definition = $this->read_json( self::EXAMPLES_DIR . $example_file );

		// Act.
		$errors = $this->validate( $definition );

		// Assert.
		$this->assertSame( [], $errors );
	}

	public function example_files_provider(): array {
		return [
			'icon button' => [ 'icon-button.json' ],
			'pricing card' => [ 'pricing-card.json' ],
		];
	}

	/**
	 * @dataProvider invalid_definitions_provider
	 */
	public function test_invalid_definition__fails_schema( string $example_file, callable $break_definition ) {
		// Arrange.
		$definition = $this->read_json_as_array( self::EXAMPLES_DIR . $example_file );
		$definition = $break_definition( $definition );

		// Act.
		$errors = $this->validate( $this->to_json_object( $definition ) );

		// Assert.
		$this->assertNotEmpty( $errors );
	}

	public function invalid_definitions_provider(): array {
		return [
			'missing template' => [
				'icon-button.json',
				function ( array $definition ) {
					unset( $definition['template'] );
					return $definition;
				},
			],
			'id is not namespaced' => [
				'icon-button.json',
				function ( array $definition ) {
					$definition['id'] = 'icon-button';
					return $definition;
				},
			],
			'unknown top-level key' => [
				'icon-button.json',
				function ( array $definition ) {
					$definition['unknown_key'] = true;
					return $definition;
				},
			],
			'template root carries the widget marker' => [
				'icon-button.json',
				function ( array $definition ) {
					$definition['template']['widget'] = [
						'id' => $definition['id'],
						'version' => $definition['version'],
						'values' => [],
					];
					return $definition;
				},
			],
			'template node carries an element id' => [
				'icon-button.json',
				function ( array $definition ) {
					$definition['template']['elements'][0]['id'] = 'a1b2c3';
					return $definition;
				},
			],
			'local style key is not a local- placeholder' => [
				'icon-button.json',
				function ( array $definition ) {
					$style = $definition['template']['styles']['local-root'];
					unset( $definition['template']['styles']['local-root'] );
					$definition['template']['styles']['e-a1b2c3-d4e5f6'] = $style;
					return $definition;
				},
			],
			'part name does not match the part pattern' => [
				'icon-button.json',
				function ( array $definition ) {
					$definition['template']['elements'][0]['part'] = 'feature-icon';
					return $definition;
				},
			],
			'slot is not a boolean' => [
				'icon-button.json',
				function ( array $definition ) {
					$definition['template']['elements'][0]['slot'] = 'yes';
					return $definition;
				},
			],
			'widget node without widgetType' => [
				'icon-button.json',
				function ( array $definition ) {
					unset( $definition['template']['elements'][1]['widgetType'] );
					return $definition;
				},
			],
			'field target without prop' => [
				'icon-button.json',
				function ( array $definition ) {
					unset( $definition['general'][0]['fields'][0]['target']['prop'] );
					return $definition;
				},
			],
			'repeater without item' => [
				'pricing-card.json',
				function ( array $definition ) {
					unset( $definition['general'][1]['item'] );
					return $definition;
				},
			],
		];
	}

	private function validate( $definition ): array {
		$validator = new Validator();
		$validator->validate( $definition, $this->read_json( self::SCHEMA_FILE ) );

		return $validator->getErrors();
	}

	private function read_json( string $path ) {
		return json_decode( file_get_contents( $path ) );
	}

	private function read_json_as_array( string $path ): array {
		return json_decode( file_get_contents( $path ), true );
	}

	private function to_json_object( array $definition ) {
		return json_decode( wp_json_encode( $definition ) );
	}
}
