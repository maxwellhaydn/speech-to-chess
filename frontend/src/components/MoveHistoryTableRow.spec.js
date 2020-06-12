import React from 'react';
import { shallow } from 'enzyme';
import { expect } from 'chai';

import MoveHistoryTableRow from './MoveHistoryTableRow';

describe('MoveHistoryTableRow component', function() {

    it.each([
        [[], ''],
        [['e4'], 'e4'],
        [['e4', 'e5'], 'e4 e5']
    ])('should show the given moves: %j', (moves, expected) => {
        const wrapper = shallow(<MoveHistoryTableRow moves={moves} />);

        expect(wrapper).to.have.text(expected);
    });

});
