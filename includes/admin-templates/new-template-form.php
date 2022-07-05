<?php

namespace Elementor\Admin_Templates;

use Elementor\Controls_Stack;
use Elementor\New_template_Renderer_factory_Interface;

class New_template_Form extends Controls_Stack {

	/**
	 * @var New_Template_Renderer_Factory_Interface
	 */
	private $new_template_renderer_factory;


	/**
	 * @param array $data
	 * @param New_Template_Renderer_Factory_Interface $new_template_renderer_factory
	 */
	public function __construct( $new_template_renderer_factory, array $data = [] ) {
		parent::__construct( $data );
		$this->new_template_renderer_factory = $new_template_renderer_factory;

	}

	public function get_name() {
		return 'add-template-form';
	}

	public function render_controls() {
		foreach ( $this->get_controls() as $control ) {
			$new_template_control_rendered = $this->new_template_renderer_factory->get_new_template_control_rendered( $control['type'] );
			$new_template_control_rendered->render( $control );
		}
	}
}
