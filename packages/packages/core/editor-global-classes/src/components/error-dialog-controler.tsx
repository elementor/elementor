import { openDialog } from "@elementor/editor-global-dialog";
import * as React from "react";
import { API_ERROR_CODES } from "../api";
import { DuplicateLabelDialog } from "./class-manager/duplicate-label-dialog";

export type ErrorDialogData = {
        message: string;
  code: typeof API_ERROR_CODES | string;
  data: {
    status: number;
    meta: {
      key: string; // The duplicated label
      duplicated_label: string;
    }
        }
}

export const showErrorDialog = (data: ErrorDialogData) => {
  
	const { code,data:{meta} } = data;
	if ( code === API_ERROR_CODES.DUPLICATED_LABEL ) {
		 openDialog( {
		 	title: 'ERROR',
		 	component: <DuplicateLabelDialog id={ meta.key } />,
		 } );
	}
};