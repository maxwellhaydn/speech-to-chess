import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useSpeechRecognition, useSpeechSynthesis } from 'react-speech-kit';
import { isNode } from 'browser-or-node';
import ChessNLP from 'chess-nlp';
import Chessboard from 'chessboardjsx';

import GameStatusIndicator from './GameStatusIndicator';
import MoveHistoryTable from './MoveHistoryTable';

let Chess;

/**
 * In CommonJS environments, chess.js exports an object with the Chess
 * constructor as a property, while on AMD environments it exports the Chess
 * constructor directly. Webpack supports both CommonJS and AMD. Due to an issue
 * in chess.js (https://github.com/jhlywa/chess.js/issues/196), you get the AMD
 * export with Webpack, so tests running in Node and code bundled with Webpack
 * cannot both use the same import signature. The following is a temporary
 * workaround until the issue in chess.js is resolved.
 */
if (isNode) {
    const chess = require('chess.js');
    Chess = chess.Chess;
}
else {
    Chess = require('chess.js');
}

const parserOptions = {
    aliases: {
        knight: ['night']
    }
};

const parser = new ChessNLP(parserOptions);

/**
 * A chess game played with voice commands.
 */
const App = (props) => {
    const chessApiRef = useRef(new Chess());
    const [moves, setMoves] = useState([]);
    const [position, setPosition] = useState(chessApiRef.current.fen());

    const turn = useCallback(() => {
        const player = chessApiRef.current.turn() === 'b' ? 'Black' : 'White';
        return `${player} to move`;
    }, [chessApiRef]);

    const [status, setStatus] = useState({ message: turn() });

    const { speak, voices } = useSpeechSynthesis();

    const handleVoiceCommand = useCallback((command) => {
        const speechSynthesisVoice =
            voices.find(voice => voice.lang === 'en-US');
        let move;

        try {
            move = parser.toSAN(command);
        }
        catch (error) {
            setStatus({
                message: 'Not a chess move',
                details: command
            });

            speak({
                text: `I don't understand: ${command}`,
                voice: speechSynthesisVoice
            });

            return;
        }

        if (chessApiRef.current.move(move)) {
            setMoves(chessApiRef.current.history());
            setPosition(chessApiRef.current.fen());

            speak({
                text: command,
                voice: speechSynthesisVoice
            });

            if (chessApiRef.current.game_over()) {
                setStatus({ message: 'Game over' });

                speak({
                    text: 'Game over',
                    voice: speechSynthesisVoice
                });
            }
            else {
                setStatus({ message: turn() });

                speak({
                    text: turn(),
                    voice: speechSynthesisVoice
                });
            }
        }
        else {
            setStatus({ message: 'Illegal move', details: move });

            speak({
                text: `Illegal move: ${command}`,
                voice: speechSynthesisVoice
            });
        }
    }, [chessApiRef, setMoves, setStatus, speak, turn, voices]);

    const {
        listen,
        listening,
        stop: stopListening,
        supported: speechRecognitionSupported
    } = useSpeechRecognition({
        onResult: handleVoiceCommand
    });

    // Stop listening for voice commands when status changes
    useEffect(stopListening, [status]);

    if (! speechRecognitionSupported) {
        return (
            <h2 className="error">
                Your browser doesn't support speech recognition.
            </h2>
        );
    }

    return (
        <div className="app">
            <Chessboard position={position} />
            <button
                onClick={() => listen({ interimResults: false, lang: 'en-US' })}
                disabled={listening}
            >
                {listening ? 'Listening' : 'Move'}
            </button>
            <MoveHistoryTable moves={moves} />
            <GameStatusIndicator
                status={status.message}
                details={status.details}
            />
        </div>
    );
};

export default App;
