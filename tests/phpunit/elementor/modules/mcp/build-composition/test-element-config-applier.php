<?php

namespace Elementor\Testing\Modules\Mcp\Build_Composition;

use Elementor\Modules\AtomicWidgets\PlainResolvers\Plain_Resolvers_Registry;
use Elementor\Modules\AtomicWidgets\PlainResolvers\Plain_Values_Resolver;
use Elementor\Modules\AtomicWidgets\PlainResolvers\Resolvers\Identity_Plain_Resolver;
use Elementor\Modules\AtomicWidgets\PlainResolvers\Resolvers\Number_Plain_Resolver;
use Elementor\Modules\AtomicWidgets\PlainResolvers\Resolvers\Size_Plain_Resolver;
use Elementor\Modules\AtomicWidgets\PlainResolvers\Resolvers\String_Plain_Resolver;
use Elementor\Modules\AtomicWidgets\PropTypes\Primitives\Number_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Primitives\String_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Size_Prop_Type;
use Elementor\Modules\Mcp\Abilities\Build_Composition\Element_Config_Applier;
use Elementor\Modules\Mcp\Abilities\Build_Composition\Widget_Type_Resolver;
use Elementor\Modules\Mcp\Abilities\Build_Composition\Xml_Parser;
use PHPUnit\Framework\TestCase;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Test_Element_Config_Applier extends TestCase {

	private function make_plain_values_resolver(): Plain_Values_Resolver {
		$registry = new Plain_Resolvers_Registry();
		$registry->register_fallback( new Identity_Plain_Resolver() );
		$registry->register( String_Prop_Type::get_key(), new String_Plain_Resolver() );
		$registry->register( Number_Prop_Type::get_key(), new Number_Plain_Resolver() );
		$registry->register( Size_Prop_Type::get_key(), new Size_Plain_Resolver() );

		return new Plain_Values_Resolver( $registry );
	}

	public function test_apply__resolves_plain_scalar_settings_to_envelopes() {
		$type_resolver = new Widget_Type_Resolver( new Xml_Parser() );
		$applier = new Element_Config_Applier( $type_resolver, $this->make_plain_values_resolver() );

		$hero_title = [
			'widgetType' => 'mock-widget',
			'settings' => [],
		];

		$index = [
			'hero-title' => &$hero_title,
		];

		$widget_configs = [
			'mock-widget' => [
				'class' => Plain_Settings_Widget::class,
			],
		];

		$result = $applier->apply(
			$index,
			[
				'hero-title' => [
					'title' => 'Hello world',
					'gap' => '16px',
				],
			],
			$widget_configs
		);

		$this->assertNull( $result['error'] );
		$this->assertSame(
			[
				'$$type' => 'string',
				'value' => 'Hello world',
			],
			$hero_title['settings']['title']
		);
		$this->assertSame(
			[
				'$$type' => 'size',
				'value' => [
					'size' => 16,
					'unit' => 'px',
				],
			],
			$hero_title['settings']['gap']
		);
	}
}

class Plain_Settings_Widget {
	public static function get_props_schema(): array {
		return [
			'title' => String_Prop_Type::make()->required(),
			'gap' => Size_Prop_Type::make(),
		];
	}
}
