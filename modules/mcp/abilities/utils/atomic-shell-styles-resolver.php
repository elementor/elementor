<?php

namespace Elementor\Modules\Mcp\Abilities\Utils;

use Elementor\Core\Files\CSS\Post as Post_CSS;
use Elementor\Plugin;
use Elementor\Utils;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Resolves the styles every atomic element gets from the `.e-con` class, the same way the
 * browser does: the rules are read from the loaded frontend stylesheet and the active kit CSS,
 * `var()` references are resolved per breakpoint, and declarations without a visible effect are
 * dropped. Top-level elements also get the document-root `.e-con` rule.
 */
class Atomic_Shell_Styles_Resolver {

	const FRONTEND_STYLESHEET = 'frontend.min.css';
	const SHELL_SELECTOR = '.e-con';
	const DOCUMENT_ROOT_SHELL_SELECTOR = ':is(.elementor-section-wrap,[data-elementor-id])>.e-con';
	const DESKTOP_MEDIA = '';
	const CUSTOM_PROPERTY_PREFIX = '--';
	const MAX_VARIABLE_DEPTH = 10;
	const CSS_WIDE_KEYWORDS = [ 'initial', 'inherit', 'unset', 'revert', 'revert-layer' ];
	const OMITTED_PROPERTY_PREFIXES = [ 'transition' ];
	const ZERO_VALUE_PROPERTY_PREFIXES = [ 'margin', 'padding' ];
	const ZERO_VALUES = [ '0', '0px' ];
	const INITIAL_VALUES = [
		'height' => 'auto',
		'width' => 'auto',
		'overflow' => 'visible',
		'position' => 'static',
		'max-width' => 'none',
		'border-radius' => '0',
	];

	private static ?self $instance = null;

	private Css_Rule_Reader $rule_reader;

	/**
	 * @var array<int, array{media: string, is_document_root: bool, declarations: array<int, array{property: string, value: string}>}>
	 */
	private array $shell_rules = [];

	/**
	 * @param string[] $stylesheets CSS sources in cascade order.
	 */
	public function __construct( array $stylesheets ) {
		$this->rule_reader = new Css_Rule_Reader();

		foreach ( $stylesheets as $css ) {
			foreach ( $this->rule_reader->read( $css ) as $rule ) {
				$this->collect_shell_rule( $rule );
			}
		}
	}

	public static function make(): self {
		if ( null === self::$instance ) {
			self::$instance = new self( self::load_stylesheets() );
		}

		return self::$instance;
	}

	public static function set_instance( ?self $instance ): void {
		self::$instance = $instance;
	}

	public function to_map(): array {
		return $this->filter_visible( $this->resolve( self::DESKTOP_MEDIA, false ) );
	}

	public function to_css_string( bool $is_document_root = false ): string {
		$desktop = $this->resolve( self::DESKTOP_MEDIA, $is_document_root );
		$blocks = [ $this->format_rule( $this->filter_visible( $desktop ) ) ];

		foreach ( $this->get_breakpoint_media() as $media ) {
			$changed_rule = $this->format_rule( array_diff_assoc( $this->resolve( $media, $is_document_root ), $desktop ) );

			if ( '' !== $changed_rule ) {
				$blocks[] = '@media ' . $media . '{' . $changed_rule . '}';
			}
		}

		return implode( "\n", array_filter( $blocks ) );
	}

	private function collect_shell_rule( array $rule ): void {
		$is_shell = in_array( self::SHELL_SELECTOR, $rule['selectors'], true );
		$is_document_root = in_array( self::DOCUMENT_ROOT_SHELL_SELECTOR, $rule['selectors'], true );

		if ( ! $is_shell && ! $is_document_root ) {
			return;
		}

		$this->shell_rules[] = [
			'media' => $rule['media'],
			'is_document_root' => ! $is_shell,
			'declarations' => $rule['declarations'],
		];
	}

	private function get_breakpoint_media(): array {
		$media = array_unique( array_column( $this->shell_rules, 'media' ) );

		return array_values( array_filter( $media, fn( $condition ) => self::DESKTOP_MEDIA !== $condition ) );
	}

