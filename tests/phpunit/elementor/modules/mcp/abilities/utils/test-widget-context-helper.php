<?php

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

if ( ! function_exists( '__' ) ) {
	function __( $text, $domain = null ) {
		return $text;
	}
}

if ( ! function_exists( 'apply_filters' ) ) {
	function apply_filters( $tag, $value ) {
		return $value;
	}
}

if ( ! function_exists( 'sanitize_text_field' ) ) {
	function sanitize_text_field( $value ) {
		return is_string( $value ) ? trim( $value ) : $value;
	}
}

require_once __DIR__ . '/../../../../../stubs/elementor-utils-stub.php';

use Elementor\Modules\AtomicWidgets\PropTypes\Base\Object_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Primitives\Boolean_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Primitives\String_Prop_Type;
use Elementor\Modules\Mcp\Abilities\Utils\Widget_Context_Helper;
use PHPUnit\Framework\TestCase;

class Test_Widget_Context_Helper_Object extends Object_Prop_Type {
	public static function get_key(): string {
		return 'test-widget-context-helper-object';
	}

	protected function define_shape(): array {
		return [
			'basic' => String_Prop_Type::make(),
			'enumed' => String_Prop_Type::make()->meta( 'enum', [ 'a', 'b', 'c', 'd' ] )->meta( 'pro', [ 'c', 'd' ] ),
			'pro_only' => String_Prop_Type::make()->meta( 'pro', true ),
			'flag' => Boolean_Prop_Type::make(),
		];
	}
}

class Test_Widget_Context_Helper extends TestCase {

	public function test_to_plain_llm_schema__enriches_enum_from_meta() {
		$prop_type = Test_Widget_Context_Helper_Object::make();

		$schema = Widget_Context_Helper::to_plain_llm_schema( $prop_type );

		$this->assertSame( [ 'a', 'b' ], $schema['properties']['enumed']['enum'] );
	}

	public function test_to_plain_llm_schema__no_op_when_no_meta_annotations() {
		$prop_type = String_Prop_Type::make();

		$schema = Widget_Context_Helper::to_plain_llm_schema( $prop_type );

		$this->assertArrayNotHasKey( 'enum', $schema );
	}
}
