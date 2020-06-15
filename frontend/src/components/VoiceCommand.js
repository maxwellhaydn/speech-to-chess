import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import SpeechRecognition from 'react-speech-recognition';

const propTypes = {
    finalTranscript: PropTypes.string,
    startListening: PropTypes.func,
    browserSupportsSpeechRecognition: PropTypes.bool,
    recognition: PropTypes.object,
    onCommand: PropTypes.func
};

/**
 * Transcribe voice commands to text.
 */
const VoiceCommand = ({
    finalTranscript,
    startListening,
    browserSupportsSpeechRecognition,
    recognition,
    onCommand
}) => {
    useEffect(() => {
        if (finalTranscript) {
            onCommand(finalTranscript);
        }
    }, [finalTranscript, onCommand]);

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

    return (
        <div className="voice-command">
            <button onClick={startListening}>Issue voice command</button>
        </div>
    );
};

VoiceCommand.propTypes = propTypes;

const options = {
    autoStart: false,
    continuous: false
};

export default SpeechRecognition(options)(VoiceCommand);
