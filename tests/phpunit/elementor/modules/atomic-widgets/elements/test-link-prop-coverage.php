<?php

namespace Elementor\Testing\Modules\AtomicWidgets\Elements;

use Elementor\Modules\AtomicWidgets\Elements\Atomic_Button\Atomic_Button;
use Elementor\Modules\AtomicWidgets\Elements\Atomic_Divider\Atomic_Divider;
use Elementor\Modules\AtomicWidgets\Elements\Atomic_Heading\Atomic_Heading;
use Elementor\Modules\AtomicWidgets\Elements\Atomic_Image\Atomic_Image;
use Elementor\Modules\AtomicWidgets\Elements\Atomic_Paragraph\Atomic_Paragraph;
use Elementor\Modules\AtomicWidgets\Elements\Atomic_Self_Hosted_Video\Atomic_Self_Hosted_Video;
use Elementor\Modules\AtomicWidgets\Elements\Atomic_Svg\Atomic_Svg;
use Elementor\Modules\AtomicWidgets\Elements\Atomic_Tabs\Atomic_Tab\Atomic_Tab;
use Elementor\Modules\AtomicWidgets\Elements\Atomic_Tabs\Atomic_Tab_Content\Atomic_Tab_Content;
use Elementor\Modules\AtomicWidgets\Elements\Atomic_Tabs\Atomic_Tabs\Atomic_Tabs;
use Elementor\Modules\AtomicWidgets\Elements\Atomic_Tabs\Atomic_Tabs_Content_Area\Atomic_Tabs_Content_Area;
use Elementor\Modules\AtomicWidgets\Elements\Atomic_Tabs\Atomic_Tabs_Menu\Atomic_Tabs_Menu;
use Elementor\Modules\AtomicWidgets\Elements\Atomic_Youtube\Atomic_Youtube;
use Elementor\Modules\AtomicWidgets\Elements\Div_Block\Div_Block;
use Elementor\Modules\AtomicWidgets\Elements\Flexbox\Flexbox;
use Elementor\Modules\AtomicWidgets\Elements\Grid\Grid;
use Elementor\Modules\AtomicWidgets\PropTypes\Link_Prop_Type;
use ElementorEditorTesting\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Guards the hardcoded linkable-widget allowlist that the MCP prompts rely on.
 *
 * If a new element registers (or drops) `Link_Prop_Type`, this test fails so the
 * allowlist in
 * `packages/packages/core/editor-canvas/src/mcp/utils/linkable-widget-types.ts`
 * (and the # LINKS prompt section) cannot silently drift out of sync.
 */
class Test_Link_Prop_Coverage extends Elementor_Test_Base {

	private const ELEMENT_CLASSES = [
		Atomic_Button::class,
		Atomic_Divider::class,
		Atomic_Heading::class,
		Atomic_Image::class,
		Atomic_Paragraph::class,
		Atomic_Self_Hosted_Video::class,
		Atomic_Svg::class,
		Atomic_Tab::class,
		Atomic_Tab_Content::class,
		Atomic_Tabs::class,
		Atomic_Tabs_Content_Area::class,
		Atomic_Tabs_Menu::class,
		Atomic_Youtube::class,
		Div_Block::class,
		Flexbox::class,
		Grid::class,
	];

	private const EXPECTED_LINKABLE_TYPES = [
		'e-button',
		'e-div-block',
		'e-flexbox',
		'e-grid',
		'e-heading',
		'e-image',
		'e-paragraph',
		'e-svg',
	];

	public function test_linkable_widget_allowlist_matches_registered_schemas() {
		// Arrange & Act.
		$linkable_types = [];

		foreach ( self::ELEMENT_CLASSES as $element_class ) {
			$has_link = false;

			foreach ( $element_class::get_props_schema() as $prop_type ) {
				if ( $prop_type instanceof Link_Prop_Type ) {
					$has_link = true;
					break;
				}
			}

			if ( $has_link ) {
				$linkable_types[] = $element_class::get_element_type();
			}
		}

		sort( $linkable_types );

		// Assert.
		$this->assertSame(
			self::EXPECTED_LINKABLE_TYPES,
			$linkable_types,
			'Linkable widget set changed. Update LINKABLE_WIDGET_TYPES in linkable-widget-types.ts and the # LINKS prompt section to match.'
		);
	}
}
