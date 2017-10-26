import moment from 'moment';
import React from 'react';
import clickOutSide from './clickOutSide';
const { div, span, ul, li, i } = React.DOM;

const DEC = 'subtract',
    INC = 'add';

const RangePicker = React.createClass({

  propTypes: {
    startDate: React.PropTypes.object.isRequired,
    endDate: React.PropTypes.object.isRequired,
    presets: React.PropTypes.array,
    onRangeChange: React.PropTypes.func.isRequired
  },

  handleClickOutside: function() {
    this.setState({
      currentlyEditing: null,
      inspecting: null
    })
  },

  getInitialState: function() {
    return {
      currentlyEditing: null,
      inspecting: null,
      startDate: this.props.startDate,
      endDate: this.props.endDate
    }
  },

  componentWillReceiveProps: function(nextProps) {
    if (nextProps.startDate != this.state.startDate ||
        nextProps.endDate != this.state.endDate) {
          this.setState({
            endDate: nextProps.endDate,
            startDate: nextProps.startDate
          })
    }
  },

  _onChange: function(day) {
    const currentlyEditing = this.state.currentlyEditing;
    const currentStart = this.state.startDate;
    const currentEnd = this.state.endDate;

    const newStart = currentlyEditing === 'start' ? day : currentStart;
    const newEnd = currentlyEditing === 'end' ? day : currentEnd;

    if (currentlyEditing === 'end') {
      this.props.onRangeChange({
        startDate: newStart,
        endDate: newEnd
      });
      this.setState({
        currentlyEditing: null,
        inspecting: null
      })
    } else {
      this.setState({
        startDate: newStart,
        endDate: newEnd,
        currentlyEditing: 'end'
      })
    }

  },

  _onSetRange: function(newStart, newEnd) {
    this.props.onRangeChange({
      startDate: newStart,
      endDate: newEnd
    });
    this.setState({
      currentlyEditing: null,
      inspecting: null
    });
  },

  _getHighlightedRange: function() {

    // 'inspecting' is the calendar day the user is currently hovering over
    // 'currentlyEditing' is either 'start' or 'end' or null, depending on which
    // date the user has selected for editing.  null if they haven't selected.
    const inspecting = this.state.inspecting,
        currentlyEditing = this.state.currentlyEditing;
    if (!this.state.inspecting) {
      return [
        this.state.startDate,
        this.state.endDate
      ];
    } else {
      if (currentlyEditing === 'start') {
        return [
          inspecting,
          this.state.endDate
        ]
      } else if (currentlyEditing === 'end') {
        return [
          this.state.startDate,
          inspecting
        ]
      }
    }

  },

  _renderSelectionControl: function() {
    if(this.props.presets) {
      return React.createElement(PresetPicker, {
        presets: this.props.presets,
        onSelectDateRange: function(start, end) { this._onSetRange(start, end) }.bind(this)
      });
    }

    return React.createElement(Calendar, {
      ref:'calendar',
      highlighted: this._getHighlightedRange(),
      initialDay: this.state.currentlyEditing === 'start' ?
        this.props.startDate : this.props.endDate,
      onInspectDate: function(day) { this.setState({ inspecting: day }) }.bind(this),
      onSelectDate: function(day) { this._onChange(day) }.bind(this)
    });
  },

  render: function() {
    const startDate = this.props.startDate;
    const endDate = this.props.endDate;
    const currentlyEditing = this.state.currentlyEditing;
    return (
      div({ className: 'daterange daterange--double'},
        React.createElement(RangePickerInput,
          {
            currentlyEditing: this.state.currentlyEditing,
            startDate: this.state.startDate,
            endDate: this.state.endDate,
            onSelectField: function(field) {
              if (this.refs.calendar) {

                let moment = this.state.currentlyEditing === 'start' ?

                this.props.endDate : this.props.startDate;
                this.refs.calendar.setMoment(moment);

              }
              this.setState( { currentlyEditing: field })

            }.bind(this)
          }
        ),
        currentlyEditing ? this._renderSelectionControl() : null
      )
    );
  }
})

const RangePickerInput = React.createClass({

  propTypes: {
    startDate: React.PropTypes.object.isRequired,
    endDate: React.PropTypes.object.isRequired,
    onSelectField: React.PropTypes.func.isRequired,
  },

  _getInputClassString: function(field, bases, editing) {
    let classString = bases;
    if (field === editing) {
      classString += ' dr-active'
    }
    return classString;
  },

  render: function() {
    const props = this.props,
        currentlyEditing = props.currentlyEditing,
        onSelectField = props.onSelectField,
        getEndClasses = this._getInputClassString
            .bind(this, 'end', 'dr-date dr-date-start'),
        getStartClasses = this._getInputClassString
            .bind(this, 'start', 'dr-date dr-date-start');

    const getInputClasses = function() {
      return currentlyEditing ? 'dr-input dr-active' : 'dr-input';
    }

    return (
      div({ className: getInputClasses() },
        div({ className: 'dr-dates' },
          div(
            {
              className: getStartClasses(currentlyEditing),
              contentEditable: true,
              onClick: function() { onSelectField('start') }
            },
              moment(props.startDate).
                startOf('day').format('MM/DD/YYYY')
          ),
          span({ className: 'dr-dates-dash'}, '-'),
          div(
            {
              className: getEndClasses(currentlyEditing),
              contentEditable: true,
              onClick: function() { onSelectField('end') }
            },
              moment(props.endDate).format('MM/DD/YYYY')
          )
        )
      )
    )
  }
})

