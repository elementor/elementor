<?php

namespace Elementor\Modules\GlobalClasses;

class Global_Classes_Errors {
	public const ITEMS_LIMIT_EXCEEDED = 'ITEMS_LIMIT_EXCEEDED';
	public const INVALID_ITEMS        = 'INVALID_ITEMS';
	public const INVALID_ORDER        = 'INVALID_ORDER';
	public const UNEXPECTED_ERROR     = 'UNEXPECTED_ERROR';

	// Optional granular errors
	public const ITEMS_MISSING        = 'ITEMS_MISSING';
	public const ORDER_MISSING        = 'ORDER_MISSING';
	public const ITEM_ID_MISMATCH     = 'ITEM_ID_MISMATCH';
	public const DUPLICATED_LABEL     = 'DUPLICATED_LABEL';
	public const ORDER_EXCESS_ID      = 'ORDER_EXCESS_ID';
	public const ORDER_MISSING_ID     = 'ORDER_MISSING_ID';
}
