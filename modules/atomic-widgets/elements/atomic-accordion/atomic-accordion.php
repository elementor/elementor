<?php

namespace Elementor\Modules\AtomicWidgets\Elements\Atomic_Accordion;

use Elementor\Core\Utils\Collection;
use Elementor\Modules\AtomicWidgets\Controls\Section;
use Elementor\Modules\AtomicWidgets\Controls\Types\Elements\Accordion_Items_Control;
use Elementor\Modules\AtomicWidgets\Controls\Types\Switch_Control;
use Elementor\Modules\AtomicWidgets\Controls\Types\Text_Control;
use Elementor\Modules\AtomicWidgets\Controls\Types\Toggle_Control;
use Elementor\Modules\AtomicWidgets\Elements\Atomic_Paragraph\Atomic_Paragraph;
use Elementor\Modules\AtomicWidgets\Elements\Base\Atomic_Element_Base;
use Elementor\Modules\AtomicWidgets\Elements\Base\Element_Builder;
use Elementor\Modules\AtomicWidgets\Elements\Base\Has_Element_Template;
use Elementor\Modules\AtomicWidgets\Elements\Loader\Frontend_Assets_Loader;
use Elementor\Modules\AtomicWidgets\PropTypes\Attributes_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Classes_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Html_V3_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Primitives\Boolean_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Primitives\String_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Size_Prop_Type;
use Elementor\Modules\AtomicWidgets\Styles\Style_Definition;
use Elementor\Modules\AtomicWidgets\Styles\Style_Variant;
use Elementor\Modules\Components\PropTypes\Overridable_Prop_Type;
use Elementor\Plugin;
use Elementor\Utils;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Atomic_Accordion extends Atomic_Element_Base {
	use Has_Element_Template;

	const BASE_STYLE_KEY = 'base';

	const ELEMENT_TYPE_ITEM = 'e-accordion-item';
	const ELEMENT_TYPE_HEADER = 'e-accordion-item-header';
	const ELEMENT_TYPE_TITLE = 'e-accordion-item-title';
	const ELEMENT_TYPE_ICON = 'e-accordion-item-icon';
	const ELEMENT_TYPE_CONTENT = 'e-accordion-item-content';

	const DEFAULT_ITEM_COUNT = 2;

	public static $widget_description = 'Create collapsible content sections using native <details>/<summary> semantics, with no JavaScript needed for the toggle. Structure: e-accordion contains e-accordion-item elements; each item contains an e-accordion-item-header (holding e-accordion-item-title and an optional e-accordion-item-icon) and an e-accordion-item-content that accepts any element.';

	public function __construct( $data = [], $args = null ) {
		parent::__construct( $data, $args );
		$this->meta( 'is_container', true );
	}

	public static function get_type() {
		return 'e-accordion';
	}

	public static function get_element_type(): string {
		return 'e-accordion';
	}

	public function get_title() {
		return esc_html__( 'Accordion', 'elementor' );
	}

	public function get_keywords() {
		return [ 'ato', 'atom', 'atoms', 'atomic', 'accordion', 'faq', 'collapse' ];
	}

	public function get_icon() {
		return 'eicon-accordion';
	}

	protected static function define_props_schema(): array {
		return [
			'classes' => Classes_Prop_Type::make()
				->default( [] ),
			'attributes' => Attributes_Prop_Type::make()->meta( Overridable_Prop_Type::ignore() ),
			'default_state' => String_Prop_Type::make()
				->enum( [ 'first_expanded', 'all_collapsed' ] )
				->default( 'first_expanded' )
				->description( 'Which items are open when the accordion first renders. Valid values: first_expanded, all_collapsed' ),
			'max_expanded' => String_Prop_Type::make()
				->enum( [ 'one', 'multiple' ] )
				->default( 'one' )
				->description( 'How many items can be open at the same time. Valid values: one, multiple' ),
			// Single, global, user-facing toggle - there is no per-item Show Icon (confirmed with the
			// PM: users want icons on every item or on none, never mixed). It is exposable as a
			// component property, so no `Overridable_Prop_Type::ignore()`. Every `e-accordion-item-header`
			// carries its own mirrored `show_icon` prop (see that class) purely because the children-
			// dependencies reconciler evaluates a rule against the *declaring* element's own settings
			// and can only attach/detach that element's *direct* children - a root-level prop here can
			// never drive a grandchild's presence. Do not "clean up" the mirror; the duplication is
			// structural, not an oversight.
			'show_icon' => Boolean_Prop_Type::make()->default( true )
				->description( 'Whether every item header shows an open/closed indicator icon. Applies to all items; there is no per-item override.' ),
			'faq_schema' => Boolean_Prop_Type::make()->default( false )
				->description( 'Whether to output an FAQPage JSON-LD structured data script on the frontend, built from each item\'s title (question) and content (answer).' ),
		];
	}

	protected function define_atomic_controls(): array {
		return [
			Section::make()
				->set_label( __( 'Content', 'elementor' ) )
				->set_id( 'content' )
				->set_items( [
					Accordion_Items_Control::make()
						->set_label( __( 'Accordion Items', 'elementor' ) )
						->set_meta( [
							'layout' => 'custom',
						] ),
					Switch_Control::bind_to( 'show_icon' )
						->set_label( esc_html__( 'Show Icon', 'elementor' ) ),
				] ),
			Section::make()
				->set_label( __( 'Settings', 'elementor' ) )
				->set_id( 'settings' )
				->set_items( [
					Toggle_Control::bind_to( 'default_state' )
						->set_label( esc_html__( 'Default State', 'elementor' ) )
						->add_options( [
							'first_expanded' => [ 'title' => esc_html__( 'First expanded', 'elementor' ) ],
							'all_collapsed' => [ 'title' => esc_html__( 'All collapsed', 'elementor' ) ],
						] )
						->set_exclusive( true )
						->set_convert_options( true )
						->set_size( 'tiny' )
						->set_full_width( true ),
					Toggle_Control::bind_to( 'max_expanded' )
						->set_label( esc_html__( 'Max Items Expanded', 'elementor' ) )
						->add_options( [
							'one' => [ 'title' => esc_html__( 'One', 'elementor' ) ],
							'multiple' => [ 'title' => esc_html__( 'Multiple', 'elementor' ) ],
						] )
						->set_exclusive( true )
						->set_convert_options( true )
						->set_size( 'tiny' )
						->set_full_width( true ),
					Switch_Control::bind_to( 'faq_schema' )
						->set_label( esc_html__( 'FAQ Schema', 'elementor' ) ),
					Text_Control::bind_to( '_cssid' )
						->set_label( __( 'ID', 'elementor' ) )
						->set_meta( $this->get_css_id_control_meta() ),
				] ),
		];
	}

	protected function define_base_styles(): array {
		return [
			static::BASE_STYLE_KEY => Style_Definition::make()
				->add_variant(
					Style_Variant::make()
						->add_props( [
							'display' => String_Prop_Type::generate( 'flex' ),
							'flex-direction' => String_Prop_Type::generate( 'column' ),
							// Neutralises the 10px inline padding that `.e-con` (added to every atomic
							// element by `render_base_classes`) resolves from the container defaults.
							// The item's own 10px lives on the header and the content slot, so any
							// padding here or on the item would just inset the whole accordion.
							'padding' => Size_Prop_Type::generate( [
								'size' => 0,
								'unit' => 'px',
							] ),
						] )
				),
		];
	}

	protected function define_allowed_child_types() {
		return [ self::ELEMENT_TYPE_ITEM ];
	}

	protected function define_default_children() {
		$items = [];

		foreach ( range( 1, self::DEFAULT_ITEM_COUNT ) as $i ) {
			$items[] = $this->build_default_item( $i );
		}

		return $items;
	}

	/**
	 * Builds one `e-accordion-item` with its numbered title seeded explicitly.
	 *
	 * Each level of `default_children` is hydrated independently client-side
	 * (`Atomic_Element_Base_Model::onElementCreate()`, driven by `hydrateDefaultChildren: true`),
	 * so the title slot's own `define_default_children()` has no way to know which item it
	 * belongs to. Building the item → header → title → paragraph chain explicitly here lets the
	 * numbered text ("Accordion Item 1", "Accordion Item 2") reach the rendered paragraph. The
	 * icon and content branches don't need per-index content, so they keep using their own
	 * `define_default_children()` via `hydrate_default_children( true )`.
	 *
	 * @param int $index
	 * @return array
	 */
	private function build_default_item( int $index ): array {
		/* translators: %d: Accordion item position. */
		$numbered_title = sprintf( esc_html__( 'Accordion Item %d', 'elementor' ), $index );

		$title = Element_Builder::make( self::ELEMENT_TYPE_TITLE )
			->editor_settings( [
				'title' => esc_html__( 'Title', 'elementor' ),
			] )
			->children( [
				Atomic_Paragraph::generate()
					->settings( [
						'paragraph' => Html_V3_Prop_Type::generate( [
							'content' => String_Prop_Type::generate( $numbered_title ),
							'children' => [],
						] ),
						'tag' => String_Prop_Type::generate( 'span' ),
					] )
					->build(),
			] )
			->build();

		$icon = Element_Builder::make( self::ELEMENT_TYPE_ICON )
			->hydrate_default_children( true )
			->editor_settings( [
				'title' => esc_html__( 'Icon', 'elementor' ),
			] )
			->build();

		$header = Element_Builder::make( self::ELEMENT_TYPE_HEADER )
			->editor_settings( [
				'title' => esc_html__( 'Header', 'elementor' ),
			] )
			// Seeded explicitly, mirroring the TS repeater's `buildItemModel()`
			// (`accordion-items-control/use-actions.ts`) - both sides of the item-building split need
			// the header's mirrored `show_icon` prop set on creation, not left to its own schema default,
			// or the two default items this method builds and any item added later through the panel
			// would start from different `show_icon` states (set vs. unset). See the comment on the
			// mirrored prop in `Atomic_Accordion_Item_Header` for why the duplication exists at all.
			//
			// Reads the *schema's* default here, not `$this->get_atomic_setting( 'show_icon' )`: this
			// runs while `define_default_children()` is itself building the initial config, before
			// `ensure_settings()` has finished resolving this element's own settings, so calling
			// `get_atomic_setting()` here recurses back into the same in-progress settings resolution
			// and fatals. There is also no "current" root value to seed from yet - the two default
			// items always start from the schema default, the same as the root's own `show_icon`
			// control does the first time it renders.
			->settings( [
				'show_icon' => self::define_props_schema()['show_icon']->get_default(),
			] )
			->children( [ $title, $icon ] )
			->build();

		$content = Element_Builder::make( self::ELEMENT_TYPE_CONTENT )
			->hydrate_default_children( true )
			->editor_settings( [
				'title' => esc_html__( 'Content', 'elementor' ),
			] )
			->build();

		return Element_Builder::make( self::ELEMENT_TYPE_ITEM )
			->editor_settings( [
				'title' => $numbered_title,
				'initial_position' => $index,
			] )
			->children( [ $header, $content ] )
			->build();
	}

	/**
	 * Index of a direct `e-accordion-item` child, by element id.
	 *
	 * Items read this through the render context to decide which one carries the `open`
	 * attribute. Mirrors `Atomic_Tabs::get_tab_index()`.
	 *
	 * @param string $item_id
	 * @return int|null
	 */
	private function get_item_index( string $item_id ) {
		$item_ids = Collection::make( $this->get_children() )
			->filter( fn( $child ) => $child->get_type() === self::ELEMENT_TYPE_ITEM )
			->map( fn( $child ) => $child->get_id() )
			->flip()
			->all();

		return $item_ids[ $item_id ] ?? null;
	}

	/**
	 * Root markdown output: one `### <title>` heading followed by the content subtree's markdown,
	 * per accordion item, blank-line separated.
	 *
	 * `Element_Base::render_markdown()` (the inherited default - fact 6) already recurses
	 * `get_children()` and joins every non-empty result with a blank line, with no regard for
	 * structure. Left unchanged, item -> header -> title -> paragraph and item -> content -> paragraph
	 * would all flatten into one undifferentiated string per item ("Title\n\nContent"), and there is
	 * no delimiter left in that output to tell where the title ends and the content begins - the
	 * heading marker has to be added *before* the two are joined, not recovered afterwards. That
	 * ruled out simply wrapping `parent::render_markdown()` and reformatting its return value.
	 *
	 * Instead this walks the `e-accordion-item` children directly - the same
	 * `Collection::make($this->get_children())->filter()` idiom `get_item_index()` and
	 * `build_faq_schema_json()` already use in this file - keeping each item's title and content
	 * markdown separate until the `### ` heading is applied. The actual text/markdown extraction
	 * still comes from calling `render_markdown()` on the title and content sub-elements (per the
	 * plan's reuse-over-reimplementation preference, the same way `get_faq_item_text()` does above);
	 * only the top-level assembly differs from the inherited default.
	 *
	 * @return string
	 */
	public function render_markdown(): string {
		$items = Collection::make( $this->get_children() )
			->filter( fn( $child ) => $child->get_type() === self::ELEMENT_TYPE_ITEM );

		$blocks = [];

		foreach ( $items as $item ) {
			$title_markdown = trim( $this->get_item_title_markdown( $item ) );
			$content_markdown = trim( $this->get_item_content_markdown( $item ) );

			if ( '' === $title_markdown && '' === $content_markdown ) {
				continue;
			}

			$blocks[] = '### ' . $title_markdown . "\n\n" . $content_markdown;
		}

		return implode( "\n\n", $blocks );
	}

	/**
	 * Markdown of an item's title, via `e-accordion-item` -> `e-accordion-item-header` ->
	 * `e-accordion-item-title` -> `render_markdown()`.
	 *
	 * @param Atomic_Element_Base $item
	 * @return string
	 */
	private function get_item_title_markdown( $item ): string {
		$header = Collection::make( $item->get_children() )
			->filter( fn( $child ) => $child->get_type() === self::ELEMENT_TYPE_HEADER )
			->first();

		if ( null === $header ) {
			return '';
		}

		$title = Collection::make( $header->get_children() )
			->filter( fn( $child ) => $child->get_type() === self::ELEMENT_TYPE_TITLE )
			->first();

		return null === $title ? '' : $title->render_markdown();
	}

	/**
	 * Markdown of an item's content, via `e-accordion-item` -> `e-accordion-item-content` ->
	 * `render_markdown()`.
	 *
	 * @param Atomic_Element_Base $item
	 * @return string
	 */
	private function get_item_content_markdown( $item ): string {
		$content = Collection::make( $item->get_children() )
			->filter( fn( $child ) => $child->get_type() === self::ELEMENT_TYPE_CONTENT )
			->first();

		return null === $content ? '' : $content->render_markdown();
	}

	protected function get_templates(): array {
		return [
			'elementor/elements/atomic-accordion' => __DIR__ . '/atomic-accordion.html.twig',
		];
	}

	/**
	 * Editor-only: auto-opens the item containing the descendant the editor just selected
	 * (`handlers/editor-accordion-state.js`). Nothing is added on the frontend - the toggle itself
	 * stays native, no JS involved.
	 *
	 * @return array
	 */
	public function get_script_depends() {
		$global_depends = parent::get_script_depends();

		if ( Plugin::$instance->preview->is_preview_mode() ) {
			return array_merge( $global_depends, [ 'elementor-accordion-preview-handler' ] );
		}

		return $global_depends;
	}

	public function register_frontend_handlers() {
		$assets_url = ELEMENTOR_ASSETS_URL;
		$min_suffix = ( Utils::is_script_debug() || Utils::is_elementor_tests() ) ? '' : '.min';

		wp_register_script(
			'elementor-accordion-preview-handler',
			"{$assets_url}js/accordion-preview-handler{$min_suffix}.js",
			[ Frontend_Assets_Loader::FRONTEND_HANDLERS_HANDLE ],
			ELEMENTOR_VERSION,
			true
		);
	}

	/**
	 * Adds the FAQPage JSON-LD payload to the template context, when enabled.
	 *
	 * Kept out of the editor preview: structured data is a frontend/SEO concern, and building it
	 * from live descendant markdown on every preview re-render would be wasted work with no
	 * user-visible effect (the `<script type="application/ld+json">` tag renders invisibly).
	 *
	 * @return array
	 */
	protected function build_template_context(): array {
		$faq_schema_json = null;

		if ( $this->get_atomic_setting( 'faq_schema' ) && ! Plugin::$instance->preview->is_preview_mode() ) {
			$faq_schema_json = $this->build_faq_schema_json();
		}

		return array_merge( $this->build_base_template_context(), [
			'faq_schema_json' => $faq_schema_json,
		] );
	}

	/**
	 * Builds the `wp_json_encode()`-ready FAQPage JSON-LD string from the accordion's items, or
	 * `null` when there is nothing valid to emit.
	 *
	 * @return string|null
	 */
	private function build_faq_schema_json() {
		$entities = [];

		$items = Collection::make( $this->get_children() )
			->filter( fn( $child ) => $child->get_type() === self::ELEMENT_TYPE_ITEM );

		foreach ( $items as $item ) {
			$question = $this->get_faq_item_text( $item, self::ELEMENT_TYPE_HEADER, self::ELEMENT_TYPE_TITLE );
			$answer = $this->get_faq_item_text( $item, null, self::ELEMENT_TYPE_CONTENT );

			if ( '' === $question || '' === $answer ) {
				continue;
			}

			$entities[] = [
				'@type' => 'Question',
				'name' => $question,
				'acceptedAnswer' => [
					'@type' => 'Answer',
					'text' => $answer,
				],
			];
		}

		if ( empty( $entities ) ) {
			return null;
		}

		return wp_json_encode( [
			'@context' => 'https://schema.org',
			'@type' => 'FAQPage',
			'mainEntity' => $entities,
		] );
	}

	/**
	 * Plain text of a sub-element within an `e-accordion-item`, found by element type.
	 *
	 * When `$via_type` is given, the target is looked up one level deeper (e.g. the title lives
	 * inside the header, not directly on the item). `render_markdown()` is `Element_Base`'s existing
	 * recursive default (fact 6) — reused as-is, not re-implemented. Its output is markdown syntax
	 * (`**bold**`, `[text](url)`, …), not HTML, so `strip_markdown_syntax()` — not
	 * `wp_strip_all_tags()` — does the real cleanup; `wp_strip_all_tags()` stays only as a
	 * defensive second pass in case some element's `render_markdown()` ever emits raw HTML.
	 *
	 * @param Atomic_Element_Base $item
	 * @param string|null         $via_type
	 * @param string              $target_type
	 * @return string
	 */
	private function get_faq_item_text( $item, $via_type, string $target_type ): string {
		$scope = $item;

		if ( null !== $via_type ) {
			$scope = Collection::make( $item->get_children() )
				->filter( fn( $child ) => $child->get_type() === $via_type )
				->first();

			if ( null === $scope ) {
				return '';
			}
		}

		$target = Collection::make( $scope->get_children() )
			->filter( fn( $child ) => $child->get_type() === $target_type )
			->first();

		if ( null === $target ) {
			return '';
		}

		$plain = $this->strip_markdown_syntax( $target->render_markdown() );

		return trim( wp_strip_all_tags( $plain ) );
	}

	/**
	 * Strips the markdown syntax `render_markdown()` produces via `Html_To_Markdown::convert()`
	 * (see `modules/markdown-render/html-to-markdown.php`) so it never leaks into JSON-LD text
	 * fields verbatim — `**bold**`, `[text](url)`, `# heading`, etc. are not valid prose, and a
	 * FAQPage consumer (Google, any schema.org parser) should see clean text. `wp_strip_all_tags()`
	 * cannot do this job: it strips HTML tags, and markdown syntax is punctuation, not HTML.
	 *
	 * Deliberately scoped to exactly what `Html_To_Markdown::convert()` can emit in this codebase's
	 * configuration, not a general-purpose markdown parser:
	 * - fenced ``` code blocks and inline `code` spans (backtick fence length varies)
	 * - `![alt](src)` images and `[text](url)` links — the visible text is kept, the target dropped
	 * - `**bold**` / `__bold__`, `*italic*` / `_italic_`, `~~strikethrough~~`
	 * - `#` … `######` heading markers and `-`/`*`/`+`/`1.` list markers at line start
	 * - `> ` blockquote markers (repeated per nesting depth) at line start — reachable from a plain
	 *   `Atomic_Paragraph`, which whitelists `<blockquote>` in its own output filter and feeds it
	 *   straight into `Html_To_Markdown::convert()`, so this is not a hypothetical case
	 * - the backslash-escaping `Html_To_Markdown::escape_text()` applies to literal
	 *   `\ \` * _ [ ]` characters in ordinary text, so those round-trip back to plain characters
	 *   instead of surfacing a stray backslash
	 *
	 * The formatting-delimiter regexes below (code/bold/italic/link/image) all require an
	 * *unescaped* delimiter via `(?<!\\)`: `escape_text()` backslash-escapes a literal `* _ \` [ ]`
	 * character wherever it appears in plain text (not just when paired), so a string like
	 * `1* free*` (literal asterisks, no formatting intended) round-trips through `render_markdown()`
	 * as `1\* free\*`. Without the guard, the two escaped asterisks look like a real `*...*` pair to
	 * a naive regex, which eats the enclosed text and leaves orphaned backslashes behind — this was
	 * exactly the Round 1→2 regression. Unescaping runs *after* the delimiter regexes so the escaped
	 * characters are still backslash-prefixed (and therefore excluded by the lookbehind) while those
	 * regexes run.
	 *
	 * Tables aren't handled: no reachable path in this codebase currently produces table markdown
	 * for an accordion title/content subtree, and adding unused coverage would be guessing at
	 * requirements rather than matching them.
	 *
	 * @param string $markdown
	 * @return string
	 */
	private function strip_markdown_syntax( string $markdown ): string {
		$text = $markdown;

		// Fenced code blocks: keep only the code content.
		$text = preg_replace( '/```[^\n`]*\n(.*?)\n```/s', '$1', $text );

		// Inline code spans (only when both fences are unescaped — see docblock).
		$text = preg_replace( '/(?<!\\\\)`+(.*?)(?<!\\\\)`+/s', '$1', $text );

		// Images and links: keep the visible text, drop the target (unescaped opening bracket only).
		$text = preg_replace( '/(?<!\\\\)!\[([^\]]*)\]\([^)]*\)/', '$1', $text );
		$text = preg_replace( '/(?<!\\\\)\[([^\]]*)\]\([^)]*\)/', '$1', $text );

		// Headings: leading #'s at the start of a line.
		$text = preg_replace( '/^#{1,6}[ \t]+/m', '', $text );

		// List markers: "- ", "* ", "+ " or "1. " at a (possibly indented) line start.
		$text = preg_replace( '/^[ \t]*(?:[-*+]|\d+\.)[ \t]+/m', '', $text );

		// Blockquote markers: "> " (repeated for nested quotes) at the start of a line.
		$text = preg_replace( '/^(?:>[ \t]?)+/m', '', $text );

		// Bold, italic (unescaped delimiters only — see docblock), strikethrough (never escaped).
		$text = preg_replace( '/(?<!\\\\)(\*\*|__)(.+?)(?<!\\\\)\1/s', '$2', $text );
		$text = preg_replace( '/(?<!\\\\)\*(.+?)(?<!\\\\)\*/s', '$1', $text );
		$text = preg_replace( '/(?<!\\\\)_(.+?)(?<!\\\\)_/s', '$1', $text );
		$text = preg_replace( '/~~(.+?)~~/s', '$1', $text );

		// Undo the converter's backslash-escaping of literal markdown-special characters.
		$text = preg_replace( '/\\\\([\\\\`*_\[\]])/', '$1', $text );

		// Collapse whitespace left behind by the removals above.
		$text = preg_replace( '/[ \t]+/', ' ', $text );
		$text = preg_replace( '/\s*\n\s*/', ' ', $text );

		return trim( $text );
	}

	/**
	 * Exposes the accordion's identity and per-item lookup to descendants that render inside its
	 * pass (item, header, title, icon, content) via `Render_Context::get( self::class )`.
	 *
	 * @return array
	 */
	protected function define_render_context(): array {
		return [
			[
				'context' => [
					'accordion-id' => $this->get_id(),
					'get-item-index' => fn( $item_id ) => $this->get_item_index( $item_id ),
					'default-state' => $this->get_atomic_setting( 'default_state' ),
					'max-expanded' => $this->get_atomic_setting( 'max_expanded' ),
				],
			],
		];
	}
}
