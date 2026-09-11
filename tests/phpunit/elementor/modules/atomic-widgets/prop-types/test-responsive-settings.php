<?php

namespace Elementor\Tests\Phpunit\Elementor\Modules\AtomicWidgets\PropTypes;

use Elementor\Core\Breakpoints\Manager as Breakpoints_Manager;
use Elementor\Modules\AtomicWidgets\PropTypes\Primitives\Number_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Responsive_Settings;
use Elementor\Modules\AtomicWidgets\PropTypes\Union_Prop_Type;
use PHPUnit\Framework\TestCase;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Test_Responsive_Settings extends TestCase {

	public function test_enable__writes_meta_tuple() {
		$prop_type = Number_Prop_Type::make()->meta( Responsive_Settings::enable() );

		$this->assertTrue( Responsive_Settings::is_enabled( $prop_type ) );
		$this->assertTrue( $prop_type->get_meta_item( Responsive_Settings::META_KEY ) );
	}

	public function test_is_enabled__false_by_default() {
		$this->assertFalse( Responsive_Settings::is_enabled( Number_Prop_Type::make() ) );
	}

	public function test_is_enabled__walks_union_members() {
		$inner = Number_Prop_Type::make()->meta( Responsive_Settings::enable() );
		$union = Union_Prop_Type::create_from( $inner );

		$this->assertTrue( Responsive_Settings::is_enabled( $union ) );
	}

	public function test_filter_schema__keeps_only_marked_keys() {
		$schema = [
			'count' => Number_Prop_Type::make()->meta( Responsive_Settings::enable() ),
			'title' => Number_Prop_Type::make(),
		];

		$this->assertSame( [ 'count' ], array_keys( Responsive_Settings::filter_schema( $schema ) ) );
	}

	public function test_fallback_chain__walks_toward_desktop() {
		$this->assertSame(
			[
				Breakpoints_Manager::BREAKPOINT_KEY_TABLET,
				Breakpoints_Manager::BREAKPOINT_KEY_TABLET_EXTRA,
				Breakpoints_Manager::BREAKPOINT_KEY_LAPTOP,
				Breakpoints_Manager::BREAKPOINT_KEY_DESKTOP,
			],
			Responsive_Settings::fallback_chain( 'tablet' )
		);
		$this->assertSame(
			[ Breakpoints_Manager::BREAKPOINT_KEY_WIDESCREEN, Breakpoints_Manager::BREAKPOINT_KEY_DESKTOP ],
			Responsive_Settings::fallback_chain( 'widescreen' )
		);
		$this->assertSame(
			[ Breakpoints_Manager::BREAKPOINT_KEY_DESKTOP ],
			Responsive_Settings::fallback_chain( 'desktop' )
		);
	}

	public function test_css_var_fallback_chain() {
		$chain = Responsive_Settings::css_var_fallback_chain( 'e-carousel-spv', 'tablet', '3' );

		$this->assertSame(
			'var(--e-carousel-spv-tablet, var(--e-carousel-spv-tablet_extra, var(--e-carousel-spv-laptop, var(--e-carousel-spv-desktop, 3))))',
			$chain
		);
	}
}
