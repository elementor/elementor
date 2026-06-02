<?php

namespace Elementor\Modules\Audits\Audits;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

abstract class Audit_Descriptor {

	const SEVERITY_ERROR = 'error';
	const SEVERITY_WARNING = 'warning';
	const SEVERITY_INFO = 'info';

	const CATEGORY_HEALTH = 'health';
	const CATEGORY_SEO = 'seo';
	const CATEGORY_ACCESSIBILITY = 'accessibility';
	const CATEGORY_PERFORMANCE = 'performance';

	abstract public function get_id(): string;

	abstract public function get_title(): string;

	abstract public function get_description(): string;

	abstract public function get_fix_hint(): string;

	/**
	 * @return string[] One or more category constants from CATEGORY_*.
	 */
	abstract public function get_categories(): array;

	/**
	 * @return string One of SEVERITY_ERROR, SEVERITY_WARNING, SEVERITY_INFO.
	 */
	abstract public function get_severity(): string;

	abstract public function get_weight(): int;

	public function is_visible(): bool {
		return true;
	}

	public function to_array(): array {
		return [
			'id'          => $this->get_id(),
			'title'       => $this->get_title(),
			'description' => $this->get_description(),
			'fixHint'     => $this->get_fix_hint(),
			'categories'  => $this->get_categories(),
			'severity'    => $this->get_severity(),
			'weight'      => $this->get_weight(),
		];
	}
}
