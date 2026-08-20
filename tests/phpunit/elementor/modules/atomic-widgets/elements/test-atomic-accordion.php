<?php

namespace Elementor\Testing\Modules\AtomicWidgets\Elements;

use Elementor\Core\Experiments\Manager as Experiments_Manager;
use Elementor\Modules\AtomicWidgets\Elements\Atomic_Accordion\Atomic_Accordion;
use Elementor\Modules\AtomicWidgets\PropTypes\Escaped_Html_Prop_Type;
use Elementor\Modules\AtomicWidgets\Elements\Atomic_Accordion\Atomic_Accordion_Item\Atomic_Accordion_Item;
use Elementor\Modules\AtomicWidgets\Elements\Atomic_Accordion\Atomic_Accordion_Item_Content\Atomic_Accordion_Item_Content;
use Elementor\Modules\AtomicWidgets\Elements\Atomic_Accordion\Atomic_Accordion_Item_Header\Atomic_Accordion_Item_Header;
use Elementor\Modules\AtomicWidgets\Elements\Atomic_Accordion\Atomic_Accordion_Item_Icon\Atomic_Accordion_Item_Icon;
use Elementor\Modules\AtomicWidgets\Elements\Atomic_Accordion\Atomic_Accordion_Item_Title\Atomic_Accordion_Item_Title;
use Elementor\Plugin;
use ElementorEditorTesting\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

/**
 * Every assertion in this file was grounded against a live WordPress bootstrap before being
 * written (see `.superpowers/sdd/accordion_v4_element.plan/task-12-report.md` for the exact
 * scripts/commands and their output) — this suite cannot itself be executed in this checkout
 * because `tests/bootstrap.php` requires `./tmp/wordpress-tests-lib/`, which is not installed here
 * (see `.superpowers/sdd/accordion_v4_element.plan/VERIFY.md`).
 */
class Test_Atomic_Accordion extends Elementor_Test_Base {

	const SUB_ELEMENT_CLASSES_BY_TYPE = [
		'e-accordion-item' => Atomic_Accordion_Item::class,
		'e-accordion-item-header' => Atomic_Accordion_Item_Header::class,
		'e-accordion-item-title' => Atomic_Accordion_Item_Title::class,
		'e-accordion-item-icon' => Atomic_Accordion_Item_Icon::class,
		'e-accordion-item-content' => Atomic_Accordion_Item_Content::class,
	];

	/**
	 * Backs the `accunitN` fixture ids `expand()` assigns. Kept on the instance, not reset to 0
	 * per tree, so two `render_accordion()` calls within the same test method get non-overlapping
	 * ids — real elements get genuinely unique ids in production, and
	 * `test_render_two_instances_have_distinct_names()` depends on that being true here too.
	 */
	private int $render_seq = 0;

	public function setUp(): void {
		parent::setUp();

		// Process-local only, mirroring VERIFY.md's live-bootstrap scripts — writes nothing to
		// the database. The accordion element types are only registered while this is active
		// (`modules/atomic-widgets/module.php::register_elements()`).
		Plugin::$instance->experiments->set_feature_default_state( 'e_accordion', Experiments_Manager::STATE_ACTIVE );
		do_action( 'elementor/elements/elements_registered', Plugin::$instance->elements_manager );
	}

	// ---------------------------------------------------------------------
	// Helpers
	// ---------------------------------------------------------------------

	private function get_define_props_schema( string $class ): array {
		$reflection = new \ReflectionMethod( $class, 'define_props_schema' );
		$reflection->setAccessible( true );

		return $reflection->invoke( null );
	}

	private function get_config( string $type ): array {
		$element_type = Plugin::$instance->elements_manager->get_element_types( $type );
		$this->assertNotNull( $element_type, "Element type {$type} is not registered." );

		return $element_type->get_config();
	}

