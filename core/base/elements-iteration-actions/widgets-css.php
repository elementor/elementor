<?php
namespace Elementor\Core\Base\Elements_Iteration_Actions;

use Elementor\Core\Base\Assets_Data_Managers\Widgets_Css as Widgets_Css_Data_Manager;
use Elementor\Element_Base;
use Elementor\Plugin;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}

class Widgets_Css extends Base {
	const ASSETS_DATA_KEY = '_elementor_assets_data';

	/**
	 * @var array - Default value must be empty.
	 */
	private $data_manager;

	public function unique_element_action( Element_Base $element_data ) {
		if ( 'widget' === $element_data->get_type() ) {
			$this->data_manager->init_asset_data( $element_data->get_group_name() );
		}
	}

	public function is_action_needed() {
		return false;
	}

	public function __construct( $document ) {
		parent::__construct( $document );

		$this->data_manager = new Widgets_Css_Data_Manager();
	}
}
