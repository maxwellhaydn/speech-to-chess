import React from 'react';
import PropTypes from 'prop-types';
import SpeechRecognition from 'react-speech-recognition';

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
    recognition.lang = 'en';

    if (! browserSupportsSpeechRecognition) {
        return (
            <h2 className="error">
                Your browser doesn't support speech recognition
            </h2>
        );
    }

    return (
        <div className="game">
            <button onClick={startListening}>Move</button>
            <span>{transcript}</span>
        </div>
    );
};

Game.propTypes = propTypes;

const options = {
    autoStart: false,
    continuous: false
};

export default SpeechRecognition(options)(Game);
