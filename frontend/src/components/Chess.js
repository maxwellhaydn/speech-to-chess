import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { Chess as ChessJS } from 'chess.js';

import MoveHistoryTable from './MoveHistoryTable';

const propTypes = {
    apiRef: PropTypes.shape({
        current: PropTypes.any
    }).isRequired
};

/**
 * A chess game. Wraps the chess.js library to get things like move validation.
 */
const Chess = ({ apiRef }) => {
    useEffect(() => {
        apiRef.current = new ChessJS();
    }, []);

    return (
        <MoveHistoryTable
            moves={apiRef.current && apiRef.current.history() || []}
        />
    );
};

Chess.propTypes = propTypes;

export default Chess;
