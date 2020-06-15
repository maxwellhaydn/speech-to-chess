import React from 'react';
import { shallow } from 'enzyme';
import { expect } from 'chai';

describe('VoiceCommand component', function() {

    beforeEach(() => {
        /**
         * Reset modules so we can mock the SpeechRecognition HOC differently in
         * different tests. For example, the property
         * browserSupportsSpeechRecognition is normally set once when the
         * VoiceCommand module is imported, but we want to run tests that
         * emulate both supported and non-supported browsers.
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

            const VoiceCommand = require('./VoiceCommand').default;
            const wrapper = shallow(<VoiceCommand />);

            expect(wrapper).to.have.exactly(1).descendants('.error');
            expect(wrapper.find('.error'))
                .to.have.text("Your browser doesn't support speech recognition");
        });

    });

    describe('browserSupportsSpeechRecognition: true', function() {

        afterEach(() => {
            jest.restoreAllMocks();
        });

        it('should show an error when browser is offline', function() {
            jest.mock('react-speech-recognition', () => {
                return options => {
                    return component => {
                        component.defaultProps = {
                            ...component.defaultProps,
                            browserSupportsSpeechRecognition: true,
                            recognition: {}
                        };
                        return component;
                    };
                };
            });

            jest.spyOn(window, 'navigator', 'get')
                .mockImplementation(() => ({ onLine: false }));

            const VoiceCommand = require('./VoiceCommand').default;
            const wrapper = shallow(<VoiceCommand />);

            expect(wrapper).to.have.exactly(1).descendants('.error');
            expect(wrapper.find('.error').text())
                .to.match(/You appear to be offline/);
        });

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

            const VoiceCommand = require('./VoiceCommand').default;
            const wrapper = shallow(<VoiceCommand />);

            expect(wrapper).to.have.exactly(1).descendants('button');

            wrapper.find('button').simulate('click');

            expect(mockStartListening).to.have.beenCalledTimes(1);
        });

        it('should set the speech recognition language to US English', function() {
            const mockRecognitionObj = {};

            jest.mock('react-speech-recognition', () => {
                return options => {
                    return component => {
                        component.defaultProps = {
                            ...component.defaultProps,
                            browserSupportsSpeechRecognition: true,
                            recognition: mockRecognitionObj
                        };
                        return component;
                    };
                };
            });

            const VoiceCommand = require('./VoiceCommand').default;
            const wrapper = shallow(<VoiceCommand />);

            expect(mockRecognitionObj).to.deep.equal({ lang: 'en-US' });
        });

        it('should call the given onChange handler when the transcript changes', function() {
            const mockOnChange = jest.fn();

            jest.mock('react-speech-recognition', () => {
                return options => {
                    return component => {
                        component.defaultProps = {
                            ...component.defaultProps,
                            browserSupportsSpeechRecognition: true,
                            recognition: {}
                        };
                        return component;
                    };
                };
            });

            const VoiceCommand = require('./VoiceCommand').default;
            const wrapper = shallow(<VoiceCommand onChange={mockOnChange} />);

            wrapper.find('.latest-move').simulate('change');

            expect(mockOnChange).to.have.beenCalledTimes(1);
        });

    });

});
