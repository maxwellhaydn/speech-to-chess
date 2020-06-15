import React, { useCallback, useRef, useState } from 'react';
import ChessNLP from 'chess-nlp';
import { isNode } from 'browser-or-node';

import GameStatusIndicator from './GameStatusIndicator';
import MoveHistoryTable from './MoveHistoryTable';
import VoiceCommand from './VoiceCommand';

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
            setStatus({ message: 'Invalid move', details: command });
            return;
        }

        if (chessApiRef.current.move(move)) {
            setMoves(chessApiRef.current.history());

            if (chessApiRef.current.game_over()) {
                setStatus({ message: 'Game over' });
            }
            else {
                setStatus({ message: turn() });
            }
        }
        else {
            setStatus({ message: 'Invalid move', details: move });
        }
    }, [chessApiRef, setMoves, setStatus, turn]);

    return (
        <div className="app">
            <VoiceCommand onCommand={handleVoiceCommand} />
            <MoveHistoryTable moves={moves} />
            <GameStatusIndicator
                status={status.message}
                details={status.details}
            />
        </div>
    );
};

export default App;
