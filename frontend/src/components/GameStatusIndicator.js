import React from 'react';
import PropTypes from 'prop-types';

const propTypes = {
    status: PropTypes.string,
    details: PropTypes.string
};

/**
 * Show the current status of the game (e.g. "Black to move", "Checkmate")
 */
const GameStatusIndicator = ({ status, details }) => {
    return (
        <div className="game-status-indicator">
            {status &&
                <React.Fragment>
                    <h2 className="status">{status}</h2>
                    {details && <h3 className="details">{details}</h3>}
                </React.Fragment>
            }
        </div>
    );
};

GameStatusIndicator.propTypes = propTypes;

export default GameStatusIndicator;
