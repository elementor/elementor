<?php

namespace Elementor\Modules\AtomicWidgets\Elements\Base;

use Elementor\Modules\AtomicWidgets\Elements\TemplateRenderer\Template_Renderer;
use Elementor\Modules\AtomicWidgets\PropTypes\Html\Children\Child_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Html\Html_V3_Prop_Type;
use Elementor\Utils;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

/**
 * @mixin Has_Atomic_Base
 */
trait Has_Span_Children_Template {
	use Has_Template;

	public function get_initial_config() {
		$config = parent::get_initial_config();

		$config['twig_main_template'] = $this->get_main_template();
		$config['twig_templates'] = $this->get_templates_contents();

		return $config;
	}

	protected static function get_html_prop_type(): Html_V3_Prop_Type {
		return Html_V3_Prop_Type::make();
	}

	protected static function get_child_content_prop_type(): Child_Prop_Type {
		return Child_Prop_Type::make();
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

			$children_html = $this->render_children_to_html();

			$context = [
				'id' => $this->get_id(),
				'type' => $this->get_name(),
				'settings' => $this->get_atomic_settings(),
				'base_styles' => $this->get_base_styles_dictionary(),
				'children_html' => $children_html,
				'allowed_tags' => '<b><strong><sup><sub><s><em><u><ul><ol><li><blockquote><a><del><span><br>',
			];
			$template_html = $renderer->render( $this->get_main_template(), $context );

			// phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
			echo $template_html;
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
