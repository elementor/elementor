<?php

namespace Elementor\Modules\Components\ImportExportCustomization\Runners;

use Elementor\App\Modules\ImportExportCustomization\Runners\Import\Import_Runner_Base;
use Elementor\Modules\Components\Documents\Component as Component_Document;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Import extends Import_Runner_Base {
	public static function get_name(): string {
		return 'components';
	}

	public function should_import( array $data ) {
		return (
			in_array( 'content', $data['include'] ?? [], true ) &&
			! empty( $data['manifest']['content'][ Component_Document::TYPE ] ) &&
			! empty( $data['extracted_directory_path'] )
		);
	}

	public function import( array $data, array $imported_data ) {
		return $this->skip();
	}

	private function skip(): array {
		return [];
	}
}
