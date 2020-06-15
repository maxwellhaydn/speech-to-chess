import React from 'react';
import { shallow } from 'enzyme';
import { expect } from 'chai';

import GameStatusIndicator from './GameStatusIndicator';

describe('GameStatusIndicator component', function() {

    it('should show the current status', function() {
        const wrapper = shallow(<GameStatusIndicator status="foo" />);

        expect(wrapper.find('.game-status-indicator .status'))
            .to.have.text('foo');
    });

    it('should show status details if available', function() {
        const wrapper = shallow(
            <GameStatusIndicator status="foo" details="bar" />
        );

        expect(wrapper.find('.game-status-indicator .status'))
            .to.have.text('foo');
        expect(wrapper.find('.game-status-indicator .details'))
            .to.have.text('bar');
    });

    it('should show nothing if status is not set', function() {
        const wrapper = shallow(<GameStatusIndicator status={null} />);

        expect(wrapper).to.be.empty;
    });

});
