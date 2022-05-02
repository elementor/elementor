<?php
namespace Elementor\Modules\Usage\GlobalUsage;

use Elementor\Modules\Usage\Collection\DocumentSettingsUsage;
use Elementor\Modules\Usage\Module;

class Global_Documents_Usage extends Base_Global_Usage {

	public function get_collection_class() {
		return DocumentSettingsUsage::class;
	}

	public function get_option_name() {
		return Module::DOCUMENT_OPTION_NAME;
	}
}
