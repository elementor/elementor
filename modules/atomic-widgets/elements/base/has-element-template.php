<?php

namespace Elementor\Modules\AtomicWidgets\Elements\Base;

use Elementor\Modules\AtomicWidgets\Elements\TemplateRenderer\Template_Renderer;
use Elementor\Utils;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Trait for nested elements that render using Twig templates.
 * Provides Twig-based rendering with children support for nested elements.
 *
 * @mixin Has_Atomic_Base
 * @mixin Atomic_Element_Base
 */
trait Has_Element_Template {

	public function get_initial_config() {
		$config = parent::get_initial_config();

		$config['support_nesting'] = true;
		$config['twig_main_template'] = $this->get_main_template();
		$config['twig_templates'] = $this->get_templates_contents();
		$config['base_styles_dictionary'] = $this->get_base_styles_dictionary();

		return $config;
	}

	protected function get_templates_contents() {
		return array_map(
			fn ( $path ) => Utils::file_get_contents( $path ),
			$this->get_templates()
		);
	}

	protected function render() {
		try {
			$renderer = Template_Renderer::instance();

			foreach ( $this->get_templates() as $name => $path ) {
				if ( $renderer->is_registered( $name ) ) {
					continue;
				}

				$renderer->register( $name, $path );
			}

			$context = $this->build_template_context();
			$template_html = $renderer->render( $this->get_main_template(), $context );
			$children_html = $this->render_children_to_html();
			$output = str_replace( $this->get_children_placeholder(), $children_html, $template_html );

			// phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
			echo $output;
		} catch ( \Exception $e ) {
			if ( Utils::is_elementor_debug() ) {
				throw $e;
			}
		}
	}

	protected function render_children_to_html(): string {
		$html = '';

		foreach ( $this->get_children() as $child ) {
			ob_start();
			$child->print_element();
			$html .= ob_get_clean();
		}

		return $html;
	}

	protected function get_children_placeholder(): string {
		return '<!-- elementor-children-placeholder -->';
	}

	protected function build_base_template_context(): array {
		return [
			'id' => $this->get_id(),
			'type' => $this->get_name(),
			'settings' => $this->get_atomic_settings(),
			'base_styles' => $this->get_base_styles_dictionary(),
			'children_placeholder' => $this->get_children_placeholder(),
		];
	}

	public function before_render() {
		// Intentionally empty - Twig template handles full rendering
	}

	public function after_render() {
		// Intentionally empty - Twig template handles full rendering
	}

	public function print_content() {
		$defined_context = $this->define_render_context();

		if ( empty( $defined_context ) ) {
			return $this->render();
		}

		$this->set_render_context( $defined_context );

		$this->render();

		$this->clear_render_context( $defined_context );
	}

	protected function get_main_template(): string {
		$templates = $this->get_templates();

		foreach ( $templates as $key => $path ) {
			return $key;
		}

		return '';
	}

	abstract protected function get_templates(): array;

	protected function build_template_context(): array {
		return $this->build_base_template_context();
	}
}
