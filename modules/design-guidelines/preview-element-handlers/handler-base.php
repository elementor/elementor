<?php

namespace Elementor\Modules\DesignGuidelines\PreviewElementHandlers;

use Elementor\Modules\DesignGuidelines\Classes\Element;
use Elementor\Modules\DesignGuidelines\Utils\Elements_Data_Helper;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}

class Handler_Base {

	/**
	 * @var Elements_Data_Helper
	 */
	protected Elements_Data_Helper $helper;

	protected array $selectors;

	protected array $elements_data;

	public function __construct( $elements_helper, array $selectors, array $elements_data ) {
		$this->helper = $elements_helper;
		$this->selectors = $selectors;
		$this->elements_data = [ 'elements' => $elements_data ];
	}

	public function get_selector( string $selector ): string {
		return $this->selectors[ $selector ];
	}

	public function create_custom_title( $default_model, $title_text ): Element {
		$title = new Element( $default_model, $this->helper );

		$title->set_settings( [
			'title' => $title_text,
		] );

		return $title;
	}


	public function get_default_title(): ?array {
		return $this->helper->find_element_by_id( $this->elements_data, $this->get_selector( 'default_title_container' ) );
	}
}

