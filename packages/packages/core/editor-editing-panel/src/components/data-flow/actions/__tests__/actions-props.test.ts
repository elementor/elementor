import {
  actionsToProps,
  type ArgPropType,
  type PlainAction,
  propsToActions,
} from '../actions-props';

const ARGS_SCHEMA: Record< string, Record< string, ArgPropType > > = {
  'class/toggle': {
    class_name: { kind: 'plain', key: 'string' },
    equals: {
      kind: 'union',
      prop_types: {
        boolean: { kind: 'plain', key: 'boolean' },
        string: { kind: 'plain', key: 'string' },
      },
    },
  },
  'state/cycle': {
    key: { kind: 'plain', key: 'string' },
    values: { kind: 'array', key: 'string-array' },
  },
};

const getArgsSchema = ( name: string ) => ARGS_SCHEMA[ name ] ?? {};

describe( 'actions props', () => {
  it( 'should convert an event action to props typed by the action args schema', () => {
    // Arrange
    const actions: PlainAction[] = [
      { on: 'state', key: 'tab', do: 'class/toggle', args: { class_name: 'is-active', equals: 2 } },
    ];

    // Act
    const [ item ] = actionsToProps( actions, getArgsSchema );

    // Assert
    expect( item ).toEqual( {
      $$type: 'event-action',
      value: {
        on: { $$type: 'string', value: 'state' },
        key: { $$type: 'string', value: 'tab' },
        action: {
          $$type: 'action-call',
          value: {
            name: { $$type: 'string', value: 'class/toggle' },
            args: {
              $$type: 'action-args',
              value: {
                class_name: { $$type: 'string', value: 'is-active' },
                equals: { $$type: 'number', value: 2 },
              },
            },
          },
        },
      },
    } );
  } );

  it( 'should convert string lists to string-array props', () => {
    // Act
    const [ item ] = actionsToProps(
      [ { on: 'click', do: 'state/cycle', args: { key: 'tab', values: [ 'one', 'two' ] } } ],
      getArgsSchema
    );

    // Assert
    const args = ( item.value.action as { value: { args: { value: Record< string, unknown > } } } )
      .value.args.value;
    expect( args.values ).toEqual( {
      $$type: 'string-array',
      value: [
        { $$type: 'string', value: 'one' },
        { $$type: 'string', value: 'two' },
      ],
    } );
  } );

  it( 'should round trip event and input actions', () => {
    // Arrange
    const actions: PlainAction[] = [
      { on: 'click', do: 'state/cycle', args: { key: 'tab', values: [ 'one', 'two' ] } },
      {
        input: 'pointer',
        space: 'local',
        reducedMotion: 'run',
        write: {
          tilt_x: {
            from: 'y',
            map: [ -1, 1, 10, -10 ],
            clamp: false,
            round: 2,
            spring: { damping: 18 },
          },
          glow: { from: 'inside', smooth: 0.9 },
        },
      },
    ];

    // Act
    const roundTripped = propsToActions( actionsToProps( actions, getArgsSchema ) );

    // Assert
    expect( roundTripped ).toEqual( actions );
  } );
} );
