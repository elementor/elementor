<?php

namespace Elementor\Modules\AtomicWidgets\TemplateRenderer;

use Elementor\Plugin;
use ElementorDeps\Twig\Environment;
use ElementorDeps\Twig\TwigFunction;

class Tag_Renderer {

	protected static $env;

	public static function init( Environment $env ) {
		self::$env = $env;
		$env->addFunction( self::get_tag_function() );
		$env->addFunction( self::get_attributes_function() );
	}

	protected static function get_attributes_function() {
		$attributes_function = new TwigFunction('attrs', function ($ctx) {
			return 'data-e-type="' . $ctx['type'] . '"';
		}, ['needs_context' => true]);
		return $attributes_function;
	}

	protected static function get_tag_function() {
		$tag_renderer_function = new TwigFunction('dynamic_tag', function ( $tag_name ) {
			$tag_info = Plugin::instance()->dynamic_tags->get_tag_info( $tag_name );
			if ( ! $tag_info ) {
				return '';
			}
			$tag_class = $tag_info['class'];
			$tag_instance = new $tag_class();
			return $tag_instance->get_content();
		});
		return $tag_renderer_function;
	}
}
