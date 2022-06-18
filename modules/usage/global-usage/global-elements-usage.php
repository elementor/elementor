<?php
namespace Elementor\Modules\Usage\GlobalUsage;

use Elementor\Modules\Usage\Collection\DocumentElementsUsage;
use Elementor\Modules\Usage\Module;

class Global_Elements_Usage extends Base_Global_Usage {

	public function get_collection_class() {
		return DocumentElementsUsage::class;
	}

	public function get_option_name() {
		return Module::ELEMENTS_OPTION_NAME;
	}
}
