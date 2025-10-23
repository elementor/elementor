<?php

namespace Elementor\Modules\AtomicWidgets\Elements;

use Elementor\Modules\AtomicWidgets\TemplateRenderer\Template_Renderer;
use Elementor\Utils;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

/**
 * @mixin Has_Atomic_Base
 */
trait Has_Template {

	public function get_initial_config() {
		$config = parent::get_initial_config();

		$config['twig_main_template'] = $this->get_main_template();
		$config['twig_templates'] = $this->get_templates_contents();

		return $config;
	}

	protected function render() {
		error_log( "🔥🔥🔥 HTMLCACHE_FIX: render() called for " . static::get_element_type() . " ID: " . $this->get_id() );
		
		try {
			$renderer = Template_Renderer::instance();

			foreach ( $this->get_templates() as $name => $path ) {
				if ( $renderer->is_registered( $name ) ) {
					continue;
				}

				$renderer->register( $name, $path );
			}

			$base_styles_dict = $this->get_base_styles_dictionary();
			error_log( "🔥🔥🔥 HTMLCACHE_FIX: base_styles_dictionary = " . json_encode( $base_styles_dict ) );

			$context = [
				'id' => $this->get_id(),
				'type' => $this->get_name(),
				'settings' => $this->get_atomic_settings(),
				'base_styles' => $base_styles_dict,
			];

			error_log( "🔥🔥🔥 HTMLCACHE_FIX: Twig context base_styles = " . json_encode( $context['base_styles'] ) );

			// phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
			$rendered_html = $renderer->render( $this->get_main_template(), $context );
			error_log( "🔥🔥🔥 HTMLCACHE_FIX: Rendered HTML snippet: " . substr( $rendered_html, 0, 200 ) . "..." );
			
			echo $rendered_html;
		} catch ( \Exception $e ) {
			if ( Utils::is_elementor_debug() ) {
				throw $e;
			}
		}
	}

	protected function get_templates_contents() {
		return array_map(
			fn ( $path ) => Utils::file_get_contents( $path ),
			$this->get_templates()
		);
	}

	protected function get_main_template() {
		$templates = $this->get_templates();

		if ( count( $templates ) > 1 ) {
			Utils::safe_throw( 'When having more than one template, you should override this method to return the main template.' );

			return null;
		}

		foreach ( $templates as $key => $path ) {
			// Returns first key in the array.
			return $key;
		}

		return null;
	}

	abstract protected function get_templates(): array;
}
