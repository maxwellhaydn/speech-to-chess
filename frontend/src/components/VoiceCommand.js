import React from 'react';
import PropTypes from 'prop-types';
import SpeechRecognition from 'react-speech-recognition';

import ChessNLP from 'chess-nlp';

const parserOptions = {
    aliases: {
        knight: ['night']
    }
};

const parser = new ChessNLP(parserOptions);

const propTypes = {
    finalTranscript: PropTypes.string,
    startListening: PropTypes.func,
    browserSupportsSpeechRecognition: PropTypes.bool,
    recognition: PropTypes.object,
    onChange: PropTypes.func
};

/**
 * Transcribe voice commands to text.
 */
const VoiceCommand = ({
    finalTranscript,
    startListening,
    browserSupportsSpeechRecognition,
    recognition,
    onChange
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

    recognition.lang = 'en-US';

    let move = '',
        errorMessage;

    if (finalTranscript) {
        try {
            move = parser.toSAN(finalTranscript);
        }
        catch (error) {
            errorMessage = `Invalid move: ${finalTranscript}`;
        }
    }

    return (
        <div className="game">
            <button onClick={startListening}>Move</button>
            <span
                className="latest-move"
                onChange={() => onChange()}
            >
                {move}
            </span>
            {errorMessage && <span className="error">{errorMessage}</span>}
        </div>
    );
};

VoiceCommand.propTypes = propTypes;

const options = {
    autoStart: false,
    continuous: false
};

export default SpeechRecognition(options)(VoiceCommand);
