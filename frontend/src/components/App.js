import React, { useRef } from 'react';

import Chess from './Chess';
import VoiceCommand from './VoiceCommand';

const App = (props) => {
    const chessAPIRef = useRef(null);

    return (
        <div className="app">
            <VoiceCommand />
            <Chess apiRef={chessAPIRef} />
        </div>
    );
};

export default App;
