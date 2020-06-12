import React from 'react';
import { shallow } from 'enzyme';
import { expect } from 'chai';

import App from './App';
import VoiceCommand from './VoiceCommand';

describe('App component', function() {

    it('should contain a VoiceCommand component', function() {
        const wrapper = shallow(<App />);

        expect(wrapper).to.containMatchingElement(<VoiceCommand />);
    });

});
