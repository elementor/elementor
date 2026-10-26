<?php

namespace Elementor\Modules\Components\ImportExport\ImportStrategies;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Import_Strategy_Result {
	private string $uid;
	private string $title;
	private string $strategy;

	public function __construct( string $uid, string $title, string $strategy ) {
		$this->uid = $uid;
		$this->title = $title;
		$this->strategy = $strategy;
	}

	public function get_uid(): string {
		return $this->uid;
	}

	public function get_title(): string {
		return $this->title;
	}

	public function get_strategy(): string {
		return $this->strategy;
	}
}
