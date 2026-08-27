<?php

namespace Elementor\Modules\Mcp\Abilities\Appliers\V3;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Derives a V3 widget's MCP mapping structure from its own control tree.
 *
 * A V3 widget already declares everything needed to expose it to an LLM: Style-tab
 * sections describe its visual sub-parts, and each control's `selectors` reveal which
 * element that sub-part renders to. These pure functions read that structure so
 * inner-element aliases and setting membership no longer have to be hand-authored.
 */
class V3_Control_Introspector {

	const TAB_CONTENT = 'content';

	const TAB_STYLE = 'style';

	const TAB_ADVANCED = 'advanced';

	const WRAPPER_PLACEHOLDER = '{{WRAPPER}}';

	/**
	 * A Style-tab section becomes an inner-element alias only when its sub-selector carries
	 * enough controls to actually style something (typically color + typography + spacing).
	 * Thinner sections are mostly wrapper-level styling with one stray decorative control,
	 * and exposing them as aliases would invite the LLM to target a near-empty scope.
	 */
	const MIN_SUB_SELECTOR_CONTROLS_PER_ALIAS = 3;

	/**
	 * Section-id tokens that carry no meaning in an alias name.
	 */
	const ALIAS_NOISE_TOKENS = [ 'section', 'style' ];

	/**
	 * Keys `Controls_Stack::add_responsive_control()` leaves on a control to mark it responsive.
	 * When the `additional_custom_breakpoints` experiment duplicates per device, the suffixed
	 * controls also exist in the stack; when it does not, only the marker does and the editor
	 * creates `<key>_<breakpoint>` settings in JS. Either way the suffixed setting is valid.
	 */
	const RESPONSIVE_MARKER_KEYS = [ 'responsive', 'is_responsive' ];

	/**
	 * Control types that structure the panel rather than hold a setting value.
	 */
	const STRUCTURAL_CONTROL_TYPES = [
		'section',
		'tab',
		'tabs',
		'divider',
		'heading',
		'raw_html',
		'deprecated_notice',
		'notice',
		'alert',
		'popover_toggle',
		'hidden',
	];

	/**
	 * Advanced-tab sections MCP never writes: they are either handled natively in V4
	 * (interactions, classes, positioning) or express themselves through internal CSS
	 * variables that an LLM cannot author meaningfully.
	 */
	const EXCLUDED_ADVANCED_SECTIONS = [
		'_section_transform',
		'_section_masking',
		'_section_responsive',
		'_section_attributes',
		'section_effects',
		'section_custom_css',
		'section_sticky',
		'section_custom_attributes',
	];

	/**
	 * @param array<string, mixed> $controls Widget controls from get_config()['controls'].
	 * @return array{
	 *     inner_elements: array<string, array{label: string, section_id: string, canonical_selector: string, setting_keys: string[]}>,
	 *     wrapper: array{setting_keys: string[]},
	 *     non_style_keys: string[],
	 *     excluded_advanced_keys: string[]
	 * }
	 */
	public static function derive( array $controls ): array {
		return [
			'inner_elements' => self::inner_elements( $controls ),
			'wrapper' => [ 'setting_keys' => self::wrapper_setting_keys( $controls ) ],
			'non_style_keys' => self::non_style_keys( $controls ),
			'excluded_advanced_keys' => self::excluded_advanced_keys( $controls ),
		];
	}

	/**
	 * @param array<string, mixed> $controls
	 * @return array<string, array{label: string, section_id: string, canonical_selector: string, setting_keys: string[]}>
	 */
	public static function inner_elements( array $controls ): array {
		$sections = self::sections( $controls );
		$inner_elements = [];

		foreach ( $sections as $section_id => $section ) {
			if ( self::TAB_STYLE !== ( $section['tab'] ?? null ) ) {
				continue;
			}

			$scope = self::scope_for_section( $controls, $section_id );

			if ( count( $scope['setting_keys'] ) < self::MIN_SUB_SELECTOR_CONTROLS_PER_ALIAS ) {
				continue;
			}

			$inner_elements[ self::alias_from_section_id( $section_id ) ] = $scope;
		}

		return $inner_elements;
	}

