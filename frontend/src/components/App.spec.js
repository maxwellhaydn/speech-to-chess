import React from 'react';
import { shallow } from 'enzyme';
import { expect } from 'chai';
import { useSpeechRecognition, useSpeechSynthesis } from 'react-speech-kit';
import useChess from 'react-chess.js';
import Chessboard from 'react-simple-chessboard';

import GameStatus from './GameStatus';
import MoveHistoryTable from './MoveHistoryTable';

jest.mock('react-speech-kit');
jest.mock('react-chess.js');

/**
 * The only way I've found to mock an ES module that is imported by another ES
 * module (the test subject) and change the mock implementation in each test is
 * by using doMock and then re-loading the test subject with require. See
 *
 *     https://github.com/facebook/jest/issues/2649#issuecomment-492128320
 *
 * The doMock and require calls need to be wrapped in a call to isolateModules
 * to work around a bug that triggers "Invalid hook call" warnings when you do
 * this with a module that contains React hooks. See
 *
 *     https://github.com/facebook/jest/issues/8987
 *
 * This is how I mock chess-nlp in the following tests.
 */

describe('App component', function() {

    beforeEach(function() {
        jest.clearAllMocks();
    });

    describe('speech recognition not supported', function() {

        it('should show an error message', function() {
            useSpeechRecognition.mockReturnValue({
                supported: false
            });

            useChess.mockReturnValue({
                history: [],
                fen: 'foo'
            });

            jest.isolateModules(() => {
                const App = require('./App').default;
                const wrapper = shallow(<App />);

                expect(wrapper).to.contain.exactly(1).descendants('.error');
                expect(wrapper.find('.error')).to.have.text(
                        "Your browser doesn't support speech recognition."
                );
            });
        });

    });

    describe('speech recognition is supported', function() {

        it('should show an empty moves table on initial render', function() {
            useSpeechRecognition.mockReturnValue({
                supported: true
            });

            useChess.mockReturnValue({
                history: [],
                fen: 'foo'
            });

            jest.isolateModules(() => {
                const App = require('./App').default;
                const wrapper = shallow(<App />);

                expect(wrapper.find('.voice-command-button'))
                    .to.have.text('Hold for voice command');
                expect(wrapper).to.contain(<MoveHistoryTable moves={[]} />);
                expect(wrapper).to.contain(<GameStatus />);
                expect(wrapper).to.containMatchingElement(
                    <Chessboard position="foo" />
                );
            });
        });

        it('should change the move button text while listening', function() {
            useSpeechRecognition.mockReturnValue({
                supported: true,
                listening: true
            });

            useChess.mockReturnValue({
                history: [],
                fen: 'foo'
            });

            jest.isolateModules(() => {
                const App = require('./App').default;
                const wrapper = shallow(<App />);

                expect(wrapper.find('.voice-command-button'))
                    .to.have.text('Listening');
            });
        });

        it('should stop listening when the user releases the move button', function() {
            const mockStopListening = jest.fn();

            useSpeechRecognition.mockReturnValue({
                supported: true,
                stop: mockStopListening
            });

            useChess.mockReturnValue({
                history: [],
                fen: 'foo'
            });

            jest.isolateModules(() => {
                const App = require('./App').default;
                const wrapper = shallow(<App />);

                const button = wrapper.find('.voice-command-button');
                button.simulate('pointerUp');

                expect(button).to.have.text('Hold for voice command');
                expect(mockStopListening).to.have.beenCalledTimes(1);
            });
        });

        it('should make a move when a valid voice command is given', function() {
            useSpeechRecognition.mockImplementation(({ onResult }) => ({
                supported: true,
                listen: jest.fn().mockImplementationOnce(() => onResult('e4'))
            }));

            useChess.mockImplementation(({ onLegalMove }) => ({
                history: ['e4'],
                fen: 'foo',
                move: jest.fn().mockImplementationOnce(() => onLegalMove('e4'))
            }));

            jest.isolateModules(() => {
                jest.doMock('chess-nlp', () => ({
                    __esModule: true,
                    default: jest.fn(() => ({
                        toSAN: text => 'e4'
                    }))
                }));

                const App = require('./App').default;
                const wrapper = shallow(<App />);

                wrapper.find('.voice-command-button').simulate('pointerDown');

                expect(wrapper).to.contain(<MoveHistoryTable moves={['e4']} />);
                expect(wrapper).to.contain(<GameStatus status="Moved e4" />);
                expect(wrapper).to.containMatchingElement(
                    <Chessboard position="foo" />
                );
            });
        });

        it("should show an error message when voice command can't be parsed",
                function() {
            useSpeechRecognition.mockImplementation(({ onResult }) => ({
                supported: true,
                listen: jest.fn().mockImplementationOnce(() => onResult('foo'))
            }));

            useChess.mockReturnValue({
                history: [],
                fen: 'foo',
                move: jest.fn()
            });

            jest.isolateModules(() => {
                jest.doMock('chess-nlp', () => ({
                    __esModule: true,
                    default: jest.fn(() => ({
                        toSAN: text => { throw new Error('unparseable'); }
                    }))
                }));

                const App = require('./App').default;
                const wrapper = shallow(<App />);

                wrapper.find('.voice-command-button').simulate('pointerDown');

                expect(wrapper).to.contain(<MoveHistoryTable moves={[]} />);
                expect(wrapper).to.contain(
                    <GameStatus status="I don't understand: foo" />
                );
                expect(wrapper).to.containMatchingElement(
                    <Chessboard position="foo" />
                );
            });
        });

        it('should show an error message when move is invalid/illegal',
                function() {
            useSpeechRecognition.mockImplementation(({ onResult }) => ({
                supported: true,
                listen: jest.fn().mockImplementationOnce(
                    () => onResult('king to h8')
                )
            }));

            useChess.mockImplementation(({ onIllegalMove }) => ({
                history: [],
                fen: 'foo',
                move:
                    jest.fn().mockImplementationOnce(() => onIllegalMove('Kh8'))
            }));

            jest.isolateModules(() => {
                jest.doMock('chess-nlp', () => ({
                    __esModule: true,
                    default: jest.fn(() => ({
                        toSAN: text => 'Kh8'
                    }))
                }));

                const App = require('./App').default;
                const wrapper = shallow(<App />);

                wrapper.find('.voice-command-button').simulate('pointerDown');

                expect(wrapper).to.contain(<MoveHistoryTable moves={[]} />);
                expect(wrapper).to.contain(
                    <GameStatus status="Illegal move: Kh8"
                />);
                expect(wrapper).to.containMatchingElement(
                    <Chessboard position="foo" />
                );
            });
        });

        it('should show a message when the game is over', function() {
            useSpeechRecognition.mockImplementation(({ onResult }) => ({
                supported: true,
                listen: jest.fn().mockImplementationOnce(() => onResult('e4'))
            }));

            useChess.mockImplementation(({ onLegalMove, onGameOver }) => ({
                history: ['e4'],
                fen: 'foo',
                move: jest.fn().mockImplementationOnce(() => {
                    onLegalMove('e4');
                    onGameOver();
                })
            }));

            jest.isolateModules(() => {
                jest.doMock('chess-nlp', () => ({
                    __esModule: true,
                    default: jest.fn(() => ({
                        toSAN: text => 'e4'
                    }))
                }));

                const App = require('./App').default;
                const wrapper = shallow(<App />);

                wrapper.find('.voice-command-button').simulate('pointerDown');

                expect(wrapper).to.contain(<MoveHistoryTable moves={['e4']} />);
                expect(wrapper).to.contain(<GameStatus status="Game over" />);
                expect(wrapper).to.containMatchingElement(
                    <Chessboard position="foo" />
                );
            });
        });

        it('should reset the game on reset command', function() {
            useSpeechRecognition.mockImplementation(({ onResult }) => ({
                supported: true,
                listen: jest.fn().mockImplementationOnce(
                    () => onResult('reset')
                )
            }));

            const mockReset = jest.fn();

            useChess.mockReturnValue({
                history: [],
                fen: 'foo',
                reset: mockReset
            });

            jest.isolateModules(() => {
                const App = require('./App').default;
                const wrapper = shallow(<App />);

                wrapper.find('.voice-command-button').simulate('pointerDown');

                expect(mockReset).to.have.beenCalledTimes(1);
                expect(wrapper).to.contain(<MoveHistoryTable moves={[]} />);
                expect(wrapper).to.contain(<GameStatus status="Reset game"/>);
                expect(wrapper).to.containMatchingElement(
                    <Chessboard position="foo" />
                );
            });
        });

        it('should undo the last move on undo command', function() {
            useSpeechRecognition.mockImplementation(({ onResult }) => ({
                supported: true,
                listen: jest.fn().mockImplementationOnce(
                    () => onResult('undo')
                )
            }));

            const mockUndo = jest.fn();

            useChess.mockReturnValue({
                history: [],
                fen: 'foo',
                undo: mockUndo
            });

            jest.isolateModules(() => {
                const App = require('./App').default;
                const wrapper = shallow(<App />);

                wrapper.find('.voice-command-button').simulate('pointerDown');

                expect(mockUndo).to.have.beenCalledTimes(1);
                expect(wrapper).to.contain(<MoveHistoryTable moves={[]} />);
                expect(wrapper).to.contain(
                    <GameStatus status="Undid last move"/>
                );
                expect(wrapper).to.containMatchingElement(
                    <Chessboard position="foo" />
                );
            });
        });

    });

});