const PresetPicker = React.createClass({
  propTypes: {
    presets: React.PropTypes.array.isRequired,
    onSelectDateRange: React.PropTypes.func.isRequired
  },
  getInitialState: function() {
    return {};
  },
  render: function() {
    const props = this.props;
    return (
      div({ className: 'dr-selections'},
        div({ className: 'dr-calendar'},
          ul({ },
            props.presets.map(function(preset) {
              return li({
                key: `preset-${preset.label.replace(' ','-')}`,
                onClick: function() { props.onSelectDateRange(preset.start, preset.end) }
              }, preset.label)
            })
            )
        )
      )
    )
  }
})

const Calendar = React.createClass({
  // responsible for 'calendar level state'
  // ie what is current position (year and month)
  propTypes: {
    initialDay: React.PropTypes.object.isRequired,
    highlighted: React.PropTypes.array
  },
  getInitialState: function() {
    const props = this.props;
    return {
      currentPosition: this.props.initialDay.clone().startOf('month'),
    }
  },
  setMoment: function(m) {
    this.setState({
      currentPosition: m.clone().startOf('month')
    });
  },
  changePosition: function(type, dir){
    const mom = this.state.currentPosition;
    this.setState({
      currentPosition: moment(mom)[dir](1, type)
    });
  },
  _renderDaysOfWeek: function() {
    return ul({ className:'dr-days-of-week-list' },
      moment.weekdaysMin().map(function(d) {
        return li({ key: d, className: 'dr-day-of-week'}, d);
      })
    );
  },
  render: function() {

    const decMonth = this.changePosition.bind(this, 'month', DEC),
        incMonth = this.changePosition.bind(this, 'month', INC),
        decYear = this.changePosition.bind(this, 'year', DEC),
        incYear = this.changePosition.bind(this, 'year', INC);

    return (
      div({ className: 'dr-selections'},
        div({ className: 'dr-calendar'},
          div({ className: 'dr-range-switcher'},
            div({ className: 'dr-switcher dr-month-switcher'},
              i({ onClick: decMonth, className: 'dr-left'}),
              span({}, this.state.currentPosition.format('MMMM')),
              i({ onClick: incMonth, className: 'dr-right'})
            ),
            div({ className: 'dr-switcher dr-year-switcher'},
              i({ onClick: decYear, className: 'dr-left'}),
              span({}, this.state.currentPosition.format('YYYY')),
              i({ onClick: incYear, className: 'dr-right'})
            )
          ), this._renderDaysOfWeek(),
          React.createElement(MonthDisplay,
            {
              highlighted: this.props.highlighted,
              date: this.state.currentPosition,
              onInspectDate: this.props.onInspectDate,
              onSelectDate: this.props.onSelectDate
            }
          )
        )
      )
    )
  }
})

const MonthDisplay = React.createClass({

  propTypes: {
    date: React.PropTypes.object.isRequired,
    highlighted: React.PropTypes.array.isRequired,
    onInspectDate: React.PropTypes.func.isRequired,
    onSelectDate: React.PropTypes.func.isRequired
  },

  getDefaultProps: function() {
    return {
      date: moment(),
      highlighted: []
    }
  },

  _getWeekFromMoment: function(mom) {
    const startOf = moment(mom).startOf('week');
    return [
      startOf, moment(startOf).add(1, 'day'),
      moment(startOf).add(2, 'day'), moment(startOf).add(3, 'day'),
      moment(startOf).add(4, 'day'), moment(startOf).add(5, 'day'),
      moment(startOf).add(6, 'day')
    ];
  },

  _getOutsiders: function() {
    const month = this.props.date;
    const start = moment(month).startOf('month'),
        end = moment(month).endOf('month');
    return {
      left: this._getWeekFromMoment(start).slice(0, parseInt(start.format('d'))),
      right: this._getWeekFromMoment(end).slice(parseInt(end.format('d')) + 1, 7)
    }
  },

  _getCalendarArray: function() {
    var month = this.props.date,
        numDays = month.daysInMonth(),
        // array containing the range of 0 - n
        days = Array.apply(null, Array(numDays)).map(function (_, i) {return i;}),
        outsiders = this._getOutsiders();

    return outsiders.left.map(function(m) {
        return {
          in: false,
          day: m
        };
    })
    .concat(days.map(function(i) {
        return {
          in: true,
          day: moment(month).add(i, 'day')
        };
    }))
    .concat(outsiders.right.map(function(m) {
        return {
          in: false,
          day: m
        };
    }));

  },

  render: function() {
    var month = this.props.date,
        highlighted = this.props.highlighted,
        onInspect = this.props.onInspectDate,
        onSelectDate = this.props.onSelectDate

    return (
      ul({ className: 'dr-day-list', onMouseLeave: function() {
        onInspect(null);
      }},
        this._getCalendarArray().map(function(conf, i) {
          var classString = 'dr-day';
          if (!conf.in) {
            classString += ' dr-fade';
          }

          if (highlighted.length === 1)  {
            if (conf.day === highlighted[0]) {
              classString += ' dr-selected';
            }
          }

          if (highlighted.length === 2) {
            if (conf.day.isBetween(moment(highlighted[0]).subtract(1, 'day'), moment(highlighted[1]).add(1, 'day'))) {
              classString += ' dr-selected';
            }
          }

          var selectDate = function() {
            onSelectDate(conf.day)
          }

          var onInspectDate = function() {
            onInspect(conf.day);
          };

          return li({ key: i, className: classString, onClick: selectDate, onMouseEnter: onInspectDate}, conf.day.format('D'))
        })
      )
    )
  }
});

export default clickOutSide(RangePicker);
