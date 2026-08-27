<?php

namespace Elementor\Tests\Phpunit\Elementor\Modules\AtomicWidgets\PropTypeMigrations;

use Elementor\Modules\AtomicWidgets\PlainResolvers\Resolvers\Html_V3_Plain_Resolver;
use Elementor\Modules\AtomicWidgets\PropTypes\Escaped_Html_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Html_V3_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropsResolver\Transformers\Settings\Escaped_Html_Transformer;
use Elementor\Modules\AtomicWidgets\PropsResolver\Transformers\Settings\Html_V3_Transformer;
use ElementorEditorTesting\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * @group prop-type-migrations
 */
class Test_Html_V3_Registration_Retained extends Elementor_Test_Base {

	public function test_html_v3_prop_type_and_transformers_remain_available() {
		$this->assertSame( 'html-v3', Html_V3_Prop_Type::get_key() );
		$this->assertSame( 'escaped-html', Escaped_Html_Prop_Type::get_key() );
		$this->assertTrue( class_exists( Html_V3_Transformer::class ) );
		$this->assertTrue( class_exists( Escaped_Html_Transformer::class ) );
		$this->assertTrue( class_exists( Html_V3_Plain_Resolver::class ) );
	}
}
