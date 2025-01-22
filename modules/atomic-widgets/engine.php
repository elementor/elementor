<?php

namespace Elementor\Modules\AtomicWidgets;

use ElementorDeps\Twig\Environment;
use ElementorDeps\Twig\Loader\ArrayLoader;

class Engine {
	private Environment $twig;

	private ArrayLoader $loader;

	private static $instance;

	public static function get_instance() {
		if ( ! self::$instance ) {
			self::$instance = new self();
		}

		return self::$instance;
	}

	private function __construct() {
		$this->loader = new ArrayLoader();

		$this->twig = new Environment( $this->loader );
	}

	public function register( $key, $template ) {
		$this->loader->setTemplate( $key, $template );

		return $this;
	}

	public function render( string $template, array $data = [] ): string {
		return $this->twig->load( $template )->render( $data );
	}
}
