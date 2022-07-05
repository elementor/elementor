<?php

namespace Elementor;

use Exception;

require_once __DIR__ . '/interfaces/new-template-renderer-factory-interface.php';
require_once __DIR__ . '/control-renderers/new-template-select-renderer.php';

class New_Template_Renderer_Factory implements New_Template_Renderer_Factory_Interface {


	/**
	 * @var array
	 */
	private $renderers;

	/**
	 * @param string $control_type
	 * @return New_Template_Renderer_Interface
	 * @throws Exception
	 */
	public function get_new_template_control_rendered( $control_type ) {
		switch ( $control_type ) {
			case Controls_Manager::SELECT:
				if ( ! isset( $this->renderers[ Controls_Manager::SELECT ] ) ) {
					$this->renderers[ Controls_Manager::SELECT ] = new New_Template_Select_Renderer();
				}
				return $this->renderers[ Controls_Manager::SELECT ];
			default:
				throw new Exception( 'not supported control type' );

		}
	}


}
