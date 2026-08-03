<?php

namespace Elementor\Testing\Modules\Mcp\Abilities\Utils;

use Elementor\Modules\AtomicWidgets\PlainResolvers\Plain_Resolvers_Registry;
use Elementor\Modules\AtomicWidgets\PlainResolvers\Plain_Values_Resolver;
use Elementor\Modules\AtomicWidgets\PlainResolvers\Resolvers\String_Plain_Resolver;
use Elementor\Modules\AtomicWidgets\DynamicTags\Dynamic_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Escaped_Html_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Union_Prop_Type;
use Elementor\Modules\Mcp\Abilities\Utils\Adjust_Llm_Prop_Value;
use PHPUnit\Framework\TestCase;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Test_Adjust_Llm_Prop_Value extends TestCase {

	private function resolve_escaped_html( $value ) {
		$registry = new Plain_Resolvers_Registry();
		$resolver = new Plain_Values_Resolver( $registry );
		$registry->register( Escaped_Html_Prop_Type::get_key(), new String_Plain_Resolver() );
		$prop_type = Escaped_Html_Prop_Type::make();
		$adjusted = Adjust_Llm_Prop_Value::adjust_for_plain_resolver( $value, $prop_type );

		if ( null === $adjusted ) {
			return null;
		}

		return $resolver->resolve( $adjusted, $prop_type );
	}

	public function test_adjust_for_plain_resolver__escaped_html_accepts_plain_string() {
		$this->assertSame(
			[
				'$$type' => 'escaped-html',
				'value' => 'Daily Herald',
			],
			$this->resolve_escaped_html( 'Daily Herald' )
		);
	}

	public function test_adjust_for_plain_resolver__escaped_html_accepts_legacy_llm_rich_text_shape() {
		$this->assertSame(
			[
				'$$type' => 'escaped-html',
				'value' => 'Bulk Title',
			],
			$this->resolve_escaped_html(
				[
					'content' => 'Bulk Title',
					'children' => [],
				]
			)
		);
	}

	public function test_adjust_for_plain_resolver__escaped_html_rejects_invalid_legacy_content() {
		$this->assertNull(
			Adjust_Llm_Prop_Value::adjust_for_plain_resolver(
				[
					'content' => [ 'not', 'a', 'string' ],
					'children' => [],
				],
				Escaped_Html_Prop_Type::make()
			)
		);
	}

	public function test_adjust_for_plain_resolver__escaped_html_rejects_bare_integer() {
		$this->assertNull( $this->resolve_escaped_html( 123 ) );
	}

	public function test_adjust_for_plain_resolver__escaped_html_union_schema_accepts_legacy_llm_rich_text_shape() {
		$union = Union_Prop_Type::make()
			->add_prop_type( Escaped_Html_Prop_Type::make() )
			->add_prop_type( Dynamic_Prop_Type::make() );

		$adjusted = Adjust_Llm_Prop_Value::adjust_for_plain_resolver(
			[
				'content' => 'Union Title',
				'children' => [],
			],
			$union
		);

		$this->assertSame( 'Union Title', $adjusted );
	}
}