	/**
	 * `strip_markdown_syntax()` is `private` — the only way to exercise it in isolation, rather
	 * than only indirectly through a full `faq_schema` render, is reflection.
	 */
	private function invoke_strip_markdown_syntax( string $markdown ): string {
		$instance = Plugin::$instance->elements_manager->get_element_types( 'e-accordion' );
		$this->assertNotNull( $instance );

		$reflection = new \ReflectionMethod( Atomic_Accordion::class, 'strip_markdown_syntax' );
		$reflection->setAccessible( true );

		return $reflection->invoke( $instance, $markdown );
	}

	/**
	 * Expands one level of `default_children` recursively, the way the editor's client-side
	 * `buildElement()` does (see VERIFY.md's "Rendering caveat"), so a mock tree can be rendered
	 * server-side through `create_element_instance()` + `print_element()`. Mirrors the scratchpad
	 * `accordion-render.php` / `task6-render.php` scripts used throughout this plan to verify
	 * render behavior live.
	 */
	private function expand( array $node, int &$seq, int $depth = 0 ): array {
		$node['id'] = 'accunit' . ( ++$seq );

		if ( empty( $node['elements'] ) && $depth < 6 ) {
			$type = 'widget' === ( $node['elType'] ?? '' ) ? ( $node['widgetType'] ?? '' ) : ( $node['elType'] ?? '' );
			$element_type = Plugin::$instance->elements_manager->get_element_types( $type );

			if ( ! $element_type ) {
				$element_type = Plugin::$instance->widgets_manager->get_widget_types( $type );
			}

			$children = $element_type ? ( $element_type->get_config()['default_children'] ?? [] ) : [];
		} else {
			$children = $node['elements'] ?? [];
		}

		// `array_map( fn( $child ) => $this->expand( $child, $seq, ... ), ... )` looks equivalent
		// to a loop, but isn't: arrow functions capture `$seq` **by value** at closure-creation
		// time, once, for the whole `array_map()` call. Each of the callback's several invocations
		// (one per sibling) starts from that same captured snapshot rather than the previous
		// sibling's mutated value, so every sibling at a given level collapsed onto the same id.
		// A plain loop passes `$seq` to `expand()` directly, preserving the real by-reference
		// parameter binding the counter depends on.
		$expanded = [];
		foreach ( $children as $child ) {
			$expanded[] = $this->expand( $child, $seq, $depth + 1 );
		}
		$node['elements'] = $expanded;

		return $node;
	}

	private function build_default_tree( array $settings ): array {
		return $this->expand( [
			'elType' => 'e-accordion',
			'settings' => $settings,
			'elements' => Plugin::$instance->elements_manager->get_element_types( 'e-accordion' )->get_config()['default_children'],
		], $this->render_seq );
	}

	/**
	 * Build accordion tree with explicit paragraph content in each item's content area.
	 * Used for tests that need the FAQ schema to be non-empty (which requires content).
	 */
	private function build_tree_with_explicit_content( array $settings ): array {
		$items = Plugin::$instance->elements_manager->get_element_types( 'e-accordion' )->get_config()['default_children'];

		// Add explicit paragraph content to each item's content area
		foreach ( $items as &$item ) {
			if ( isset( $item['elements'] ) ) {
				foreach ( $item['elements'] as &$sub ) {
					if ( ( $sub['elType'] ?? '' ) === 'e-accordion-item-content' ) {
						// Add a paragraph child with answer content
						$item_num = array_search( $item, $items ) + 1;
						$sub['elements'] = [
							[
								'elType' => 'widget',
								'widgetType' => 'e-paragraph',
								'settings' => [
									'paragraph' => Escaped_Html_Prop_Type::generate( 'Answer ' . $item_num ),
								],
							],
						];
					}
				}
				unset( $sub );
			}
		}
		unset( $item );

		return $this->expand( [
			'elType' => 'e-accordion',
			'settings' => $settings,
			'elements' => $items,
		], $this->render_seq );
	}

	private function render_accordion( array $settings ): string {
		$instance = Plugin::$instance->elements_manager->create_element_instance( $this->build_default_tree( $settings ) );
		$this->assertNotNull( $instance, 'Failed to create accordion element instance.' );

		ob_start();
		$instance->print_element();

		return ob_get_clean();
	}

