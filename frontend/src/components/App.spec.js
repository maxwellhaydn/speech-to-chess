import React from 'react';
import { shallow } from 'enzyme';
import { expect } from 'chai';

import App from './App';
import Chess from './Chess';
import VoiceCommand from './VoiceCommand';

describe('App component', function() {

    it('should contain a VoiceCommand and a Chess component', function() {
        const wrapper = shallow(<App />);

        expect(wrapper).to.containMatchingElement(<VoiceCommand />);
        expect(wrapper).to.containMatchingElement(
            <Chess apiRef={{ current: null }} />
        );
    });

});
