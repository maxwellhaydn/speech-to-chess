import React from 'react';
import PropTypes from 'prop-types';

import MoveHistoryTableRow from './MoveHistoryTableRow';

const propTypes = {
    moves: PropTypes.arrayOf(PropTypes.string).isRequired
};

const MOVES_PER_ROW = 2;

/**
 * A table showing the move history for a game.
 */
const MoveHistoryTable = ({ moves }) => {
    let i = 0,
        rows = [];

    while (i < moves.length) {
        rows.push(
            <li key={i}>
                <MoveHistoryTableRow
                    moves={moves.slice(i, i + MOVES_PER_ROW)}
                />
            </li>
        );

        i += MOVES_PER_ROW;
    }

    return <ol className="move-history-table">{rows}</ol>;
};

MoveHistoryTable.propTypes = propTypes;

export default MoveHistoryTable;