	// ---------------------------------------------------------------------
	// Root props schema: keys, types, defaults, enums
	// ---------------------------------------------------------------------

	public function test_root_props_schema_keys_and_defaults() {
		$schema = $this->get_define_props_schema( Atomic_Accordion::class );

		$this->assertEqualsCanonicalizing(
			[ 'classes', 'attributes', 'default_state', 'max_expanded', 'show_icon', 'faq_schema' ],
			array_keys( $schema )
		);

		$this->assertSame( 'first_expanded', $schema['default_state']->get_default()['value'] );
		$this->assertSame( [ 'first_expanded', 'all_collapsed' ], $schema['default_state']->get_enum() );

		$this->assertSame( 'one', $schema['max_expanded']->get_default()['value'] );
		$this->assertSame( [ 'one', 'multiple' ], $schema['max_expanded']->get_enum() );

		$this->assertTrue( $schema['show_icon']->get_default()['value'] );
		$this->assertFalse( $schema['faq_schema']->get_default()['value'] );
	}

	public function test_functional_props_have_descriptions_classes_and_attributes_do_not() {
		$schema = $this->get_define_props_schema( Atomic_Accordion::class );

		foreach ( [ 'default_state', 'max_expanded', 'show_icon', 'faq_schema' ] as $key ) {
			$description = $schema[ $key ]->get_meta()['description'] ?? '';
			$this->assertNotSame( '', $description, "Expected {$key} to have a non-empty description." );
		}

		// Framework plumbing — never described, matching every other element in this codebase
		// (Atomic_Form, Atomic_Background_Video, Atomic_Tabs; confirmed 2026-08-06).
		foreach ( [ 'classes', 'attributes' ] as $key ) {
			$this->assertArrayNotHasKey( 'description', $schema[ $key ]->get_meta(), "Did not expect {$key} to have a description." );
		}
	}

	public function test_attributes_is_non_overridable_functional_props_are_not() {
		$schema = $this->get_define_props_schema( Atomic_Accordion::class );

		$this->assertArrayHasKey( 'overridable', $schema['attributes']->get_meta() );
		$this->assertFalse( $schema['attributes']->get_meta()['overridable'] );

		foreach ( [ 'default_state', 'max_expanded', 'show_icon', 'faq_schema' ] as $key ) {
			$this->assertArrayNotHasKey( 'overridable', $schema[ $key ]->get_meta(), "Did not expect {$key} to be marked non-overridable." );
		}
	}

	// ---------------------------------------------------------------------
	// default_children
	// ---------------------------------------------------------------------

	public function test_default_children_two_items_hydrate_full_subtree() {
		$children = $this->get_config( 'e-accordion' )['default_children'];

		$this->assertCount( 2, $children );

		foreach ( $children as $i => $item ) {
			$this->assertSame( 'e-accordion-item', $item['elType'] );
			$this->assertSame( 'Accordion Item ' . ( $i + 1 ), $item['editor_settings']['title'] );

			[ $header, $content ] = $item['elements'];

			$this->assertSame( 'e-accordion-item-header', $header['elType'] );
			[ $title, $icon ] = $header['elements'];

			$this->assertSame( 'e-accordion-item-title', $title['elType'] );
			$paragraph = $title['elements'][0];
			$this->assertSame( 'widget', $paragraph['elType'] );
			$this->assertSame( 'e-paragraph', $paragraph['widgetType'] );
			$this->assertSame(
				'Accordion Item ' . ( $i + 1 ),
				$paragraph['settings']['paragraph']['value']['content']['value']
			);

			$this->assertSame( 'e-accordion-item-icon', $icon['elType'] );
			$this->assertTrue( $icon['hydrateDefaultChildren'] );

			$this->assertSame( 'e-accordion-item-content', $content['elType'] );
			$this->assertTrue( $content['hydrateDefaultChildren'] );
		}
	}

	// ---------------------------------------------------------------------
	// allowed_child_types per level
	// ---------------------------------------------------------------------

