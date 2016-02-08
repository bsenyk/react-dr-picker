import './example.css';
import style from '../src/calendar.css';
import RangePicker from '../src/index';
import React from 'react';
import ReactDOM from 'react-dom';
import moment from 'moment';

const { div } = React.DOM;

var App = React.createClass({
  getInitialState: function() {
    return {
      startDate: moment().startOf('month'),
      endDate: moment().endOf('month')
    }
  },
  render: function() {
    var _this = this,
        format = 'MM/DD/YYYY',
        formattedStart = this.state.startDate.format(format),
        formattedEnd = this.state.endDate.format(format);

    return div({},
      div({}, 'Start: ' + formattedStart),
      div({}, 'Stop: ' + formattedEnd),
      React.createElement(RangePicker, {
        onRangeChange: function(dates) {
          _this.setState(dates);
        },
        startDate: this.state.startDate,
        endDate: this.state.endDate
    })
    )
  }
})

ReactDOM.render(
  React.createElement(App), document.getElementById('react-calendar')
)