	/**
	 * Resolves one Style-tab section into a styleable scope. Used both for auto-derived aliases
	 * and for aliases a map file declares explicitly by `section_id`.
	 *
	 * @param array<string, mixed> $controls
	 * @return array{label: string, section_id: string, canonical_selector: string, setting_keys: string[]}
	 */
	public static function scope_for_section( array $controls, string $section_id ): array {
		$members = self::sub_selector_members( $controls, $section_id );
		$section = self::sections( $controls )[ $section_id ] ?? [];
		$alias = self::alias_from_section_id( $section_id );

		return [
			'label' => (string) ( $section['label'] ?? $alias ),
			'section_id' => $section_id,
			'canonical_selector' => $members['canonical_selector'],
			'setting_keys' => $members['setting_keys'],
		];
	}

	/**
	 * Controls that style the widget wrapper itself, from any tab. Advanced-tab controls are
	 * wrapper-scoped by design; Style-tab sections also hold wrapper-level controls next to
	 * their sub-part controls (e.g. a "Box" section styling the widget's own padding).
	 *
	 * @param array<string, mixed> $controls
	 * @return string[]
	 */
	public static function wrapper_setting_keys( array $controls ): array {
		$setting_keys = [];

		foreach ( $controls as $setting_key => $control ) {
			if ( ! self::is_setting_control( $setting_key, $control ) ) {
				continue;
			}

			if ( self::is_excluded_advanced_control( $control ) ) {
				continue;
			}

			if ( ! self::has_only_wrapper_selectors( $control ) ) {
				continue;
			}

			$setting_keys[] = $setting_key;
		}

		return $setting_keys;
	}

	/**
	 * Every control that paints something, wrapper-scoped or not. Widgets without inner-element
	 * aliases expose a single flat scope, so their sub-part controls have to stay reachable.
	 *
	 * @param array<string, mixed> $controls
	 * @return string[]
	 */
	public static function styleable_setting_keys( array $controls ): array {
		$setting_keys = [];

		foreach ( $controls as $setting_key => $control ) {
			if ( ! self::is_setting_control( $setting_key, $control ) ) {
				continue;
			}

			if ( self::is_excluded_advanced_control( $control ) || empty( self::selector_templates( $control ) ) ) {
				continue;
			}

			$setting_keys[] = $setting_key;
		}

		return $setting_keys;
	}

	/**
	 * Content-tab controls are data and behavior: the LLM sets them through `element_config`,
	 * not through CSS.
	 *
	 * @param array<string, mixed> $controls
	 * @return string[]
	 */
	public static function non_style_keys( array $controls ): array {
		$setting_keys = [];

		foreach ( $controls as $setting_key => $control ) {
			if ( ! self::is_setting_control( $setting_key, $control ) ) {
				continue;
			}

			$tab = $control['tab'] ?? self::TAB_CONTENT;

			if ( self::TAB_CONTENT !== $tab ) {
				continue;
			}

			$setting_keys[] = $setting_key;
		}

		return $setting_keys;
	}

	/**
	 * @param array<string, mixed> $controls
	 * @return string[]
	 */
	public static function excluded_advanced_keys( array $controls ): array {
		$setting_keys = [];

		foreach ( $controls as $setting_key => $control ) {
			if ( ! self::is_setting_control( $setting_key, $control ) ) {
				continue;
			}

			if ( self::TAB_ADVANCED !== ( $control['tab'] ?? null ) ) {
				continue;
			}

			if ( self::is_excluded_advanced_control( $control ) || ! self::has_only_wrapper_selectors( $control ) ) {
				$setting_keys[] = $setting_key;
			}
		}

		return $setting_keys;
	}

	/**
	 * @param array<string, mixed> $controls
	 */
	public static function is_responsive_setting( string $setting_key, array $controls ): bool {
		$control = $controls[ $setting_key ] ?? null;

		if ( is_array( $control ) ) {
			foreach ( self::RESPONSIVE_MARKER_KEYS as $marker ) {
				if ( array_key_exists( $marker, $control ) ) {
					return true;
				}
			}
		}

		return isset( $controls[ $setting_key . '_tablet' ] ) || isset( $controls[ $setting_key . '_mobile' ] );
	}

	/**
	 * Section ids are inconsistent across widgets (`section_style_dropdown`, `style_toggle`,
	 * `header_style`), so the alias keeps only the meaningful tokens.
	 */
	public static function alias_from_section_id( string $section_id ): string {
		$tokens = array_filter(
			explode( '_', $section_id ),
			static fn( $token ) => '' !== $token && ! in_array( $token, self::ALIAS_NOISE_TOKENS, true )
		);

		$alias = implode( '-', $tokens );

		return '' === $alias ? $section_id : $alias;
	}

