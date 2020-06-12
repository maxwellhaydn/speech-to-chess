import React, { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { Chess as ChessJS } from 'chess.js';

import MoveHistoryTable from './MoveHistoryTable';

const propTypes = {};

/**
 * A chess game. Wraps the chess.js library to get things like move validation.
 */
const Chess = (props) => {
    const game = useRef(new ChessJS());

    return <MoveHistoryTable moves={game.current.history()} />;
};

Chess.propTypes = propTypes;

export default Chess;
