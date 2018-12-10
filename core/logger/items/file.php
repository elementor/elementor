<?php

namespace Elementor\Core\Logger\Items;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}

class File extends Base {

	const FORMAT = 'File :date [type] message [file::line] X times';

	protected $file;
	protected $line;

	public function __construct( $args ) {
		parent::__construct( $args );

		$this->file = $args['file'];
		$this->line = $args['line'];
	}
}
