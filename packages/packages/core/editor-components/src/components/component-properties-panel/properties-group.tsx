import * as React from 'react';
import { useEffect, useId, useRef } from 'react';
import { useStateByElement } from '@elementor/editor-editing-panel';
import { getWidgetsCache } from '@elementor/editor-elements';
import { CollapseIcon, EditableField, useEditable, WarningInfotip } from '@elementor/editor-ui';
import { DotsVerticalIcon } from '@elementor/icons';
import {
	Box,
	Collapse,
	Divider,
	IconButton,
	ListItemButton,
	ListItemText,
	Stack,
	type Theme,
	Typography,
} from '@elementor/ui';

import { type OverridableProp, type OverridablePropsGroup } from '../../types';

type Props = {
	group: OverridablePropsGroup;
	props: Record< string, OverridableProp >;
	allowEmpty?: boolean;
	isEditing?: boolean;
	onRename?: ( label: string ) => void;
	validateLabel?: ( label: string ) => string | null;
};

export function PropertiesGroup( {
	group,
	props,
	allowEmpty = false,
	isEditing = false,
	onRename,
	validateLabel,
}: Props ) {
	const [ isOpen, setIsOpen ] = useStateByElement( group.id, false );

	const handleClick = () => {
		setIsOpen( ! isOpen );
	};

	const id = useId();
	const labelId = `label-${ id }`;
	const contentId = `content-${ id }`;

	const title = group.label;
	const ariaTitle = title || group.id;

	const groupProps = group.props.map( ( propId ) => props[ propId ] ).filter( Boolean );

	if ( groupProps.length === 0 && ! allowEmpty ) {
		return null;
	}

	return (
		<>
			<ListItemButton
				id={ labelId }
				aria-controls={ contentId }
				aria-label={ `${ ariaTitle } section` }
				onClick={ isEditing ? undefined : handleClick }
				sx={ {
					px: 1.5,
					py: 0.75,
					minHeight: 27,
					'&:hover': { backgroundColor: 'transparent' },
				} }
			>
				<Stack direction="row" alignItems="center" justifyContent="space-between" flexGrow={ 1 }>
					{ onRename && validateLabel ? (
						<EditableGroupTitle
							label={ title }
							isEditing={ isEditing }
							onRename={ onRename }
							validateLabel={ validateLabel }
						/>
					) : (
						<ListItemText
							primary={ title }
							primaryTypographyProps={ {
								variant: 'body2',
								fontWeight: 500,
								color: 'text.primary',
							} }
						/>
					) }
					<Stack direction="row" alignItems="center" gap={ 0.5 }>
						<IconButton
							size="tiny"
							onClick={ ( e: React.MouseEvent ) => {
								e.stopPropagation();
							} }
							aria-label="More options"
						>
							<DotsVerticalIcon fontSize="tiny" />
						</IconButton>
						<CollapseIcon open={ isOpen } color="secondary" fontSize="tiny" />
					</Stack>
				</Stack>
			</ListItemButton>
			<Collapse id={ contentId } aria-labelledby={ labelId } in={ isOpen } timeout="auto">
				<Stack direction="column" gap={ 0.5 } px={ 1.5 } pb={ 1 }>
					{ groupProps.map( ( prop ) => (
						<PropertyItem key={ prop.overrideKey } prop={ prop } />
					) ) }
				</Stack>
			</Collapse>
			<Divider />
		</>
	);
}

type EditableGroupTitleProps = {
	label: string;
	isEditing: boolean;
	onRename: ( label: string ) => void;
	validateLabel: ( label: string ) => string | null;
};

function EditableGroupTitle( { label, isEditing, onRename, validateLabel }: EditableGroupTitleProps ) {
	const itemRef = useRef< HTMLElement >( null );
	const {
		ref: editableRef,
		openEditMode,
		isEditing: isEditingInternal,
		error,
		getProps: getEditableProps,
	} = useEditable( {
		value: label,
		onSubmit: ( newLabel: string ) => onRename( newLabel ),
		validation: validateLabel,
	} );

	useEffect( () => {
		if ( isEditing ) {
			openEditMode();
		}
	}, [ isEditing, openEditMode ] );

	const showEditor = isEditing || isEditingInternal;

	return (
		<WarningInfotip
			open={ Boolean( error ) }
			text={ error ?? '' }
			placement="bottom"
			width={ itemRef.current?.getBoundingClientRect().width }
			offset={ [ 0, -15 ] }
		>
			<TitleIndicator ref={ itemRef } isActive={ showEditor } isError={ Boolean( error ) }>
				{ showEditor ? (
					<EditableField
						ref={ editableRef }
						as={ Typography }
						variant="body2"
						{ ...getEditableProps() }
						onClick={ ( e: React.MouseEvent ) => e.stopPropagation() }
					/>
				) : (
					<Typography
						variant="body2"
						sx={ { color: 'text.primary', fontWeight: 500, flexGrow: 1, minWidth: 0 } }
						noWrap
						onDoubleClick={ ( e: React.MouseEvent ) => {
							e.stopPropagation();
							openEditMode();
						} }
					>
						{ label }
					</Typography>
				) }
			</TitleIndicator>
		</WarningInfotip>
	);
}

const TitleIndicator = React.forwardRef<
	HTMLElement,
	React.PropsWithChildren< { isActive: boolean; isError: boolean } >
>( function TitleIndicator( { children, isActive, isError }, ref ) {
	return (
		<Box
			ref={ ref }
			sx={ ( theme: Theme ) => ( {
				display: 'flex',
				width: '100%',
				flexGrow: 1,
				minWidth: 0,
				borderRadius: theme.spacing( 0.5 ),
				border: getTitleBorder( { isActive, isError, theme } ),
				padding: `0 ${ theme.spacing( 1 ) }`,
			} ) }
		>
			{ children }
		</Box>
	);
} );

const getTitleBorder = ( { isActive, isError, theme }: { isActive: boolean; isError: boolean; theme: Theme } ) => {
	if ( isError ) {
		return `2px solid ${ theme.palette.error.main }`;
	}

	if ( isActive ) {
		return `2px solid ${ theme.palette.secondary.main }`;
	}

	return 'none';
};

function PropertyItem( { prop }: { prop: OverridableProp } ) {
	const elementType = prop.elType === 'widget' ? prop.widgetType : prop.elType;
	const icon = getElementIcon( elementType );

	return (
		<Box
			sx={ {
				px: 1.25,
				py: 0.75,
				minHeight: 27,
				borderRadius: 1,
				backgroundColor: 'background.paper',
				border: '1px solid',
				borderColor: 'divider',
				display: 'flex',
				alignItems: 'center',
				gap: 1,
				'&:hover': {
					backgroundColor: 'action.hover',
				},
			} }
		>
			<Box sx={ { display: 'flex', alignItems: 'center', color: 'text.secondary', fontSize: '14px' } }>
				<i className={ icon } />
			</Box>
			<Typography variant="body2" sx={ { color: 'text.primary', flexGrow: 1, fontSize: 12 } }>
				{ prop.label }
			</Typography>
		</Box>
	);
}

function getElementIcon( elType: string ): string {
	const widgetsCache = getWidgetsCache();

	if ( ! widgetsCache ) {
		return 'eicon-apps';
	}

	const widgetConfig = widgetsCache[ elType ];

	return widgetConfig?.icon || 'eicon-apps';
}
