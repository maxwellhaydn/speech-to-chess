import React from 'react';
import PropTypes from 'prop-types';
import SpeechRecognition from 'react-speech-recognition';

import ChessNLP from 'chess-nlp';

const parser = new ChessNLP();

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

    if (! navigator.onLine) {
        return (
            <h2 className="error">
                You appear to be offline. Speech recognition requires an active
                internet connection.
            </h2>
        );
    }

    recognition.lang = 'en';

    let move = '';

    if (transcript) {
        try {
            move = parser.toSAN(transcript);
        }
        catch (error) {
            move = `Invalid move: ${transcript}`;
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
