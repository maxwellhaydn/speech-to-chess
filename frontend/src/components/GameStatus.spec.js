import React from 'react';
import { mount, shallow } from 'enzyme';
import { expect } from 'chai';

import GameStatus from './GameStatus';

const mockSpeak = jest.fn();

jest.mock('react-speech-kit', () => ({
    useSpeechSynthesis: () => ({
        speak: mockSpeak,
        voices: [{ lang: 'en-GB' }, { lang: 'zh-CN' }, { lang: 'en-US' }]
    })
}));

describe('GameStatus component', function() {

    beforeEach(() => jest.clearAllMocks());

    it('should show the current status', function() {
        const wrapper = shallow(<GameStatus status="foo" />);

        expect(wrapper.find('.game-status')).to.have.text('foo');
    });

    it('should show nothing if status is not set', function() {
        const wrapper = shallow(<GameStatus status={null} />);

        expect(wrapper).to.be.empty;
    });

    it('should say the new status when status changes', function() {
        const wrapper = mount(<GameStatus />);

        wrapper.setProps({ status: 'foo' });

        expect(mockSpeak).to.have.beenCalledWith({
            text: 'foo',
            voice: { lang: 'en-US' }
        });
    });

    it('should say nothing when status becomes falsy', function() {
        const wrapper = mount(<GameStatus status="foo" />);

        // mockSpeak is called once on initial render; clear the mock so we can
        // test if it's called again after changing the status prop
        mockSpeak.mockClear();

        wrapper.setProps({ status: '' });

        expect(mockSpeak).to.not.have.beenCalled();
    });

});
