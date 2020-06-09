import React from 'react';
import PropTypes from 'prop-types';
import SpeechRecognition from 'react-speech-recognition';

import textToSAN from '../text-to-san';

const propTypes = {
    transcript: PropTypes.string,
    startListening: PropTypes.func,
    browserSupportsSpeechRecognition: PropTypes.bool,
    recognition: PropTypes.object
};

const Game = ({
    transcript,
    startListening,
    browserSupportsSpeechRecognition,
    recognition
}) => {
    if (! browserSupportsSpeechRecognition) {
        return (
            <h2 className="error">
                Your browser doesn't support speech recognition
            </h2>
        );
    }

    recognition.lang = 'en';

    let move = '';

    if (transcript) {
        try {
            move = textToSAN(transcript);
        }
        catch (error) {
            move = 'Invalid move';
        }
    }

    return (
        <div className="game">
            <button onClick={startListening}>Move</button>
            <span>{move}</span>
        </div>
    );
};

Game.propTypes = propTypes;

const options = {
    autoStart: false,
    continuous: false
};

export default SpeechRecognition(options)(Game);
