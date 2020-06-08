import React from 'react';
import { shallow } from 'enzyme';
import { expect } from 'chai';

describe('Game component', function() {

    beforeEach(() => {
        /**
         * Reset modules so we can mock the SpeechRecognition HOC differently in
         * different tests. For example, the property
         * browserSupportsSpeechRecognition is normally set once when the Game
         * module is imported, but we want to run tests that emulate both
         * supported and non-supported browsers.
         *
         * See
         *
         *     https://github.com/facebook/jest/issues/2582#issuecomment-378677440
         *
         *  and
         *
         *     https://medium.com/trabe/mocking-different-values-for-the-same-module-using-jest-a7b8d358d78b
         */
        jest.resetModules()
    });

    describe('browserSupportsSpeechRecognition: false', function() {

        it('should show an error message', function() {
            jest.mock('react-speech-recognition', () => {
                return options => {
                    return component => {
                        component.defaultProps = {
                            ...component.defaultProps,
                            browserSupportsSpeechRecognition: false,
                            recognition: {}
                        };
                        return component;
                    };
                };
            });

            const Game = require('./Game').default;
            const wrapper = shallow(<Game />);

            expect(wrapper).to.have.exactly(1).descendants('.error');
            expect(wrapper.find('.error'))
                .to.have.text("Your browser doesn't support speech recognition");
        });

    });

    describe('browserSupportsSpeechRecognition: true', function() {

        it('should call startListening on button click', function() {
            const mockStartListening = jest.fn();

            jest.mock('react-speech-recognition', () => {
                return options => {
                    return component => {
                        component.defaultProps = {
                            ...component.defaultProps,
                            browserSupportsSpeechRecognition: true,
                            recognition: {},
                            startListening: mockStartListening
                        };
                        return component;
                    };
                };
            });

            const Game = require('./Game').default;
            const wrapper = shallow(<Game />);

            expect(wrapper).to.have.exactly(1).descendants('button');

            wrapper.find('button').simulate('click');

            expect(mockStartListening).to.have.beenCalledTimes(1);
        });

    });

});
