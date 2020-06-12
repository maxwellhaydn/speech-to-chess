import React from 'react';
import { mount } from 'enzyme';
import { expect } from 'chai';

import Chess from './Chess';
import MoveHistoryTable from './MoveHistoryTable';

describe('Chess component', function() {

    it('should show the move history', function() {
        const wrapper = mount(<Chess apiRef={{}} />);

        expect(wrapper).to.contain(<MoveHistoryTable moves={[]} />);
    });

});
