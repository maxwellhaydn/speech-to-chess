import React, { useEffect, useMemo } from 'react';
import PropTypes from 'prop-types';
import { useSpeechSynthesis } from 'react-speech-kit';

const propTypes = {
    display: PropTypes.string,
    announce: PropTypes.string
};

/**
 * Show the current status of the game (e.g. "Black to move", "Checkmate")
 * and say it out loud with text-to-speech.
 */
const GameStatus = ({ display, announce }) => {
    const { speak, voices } = useSpeechSynthesis();
    const voice = useMemo(() => {
        return voices.find(voice => voice.lang === 'en-US');
    }, [voices]);

    // When status changes, say the new status out loud
    useEffect(() => {
        if (announce) speak({ text: announce, voice });
    }, [announce]);

    return (
        <div className="game-status">
            {display && <h2>{display}</h2>}
        </div>
    );
};

GameStatus.propTypes = propTypes;

export default GameStatus;
