import React from 'react';
import { shallow } from 'enzyme';
import { expect } from 'chai';

import MoveHistoryTable from './MoveHistoryTable';
import MoveHistoryTableRow from './MoveHistoryTableRow';

describe('MoveHistoryTable component', function() {

    it('should show the move history', function() {
        const wrapper = shallow(
            <MoveHistoryTable
                moves={['e4', 'e5', 'Nf3', 'Nc6', 'd4']}
            />
        );

        expect(wrapper).to.contain([
            <li><MoveHistoryTableRow moves={['e4', 'e5']} /></li>,
            <li><MoveHistoryTableRow moves={['Nf3', 'Nc6']} /></li>,
            <li><MoveHistoryTableRow moves={['d4']} /></li>
        ]);
    });

});
