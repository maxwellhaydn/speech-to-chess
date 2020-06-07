import React from 'react';
import { shallow } from 'enzyme';
import { expect } from 'chai';

describe('Game component', function() {

    const nonsupportedBrowserTests = () => {
        it('should show an error message',
            function() {
            const Game = require('./Game').default;
            const wrapper = shallow(<Game />);

            expect(wrapper).to.have.exactly(1).descendants('.error');
            expect(wrapper.find('.error'))
                .to.have.text("Your browser doesn't support speech recognition");
        });
    };

    const supportedBrowserTests = (mockProps) => {
        it('should call startListening on button click', function() {
            const Game = require('./Game').default;
            const wrapper = shallow(<Game />);

            expect(wrapper).to.have.exactly(1).descendants('button');

            wrapper.find('button').simulate('click');

            expect(mockProps.startListening).to.have.beenCalledTimes(1);
        });
    };

    describe.each([
        [false, {}, nonsupportedBrowserTests],
        [true, { startListening: jest.fn() }, supportedBrowserTests]
    ])(
        'browser supports speech recognition: %j',
        (mockBrowserSupportsSpeechRecognition, mockAdditionalProps, runTests) => {

        beforeEach(() => {
            /**
             * Mock the SpeechRecognition HOC so we can set different values
             * for properties in different tests. For example, the property
             * browserSupportsSpeechRecognition is normally set once when the
             * Game module is imported, but we want to run tests that emulate
             * both supported and non-supported browsers.
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
            jest.mock('react-speech-recognition', () => {
                return options => {
                    return component => {
                        component.defaultProps = {
                            ...component.defaultProps,
                            ...mockAdditionalProps,
                            browserSupportsSpeechRecognition:
                                mockBrowserSupportsSpeechRecognition,
                            recognition: {}
                        };
                        return component;
                    };
                };
            });
        });

        runTests(mockAdditionalProps);

    });


});