	/**
	 * @param array<string, mixed> $controls
	 * @return array<string, array{tab: ?string, label: ?string}>
	 */
	private static function sections( array $controls ): array {
		$sections = [];

		foreach ( $controls as $section_id => $control ) {
			if ( ! is_string( $section_id ) || ! is_array( $control ) || 'section' !== ( $control['type'] ?? null ) ) {
				continue;
			}

			$sections[ $section_id ] = [
				'tab' => $control['tab'] ?? null,
				'label' => $control['label'] ?? null,
			];
		}

		return $sections;
	}

	/**
	 * @param array<string, mixed> $controls
	 * @return array{setting_keys: string[], canonical_selector: string}
	 */
	private static function sub_selector_members( array $controls, string $section_id ): array {
		$setting_keys = [];
		$selector_frequency = [];

		foreach ( $controls as $setting_key => $control ) {
			if ( ! self::is_setting_control( $setting_key, $control ) ) {
				continue;
			}

			if ( ( $control['section'] ?? null ) !== $section_id ) {
				continue;
			}

			$sub_selectors = self::sub_selectors( $control );

			if ( empty( $sub_selectors ) ) {
				continue;
			}

			$setting_keys[] = $setting_key;

			foreach ( $sub_selectors as $selector ) {
				$selector_frequency[ $selector ] = ( $selector_frequency[ $selector ] ?? 0 ) + 1;
			}
		}

		arsort( $selector_frequency );

		return [
			'setting_keys' => $setting_keys,
			'canonical_selector' => (string) ( array_key_first( $selector_frequency ) ?? '' ),
		];
	}

	/**
	 * @param array<string, mixed> $control
	 * @return string[]
	 */
	private static function sub_selectors( array $control ): array {
		$sub_selectors = [];

		foreach ( self::selector_templates( $control ) as $selector_template ) {
			if ( ! self::is_wrapper_scoped_selector( $selector_template ) ) {
				$sub_selectors[ self::normalize_selector( $selector_template ) ] = true;
			}
		}

		return array_keys( $sub_selectors );
	}

	/**
	 * @param array<string, mixed> $control
	 */
	private static function has_only_wrapper_selectors( array $control ): bool {
		$selector_templates = self::selector_templates( $control );

		if ( empty( $selector_templates ) ) {
			return false;
		}

		foreach ( $selector_templates as $selector_template ) {
			if ( ! self::is_wrapper_scoped_selector( $selector_template ) ) {
				return false;
			}
		}

		return true;
	}

	/**
	 * @param array<string, mixed> $control
	 * @return string[]
	 */
	private static function selector_templates( array $control ): array {
		$selectors = $control['selectors'] ?? null;

		if ( ! is_array( $selectors ) ) {
			return [];
		}

		return array_values( array_filter( array_keys( $selectors ), 'is_string' ) );
	}

	/**
	 * A selector is wrapper-scoped when every comma part targets the widget wrapper itself,
	 * optionally with attached state classes or pseudo-classes, and never a descendant.
	 */
	private static function is_wrapper_scoped_selector( string $selector_template ): bool {
		foreach ( explode( ',', $selector_template ) as $part ) {
			$part = self::normalize_selector( $part );

			if ( 1 !== preg_match( '/^' . preg_quote( self::WRAPPER_PLACEHOLDER, '/' ) . '[^\s>+~]*$/', $part ) ) {
				return false;
			}
		}

		return true;
	}

	/**
	 * Drops pseudo-classes and Elementor's device prefix (`(desktop+){{WRAPPER}}`) so selectors
	 * can be compared by the element they target.
	 */
	private static function normalize_selector( string $selector_template ): string {
		$selector_template = preg_replace( '/^\s*\([a-z+\-, ]+\)/i', '', $selector_template ) ?? $selector_template;

		return trim( preg_replace( '/:(hover|focus|focus-within|focus-visible|active)\b/i', '', $selector_template ) ?? '' );
	}

	/**
	 * @param array<string, mixed> $control
	 */
	private static function is_excluded_advanced_control( array $control ): bool {
		return in_array( $control['section'] ?? null, self::EXCLUDED_ADVANCED_SECTIONS, true );
	}

	/**
	 * @param mixed $setting_key
	 * @param mixed $control
	 */
	private static function is_setting_control( $setting_key, $control ): bool {
		if ( ! is_string( $setting_key ) || ! is_array( $control ) ) {
			return false;
		}

		return ! in_array( $control['type'] ?? null, self::STRUCTURAL_CONTROL_TYPES, true );
	}
}
