<?php

namespace Elementor\Modules\GlobalClasses;

class Global_Classes_CSS_Preview extends Global_Classes_CSS_File {

	const FILE_PREFIX = 'global-classes-preview-';

	private $meta_cache = [];

	public function is_update_required() {
		return true;
	}

	protected function load_meta() {
		return $this->meta_cache;
	}

	protected function delete_meta() {
		$this->meta_cache = [];
	}

	protected function update_meta( $meta ) {
		$this->meta_cache = $meta;
	}

	protected function get_file_handle_id() {
		return 'elementor-global-classes-preview-' . $this->get_post_id();
	}

	protected function render_css() {
		$this->render( Global_Classes_Repository::CONTEXT_PREVIEW );
	}
}
