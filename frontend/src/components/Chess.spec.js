import React from 'react';
import { shallow } from 'enzyme';
import { expect } from 'chai';

import Chess from './Chess';
import MoveHistoryTable from './MoveHistoryTable';

describe('Chess component', function() {

    it('should show the move history', function() {
        const wrapper = shallow(<Chess />);

        expect(wrapper).to.contain(<MoveHistoryTable moves={[]} />);
    });

});