	public function test_allowed_child_types_per_level() {
		$this->assertSame( [ 'e-accordion-item' ], $this->get_config( 'e-accordion' )['allowed_child_types'] );
		$this->assertSame(
			[ 'e-accordion-item-header', 'e-accordion-item-content' ],
			$this->get_config( 'e-accordion-item' )['allowed_child_types']
		);
		$this->assertSame(
			[ 'e-accordion-item-title', 'e-accordion-item-icon' ],
			$this->get_config( 'e-accordion-item-header' )['allowed_child_types']
		);
		$this->assertEmpty( $this->get_config( 'e-accordion-item-title' )['allowed_child_types'] );
		$this->assertEmpty( $this->get_config( 'e-accordion-item-icon' )['allowed_child_types'] );
		$this->assertEmpty( $this->get_config( 'e-accordion-item-content' )['allowed_child_types'] );
	}

	// ---------------------------------------------------------------------
	// Base styles
	// ---------------------------------------------------------------------

	/**
	 * Every level must declare its own `padding`, including the levels that want none. The Twig
	 * macro `render_base_classes()` puts `e-con` on every atomic element, and `.e-con` resolves
	 * `padding-inline-start/end` from the container defaults (10px), so a level that declares no
	 * padding does not end up at 0 — it silently inherits a 10px inline inset. That is what made
	 * the title text sit 10px to the right of the content slot's children: only the header and the
	 * content declared a padding, so the root, the item, the title and the icon each added a stray
	 * 10px of their own.
	 */
	public function test_every_level_declares_padding_so_the_container_default_cannot_leak_in() {
		$expected_padding_px = [
			'e-accordion' => 0,
			'e-accordion-item' => 0,
			'e-accordion-item-header' => 10,
			'e-accordion-item-title' => 0,
			'e-accordion-item-icon' => 0,
			'e-accordion-item-content' => 10,
		];

		foreach ( $expected_padding_px as $type => $size ) {
			$base_styles = $this->get_config( $type )['base_styles'];
			$props = $base_styles[ $type . '-base' ]['variants'][0]['props'] ?? [];

			$this->assertArrayHasKey( 'padding', $props, "{$type} must declare a padding base style." );
			$this->assertSame(
				[
					'$$type' => 'size',
					'value' => [
						'size' => $size,
						'unit' => 'px',
					],
				],
				$props['padding'],
				"{$type} padding mismatch."
			);
		}
	}

	/**
	 * The icon slot is far wider than the icon it holds (200x20, wide enough to stay a usable drop
	 * target once the default SVG is deleted), so what keeps the indicator at the header's trailing
	 * edge is the slot's own alignment, not the icon's. It has to live here, on the permanently
	 * locked slot, and not on the SVG child: a child takes its styles with it when the user deletes
	 * it, so the next element dropped into the slot would fall back to centred.
	 */
	public function test_icon_slot_pins_its_content_to_the_trailing_edge() {
		$props = $this->get_config( 'e-accordion-item-icon' )['base_styles']['e-accordion-item-icon-base']['variants'][0]['props'];

		$this->assertSame(
			[
				'$$type' => 'string',
				'value' => 'flex-end',
			],
			$props['justify-content']
		);
	}

	// ---------------------------------------------------------------------
	// children_dependencies
	// ---------------------------------------------------------------------

	public function test_header_children_dependencies_shape() {
		$config = $this->get_config( 'e-accordion-item-header' );

		$this->assertCount( 1, $config['children_dependencies'] );

		$rule = $config['children_dependencies'][0];
		$this->assertSame( 'e-accordion-item-icon', $rule['child_type'] );
		$this->assertSame( 'last', $rule['position']['kind'] );
		$this->assertTrue( $rule['stash'] );
		$this->assertSame( 'e-accordion-item-icon', $rule['default_model']['elType'] );
		$this->assertTrue( $rule['default_model']['hydrateDefaultChildren'] );

		$term = $rule['when']['terms'][0];
		$this->assertSame( 'ne', $term['operator'] );
		$this->assertSame( [ 'show_icon' ], $term['path'] );
		$this->assertFalse( $term['value'] );
	}

