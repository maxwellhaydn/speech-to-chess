import React from 'react';
import PropTypes from 'prop-types';

const propTypes = {
    moves: PropTypes.arrayOf(PropTypes.string).isRequired
};

/**
 * A single row in the MoveHistoryTable. Each row shows up to two moves: one for
 * white and one for black.
 */
const MoveHistoryTableRow = ({ moves }) => {
    return <div className="move-history-table-row">{moves.join(' ')}</div>;
};

MoveHistoryTableRow.propTypes = propTypes;

export default MoveHistoryTableRow;
