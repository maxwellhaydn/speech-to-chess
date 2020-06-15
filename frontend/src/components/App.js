import React, { useCallback, useRef, useState } from 'react';
import { useSpeechRecognition } from 'react-speech-kit';
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

    const handleVoiceCommand = useCallback((command) => {
        let move;

        try {
            move = parser.toSAN(command);
        }
        catch (error) {
            setStatus({
                message: "I couldn't understand what you said",
                details: command
            });
            return;
        }

        if (chessApiRef.current.move(move)) {
            setMoves(chessApiRef.current.history());
            setPosition(chessApiRef.current.fen());

            if (chessApiRef.current.game_over()) {
                setStatus({ message: 'Game over' });
            }
            else {
                setStatus({ message: turn() });
            }
        }
        else {
            setStatus({ message: 'Illegal move', details: move });
        }
    }, [chessApiRef, setMoves, setStatus, turn]);

    const { listen, listening, supported } = useSpeechRecognition({
        onResult: handleVoiceCommand
    });

    if (! supported) {
        return (
            <h2 className="error">
                Your browser doesn't support speech recognition
            </h2>
        );
    }

    return (
        <div className="app">
            <Chessboard position={position} />
            <button
                onClick={() => listen({ interimResults: false, lang: 'en-US' })}
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