	public function test_root_and_item_have_no_children_dependencies() {
		$this->assertSame( [], $this->get_config( 'e-accordion' )['children_dependencies'] );
		$this->assertSame( [], $this->get_config( 'e-accordion-item' )['children_dependencies'] );
	}

	// ---------------------------------------------------------------------
	// Sub-element panel visibility, locking, and props schema
	// ---------------------------------------------------------------------

	public function test_sub_elements_are_hidden_from_panel_and_permanently_locked() {
		foreach ( array_keys( self::SUB_ELEMENT_CLASSES_BY_TYPE ) as $type ) {
			$config = $this->get_config( $type );

			$this->assertFalse( $config['show_in_panel'], "{$type} should not show in the panel." );
			$this->assertTrue( ! empty( $config['meta']['permanently_locked'] ), "{$type} should be permanently locked." );
		}
	}

	public function test_sub_elements_props_schema() {
		// `_cssid` and `display-conditions` are framework-injected by
		// `Has_Atomic_Base::get_props_schema()` / the `elementor/atomic-widgets/props-schema`
		// filter, never declared by the element — do not assert their absence (Step 2's
		// correction). `e-accordion-item-header` additionally carries the mirrored `show_icon` prop
		// (see that class) — every other sub-element exposes only the four framework/plumbing
		// props.
		foreach ( self::SUB_ELEMENT_CLASSES_BY_TYPE as $type => $class ) {
			$schema_keys = array_keys( $class::get_props_schema() );

			$expected = 'e-accordion-item-header' === $type
				? [ 'classes', 'attributes', 'show_icon', '_cssid', 'display-conditions' ]
				: [ 'classes', 'attributes', '_cssid', 'display-conditions' ];

			$this->assertEqualsCanonicalizing( $expected, $schema_keys, "{$type} props schema mismatch." );
		}
	}

	// ---------------------------------------------------------------------
	// Render: name / open / title tag / aria-hidden
	// ---------------------------------------------------------------------

	public function test_render_first_expanded_one_marks_only_first_item_open_and_shares_name() {
		$html = $this->render_accordion( [] ); // defaults: first_expanded, one

		preg_match_all( '/<details[^>]*>/', $html, $matches );
		$details_tags = $matches[0];
		$this->assertCount( 2, $details_tags );

		$this->assertMatchesRegularExpression( '/\bopen\b/', $details_tags[0] );
		$this->assertDoesNotMatchRegularExpression( '/\bopen\b/', $details_tags[1] );

		preg_match( '/name="([^"]+)"/', $details_tags[0], $name_0 );
		preg_match( '/name="([^"]+)"/', $details_tags[1], $name_1 );
		$this->assertNotEmpty( $name_0 );
		$this->assertNotEmpty( $name_1 );
		$this->assertSame( $name_0[1], $name_1[1] );
	}

	public function test_render_all_collapsed_no_item_open() {
		$html = $this->render_accordion( [ 'default_state' => 'all_collapsed' ] );

		preg_match_all( '/<details[^>]*>/', $html, $matches );
		$this->assertCount( 2, $matches[0] );

		foreach ( $matches[0] as $tag ) {
			$this->assertDoesNotMatchRegularExpression( '/\bopen\b/', $tag );
		}
	}

	public function test_render_max_expanded_multiple_omits_name_attribute() {
		$html = $this->render_accordion( [ 'max_expanded' => 'multiple' ] );

		preg_match_all( '/<details[^>]*>/', $html, $matches );
		$this->assertCount( 2, $matches[0] );

		foreach ( $matches[0] as $tag ) {
			$this->assertStringNotContainsString( 'name="', $tag );
		}
	}

	public function test_render_two_instances_have_distinct_names() {
		$html_a = $this->render_accordion( [] );
		$html_b = $this->render_accordion( [] );

		preg_match( '/name="([^"]+)"/', $html_a, $name_a );
		preg_match( '/name="([^"]+)"/', $html_b, $name_b );

		$this->assertNotEmpty( $name_a );
		$this->assertNotEmpty( $name_b );
		$this->assertNotSame( $name_a[1], $name_b[1] );
	}

