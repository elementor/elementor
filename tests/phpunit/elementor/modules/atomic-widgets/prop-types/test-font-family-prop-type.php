<?php

namespace Elementor\Testing\Modules\AtomicWidgets\PropTypes;

use Elementor\Modules\AtomicWidgets\PropTypes\Font_Family_Prop_Type;
use ElementorEditorTesting\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Test_Font_Family_Prop_Type extends Elementor_Test_Base {

	private Font_Family_Prop_Type $prop_type;

	public function setUp(): void {
		parent::setUp();

		$this->prop_type = Font_Family_Prop_Type::make();
	}

	public function test_get_enqueue_font_family__returns_trimmed_stored_value() {
		$this->assertSame( 'Open Sans', $this->prop_type->get_enqueue_font_family( ' Open Sans ' ) );
	}

	public function test_get_enqueue_font_family__strips_surrounding_quotes() {
		$this->assertSame( 'Open Sans', $this->prop_type->get_enqueue_font_family( '"Open Sans"' ) );
	}
}
