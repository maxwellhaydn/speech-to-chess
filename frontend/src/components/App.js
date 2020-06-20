import React, { useCallback, useState } from 'react';
import { useSpeechRecognition } from 'react-speech-kit';
import useChess from 'react-chess.js';
import ChessNLP from 'chess-nlp';
import Chessboard from 'chessboardjsx';

import GameStatus from './GameStatus';
import MoveHistoryTable from './MoveHistoryTable';

const parserOptions = {
    aliases: {
        knight: ['night'],
        rook: ['brooke', 'brook'],
        a: ['alpha'],
        b: ['bravo'],
        c: ['charlie'],
        d: ['delta'],
        e: ['echo'],
        f: ['foxtrot'],
        g: ['golf'],
        h: ['hotel']
    }
};

const parser = new ChessNLP(parserOptions);

/**
 * A chess game played with voice commands.
 */
const App = (props) => {
    const [status, setStatus] = useState();

    const handleLegalMove = (move) => {
        setStatus(`Moved ${move}`);
    };

    const handleIllegalMove = (move) => {
        setStatus(`Illegal move: ${move}`);
    };

    const handleGameOver = () => {
        setStatus('Game over');
    };

    const { move: makeMove, undo, reset, history, fen } = useChess({
        onLegalMove: handleLegalMove,
        onIllegalMove: handleIllegalMove,
        onGameOver: handleGameOver
    });

    const handleVoiceCommand = useCallback((command) => {
        switch (command) {
            case 'undo':
                undo();
                setStatus('Undid last move');
                return;
            case 'reset':
                reset();
                setStatus('Reset game');
                return;
            default:
                let move;

                try {
                    move = parser.toSAN(command);
                }
                catch (error) {
                    setStatus(`I don't understand: ${command}`);
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

    if (! speechRecognitionSupported) {
        return (
            <h2 className="error">
                Your browser doesn't support speech recognition.
            </h2>
        );
    }

    return (
        <div className="app">
            <Chessboard position={fen} />
            <button
                className="voice-command-button"
                onPointerDown={
                    () => listen({ interimResults: false, lang: 'en-US' })
                }
                onPointerUp={stopListening}
            >
                {listening ? 'Listening' : 'Move'}
            </button>
            <MoveHistoryTable moves={history} />
            <GameStatus status={status} />
        </div>
    );
};

export default App;