	/**
	 * `title_tag` has been removed from the root's props schema — the title wrapper
	 * (`e-accordion-item-title`) has no settable tag of its own any more and always renders as a
	 * fixed, non-semantic `<span>` (the Twig's `title_tag | default('span')` falls through to its
	 * default since `title_tag` is never supplied). The actual visible tag is controlled by the
	 * inner Paragraph child's own `tag` setting, which is out of scope for this test file.
	 */
	public function test_render_title_wrapper_tag_is_always_the_fixed_span_default() {
		$html = $this->render_accordion( [] );

		preg_match_all( '/<([a-z0-9]+)[^>]*data-element_type="e-accordion-item-title"[^>]*>/i', $html, $matches );

		$this->assertCount( 2, $matches[1] );
		foreach ( $matches[1] as $rendered_tag ) {
			$this->assertSame( 'span', $rendered_tag );
		}
	}

	public function test_render_icon_has_aria_hidden() {
		$html = $this->render_accordion( [] ); // show_icon defaults to true

		preg_match_all( '/<div[^>]*data-element_type="e-accordion-item-icon"[^>]*>/', $html, $matches );
		$this->assertCount( 2, $matches[0] );

		foreach ( $matches[0] as $tag ) {
			$this->assertStringContainsString( 'aria-hidden="true"', $tag );
		}
	}

	// ---------------------------------------------------------------------
	// strip_markdown_syntax() — the constructs documented on the method itself
	// ---------------------------------------------------------------------

	public function test_strip_markdown_syntax_plain_text_is_untouched() {
		$this->assertSame( 'Plain text, nothing to strip.', $this->invoke_strip_markdown_syntax( 'Plain text, nothing to strip.' ) );
	}

	public function test_strip_markdown_syntax_removes_bold_and_italic() {
		$this->assertSame(
			'See bold and italic and strikethrough here.',
			$this->invoke_strip_markdown_syntax( 'See **bold** and _italic_ and ~~strikethrough~~ here.' )
		);
		$this->assertSame( 'Alt bold and alt italic.', $this->invoke_strip_markdown_syntax( '__Alt bold__ and *alt italic*.' ) );
	}

	public function test_strip_markdown_syntax_link_keeps_visible_text_drops_url() {
		$this->assertSame(
			'See a link here.',
			$this->invoke_strip_markdown_syntax( 'See [a link](https://example.com) here.' )
		);
	}

	public function test_strip_markdown_syntax_image_keeps_alt_text_drops_src() {
		$this->assertSame(
			'See a picture here.',
			$this->invoke_strip_markdown_syntax( 'See ![a picture](https://example.com/x.png) here.' )
		);
	}

	public function test_strip_markdown_syntax_inline_code_and_fenced_block_keep_only_content() {
		$this->assertSame( 'Run npm install now.', $this->invoke_strip_markdown_syntax( 'Run `npm install` now.' ) );
		$this->assertSame(
			'Before code after.',
			$this->invoke_strip_markdown_syntax( "Before\n```\ncode\n```\nafter." )
		);
	}

	public function test_strip_markdown_syntax_heading_and_list_markers_are_removed() {
		$this->assertSame( 'Title', $this->invoke_strip_markdown_syntax( '### Title' ) );
		$this->assertSame( 'One Two', $this->invoke_strip_markdown_syntax( "- One\n- Two" ) );
		$this->assertSame( 'First Second', $this->invoke_strip_markdown_syntax( "1. First\n2. Second" ) );
	}

	public function test_strip_markdown_syntax_blockquote_marker_is_removed_including_nested() {
		$this->assertSame(
			'A quoted policy statement.',
			$this->invoke_strip_markdown_syntax( '> A quoted policy statement.' )
		);
		$this->assertSame(
			'A nested quote.',
			$this->invoke_strip_markdown_syntax( '> > A nested quote.' )
		);
	}

