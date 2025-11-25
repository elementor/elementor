<?php

namespace Elementor\Testing\Modules\AtomicWidgets\PropTypes;

use Elementor\Modules\AtomicWidgets\PropTypes\Base\Plain_Prop_Type;
use PHPUnit\Framework\TestCase;

if (! defined('ABSPATH')) {
	exit; // Exit if accessed directly.
}

class Test_Plain_Prop_Type_Inheritance extends TestCase
{
	const WHITE_LIST = [
		'Elementor\Modules\AtomicWidgets\PropTypes\Classes_Prop_Type',
		'Elementor\Modules\AtomicWidgets\DynamicTags\Dynamic_Prop_Type',
	];

	const ALLOWED_PROP_KINDS = [
		'string',
		'number',
		'boolean',
		'object',
		'union',
		'array'
	];

	public function test_plain_inheritance_has_kind_and_key() {
		$prop_types = Plain_Prop_Type::get_subclasses();
		$kinds = [];
		foreach ( $prop_types as $class ) {
			if (in_array($class, self::WHITE_LIST, true)) {
				$kinds[] = 'plain::whitelisted-' . $class;
			} else {
				$reflection_class = new \ReflectionClass($class);
				$kind = $reflection_class->getStaticPropertyValue('KIND');
				if ( !in_array( $kind, self::ALLOWED_PROP_KINDS, true ) ) {
					static::fail( "Prop type class {$class} has invalid KIND value '{$kind}'. Allowed kinds: " . implode( ', ', self::ALLOWED_PROP_KINDS ) );
				}
				$kinds[] = $kind;
			}
		}
		static::assertNotContains(null, $kinds, 'Some Plain_Prop_Type subclass is missing KIND definition.');
		static::assertNotContains('', $kinds, 'Some Plain_Prop_Type subclass has empty KIND definition.');
	}
}
