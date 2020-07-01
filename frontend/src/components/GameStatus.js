import React, { useEffect, useMemo } from 'react';
import PropTypes from 'prop-types';
import { useSpeechSynthesis } from 'react-speech-kit';

const propTypes = {
    display: PropTypes.string,
    announce: PropTypes.string,
    moveNumber: PropTypes.number,
};

/**
 * Show the current status of the game (e.g. "Black to move", "Checkmate")
 * and say it out loud with text-to-speech.
 */
const GameStatus = ({ display, announce, moveNumber }) => {
    const { speak, voices } = useSpeechSynthesis();
    const voice = useMemo(() => {
        return voices.find(voice => voice.lang === 'en-US');
    }, [voices]);

    // When status or move number changes, say the new status out loud
    useEffect(() => {
        if (announce) speak({ text: announce, voice });
    }, [announce, moveNumber]);

    return (
        <div className="game-status">
            {display && <h2>{display}</h2>}
        </div>
    );
};

GameStatus.propTypes = propTypes;

export default GameStatus;
