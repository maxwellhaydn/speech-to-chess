import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { isNode } from 'browser-or-node';

import MoveHistoryTable from './MoveHistoryTable';

let ChessJS;

/**
 * In CommonJS environments, chess.js exports an object with the Chess
 * constructor as a property, while on AMD environments it exports the Chess
 * constructor directly. Webpack supports both CommonJS and AMD. Due to an issue
 * in chess.js (https://github.com/jhlywa/chess.js/issues/196), you get the AMD
 * export with Webpack, so tests running in Node and code bundled with Webpack
 * cannot both use the same import signature. The following is a temporary
 * workaround until the issue in chess.js is resolved.
 */
if (isNode) {
    const chess = require('chess.js');
    ChessJS = chess.Chess;
}
else {
    ChessJS = require('chess.js');
}

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
