<?php

namespace Elementor\Modules\AtomicWidgets\Elements\TemplateRenderer;

use Elementor\Utils;
use ElementorDeps\Twig\Environment;
use ElementorDeps\Twig\Runtime\EscaperRuntime;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Template_Renderer {
	private const JS_IDENTIFIER_PATTERN = '/\A[A-Za-z0-9_]+\z/';

	private static ?self $instance = null;

	private Single_File_Loader $loader;

	private Environment $env;

	private function __construct() {
		$this->loader = new Single_File_Loader();

		$this->env = new Environment(
			$this->loader,
			[
				'debug' => Utils::is_elementor_debug(),
				'autoescape' => 'name',
			]
		);

		$escaper = $this->env->getRuntime( EscaperRuntime::class );

		$escaper->setEscaper( 'full_url', 'esc_url' );
		$escaper->setEscaper( 'html_tag', [ Utils::class, 'validate_html_tag' ] );
		$escaper->setEscaper( 'js_identifier', [ self::class, 'escape_js_identifier' ] );
	}

	/**
	 * Element ids are concatenated into Alpine expressions. A hyphen is subtraction
	 * there, so only an identifier character set is returned. Anything else is
	 * dropped and the template renders an empty object instead of the id.
	 *
	 * @param mixed  $value
	 * @param string $charset
	 * @return string
	 */
	public static function escape_js_identifier( $value, $charset ): string {
		unset( $charset );

		if ( ! is_scalar( $value ) ) {
			return '';
		}

		$id = (string) $value;

		if ( 1 === preg_match( self::JS_IDENTIFIER_PATTERN, $id ) ) {
			return $id;
		}

		return '';
	}

	public static function instance(): self {
		if ( null === self::$instance ) {
			self::$instance = new self();
		}

		return self::$instance;
	}

	public static function reset() {
		self::$instance = null;
	}

	public function is_registered( string $name ): bool {
		return $this->loader->is_registered( $name );
	}

	public function register( string $name, string $path ): self {
		$this->loader->register( $name, $path );

		return $this;
	}

	public function render( string $name, array $context = [] ): string {
		return $this->env->render( $name, $context );
	}
}
