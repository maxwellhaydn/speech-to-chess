import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useSpeechRecognition } from 'react-speech-kit';
import useChess from 'react-chess.js';
import ChessNLP from 'chess-nlp';
import Chessboard from 'react-simple-chessboard';
import Button from 'react-bootstrap/Button';
import Container from 'react-bootstrap/Container';
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';

import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

import GameStatus from './GameStatus';
import MoveHistoryTable from './MoveHistoryTable';

// Add aliases for sounds that Google Chrome's Web Speech API implementation
// often gets wrong
const parserOptions = {
    aliases: {
        knight: ['night'],
        rook: [
            'brooke', 'brooks', 'brookdale', 'brook', 'work', 'route', 'rough',
            'trucks', 'truck', 'ruck', 'rupp', 'rupt', 'rocket', 'rockstar',
            'rock', 'rugs', 'rug', 'look', 'ruff'
        ],
        king: ['teen'],
        a: ['alpha', 'office', 'off of', 'also'],
        b: ['bravo', 'beta', 'beat', 'bee', 'be'],
        c: ['charlie', 'sea', 'see'],
        d: ['delta', 'the'],
        e: ['echo', 'eat'],
        f: ['foxtrot', 'at', 'of'],
        g: ['golf', 'gulf'],
        h: ['hotel', 'stage', 'age', 'its', 'each'],
        2: ['too'],
        4: ['force', 'for', 'far', 'park', 'store', 'fork'],
        5: ['v', 'psi'],
        6: ['sex'],
    }
};

const parser = new ChessNLP(parserOptions);

/**
 * A chess game played with voice commands.
 */
const App = (props) => {
    const [status, setStatus] = useState({});
    const [waitingForVoiceCommand, setWaitingForVoiceCommand] = useState(false);
    const voiceCommandTimeout = useRef(null);
    const stopListeningRef = useRef(null);

    const handleLegalMove = (move) => {
        const moveDesc = parser.sanToText(move);
        setStatus({ display: `Moved ${move}`, announce: `Moved ${moveDesc}` });
    };

    const handleIllegalMove = (move) => {
        const moveDesc = parser.sanToText(move);
        setStatus({
            display: `Illegal move: ${move}`,
            announce: `Illegal move: ${moveDesc}`
        });
    };

    const handleGameOver = () => {
        const status = 'Game over';
        setStatus({ display: status, announce: status });
    };

    const { move: makeMove, undo, reset, history, fen } = useChess({
        onLegalMove: handleLegalMove,
        onIllegalMove: handleIllegalMove,
        onGameOver: handleGameOver
    });

    const handleVoiceCommand = useCallback((command) => {
        let status;
        setWaitingForVoiceCommand(false);

        switch (command) {
            case 'undo':
                undo();
                status = 'Undid last move';
                setStatus({ display: status, announce: status });
                return;
            case 'reset':
                reset();
                status = 'Reset game';
                setStatus({ display: status, announce: status });
                return;
            default:
                let move;

                try {
                    move = parser.textToSan(command);
                }
                catch (error) {
                    status = `I don't understand: ${command}`;
                    setStatus({ display: status, announce: status });
                    return;
                }

                makeMove(move);
        }
    }, [makeMove, reset, undo]);

    const {
        listen,
        listening,
        stop: stopListening,
        supported: speechRecognitionSupported
    } = useSpeechRecognition({
        onResult: handleVoiceCommand
    });

    // Workaround for issue in react-speech-kit to make sure we always have the
    // latest version of the callback to stop listening
    // https://github.com/MikeyParton/react-speech-kit/issues/31
    useEffect(() => {
        stopListeningRef.current = stopListening;
    }, [stopListening]);

    // When we recognize that the user has issued a new voice command, cancel
    // the voice command timeout and stop listening
    useEffect(() => {
        if (listening && ! waitingForVoiceCommand) {
            clearTimeout(voiceCommandTimeout.current);
            stopListening();
        }
    }, [listening, stopListening, voiceCommandTimeout, waitingForVoiceCommand]);

    const handleClick = useCallback(() => {
        // Cancel current active timeout. If there isn't one, this will
        // silently do nothing
        clearTimeout(voiceCommandTimeout.current);

        setWaitingForVoiceCommand(true);

        // Give the user 5 seconds to say something after pushing the voice
        // command button
        voiceCommandTimeout.current = setTimeout(() => {
             stopListeningRef.current();
             setWaitingForVoiceCommand(false);
        }, 5000);

        listen({ interimResults: false, lang: 'en-US' });
    }, [listen, stopListeningRef, voiceCommandTimeout]);

    if (! speechRecognitionSupported) {
        return (
            <h2 className="error">
                Your browser doesn't support speech recognition.
            </h2>
        );
    }

    return (
        <Container className="app" fluid>
            <Row>
                <Col xs={12} sm>
                    <Chessboard position={fen} />
                </Col>
                <Col xs={12} sm>
                    <Button
                        className="voice-command-button"
                        onClick={handleClick}
                        disabled={listening}
                        block
                    >
                        {listening ? 'Listening' : 'Click to give voice command'}
                    </Button>
                    <GameStatus {...status} />
                    <MoveHistoryTable moves={history} />
                </Col>
            </Row>
        </Container>
    );
};

export default App;
