import React from 'react';
import { mount, shallow } from 'enzyme';
import { expect } from 'chai';
import { Chess } from 'chess.js';
import ChessNLP from 'chess-nlp';

import App from './App';
import GameStatusIndicator from './GameStatusIndicator';
import MoveHistoryTable from './MoveHistoryTable';
import VoiceCommand from './VoiceCommand';

jest.mock('chess.js', () => ({
    Chess: jest.fn().mockImplementation(() => ({
        move: move => true,
        turn: () => 'w',
        game_over: () => false,
        history: () => []
    }))
}));

jest.mock('chess-nlp', () => ({
    __esModule: true,
    default: jest.fn().mockImplementation((options) => ({
        toSAN: text => text
    }))
}));

describe('App component', function() {

    beforeEach(function() {
        jest.restoreAllMocks();
        jest.clearAllMocks();
    });

    it('should show an empty moves table with white to move on initial render', function() {
        const wrapper = shallow(<App />);

        expect(wrapper).to.containMatchingElement(<VoiceCommand />);
        expect(wrapper).to.contain(<MoveHistoryTable moves={[]} />);
        expect(wrapper).to.contain(
            <GameStatusIndicator status="White to move" />
        );
    });

    it('should make a move when a valid voice command is given', function() {
        Chess.mockImplementation(() => ({
            move: move => true,
            turn: () => 'b',
            game_over: () => false,
            history: () => ['e4']
        }));

        const wrapper = shallow(<App />);

        wrapper.find(VoiceCommand).invoke('onCommand')('e4');

        expect(wrapper).to.contain(<MoveHistoryTable moves={['e4']} />);
        expect(wrapper).to.contain(
            <GameStatusIndicator status="Black to move" />
        );
    });

    it("should show an error message when voice command can't be parsed", function() {
        ChessNLP.mockImplementation(() => ({
            toSAN: text => { throw new Error(); }
        }));

        const wrapper = shallow(<App />);

        wrapper.find(VoiceCommand).invoke('onCommand')('foo');

        expect(wrapper).to.contain(<MoveHistoryTable moves={[]} />);
        expect(wrapper).to.contain(
            <GameStatusIndicator status="Invalid move" details="foo" />
        );
    });

    it('should show an error message when move is invalid', function() {
        Chess.mockImplementation(() => ({
            move: move => null,
            turn: () => 'w',
            game_over: () => false,
            history: () => []
        }));

        const wrapper = shallow(<App />);

        wrapper.find(VoiceCommand).invoke('onCommand')('Ke8');

        expect(wrapper).to.contain(<MoveHistoryTable moves={[]} />);
        expect(wrapper).to.contain(
            <GameStatusIndicator status="Invalid move" details="Ke8" />
        );
    });

    it('should show a message when the game is over', function() {
        Chess.mockImplementation(() => ({
            move: move => true,
            turn: () => 'b',
            game_over: () => true,
            history: () => ['e4']
        }));

        const wrapper = shallow(<App />);

        wrapper.find(VoiceCommand).invoke('onCommand')('e4');

        expect(wrapper).to.contain(<MoveHistoryTable moves={['e4']} />);
        expect(wrapper).to.contain(<GameStatusIndicator status="Game over" />);
    });

});
