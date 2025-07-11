<?php

namespace Elementor\Modules\AtomicWidgets\TemplateRenderer;

use Elementor\Plugin;
use ElementorDeps\Twig\Environment;
use ElementorDeps\Twig\TwigFunction;
use ElementorDeps\Twig\Markup;

class Tag_Renderer {


	public static function init( Environment $env ) {
		$env->addFunction( self::get_tag_function() );
		$env->addFunction( self::get_elementor_inject_function() );
	}

	protected static function get_elementor_inject_function() {
		$elementor_inject_function = new TwigFunction('element', function ( $widget_type, $settings ) {
			$settings_json = esc_html( json_encode( $settings ) );
			return new Markup( "<div is=\"elementor-widget\" widget-type=\"{$widget_type}\" settings=\"{$settings_json}\"/>", 'UTF-8' );
		});
		return $elementor_inject_function;
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
