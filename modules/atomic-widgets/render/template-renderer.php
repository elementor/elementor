<?php

namespace Elementor\Modules\AtomicWidgets\render;

use ElementorDeps\Twig\Environment;
use ElementorDeps\Twig\Loader\FilesystemLoader;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Template_Renderer {
	private static self $instance;

	private $loader;

	private $env;

	public static function instance(): self {
		if ( ! isset( self::$instance ) ) {
			self::$instance = new self();
		}

		return self::$instance;
	}

	private function __construct() {
		$this->loader = new FilesystemLoader();
		$this->env = new Environment( $this->loader );
	}

	public function render() {

	}
}