	/**
	 * The Round 1→2 regression this method's docblock documents: `Html_To_Markdown::escape_text()`
	 * backslash-escapes literal markdown-special characters in ordinary text, so a real (non-
	 * formatting) asterisk survives `render_markdown()` as `\*`. Stripping must undo that escape
	 * and must NOT treat the pair as a `*...*` italic delimiter — the earlier, buggy version of
	 * this method ate the text between two such literal asterisks and left stray backslashes.
	 */
	public function test_strip_markdown_syntax_preserves_escaped_literal_characters() {
		$this->assertSame(
			'Buy 2 get 1* free* today',
			$this->invoke_strip_markdown_syntax( 'Buy 2 get 1\* free\* today' )
		);
		$this->assertSame(
			'Use the `ls` command, then pwd next',
			$this->invoke_strip_markdown_syntax( 'Use the \`ls\` command, then pwd next' )
		);
	}

	/**
	 * The discriminating case: real formatting and a literal escaped character in the *same*
	 * string, so a regex that merely ignores escaping entirely (rather than excluding only the
	 * escaped occurrences) can't pass by accident.
	 */
	public function test_strip_markdown_syntax_distinguishes_real_formatting_from_escaped_literal() {
		$this->assertSame(
			'This is really important, buy 1* free* today',
			$this->invoke_strip_markdown_syntax( 'This is **really** important, buy 1\* free\* today' )
		);
	}

	public function test_strip_markdown_syntax_collapses_leftover_whitespace() {
		// The blockquote marker must be at true line-start to be stripped at all (matching how
		// `Html_To_Markdown::convert()` places a converted `<blockquote>` on its own line) — this
		// verifies the blank line/newline left behind by removing it collapses into single spaces
		// rather than surviving as a stray line break in the JSON-LD text field.
		$this->assertSame(
			'Intro text. A quoted policy statement about returns. Closing text.',
			$this->invoke_strip_markdown_syntax( "Intro text.\n> A quoted policy statement about returns.\nClosing text." )
		);
	}

	// ---------------------------------------------------------------------
	// faq_schema
	// ---------------------------------------------------------------------

	public function test_faq_schema_on_emits_faq_page_json_ld() {
		// Build accordion with explicit content; the content area no longer has default children
		$instance = Plugin::$instance->elements_manager->create_element_instance(
			$this->build_tree_with_explicit_content( [ 'faq_schema' => true ] )
		);
		$this->assertNotNull( $instance, 'Failed to create accordion element instance.' );

		ob_start();
		$instance->print_element();
		$html = ob_get_clean();

		$this->assertMatchesRegularExpression( '#<script type="application/ld\+json">.*?</script>#s', $html );

		preg_match( '#<script type="application/ld\+json">(.*?)</script>#s', $html, $match );
		$decoded = json_decode( $match[1], true );

		$this->assertSame( JSON_ERROR_NONE, json_last_error() );
		$this->assertSame( 'https://schema.org', $decoded['@context'] );
		$this->assertSame( 'FAQPage', $decoded['@type'] );
		$this->assertCount( 2, $decoded['mainEntity'] );

		foreach ( $decoded['mainEntity'] as $i => $entity ) {
			$this->assertSame( 'Question', $entity['@type'] );
			$this->assertSame( 'Accordion Item ' . ( $i + 1 ), $entity['name'] );
			$this->assertSame( 'Answer', $entity['acceptedAnswer']['@type'] );
			$this->assertSame( 'Answer ' . ( $i + 1 ), $entity['acceptedAnswer']['text'] );
		}
	}

	public function test_faq_schema_off_emits_no_json_ld() {
		$html = $this->render_accordion( [ 'faq_schema' => false ] );

		$this->assertStringNotContainsString( 'application/ld+json', $html );
	}

	// ---------------------------------------------------------------------
	// render_markdown()
	// ---------------------------------------------------------------------

	public function test_render_markdown_matches_expected_shape() {
		$instance = Plugin::$instance->elements_manager->create_element_instance( $this->build_default_tree( [] ) );
		$this->assertNotNull( $instance );

		$markdown = $instance->render_markdown();

		$expected = "### Accordion Item 1\n\n\n\n### Accordion Item 2\n\n";
		$this->assertSame( $expected, $markdown );
	}
}