	/**
	 * Document-root rules are more specific than `.e-con`, so they apply after it.
	 *
	 * @return array<string, string> Resolved property => value, without custom properties.
	 */
	private function resolve( string $media, bool $is_document_root ): array {
		$applicable = array_filter(
			$this->shell_rules,
			fn( $rule ) => in_array( $rule['media'], [ self::DESKTOP_MEDIA, $media ], true )
				&& ( ! $rule['is_document_root'] || $is_document_root )
		);

		usort( $applicable, fn( $a, $b ) => (int) $a['is_document_root'] - (int) $b['is_document_root'] );

		$variables = [];
		$properties = [];

		foreach ( $applicable as $rule ) {
			foreach ( $rule['declarations'] as $declaration ) {
				if ( str_starts_with( $declaration['property'], self::CUSTOM_PROPERTY_PREFIX ) ) {
					$variables[ $declaration['property'] ] = $declaration['value'];
					continue;
				}

				$properties[ $declaration['property'] ] = $declaration['value'];
			}
		}

		$resolved = array_map( fn( $value ) => $this->resolve_value( $value, $variables ), $properties );

		return array_filter( $resolved, fn( $value, $property ) => $this->is_meaningful( $property, $value ), ARRAY_FILTER_USE_BOTH );
	}

	private function resolve_value( string $value, array $variables, int $depth = 0 ): ?string {
		$start = strpos( $value, 'var(' );

		if ( false === $start ) {
			return $value;
		}

		$end = $this->rule_reader->find_closing( $value, $start + strlen( 'var' ), '(', ')' );

		if ( null === $end || $depth >= self::MAX_VARIABLE_DEPTH ) {
			return null;
		}

		$arguments = substr( $value, $start + strlen( 'var(' ), $end - $start - strlen( 'var(' ) );
		$separator = strpos( $arguments, ',' );
		$name = trim( false === $separator ? $arguments : substr( $arguments, 0, $separator ) );
		$fallback = false === $separator ? null : trim( substr( $arguments, $separator + 1 ) );

		$replacement = isset( $variables[ $name ] ) ? $this->resolve_value( $variables[ $name ], $variables, $depth + 1 ) : null;

		if ( null === $replacement && null !== $fallback ) {
			$replacement = $this->resolve_value( $fallback, $variables, $depth + 1 );
		}

		if ( null === $replacement ) {
			return null;
		}

		return $this->resolve_value( substr( $value, 0, $start ) . $replacement . substr( $value, $end + 1 ), $variables, $depth );
	}

	private function is_meaningful( string $property, ?string $value ): bool {
		if ( null === $value || in_array( strtolower( $value ), self::CSS_WIDE_KEYWORDS, true ) ) {
			return false;
		}

		return ! $this->starts_with_any( $property, self::OMITTED_PROPERTY_PREFIXES );
	}

	private function filter_visible( array $properties ): array {
		return array_filter(
			$properties,
			fn( $value, $property ) => ! $this->is_initial_value( $property, $value ),
			ARRAY_FILTER_USE_BOTH
		);
	}

	private function is_initial_value( string $property, string $value ): bool {
		if ( $this->starts_with_any( $property, self::ZERO_VALUE_PROPERTY_PREFIXES ) ) {
			return in_array( $value, self::ZERO_VALUES, true );
		}

		return ( self::INITIAL_VALUES[ $property ] ?? null ) === $value;
	}

	private function starts_with_any( string $property, array $prefixes ): bool {
		foreach ( $prefixes as $prefix ) {
			if ( str_starts_with( $property, $prefix ) ) {
				return true;
			}
		}

		return false;
	}

	private function format_rule( array $properties ): string {
		if ( empty( $properties ) ) {
			return '';
		}

		$declarations = array_map( fn( $property, $value ) => $property . ':' . $value . ';', array_keys( $properties ), $properties );

		return self::SHELL_SELECTOR . '{' . implode( '', $declarations ) . '}';
	}

	private static function load_stylesheets(): array {
		return array_values( array_filter( [
			self::read_frontend_stylesheet(),
			self::read_kit_stylesheet(),
		] ) );
	}

	private static function read_frontend_stylesheet(): string {
		$path = Plugin::$instance->frontend->get_frontend_file_path(
			self::FRONTEND_STYLESHEET,
			Plugin::$instance->breakpoints->has_custom_breakpoints()
		);

		return is_readable( $path ) ? (string) Utils::file_get_contents( $path ) : '';
	}

	private static function read_kit_stylesheet(): string {
		$kit_id = Plugin::$instance->kits_manager->get_active_id();

		return $kit_id ? (string) Post_CSS::create( $kit_id )->get_content() : '';
	}
}
