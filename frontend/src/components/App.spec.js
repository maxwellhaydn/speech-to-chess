import React from 'react';
import { act } from 'react-dom/test-utils';
import { mount, shallow } from 'enzyme';
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

        beforeEach(function() {
            jest.useFakeTimers();
        });

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
                    .to.have.text('Click to give voice command');
                expect(wrapper).to.contain(<MoveHistoryTable moves={[]} />);
                expect(wrapper).to.contain(<GameStatus moveNumber={0} />);
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

        it('should stop listening after 5 seconds with no command', function() {
            const mockListen = jest.fn();
            const mockStopListening = jest.fn();

            useSpeechRecognition.mockReturnValue({
                supported: true,
                listen: mockListen,
                stop: mockStopListening
            });

            useSpeechSynthesis.mockReturnValue({
                speak: jest.fn(),
                voices: [{ lang: 'en-US' }]
            });

            useChess.mockReturnValue({
                history: [],
                fen: 'foo'
            });

            jest.isolateModules(() => {
                const App = require('./App').default;
                const wrapper = mount(<App />);

                // Use "button.voice-command-button" instead of just
                // "voice-command-button" to get around this Enzyme feature:
                // https://github.com/enzymejs/enzyme/issues/1174
                const button = wrapper.find('button.voice-command-button');

                expect(mockListen).to.not.have.beenCalled();
                expect(mockStopListening).to.not.have.beenCalled();

                act(() => {
                    button.simulate('click');
                });

                expect(mockListen).to.have.beenCalledTimes(1);
                expect(mockStopListening).to.not.have.beenCalled();

                act(() => {
                    jest.advanceTimersByTime(5000);
                });

                expect(mockListen).to.have.beenCalledTimes(1);
                expect(mockStopListening).to.have.beenCalledTimes(1);
            });
        });

        it('should make a move when a valid voice command is given', function() {
            useSpeechRecognition.mockImplementation(({ onResult }) => ({
                supported: true,
                listen: jest.fn().mockImplementationOnce(() => onResult('Nf3'))
            }));

            useChess.mockImplementation(({ onLegalMove }) => ({
                history: ['Nf3'],
                fen: 'foo',
                move: jest.fn().mockImplementationOnce(() => onLegalMove('Nf3'))
            }));

            jest.isolateModules(() => {
                jest.doMock('chess-nlp', () => ({
                    __esModule: true,
                    default: jest.fn(() => ({
                        textToSan: text => 'Nf3',
                        sanToText: san => 'knight to f3'
                    }))
                }));

                const App = require('./App').default;
                const wrapper = shallow(<App />);

                wrapper.find('.voice-command-button').simulate('click');

                expect(wrapper).to.contain(<MoveHistoryTable moves={['Nf3']} />);
                expect(wrapper).to.contain(
                    <GameStatus
                        display="Moved Nf3"
                        announce="Moved knight to f3"
                        moveNumber={1}
                    />
                );
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
                        textToSan: text => { throw new Error('unparseable'); }
                    }))
                }));

                const App = require('./App').default;
                const wrapper = shallow(<App />);

                wrapper.find('.voice-command-button').simulate('click');

                expect(wrapper).to.contain(<MoveHistoryTable moves={[]} />);
                expect(wrapper).to.contain(
                    <GameStatus
                        display="I don't understand: foo"
                        announce="I don't understand: foo"
                        moveNumber={0}
                    />
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
                        textToSan: text => 'Kh8',
                        sanToText: san => 'king to h8'
                    }))
                }));

                const App = require('./App').default;
                const wrapper = shallow(<App />);

                wrapper.find('.voice-command-button').simulate('click');

                expect(wrapper).to.contain(<MoveHistoryTable moves={[]} />);
                expect(wrapper).to.contain(
                    <GameStatus
                        display="Illegal move: Kh8"
                        announce="Illegal move: king to h8"
                        moveNumber={0}
                    />
                );
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
                        textToSan: text => 'e4',
                        sanToText: text => 'e4'
                    }))
                }));

                const App = require('./App').default;
                const wrapper = shallow(<App />);

                wrapper.find('.voice-command-button').simulate('click');

                expect(wrapper).to.contain(<MoveHistoryTable moves={['e4']} />);
                expect(wrapper).to.contain(
                    <GameStatus
                        display="Game over"
                        announce="Game over"
                        moveNumber={1}
                    />
                );
                expect(wrapper).to.containMatchingElement(
                    <Chessboard position="foo" />
                );
            });
        });

        it('should show a message on stalemate', function() {
            useSpeechRecognition.mockImplementation(({ onResult }) => ({
                supported: true,
                listen: jest.fn().mockImplementationOnce(() => onResult('e4'))
            }));

            useChess.mockImplementation(({ onLegalMove, onStalemate }) => ({
                history: ['e4'],
                fen: 'foo',
                move: jest.fn().mockImplementationOnce(() => {
                    onLegalMove('e4');
                    onStalemate();
                })
            }));

            jest.isolateModules(() => {
                jest.doMock('chess-nlp', () => ({
                    __esModule: true,
                    default: jest.fn(() => ({
                        textToSan: text => 'e4',
                        sanToText: text => 'e4'
                    }))
                }));

                const App = require('./App').default;
                const wrapper = shallow(<App />);

                wrapper.find('.voice-command-button').simulate('click');

                expect(wrapper).to.contain(<MoveHistoryTable moves={['e4']} />);
                expect(wrapper).to.contain(
                    <GameStatus
                        display="Stalemate"
                        announce="Stalemate"
                        moveNumber={1}
                    />
                );
                expect(wrapper).to.containMatchingElement(
                    <Chessboard position="foo" />
                );
            });
        });

        it('should show a message on threefold repetition', function() {
            useSpeechRecognition.mockImplementation(({ onResult }) => ({
                supported: true,
                listen: jest.fn().mockImplementationOnce(() => onResult('e4'))
            }));

            useChess.mockImplementation(({ onLegalMove, onThreefoldRepetition }) => ({
                history: ['e4'],
                fen: 'foo',
                move: jest.fn().mockImplementationOnce(() => {
                    onLegalMove('e4');
                    onThreefoldRepetition();
                })
            }));

            jest.isolateModules(() => {
                jest.doMock('chess-nlp', () => ({
                    __esModule: true,
                    default: jest.fn(() => ({
                        textToSan: text => 'e4',
                        sanToText: text => 'e4'
                    }))
                }));

                const App = require('./App').default;
                const wrapper = shallow(<App />);

                wrapper.find('.voice-command-button').simulate('click');

                expect(wrapper).to.contain(<MoveHistoryTable moves={['e4']} />);
                expect(wrapper).to.contain(
                    <GameStatus
                        display="Draw due to threefold repetition"
                        announce="Draw due to threefold repetition"
                        moveNumber={1}
                    />
                );
                expect(wrapper).to.containMatchingElement(
                    <Chessboard position="foo" />
                );
            });
        });

        it('should show a message on insufficient material', function() {
            useSpeechRecognition.mockImplementation(({ onResult }) => ({
                supported: true,
                listen: jest.fn().mockImplementationOnce(() => onResult('e4'))
            }));

            useChess.mockImplementation(({ onLegalMove, onInsufficientMaterial }) => ({
                history: ['e4'],
                fen: 'foo',
                move: jest.fn().mockImplementationOnce(() => {
                    onLegalMove('e4');
                    onInsufficientMaterial();
                })
            }));

            jest.isolateModules(() => {
                jest.doMock('chess-nlp', () => ({
                    __esModule: true,
                    default: jest.fn(() => ({
                        textToSan: text => 'e4',
                        sanToText: text => 'e4'
                    }))
                }));

                const App = require('./App').default;
                const wrapper = shallow(<App />);

                wrapper.find('.voice-command-button').simulate('click');

                expect(wrapper).to.contain(<MoveHistoryTable moves={['e4']} />);
                expect(wrapper).to.contain(
                    <GameStatus
                        display="Draw due to insufficient material"
                        announce="Draw due to insufficient material"
                        moveNumber={1}
                    />
                );
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

                wrapper.find('.voice-command-button').simulate('click');

                expect(mockReset).to.have.beenCalledTimes(1);
                expect(wrapper).to.contain(<MoveHistoryTable moves={[]} />);
                expect(wrapper).to.contain(
                    <GameStatus
                        display="Reset game"
                        announce="Reset game"
                        moveNumber={0}
                    />
                );
                expect(wrapper).to.containMatchingElement(
                    <Chessboard position="foo" />
                );
            });
        });

        it('should undo the last move on undo command', function() {
            const mockUndo = jest.fn();
            const commands = ['e4', 'undo'];

            useSpeechRecognition.mockImplementation(({ onResult }) => ({
                supported: true,
                listen: jest.fn(() => onResult(commands.shift()))
            }))

            useChess.mockImplementation(({ onLegalMove }) => ({
                history: [],
                fen: 'foo',
                move: jest.fn().mockImplementationOnce(() => onLegalMove('e4')),
                undo: mockUndo
            }))

            jest.isolateModules(() => {
                jest.doMock('chess-nlp', () => ({
                    __esModule: true,
                    default: jest.fn(() => ({
                        textToSan: text => 'e4',
                        sanToText: san => 'e4'
                    }))
                }));

                const App = require('./App').default;
                const wrapper = shallow(<App />);

                // e4
                act(() => {
                    wrapper.find('.voice-command-button').simulate('click');
                });

                wrapper.update();

                // undo
                act(() => {
                    wrapper.find('.voice-command-button').simulate('click');
                });

                wrapper.update();

                expect(mockUndo).to.have.beenCalledTimes(1);
                expect(wrapper).to.contain(<MoveHistoryTable moves={[]} />);
                expect(wrapper).to.contain(
                    <GameStatus
                        display="Undid last move"
                        announce="Undid last move"
                        moveNumber={0}
                    />
                );
                expect(wrapper).to.containMatchingElement(
                    <Chessboard position="foo" />
                );
            });
        });

    });

});
