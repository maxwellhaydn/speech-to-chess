import React, { useEffect, useMemo } from 'react';
import PropTypes from 'prop-types';
import { useSpeechSynthesis } from 'react-speech-kit';

const propTypes = {
    status: PropTypes.string
};

/**
 * Show the current status of the game (e.g. "Black to move", "Checkmate")
 * and say it out loud with text-to-speech.
 */
const GameStatus = ({ status }) => {
    const { speak, voices } = useSpeechSynthesis();
    const voice = useMemo(() => {
        return voices.find(voice => voice.lang === 'en-US');
    }, [voices]);

    // When status changes, say the new status out loud
    useEffect(() => {
        if (status) speak({ text: status, voice });
    }, [status]);

    return (
        <div className="game-status">
            {status && <h2>{status}</h2>}
        </div>
    );
};

GameStatus.propTypes = propTypes;

export default GameStatus;
