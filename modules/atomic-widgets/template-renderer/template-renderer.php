<?php

namespace Elementor\Modules\AtomicWidgets\TemplateRenderer;

use Elementor\Utils;
use ElementorDeps\Twig\Environment;
use ElementorDeps\Twig\TemplateWrapper;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Template_Renderer {
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
	}

	public static function instance(): self {
		if ( ! isset( self::$instance ) ) {
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
