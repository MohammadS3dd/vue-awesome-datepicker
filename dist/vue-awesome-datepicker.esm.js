import { defineComponent, pushScopeId, popScopeId, openBlock, createBlock, createVNode, Transition, toDisplayString, Fragment, renderList, createCommentVNode, withScopeId } from 'vue';

var script = defineComponent({
  props: {
    date: {
      type: Object
    },
    lang: {
      type: String
    },
    type: {
      type: String
    },
    preSelectedModel: {
      type: Object
    },
    holidayMap: {
      type: Object
    },
    disabledMap: {
      type: Object
    },
    events: {
      type: Array
    },
    forwardLimit: {
      type: Object
    },
    backwardLimit: {
      type: Object
    },
    selectable: {
      type: Object
    }
  },

  setup(props, ctx) {
    const dmHandle = t => {
      ctx.emit('datemodel', t);
      ctx.emit('update:modelValue', t);
    };

    return {
      dmHandle
    };
  },

  data() {
    return {
      toolkit: {
        isLeapYear(year) {
          const ary = year > 1342 ? [1, 5, 9, 13, 17, 22, 26, 30] : [1, 5, 9, 13, 17, 21, 26, 30];

          const _b = year % 33;

          return ary.includes(_b);
        },

        getLastDayOfMonth({
          year,
          month
        }) {
          const y = year;
          const m = month;

          if (m >= 1 && m <= 6) {
            return 31;
          } else if (m >= 7 && m < 12) {
            return 30;
          } else if (this.isLeapYear(y)) {
            /* Leap year */
            return 30;
          } else {
            return 29;
          }
        },

        getGregorian(pd) {
          let jy = pd.year;
          const jm = pd.month;
          const jd = pd.date;
          let gy;

          if (jy > 979) {
            gy = 1600;
            jy -= 979;
          } else {
            gy = 621;
          }

          let days = 365 * jy + parseInt(jy / 33) * 8 + parseInt((jy % 33 + 3) / 4) + 78 + jd + (jm < 7 ? (jm - 1) * 31 : (jm - 7) * 30 + 186);
          gy += 400 * parseInt(days / 146097);
          days %= 146097;

          if (days > 36524) {
            gy += 100 * parseInt(--days / 36524);
            days %= 36524;
            if (days >= 365) days++;
          }

          gy += 4 * parseInt(days / 1461);
          days %= 1461;

          if (days > 365) {
            gy += parseInt((days - 1) / 365);
            days = (days - 1) % 365;
          }

          let gd = days + 1;
          const sala = [0, 31, gy % 4 === 0 && gy % 100 !== 0 || gy % 400 === 0 ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
          let gm;

          for (gm = 0; gm < 13; gm++) {
            const v = sala[gm];
            if (gd <= v) break;
            gd -= v;
          }

          const pdt = new Date(gy, gm - 1, gd, 1, 0, 0, 0);
          const gds = [1, 2, 3, 4, 5, 6, 0];
          return {
            gregorian: pdt,
            weekday: gds[pdt.getDay()]
          };
        },

        getJalali(dt) {
          let gy = dt.getFullYear();
          const gm = dt.getMonth() + 1;
          const gd = dt.getDate();
          let jy;
          const gdm = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334];

          if (gy > 1600) {
            jy = 979;
            gy -= 1600;
          } else {
            jy = 0;
            gy -= 621;
          }

          const gy2 = gm > 2 ? gy + 1 : gy;
          let days = 365 * gy + parseInt((gy2 + 3) / 4) - parseInt((gy2 + 99) / 100) + parseInt((gy2 + 399) / 400) - 80 + gd + gdm[gm - 1];
          jy += 33 * parseInt(days / 12053);
          days %= 12053;
          jy += 4 * parseInt(days / 1461);
          days %= 1461;

          if (days > 365) {
            jy += parseInt((days - 1) / 365);
            days = (days - 1) % 365;
          }

          const jm = days < 186 ? 1 + parseInt(days / 31) : 7 + parseInt((days - 186) / 30);
          const jd = 1 + (days < 186 ? days % 31 : (days - 186) % 30);
          dt = new Date();
          const pd = {};
          pd.year = jy;
          pd.month = jm;
          pd.date = jd;
          pd.gDate = dt;
          return pd;
        },

        now() {
          return this.getJalali(new Date());
        },

        nextMonth({
          year,
          month
        }) {
          const m = month % 12 + 1;
          const y = parseInt(month / 12) + year;
          return {
            year: y,
            month: m
          };
        },

        prevMonth({
          year,
          month
        }) {
          const m = (12 + (month - 2) % 12) % 12 + 1;
          const y = year + (month === 1 ? -1 : 0);
          return {
            year: y,
            month: m
          };
        },

        getMeta(now) {
          now.date = 1;
          const nextm = this.nextMonth({
            year: now.year,
            month: now.month
          });
          nextm.date = 1;
          const ng = this.getGregorian(nextm);
          const g = this.getGregorian(now);
          const prevLWD = (g.weekday + 6) % 7;
          const currLWD = (ng.weekday + 6) % 7;
          const currLD = this.getLastDayOfMonth(now);
          const prevLD = this.getLastDayOfMonth(this.prevMonth(now));
          return {
            currLD,
            prevLWD,
            prevLD,
            currLWD
          };
        }

      },
      inpday: null,
      Settings: {
        Jalali: {
          monthNames: ['فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور', 'مهر', 'آبان', 'آذر', 'دی', 'بهمن', 'اسفند'],
          WD: ['ش', 'ی', 'د', 'س', 'چ', 'پ', 'ج'],
          setup: [0, 1, 2, 3, 4, 5, 6],
          persianNumeric: ['٠', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹']
        },
        Greg: {
          WD: ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'],
          setup: [0, 1, 2, 3, 4, 5, 6]
        }
      },
      prevMap: [1, 2, 3, 4, 5, 6, 0],
      nextMap: [6, 5, 4, 3, 2, 1, 0],
      month: {},
      inputType: null,
      dateModel: {},
      selectedDateModel: {},
      selectedDateMap: {},
      eventsMap: {},
      isSelectableMap: {},
      animationIn: '',
      animationDirection: '',
      changeKey: 0.1,
      dateselected: {}
    };
  },

  computed: {
    now() {
      if (this.locale === 'Jalali') {
        return this.toolkit.now();
      } else {
        const now = new Date();
        return {
          year: now.getFullYear(),
          month: now.getMonth(),
          date: now.getDate()
        };
      }
    },

    prevCounter() {
      return this.prevMap[(7 + (this.thisMonth.prev.LWDM - this.thisMonth.settings[0])) % 7];
    },

    nextCounter() {
      return this.nextMap[(7 + (this.thisMonth.current.LWDM - this.thisMonth.settings[0])) % 7];
    },

    thisMonth() {
      let today, curr, prev, cal;

      if (this.locale === 'Jalali') {
        const meta = this.toolkit.getMeta(this.month);
        cal = {
          prev: {
            LD: meta.prevLD,
            LWDM: meta.prevLWD
          },
          current: {
            month: this.month.month,
            monthSTD: this.month.month,
            LD: meta.currLD,
            LWDM: meta.currLWD,
            year: this.month.year,
            monthName: this.Settings.Jalali.monthNames[this.month.month - 1]
          },
          settings: this.Settings[this.locale].setup
        };
      } else {
        today = this.month;
        curr = new Date(today.year, today.month + 1, 0);
        prev = new Date(today.year, today.month, 0);
        cal = {
          prev: {
            LD: prev.getDate(),
            LWDM: prev.getDay()
          },
          current: {
            month: curr.getMonth(),
            monthSTD: curr.getMonth() + 1,
            LD: curr.getDate(),
            LWDM: curr.getDay(),
            year: curr.getFullYear(),
            monthName: curr.toLocaleString('default', {
              month: 'long'
            })
          },
          settings: this.Settings[this.locale].setup
        };
      }

      return cal;
    },

    locale() {
      return this.lang === 'Jalali' ? 'Jalali' : 'Greg';
    }

  },
  watch: {
    // inputType() {
    //   this.dateModel = { type: this.inputType, dates: [] }
    //   this.calcSelected()
    // },
    dateModel() {
      this.dmHandle(this.dateModel); // this.$emit('datemodel', this.dateModel)
    },

    dateselected() {
      this.handleDateSelected(this.dateselected);
    },

    month() {
      this.changeKey = Math.random();
    }

  },

  created() {
    this.month = this.now;
  },

  mounted() {
    var _this$preSelectedMode;

    this.month = this.now; // this.$on('dateselected', this.handleDateSelected)

    this.inputType = ((_this$preSelectedMode = this.preSelectedModel) === null || _this$preSelectedMode === void 0 ? void 0 : _this$preSelectedMode.type) || this.type || "single";
    this.dateModel = this.preSelectedModel || {};
    this.calcSelected();
    this.calcMapEvents();
    this.calcMapSelectable();
  },

  methods: {
    dPickHandle(event) {
      this.inpday = parseInt(event.target.textContent);
    },

    NextMonth() {
      this.animationDirection = this.locale === 'Jalali' ? 'direction-prev' : 'direction-next';
      this.month = this.toolkit.nextMonth(this.month);
    },

    PrevMonth() {
      this.animationDirection = this.locale === 'Jalali' ? 'direction-next' : 'direction-prev';
      this.month = this.toolkit.prevMonth(this.month);
    },

    normalizeDate(dateObj) {
      return {
        year: Number.parseInt(dateObj === null || dateObj === void 0 ? void 0 : dateObj.year),
        month: Number.parseInt(dateObj === null || dateObj === void 0 ? void 0 : dateObj.month),
        date: Number.parseInt(dateObj === null || dateObj === void 0 ? void 0 : dateObj.date)
      };
    },

    handleDateSelected(event) {
      var _this$selectedDateMap, _this$selectedDateMap2, _this$selectedDateMap3, _this$dateModel, _this$dateModel$dates, _this$dateModel2;

      const normalized = this.normalizeDate(event); // let dateModel = this.dateModel

      if ((_this$selectedDateMap = this.selectedDateMap) !== null && _this$selectedDateMap !== void 0 && (_this$selectedDateMap2 = _this$selectedDateMap[normalized === null || normalized === void 0 ? void 0 : normalized.year]) !== null && _this$selectedDateMap2 !== void 0 && (_this$selectedDateMap3 = _this$selectedDateMap2[normalized === null || normalized === void 0 ? void 0 : normalized.month]) !== null && _this$selectedDateMap3 !== void 0 && _this$selectedDateMap3[normalized === null || normalized === void 0 ? void 0 : normalized.date]) {
        const arr = this.dateModel.dates.filter(el => {
          var _el, _el2, _el3;

          el = this.normalizeDate(el);
          return !(((_el = el) === null || _el === void 0 ? void 0 : _el.year) === (normalized === null || normalized === void 0 ? void 0 : normalized.year) && ((_el2 = el) === null || _el2 === void 0 ? void 0 : _el2.month) === (normalized === null || normalized === void 0 ? void 0 : normalized.month) && ((_el3 = el) === null || _el3 === void 0 ? void 0 : _el3.date) === (normalized === null || normalized === void 0 ? void 0 : normalized.date)) || event.all;
        });
        this.dateModel.dates = arr;
      } else {
        switch (this.inputType) {
          case 'single':
            this.dateModel = {
              type: 'single',
              dates: [normalized]
            };
            break;

          case 'range':
            if (this.dateModel) this.dateModel.type = 'range';

            if (((_this$dateModel = this.dateModel) === null || _this$dateModel === void 0 ? void 0 : (_this$dateModel$dates = _this$dateModel.dates) === null || _this$dateModel$dates === void 0 ? void 0 : _this$dateModel$dates.length) === 1) {
              this.dateModel.dates.push(normalized);
            } else {
              this.dateModel.dates = [normalized];
            }

            break;

          case 'multiple':
            if (!this.dateModel.dates) {
              this.dateModel = {
                type: 'multiple',
                dates: []
              };
            }

            ((_this$dateModel2 = this.dateModel) === null || _this$dateModel2 === void 0 ? void 0 : _this$dateModel2.dates) && this.dateModel.dates.push(normalized);
        }
      } // this.dateModel = dateModel


      this.calcSelected();
    },

    isHoliday(day) {
      var _this$holidayMap, _this$holidayMap$this, _this$holidayMap$this2;

      const thisMonth = this.thisMonth;
      return !!((_this$holidayMap = this.holidayMap) !== null && _this$holidayMap !== void 0 && (_this$holidayMap$this = _this$holidayMap[thisMonth.current.year]) !== null && _this$holidayMap$this !== void 0 && (_this$holidayMap$this2 = _this$holidayMap$this[thisMonth.current.monthSTD]) !== null && _this$holidayMap$this2 !== void 0 && _this$holidayMap$this2[day]) || (thisMonth.prev.LWDM + day + 1) % 7 === 0 && this.locale === 'Jalali';
    },

    calcSelected() {
      const dateModel = this.dateModel;

      if (dateModel !== null && dateModel !== void 0 && dateModel.dates) {
        const map = {};

        for (let i = 0; i < dateModel.dates.length; i++) {
          var _map$year, _map$year2, _map$year2$month;

          const year = dateModel.dates[i].year;
          const month = dateModel.dates[i].month;
          const date = dateModel.dates[i].date;

          if (!map[year]) {
            map[year] = {};
          }

          if (!((_map$year = map[year]) !== null && _map$year !== void 0 && _map$year[month])) {
            map[year][month] = {};
          }

          if (!((_map$year2 = map.year) !== null && _map$year2 !== void 0 && (_map$year2$month = _map$year2.month) !== null && _map$year2$month !== void 0 && _map$year2$month.date)) {
            map[year][month][date] = true;
          }
        }

        this.selectedDateMap = map;
      }
    },

    calcMapEvents() {
      const model = this.events;

      if (model) {
        const map = {};

        for (let i = 0; i < model.length; i++) {
          var _map$year3, _map$year4, _map$year4$month;

          const year = model[i].year;
          const month = model[i].month;
          const date = model[i].date;
          const count = model[i].count;
          const color = model[i].color;

          if (!map[year]) {
            map[year] = {};
          }

          if (!((_map$year3 = map[year]) !== null && _map$year3 !== void 0 && _map$year3[month])) {
            map[year][month] = {};
          }

          if (!((_map$year4 = map.year) !== null && _map$year4 !== void 0 && (_map$year4$month = _map$year4.month) !== null && _map$year4$month !== void 0 && _map$year4$month.date)) {
            map[year][month][date] = {};
          }

          map[year][month][date] = {
            count,
            color
          };
        }

        this.eventsMap = map;
      }
    },

    calcMapSelectable() {
      const model = this.selectable;

      if (model) {
        const map = {};

        for (let i = 0; i < ((_model$dates = model.dates) === null || _model$dates === void 0 ? void 0 : _model$dates.length); i++) {
          var _model$dates, _model$dates2, _model$dates3, _model$dates4, _map$year5, _map$year6, _map$year6$month;

          const year = (_model$dates2 = model.dates) === null || _model$dates2 === void 0 ? void 0 : _model$dates2[i].year;
          const month = (_model$dates3 = model.dates) === null || _model$dates3 === void 0 ? void 0 : _model$dates3[i].month;
          const date = (_model$dates4 = model.dates) === null || _model$dates4 === void 0 ? void 0 : _model$dates4[i].date;

          if (!map[year]) {
            map[year] = {};
          }

          if (!((_map$year5 = map[year]) !== null && _map$year5 !== void 0 && _map$year5[month])) {
            map[year][month] = {};
          }

          if (!((_map$year6 = map.year) !== null && _map$year6 !== void 0 && (_map$year6$month = _map$year6.month) !== null && _map$year6$month !== void 0 && _map$year6$month.date)) {
            map[year][month][date] = true;
          }
        }

        this.isSelectableMap = map;
      }
    },

    isSelectable(day) {
      var _this$selectable;

      const thisMonth = this.thisMonth;

      if (((_this$selectable = this.selectable) === null || _this$selectable === void 0 ? void 0 : _this$selectable.type) === 'multiple') {
        var _this$isSelectableMap, _this$isSelectableMap2, _this$isSelectableMap3;

        return !!((_this$isSelectableMap = this.isSelectableMap) !== null && _this$isSelectableMap !== void 0 && (_this$isSelectableMap2 = _this$isSelectableMap[thisMonth.current.year]) !== null && _this$isSelectableMap2 !== void 0 && (_this$isSelectableMap3 = _this$isSelectableMap2[thisMonth.current.monthSTD]) !== null && _this$isSelectableMap3 !== void 0 && _this$isSelectableMap3[day]);
      }

      return true;
    },

    isEvent(day) {
      var _this$eventsMap, _this$eventsMap$thisM, _this$eventsMap$thisM2;

      const thisMonth = this.thisMonth;
      return !!((_this$eventsMap = this.eventsMap) !== null && _this$eventsMap !== void 0 && (_this$eventsMap$thisM = _this$eventsMap[thisMonth.current.year]) !== null && _this$eventsMap$thisM !== void 0 && (_this$eventsMap$thisM2 = _this$eventsMap$thisM[thisMonth.current.monthSTD]) !== null && _this$eventsMap$thisM2 !== void 0 && _this$eventsMap$thisM2[day]);
    },

    isSelected(day) {
      var _this$selectedDateMap4, _this$selectedDateMap5, _this$selectedDateMap6;

      const thisMonth = this.thisMonth;
      return !!((_this$selectedDateMap4 = this.selectedDateMap) !== null && _this$selectedDateMap4 !== void 0 && (_this$selectedDateMap5 = _this$selectedDateMap4[thisMonth.current.year]) !== null && _this$selectedDateMap5 !== void 0 && (_this$selectedDateMap6 = _this$selectedDateMap5[thisMonth.current.monthSTD]) !== null && _this$selectedDateMap6 !== void 0 && _this$selectedDateMap6[day]);
    },

    isDisabled(day) {
      var _this$disabledMap, _this$disabledMap$thi, _this$disabledMap$thi2;

      const thisMonth = this.thisMonth;
      return !!((_this$disabledMap = this.disabledMap) !== null && _this$disabledMap !== void 0 && (_this$disabledMap$thi = _this$disabledMap[thisMonth.current.year]) !== null && _this$disabledMap$thi !== void 0 && (_this$disabledMap$thi2 = _this$disabledMap$thi[thisMonth.current.monthSTD]) !== null && _this$disabledMap$thi2 !== void 0 && _this$disabledMap$thi2[day]);
    },

    isInrange(day) {
      var _this$dateModel3, _this$dateModel4;

      if (((_this$dateModel3 = this.dateModel) === null || _this$dateModel3 === void 0 ? void 0 : _this$dateModel3.type) === 'range' && ((_this$dateModel4 = this.dateModel) === null || _this$dateModel4 === void 0 ? void 0 : _this$dateModel4.dates.length) === 2) {
        var _this$dateModel5, _this$dateModel5$date, _this$dateModel6, _this$dateModel6$date;

        const thisMonth = this.thisMonth;
        const now = new Date(thisMonth.current.year, thisMonth.current.monthSTD, day);
        const f = this.normalizeDate((_this$dateModel5 = this.dateModel) === null || _this$dateModel5 === void 0 ? void 0 : (_this$dateModel5$date = _this$dateModel5.dates) === null || _this$dateModel5$date === void 0 ? void 0 : _this$dateModel5$date[0]);
        const s = this.normalizeDate((_this$dateModel6 = this.dateModel) === null || _this$dateModel6 === void 0 ? void 0 : (_this$dateModel6$date = _this$dateModel6.dates) === null || _this$dateModel6$date === void 0 ? void 0 : _this$dateModel6$date[1]);
        let fD = new Date(f.year, f.month, f.date);
        let sD = new Date(s.year, s.month, s.date);

        if (sD < fD) {
          const t = fD;
          fD = sD;
          sD = t;
        }

        return {
          value: fD < now && now < sD,
          isFirstDay: +fD === +now,
          isLastDay: +sD === +now
        };
      }

      return {
        value: false,
        isFirstDay: false,
        isLastDay: false
      };
    },

    inp(event) {
      this.inpday = parseInt(event.target.value);
      const day = this.inpday ? this.inpday : 1;
      const m = this.thisMonth.current.monthSTD;
      this.dateselected = {
        year: this.thisMonth.current.year,
        month: m,
        date: day
      };
      return '' + this.thisMonth.current.year + '/' + m + '/' + day;
    },

    handleInputtypeChange() {
      this.dateModel = {
        type: this.inputType,
        dates: []
      };
      this.calcSelected();
    },

    getEventCount(day) {
      var _this$eventsMap2, _this$eventsMap2$this, _this$eventsMap2$this2, _this$eventsMap2$this3;

      const thisMonth = this.thisMonth;
      return (_this$eventsMap2 = this.eventsMap) === null || _this$eventsMap2 === void 0 ? void 0 : (_this$eventsMap2$this = _this$eventsMap2[thisMonth.current.year]) === null || _this$eventsMap2$this === void 0 ? void 0 : (_this$eventsMap2$this2 = _this$eventsMap2$this[thisMonth.current.monthSTD]) === null || _this$eventsMap2$this2 === void 0 ? void 0 : (_this$eventsMap2$this3 = _this$eventsMap2$this2[day]) === null || _this$eventsMap2$this3 === void 0 ? void 0 : _this$eventsMap2$this3.count;
    },

    getEventColor(day) {
      var _this$eventsMap3, _this$eventsMap3$this, _this$eventsMap3$this2, _this$eventsMap3$this3;

      const thisMonth = this.thisMonth;
      return (_this$eventsMap3 = this.eventsMap) === null || _this$eventsMap3 === void 0 ? void 0 : (_this$eventsMap3$this = _this$eventsMap3[thisMonth.current.year]) === null || _this$eventsMap3$this === void 0 ? void 0 : (_this$eventsMap3$this2 = _this$eventsMap3$this[thisMonth.current.monthSTD]) === null || _this$eventsMap3$this2 === void 0 ? void 0 : (_this$eventsMap3$this3 = _this$eventsMap3$this2[day]) === null || _this$eventsMap3$this3 === void 0 ? void 0 : _this$eventsMap3$this3.color;
    },

    getPersianNumeric(day) {
      let str = '';

      if (typeof day === 'number') {
        const nums = this.Settings.Jalali.persianNumeric;
        str = day.toString();

        for (let i = 0; i < str.length; i++) {
          let num = Number.parseInt(str[i]);
          num = nums[num];
          str = str.slice(0, i) + num + str.slice(i + 1);
        }
      }

      return str;
    },

    addMonth() {
      for (let i = 1; i <= this.thisMonth.current.LD; i++) {
        if (this.isSelectable(i)) {
          this.handleDateSelected({
            year: this.month.year,
            month: this.thisMonth.current.monthSTD,
            date: i,
            all: true
          });
        }
      }
    },

    gotoToday() {
      this.month = this.now;
    },

    isForwardLimit() {
      const limit = this.forwardLimit;
      const next = this.toolkit.nextMonth(this.month);

      if (limit) {
        if (next.year > limit.year) {
          return false;
        }

        if (next.year === limit.year && next.month > limit.month) {
          return false;
        }
      }

      return true;
    },

    isBackwardLimit() {
      const limit = this.backwardLimit;
      const prev = this.toolkit.prevMonth(this.month);

      if (limit) {
        if (prev.year < limit.year) {
          return false;
        }

        if (prev.year === limit.year && prev.month < limit.month) {
          return false;
        }
      }

      return true;
    },

    isToday(day) {
      const now = this.toolkit.getJalali(new Date());
      return now.yaer === this.thisMonth.current.yaer && now.month === this.thisMonth.current.monthSTD && now.date === day;
    }

  }
});

const _withId = /*#__PURE__*/withScopeId("data-v-0a5cef92");

pushScopeId("data-v-0a5cef92");

const _hoisted_1 = {
  class: "datepicker"
};

const _hoisted_2 = /*#__PURE__*/createVNode("path", {
  fill: "none",
  d: "M0 0h24v24H0z"
}, null, -1);

const _hoisted_3 = /*#__PURE__*/createVNode("path", {
  class: "fill-current dp-text-white",
  d: "M7.828 11H20v2H7.828l5.364 5.364-1.414 1.414L4 12l7.778-7.778 1.414 1.414z"
}, null, -1);

const _hoisted_4 = {
  class: "dp-h-full dp-w-auto flex justify-center"
};
const _hoisted_5 = {
  class: "dp-text-norm items-center flex dp-text-gray-800 dp-text-sm dp-font-bold"
};

const _hoisted_6 = /*#__PURE__*/createVNode("path", {
  fill: "none",
  d: "M0 0h24v24H0z"
}, null, -1);

const _hoisted_7 = /*#__PURE__*/createVNode("path", {
  class: "fill-current dp-text-white",
  d: "M16.172 11l-5.364-5.364 1.414-1.414L20 12l-7.778 7.778-1.414-1.414L16.172 13H4v-2z"
}, null, -1);

const _hoisted_8 = {
  class: "inrow dp-py-2 dp-border-b dp-border-dashed"
};
const _hoisted_9 = {
  class: "dp-sii"
};
const _hoisted_10 = {
  class: "flex flex-wrap dp-mt-3 dp-mx-3"
};

popScopeId();

const render = /*#__PURE__*/_withId((_ctx, _cache, $props, $setup, $data, $options) => {
  return openBlock(), createBlock("div", {
    class: "wraper",
    onDateselected: _cache[6] || (_cache[6] = (...args) => _ctx.handleDateSelected && _ctx.handleDateSelected(...args))
  }, [createVNode("div", _hoisted_1, [createVNode("div", {
    dir: _ctx.locale === 'Jalali' ? 'rtl' : 'ltr',
    class: ["dp-header", [_ctx.locale === 'Jalali' ? '' : '', _ctx.animationDirection]]
  }, [createVNode("button", {
    class: ["dp-bg-white dp-rounded-md dp-text-white dp-w-6 dp-h-6 justify-center flex dp-focus:outline-none", [!_ctx.isBackwardLimit() ? 'dp-bg-gray-400' : 'dp-bg-yellow-400']],
    "v-show": _ctx.isBackwardLimit(),
    disabled: !_ctx.isBackwardLimit(),
    onClick: _cache[1] || (_cache[1] = (...args) => _ctx.PrevMonth && _ctx.PrevMonth(...args))
  }, [(openBlock(), createBlock("svg", {
    xmlns: "http://www.w3.org/2000/svg",
    viewBox: "0 0 24 24",
    class: ["dp-h-full dp-w-5 dp-text-sm dp-pointer-events-none", {
      flipH: _ctx.locale === 'Jalali'
    }]
  }, [_hoisted_2, _hoisted_3], 2))], 10, ["v-show", "disabled"]), createVNode(Transition, {
    name: "fade"
  }, {
    default: _withId(() => [(openBlock(), createBlock("div", {
      key: _ctx.changeKey,
      class: "dp-absolute dp-top-1/3 dp-left-1/2 dp--translate-x-1/2 dp-transform"
    }, [createVNode("div", _hoisted_4, [createVNode("span", _hoisted_5, toDisplayString(_ctx.thisMonth.current.monthName) + " " + toDisplayString(_ctx.locale === "Jalali" ? _ctx.getPersianNumeric(_ctx.thisMonth.current.year) : _ctx.thisMonth.current.year), 1)])]))]),
    _: 1
  }), createVNode("button", {
    class: ["dp-bg-white dp-rounded-md dp-text-white dp-w-6 dp-h-6 justify-center flex dp-focus:outline-none", [!_ctx.isForwardLimit() ? 'dp-bg-gray-400' : 'dp-bg-yellow-400']],
    "v-show": _ctx.isForwardLimit(),
    disabled: !_ctx.isForwardLimit(),
    onClick: _cache[2] || (_cache[2] = (...args) => _ctx.NextMonth && _ctx.NextMonth(...args))
  }, [(openBlock(), createBlock("svg", {
    xmlns: "http://www.w3.org/2000/svg",
    viewBox: "0 0 24 24",
    class: ["dp-h-full dp-w-5 dp-text-sm dp-pointer-events-none dp-focus:outline-none", {
      flipH: _ctx.locale === 'Jalali'
    }]
  }, [_hoisted_6, _hoisted_7], 2))], 10, ["v-show", "disabled"])], 10, ["dir"]), createVNode("div", {
    class: ["calender", {
      rtl: _ctx.locale === 'Jalali'
    }]
  }, [createVNode("div", _hoisted_8, [(openBlock(true), createBlock(Fragment, null, renderList(_ctx.Settings[_ctx.locale].WD, day => {
    return openBlock(), createBlock("div", {
      key: day,
      class: "dp-text-yellow-500 days dp-text-base dp-font-medium"
    }, toDisplayString(day), 1);
  }), 128))]), createVNode("div", {
    class: ["dp-main", _ctx.animationDirection]
  }, [createVNode(Transition, {
    name: "slideX",
    class: _ctx.animationDirection
  }, {
    default: _withId(() => [(openBlock(), createBlock("div", {
      key: _ctx.changeKey,
      class: "inrow dp-main-inner"
    }, [(openBlock(true), createBlock(Fragment, null, renderList(_ctx.prevCounter, day => {
      return openBlock(), createBlock("div", {
        key: day + 'prev',
        class: "dp-text-gray-300 days dp-font-bold dp-h-8",
        style: {}
      }, toDisplayString(_ctx.locale === "Jalali" ? _ctx.getPersianNumeric(_ctx.thisMonth.prev.LD - _ctx.prevCounter + day) : _ctx.thisMonth.prev.LD - _ctx.prevCounter + day), 1);
    }), 128)), (openBlock(true), createBlock(Fragment, null, renderList(_ctx.thisMonth.current.LD, day => {
      return openBlock(), createBlock("button", {
        key: day + 'c',
        class: ["days dp-bt-m dp-font-medium dp-h-8 cursor-pointer group dp-relative", [_ctx.isHoliday(day) ? 'dp-text-red-400' : '', _ctx.isDisabled(day) || !_ctx.isSelectable(day) ? 'dp-text-gray-300' : 'dp-text-gray-900 days-curr']],
        style: {},
        disabled: _ctx.isDisabled(day) || !_ctx.isSelectable(day),
        value: day,
        onClick: _cache[3] || (_cache[3] = (...args) => _ctx.inp && _ctx.inp(...args))
      }, [createVNode("span", {
        class: ["flex dp-si dp-rounded items-center justify-center group-hover:dp-bg-transparent group-dp-focus:dp-bg-transparent dp-bg-opacity-70 justify-center items-center dp-w-7 dp-h-7 dp-pointer-events-none", [_ctx.isSelected(day) && !(_ctx.isInrange(day).isFirstDay || _ctx.isInrange(day).isLastDay) ? 'dp-bg-yellow-400 dp-text-white day-selected  ' : '', _ctx.isInrange(day).value ? 'dp-bg-yellow-400 dp-w-full dp-text-white not-round' : '', _ctx.isInrange(day).isFirstDay && _ctx.locale === 'Jalali' ? 'dp-bg-yellow-400 rounded-r-force dp-w-full dp-text-white' : '', _ctx.isInrange(day).isLastDay && _ctx.locale === 'Jalali' ? 'dp-bg-yellow-400 rounded-l-force dp-w-full dp-text-white' : '', _ctx.isInrange(day).isFirstDay && _ctx.locale === 'Greg' ? 'dp-bg-yellow-400 rounded-l-force dp-w-full dp-text-white' : '', _ctx.isInrange(day).isLastDay && _ctx.locale === 'Greg' ? 'dp-bg-yellow-400 rounded-r-force dp-w-full dp-text-white' : '', _ctx.isToday(day) && !_ctx.isSelected(day) ? 'ring-yellow-400 ring-2' : '']],
        value: day
      }, [createVNode("span", _hoisted_9, toDisplayString(_ctx.locale === "Jalali" ? _ctx.getPersianNumeric(day) : day), 1)], 10, ["value"]), !!_ctx.isEvent(day) ? (openBlock(), createBlock("div", {
        key: 0,
        class: ["dp-absolute flex justify-center items-center dp-font-mono dp-w-3 dp-h-3 dp-rounded-full dp-left-1/2 dp--bottom-1 text-xxs dp-text-white dp-transform -translate-x-1/2 dp-pointer-events-none", ['dp-bg-' + _ctx.getEventColor(day) + '-400']]
      }, null, 2)) : createCommentVNode("", true)], 10, ["disabled", "value"]);
    }), 128)), (openBlock(true), createBlock(Fragment, null, renderList(_ctx.nextCounter, day => {
      return openBlock(), createBlock("div", {
        key: day + 'next',
        class: "dp-text-gray-300 days dp-font-bold dp-h-8",
        style: {}
      }, toDisplayString(_ctx.locale === "Jalali" ? _ctx.getPersianNumeric(day) : day), 1);
    }), 128))]))]),
    _: 1
  }, 8, ["class"])], 2), createVNode("div", _hoisted_10, [createVNode("button", {
    class: "dp-bg-green-400 dp-text-white dp-p-2 dp-rounded-xl dp-font-bold dp-text-sm dp-mx-1 outline-none dp-focus:outline-none",
    onClick: _cache[4] || (_cache[4] = (...args) => _ctx.gotoToday && _ctx.gotoToday(...args))
  }, toDisplayString(_ctx.locale === "Jalali" ? "امروز" : "Today"), 1), _ctx.dateModel.type === 'multiple' ? (openBlock(), createBlock("button", {
    key: 0,
    class: "dp-bg-red-400 dp-text-white dp-p-2 dp-rounded-xl dp-font-bold dp-text-sm dp-mx-1 outline-none dp-focus:outline-none",
    onClick: _cache[5] || (_cache[5] = (...args) => _ctx.addMonth && _ctx.addMonth(...args))
  }, toDisplayString(_ctx.locale === "Jalali" ? "انتخاب ماه" : "select This Month"), 1)) : createCommentVNode("", true)])], 2)])], 32);
});

function styleInject(css, ref) {
  if ( ref === void 0 ) ref = {};
  var insertAt = ref.insertAt;

  if (!css || typeof document === 'undefined') { return; }

  var head = document.head || document.getElementsByTagName('head')[0];
  var style = document.createElement('style');
  style.type = 'text/css';

  if (insertAt === 'top') {
    if (head.firstChild) {
      head.insertBefore(style, head.firstChild);
    } else {
      head.appendChild(style);
    }
  } else {
    head.appendChild(style);
  }

  if (style.styleSheet) {
    style.styleSheet.cssText = css;
  } else {
    style.appendChild(document.createTextNode(css));
  }
}

var css_248z = "\n[data-v-0a5cef92]:root {\r\n  -moz-tab-size: 4;\r\n  -o-tab-size: 4;\r\n  tab-size: 4;\n}\nhtml[data-v-0a5cef92] {\r\n  line-height: 1.15;\r\n  -webkit-text-size-adjust: 100%;\n}\nbody[data-v-0a5cef92] {\r\n  margin: 0;\r\n  font-family: system-ui, -apple-system, Segoe UI, Roboto, Ubuntu, Cantarell,\r\n    Noto Sans, sans-serif, \"Segoe UI\", Helvetica, Arial, \"Apple Color Emoji\",\r\n    \"Segoe UI Emoji\";\n}\nhr[data-v-0a5cef92] {\r\n  height: 0;\r\n  color: inherit;\n}\nabbr[title][data-v-0a5cef92] {\r\n  -webkit-text-decoration: underline dotted;\r\n  text-decoration: underline dotted;\n}\nb[data-v-0a5cef92],\r\nstrong[data-v-0a5cef92] {\r\n  font-weight: bolder;\n}\ncode[data-v-0a5cef92],\r\nkbd[data-v-0a5cef92],\r\npre[data-v-0a5cef92],\r\nsamp[data-v-0a5cef92] {\r\n  font-family: ui-monospace, SFMono-Regular, Consolas, \"Liberation Mono\", Menlo,\r\n    monospace;\r\n  font-size: 1em;\n}\nsmall[data-v-0a5cef92] {\r\n  font-size: 80%;\n}\nsub[data-v-0a5cef92],\r\nsup[data-v-0a5cef92] {\r\n  font-size: 75%;\r\n  line-height: 0;\r\n  position: relative;\r\n  vertical-align: baseline;\n}\nsub[data-v-0a5cef92] {\r\n  bottom: -0.25em;\n}\nsup[data-v-0a5cef92] {\r\n  top: -0.5em;\n}\ntable[data-v-0a5cef92] {\r\n  text-indent: 0;\r\n  border-color: inherit;\n}\nbutton[data-v-0a5cef92],\r\ninput[data-v-0a5cef92],\r\noptgroup[data-v-0a5cef92],\r\nselect[data-v-0a5cef92],\r\ntextarea[data-v-0a5cef92] {\r\n  font-family: inherit;\r\n  font-size: 100%;\r\n  line-height: 1.15;\r\n  margin: 0;\n}\nbutton[data-v-0a5cef92],\r\nselect[data-v-0a5cef92] {\r\n  text-transform: none;\n}\n[type=\"button\"][data-v-0a5cef92],\r\nbutton[data-v-0a5cef92] {\r\n  -webkit-appearance: button;\n}\nlegend[data-v-0a5cef92] {\r\n  padding: 0;\n}\nprogress[data-v-0a5cef92] {\r\n  vertical-align: baseline;\n}\nsummary[data-v-0a5cef92] {\r\n  display: list-item;\n}\nblockquote[data-v-0a5cef92],\r\ndd[data-v-0a5cef92],\r\ndl[data-v-0a5cef92],\r\nfigure[data-v-0a5cef92],\r\nh1[data-v-0a5cef92],\r\nh2[data-v-0a5cef92],\r\nh3[data-v-0a5cef92],\r\nh4[data-v-0a5cef92],\r\nh5[data-v-0a5cef92],\r\nh6[data-v-0a5cef92],\r\nhr[data-v-0a5cef92],\r\np[data-v-0a5cef92],\r\npre[data-v-0a5cef92] {\r\n  margin: 0;\n}\nbutton[data-v-0a5cef92] {\r\n  background-color: transparent;\r\n  background-image: none;\n}\nbutton[data-v-0a5cef92]:focus {\r\n  outline: 1px dotted;\r\n  outline: 5px auto -webkit-focus-ring-color;\n}\nfieldset[data-v-0a5cef92],\r\nol[data-v-0a5cef92],\r\nul[data-v-0a5cef92] {\r\n  margin: 0;\r\n  padding: 0;\n}\nol[data-v-0a5cef92],\r\nul[data-v-0a5cef92] {\r\n  list-style: none;\n}\nhtml[data-v-0a5cef92] {\r\n  font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Ubuntu,\r\n    Cantarell, Noto Sans, sans-serif, BlinkMacSystemFont, \"Segoe UI\",\r\n    \"Helvetica Neue\", Arial, \"Noto Sans\", \"Apple Color Emoji\", \"Segoe UI Emoji\",\r\n    \"Segoe UI Symbol\", \"Noto Color Emoji\";\r\n  line-height: 1.5;\n}\nbody[data-v-0a5cef92] {\r\n  font-family: inherit;\r\n  line-height: inherit;\n}\n*[data-v-0a5cef92],[data-v-0a5cef92]:after,[data-v-0a5cef92]:before {\r\n  box-sizing: border-box;\r\n  border: 0 solid #e5e7eb;\n}\nhr[data-v-0a5cef92] {\r\n  border-top-width: 1px;\n}\nimg[data-v-0a5cef92] {\r\n  border-style: solid;\n}\ntextarea[data-v-0a5cef92] {\r\n  resize: vertical;\n}\ninput[data-v-0a5cef92]::-moz-placeholder,\r\ntextarea[data-v-0a5cef92]::-moz-placeholder {\r\n  opacity: 1;\r\n  color: #9ca3af;\n}\ninput[data-v-0a5cef92]:-ms-input-placeholder,\r\ntextarea[data-v-0a5cef92]:-ms-input-placeholder {\r\n  opacity: 1;\r\n  color: #9ca3af;\n}\ninput[data-v-0a5cef92]::placeholder,\r\ntextarea[data-v-0a5cef92]::placeholder {\r\n  opacity: 1;\r\n  color: #9ca3af;\n}\nbutton[data-v-0a5cef92] {\r\n  cursor: pointer;\n}\ntable[data-v-0a5cef92] {\r\n  border-collapse: collapse;\n}\nh1[data-v-0a5cef92],\r\nh2[data-v-0a5cef92],\r\nh3[data-v-0a5cef92],\r\nh4[data-v-0a5cef92],\r\nh5[data-v-0a5cef92],\r\nh6[data-v-0a5cef92] {\r\n  font-size: inherit;\r\n  font-weight: inherit;\n}\na[data-v-0a5cef92] {\r\n  color: inherit;\r\n  text-decoration: inherit;\n}\nbutton[data-v-0a5cef92],\r\ninput[data-v-0a5cef92],\r\noptgroup[data-v-0a5cef92],\r\nselect[data-v-0a5cef92],\r\ntextarea[data-v-0a5cef92] {\r\n  padding: 0;\r\n  line-height: inherit;\r\n  color: inherit;\n}\ncode[data-v-0a5cef92],\r\nkbd[data-v-0a5cef92],\r\npre[data-v-0a5cef92],\r\nsamp[data-v-0a5cef92] {\r\n  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas,\r\n    \"Liberation Mono\", \"Courier New\", monospace;\n}\naudio[data-v-0a5cef92],\r\ncanvas[data-v-0a5cef92],\r\nembed[data-v-0a5cef92],\r\niframe[data-v-0a5cef92],\r\nimg[data-v-0a5cef92],\r\nobject[data-v-0a5cef92],\r\nsvg[data-v-0a5cef92],\r\nvideo[data-v-0a5cef92] {\r\n  display: block;\r\n  vertical-align: middle;\n}\nimg[data-v-0a5cef92],\r\nvideo[data-v-0a5cef92] {\r\n  max-width: 100%;\r\n  height: auto;\n}\n.wraper[data-v-0a5cef92] {\r\n  font-family: iranyekan, \"Vazir\" ;\r\n  -webkit-font-smoothing: antialiased;\r\n  -moz-osx-font-smoothing: grayscale;\r\n  text-rendering: optimizeLegibility;\r\n  background-color: transparent;\r\n  display: flex;\r\n  flex-direction: column;\r\n  height: auto;\r\n  width: auto;\n}\n.datepicker[data-v-0a5cef92] {\r\n  width: 20rem;\r\n  height: auto;\r\n  --ttw-bg-opacity: 1;\r\n  background-color: rgba(249, 250, 251, var(--ttw-bg-opacity));\r\n  display: flex;\r\n  flex-direction: column;\r\n  border-radius: 0.125rem;\r\n  -webkit-user-select: none;\r\n  -moz-user-select: none;\r\n  -ms-user-select: none;\r\n  user-select: none;\n}\n.dp-header[data-v-0a5cef92] {\r\n  display: flex;\r\n  flex-direction: row;\r\n  align-items: center;\r\n  justify-content: space-between;\r\n  height: 3rem;\r\n  padding: 0.75rem;\r\n  padding-left: 3rem;\r\n  padding-right: 3rem;\r\n  position: relative;\r\n  width: 100%;\n}\n.calender[data-v-0a5cef92] {\r\n  direction: ltr;\r\n  margin-top: 0.5rem;\r\n  margin-bottom: 0.5rem;\n}\n.dp-main[data-v-0a5cef92] {\r\n  height: 13rem;\r\n  overflow: hidden;\r\n  padding-right: 0.25rem;\r\n  position: relative;\r\n  width: 100%;\n}\n.dp-main-inner[data-v-0a5cef92] {\r\n  flex-wrap: wrap;\r\n  height: 100%;\r\n  width: 100%;\n}\n.inrow[data-v-0a5cef92] {\r\n  font-size: 0.85rem;\r\n  font-weight: 300;\r\n  flex: 1 0 21%;\r\n  display: flex;\r\n  flex-direction: row;\r\n  width: 100%;\n}\n.days[data-v-0a5cef92] {\r\n  flex: 0 0 14%;\r\n  display: flex;\r\n  align-items: center;\r\n  justify-content: center;\n}\n.dp-bt-m[data-v-0a5cef92] {\r\n  cursor: pointer;\r\n  font-weight: 500;\r\n  height: 2rem;\r\n  position: relative;\r\n  --ttw-text-opacity: 1;\r\n  color: rgba(17, 24, 39, var(--ttw-text-opacity));\n}\n.dp-si[data-v-0a5cef92] {\r\n  -webkit-text-size-adjust: 100%;\r\n  tab-size: 4;\r\n  -webkit-font-smoothing: antialiased;\r\n  user-select: none;\r\n  direction: ltr;\r\n  font-family: inherit;\r\n  font-size: 100%;\r\n  text-transform: none;\r\n  line-height: inherit;\r\n  cursor: pointer;\r\n  font-weight: 500;\r\n  --ttw-text-opacity: 1;\r\n  color: rgba(17, 24, 39, var(--ttw-text-opacity));\r\n  margin: 0;\r\n  padding: 0;\r\n  box-sizing: border-box;\r\n  border-width: 0;\r\n  border-style: solid;\r\n  border-color: #e5e7eb;\r\n  --ttw-shadow: 0 0 #0000;\r\n  --ttw-ring-inset: var(--ttw-empty, /*!*/ /*!*/);\r\n  --ttw-ring-offset-width: 0px;\r\n  --ttw-ring-offset-color: #fff;\r\n  --ttw-ring-color: rgba(59, 130, 246, 0.5);\r\n  --ttw-ring-offset-shadow: 0 0 #0000;\r\n  --ttw-ring-shadow: 0 0 #0000;\r\n  --ttw-bg-opacity: 0.7;\r\n  border-radius: 0.25rem;\r\n  display: flex;\r\n  align-items: center;\r\n  justify-content: center;\r\n  height: 1.75rem;\r\n  pointer-events: none;\r\n  width: 1.75rem;\n}\n.dp-sii[data-v-0a5cef92] {\r\n  display: flex;\r\n  position: absolute;\r\n  left: 50%;\r\n  --ttw-translate-y: 0;\r\n  --ttw-rotate: 0;\r\n  --ttw-skew-x: 0;\r\n  --ttw-skew-y: 0;\r\n  --ttw-scale-x: 1;\r\n  --ttw-scale-y: 1;\r\n  transform: translateX(var(--ttw-translate-x))\r\n    translateY(var(--ttw-translate-y)) rotate(var(--ttw-rotate))\r\n    skewX(var(--ttw-skew-x)) skewY(var(--ttw-skew-y)) scaleX(var(--ttw-scale-x))\r\n    scaleY(var(--ttw-scale-y));\r\n  --ttw-translate-x: -50%;\n}\n.days[data-v-0a5cef92]:focus {\r\n  outline: none;\n}\n.days-curr:hover span[data-v-0a5cef92] {\r\n  --ttw-bg-opacity: 1;\r\n  background-color: rgba(252, 211, 77, var(--ttw-bg-opacity));\n}\n.days-curr[data-v-0a5cef92]:focus {\r\n  outline: none;\n}\n.btn[data-v-0a5cef92] {\r\n  border-radius: 0.25rem;\r\n  cursor: pointer;\r\n  display: flex;\r\n  align-items: center;\r\n  justify-content: center;\r\n  height: 2.5rem;\n}\n.rtl[data-v-0a5cef92] {\r\n  direction: rtl;\n}\n.flipH[data-v-0a5cef92] {\r\n  display: block;\r\n  transform: scale(-1, 1);\n}\n.inp[data-v-0a5cef92] {\r\n  width: 18rem;\r\n  height: 2rem;\r\n  text-align: center;\r\n  border-radius: 0.375rem;\r\n  margin-top: 0.75rem;\r\n  outline: 2px solid transparent;\r\n  outline-offset: 2px;\n}\n.day-selected[data-v-0a5cef92] {\r\n  opacity: 1;\r\n  /*  background-color: rgba(110, 231, 183, 1); */\n}\n.day-selected[data-v-0a5cef92]:hover {\r\n  --ttw-bg-opacity: 1;\r\n  background-color: rgba(252, 211, 77, var(--ttw-bg-opacity));\n}\n.day-selected span[data-v-0a5cef92] {\r\n  background-color: transparent;\n}\n.fade-enter-from[data-v-0a5cef92],\r\n.fade-leave-to[data-v-0a5cef92] {\r\n  opacity: 0;\n}\n.fade-enter-to[data-v-0a5cef92],\r\n.fade-leave-from[data-v-0a5cef92] {\r\n  opacity: 1;\n}\n.fade-enter-active[data-v-0a5cef92],\r\n.fade-leave-active[data-v-0a5cef92] {\r\n  transition: opacity 0.2s;\n}\n.slideX-enter-from[data-v-0a5cef92],\r\n.slideX-leave-to[data-v-0a5cef92] {\r\n  opacity: 0;\n}\n.direction-next .slideX-leave-to[data-v-0a5cef92] {\r\n  -webkit-transform: translateX(-100%);\r\n  transform: translateX(-100%);\n}\n.direction-next .slideX-enter-from[data-v-0a5cef92],\r\n.direction-prev .slideX-leave-to[data-v-0a5cef92] {\r\n  -webkit-transform: translateX(100%);\r\n  transform: translateX(100%);\n}\n.direction-prev .slideX-enter-from[data-v-0a5cef92] {\r\n  -webkit-transform: translateX(-100%);\r\n  transform: translateX(-100%);\n}\n.slideX-enter-active[data-v-0a5cef92],\r\n.slideX-leave-active[data-v-0a5cef92] {\r\n  position: absolute;\r\n  top: 0;\r\n  left: 0;\r\n  opacity: 1;\r\n  -webkit-transform: translateX(0);\r\n  transform: translateX(0);\r\n  -webkit-transition: all 0.3s ease-out;\r\n  transition: all 0.3s ease-out;\n}\n.fade-enter-active[data-v-0a5cef92],\r\n.fade-leave-active[data-v-0a5cef92] {\r\n  transition: opacity 0.5s;\n}\n.fade-enter[data-v-0a5cef92],\r\n.fade-leave-to[data-v-0a5cef92] {\r\n  opacity: 0;\n}\r\n/* */\n*[data-v-0a5cef92],[data-v-0a5cef92]::before,[data-v-0a5cef92]::after {\r\n  box-sizing: border-box;\r\n  border-width: 0;\r\n  border-top-width: 0px;\r\n  border-right-width: 0px;\r\n  border-bottom-width: 0px;\r\n  border-left-width: 0px;\r\n  border-style: solid;\r\n  border-top-style: solid;\r\n  border-right-style: solid;\r\n  border-bottom-style: solid;\r\n  border-left-style: solid;\r\n  border-color: #e5e7eb;\r\n  border-top-color: rgb(229, 231, 235);\r\n  border-right-color: rgb(229, 231, 235);\r\n  border-bottom-color: rgb(229, 231, 235);\r\n  border-left-color: rgb(229, 231, 235);\n}\nbutton[data-v-0a5cef92] {\r\n  background-color: transparent;\r\n  background-image: none;\r\n  cursor: pointer;\n}\n.fill-current[data-v-0a5cef92] {\r\n  fill: currentColor;\n}\n.dp-text-white[data-v-0a5cef92] {\r\n  --tw-text-opacity: 1;\r\n  color: rgba(255, 255, 255, var(--tw-text-opacity));\n}\n.dp-text-gray-300[data-v-0a5cef92] {\r\n  --tw-text-opacity: 1;\r\n  color: rgba(209, 213, 219, var(--tw-text-opacity));\n}\n.dp-text-gray-900[data-v-0a5cef92] {\r\n  --tw-text-opacity: 1;\r\n  color: rgba(17, 24, 39, var(--tw-text-opacity));\n}\n.dp-text-yellow-500[data-v-0a5cef92] {\r\n  --tw-text-opacity: 1;\r\n  color: rgba(245, 158, 11, var(--tw-text-opacity));\n}\n.dp-text-red-400[data-v-0a5cef92] {\r\n  --tw-text-opacity: 1;\r\n  color: rgba(248, 113, 113, var(--tw-text-opacity));\n}\n.dp-text-gray-800[data-v-0a5cef92] {\r\n  --tw-text-opacity: 1;\r\n  color: rgba(31, 41, 55, var(--tw-text-opacity));\n}\n.dp-bg-transparent[data-v-0a5cef92] {\r\n  background-color: transparent;\n}\n.dp-bg-white[data-v-0a5cef92] {\r\n  --tw-bg-opacity: 1;\r\n  background-color: rgba(255, 255, 255, var(--tw-bg-opacity));\n}\n.dp-bg-gray-100[data-v-0a5cef92] {\r\n  --tw-bg-opacity: 1;\r\n  background-color: rgba(243, 244, 246, var(--tw-bg-opacity));\n}\n.dp-bg-gray-400[data-v-0a5cef92] {\r\n  --tw-bg-opacity: 1;\r\n  background-color: rgba(156, 163, 175, var(--tw-bg-opacity));\n}\n.dp-bg-red-300[data-v-0a5cef92] {\r\n  --tw-bg-opacity: 1;\r\n  background-color: rgba(252, 165, 165, var(--tw-bg-opacity));\n}\n.dp-bg-red-400[data-v-0a5cef92] {\r\n  --tw-bg-opacity: 1;\r\n  background-color: rgba(248, 113, 113, var(--tw-bg-opacity));\n}\n.dp-bg-yellow-400[data-v-0a5cef92] {\r\n  --tw-bg-opacity: 1;\r\n  background-color: rgba(251, 191, 36, var(--tw-bg-opacity));\n}\n.dp-bg-green-400[data-v-0a5cef92] {\r\n  --tw-bg-opacity: 1;\r\n  background-color: rgba(52, 211, 153, var(--tw-bg-opacity));\n}\n.dp-group:hover .group-hover\\:bg-transparent[data-v-0a5cef92] {\r\n  background-color: transparent;\n}\n.dp-bg-opacity-70[data-v-0a5cef92] {\r\n  --tw-bg-opacity: 0.7;\n}\n.flex[data-v-0a5cef92] {\r\n  display: flex;\n}\n.table[data-v-0a5cef92] {\r\n  display: table;\n}\n.flex-row[data-v-0a5cef92] {\r\n  flex-direction: row;\n}\n.flex-col[data-v-0a5cef92] {\r\n  flex-direction: column;\n}\n.flex-wrap[data-v-0a5cef92] {\r\n  flex-wrap: wrap;\n}\n.items-center[data-v-0a5cef92] {\r\n  align-items: center;\n}\n.content-center[data-v-0a5cef92] {\r\n  align-content: center;\n}\n.justify-center[data-v-0a5cef92] {\r\n  justify-content: center;\n}\n.justify-between[data-v-0a5cef92] {\r\n  justify-content: space-between;\n}\n.justify-around[data-v-0a5cef92] {\r\n  justify-content: space-around;\n}\n.flex-grow[data-v-0a5cef92] {\r\n  flex-grow: 1;\n}\n.dp-font-mono[data-v-0a5cef92] {\r\n  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas,\r\n    Liberation Mono, Courier New, monospace;\n}\n.dp-font-medium[data-v-0a5cef92] {\r\n  font-weight: 500;\n}\n.dp-font-bold[data-v-0a5cef92] {\r\n  font-weight: 700;\n}\n.dp-h-3[data-v-0a5cef92] {\r\n  height: 0.75rem;\n}\n.dp-h-6[data-v-0a5cef92] {\r\n  height: 1.5rem;\n}\n.dp-h-7[data-v-0a5cef92] {\r\n  height: 1.75rem;\n}\n.dp-h-8[data-v-0a5cef92] {\r\n  height: 2rem;\n}\n.dp-h-10[data-v-0a5cef92] {\r\n  height: 2.5rem;\n}\n.dp-h-12[data-v-0a5cef92] {\r\n  height: 3rem;\n}\n.dp-h-52[data-v-0a5cef92] {\r\n  height: 13rem;\n}\n.dp-h-full[data-v-0a5cef92] {\r\n  height: 100%;\n}\n.h-screen[data-v-0a5cef92] {\r\n  height: 100vh;\n}\n.dp-w-full[data-v-0a5cef92] {\r\n  width: 100%;\n}\n.dp-h-full[data-v-0a5cef92] {\r\n  height: 100%;\n}\n.dp-transform[data-v-0a5cef92] {\r\n  --tw-translate-x: 0;\r\n  --tw-translate-y: 0;\r\n  --tw-rotate: 0;\r\n  --tw-skew-x: 0;\r\n  --tw-skew-y: 0;\r\n  --tw-scale-x: 1;\r\n  --tw-scale-y: 1;\r\n  transform: translateX(var(--tw-translate-x)) translateY(var(--tw-translate-y))\r\n    rotate(var(--tw-rotate)) skewX(var(--tw-skew-x)) skewY(var(--tw-skew-y))\r\n    scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y));\n}\n.dp-transition[data-v-0a5cef92] {\r\n  transition-property: background-color, border-color, color, fill, stroke,\r\n    opacity, box-shadow, transform, filter, -webkit-backdrop-filter;\r\n  transition-property: background-color, border-color, color, fill, stroke,\r\n    opacity, box-shadow, transform, filter, backdrop-filter;\r\n  transition-property: background-color, border-color, color, fill, stroke,\r\n    opacity, box-shadow, transform, filter, backdrop-filter,\r\n    -webkit-backdrop-filter;\r\n  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);\r\n  transition-duration: 0.15s;\n}\n.dp--translate-x-1\\/2[data-v-0a5cef92] {\r\n  --tw-translate-x: -50%;\n}\n.dp-text-sm[data-v-0a5cef92] {\r\n  font-size: 0.875rem;\r\n  line-height: 1.25rem;\n}\n.dp-text-base[data-v-0a5cef92] {\r\n  font-size: 1rem;\r\n  line-height: 1.5rem;\n}\n.dp-m-2[data-v-0a5cef92] {\r\n  margin: 0.5rem;\n}\n.dp-mx-1[data-v-0a5cef92] {\r\n  margin-left: 0.25rem;\r\n  margin-right: 0.25rem;\n}\n.dp-mx-3[data-v-0a5cef92] {\r\n  margin-left: 0.75rem;\r\n  margin-right: 0.75rem;\n}\n.dp-mt-3[data-v-0a5cef92] {\r\n  margin-top: 0.75rem;\n}\n.dp-focus\\:outline-none[data-v-0a5cef92]:focus,\r\n.outline-none[data-v-0a5cef92] {\r\n  outline: 2px solid transparent;\r\n  outline-offset: 2px;\n}\n.dp-overflow-hidden[data-v-0a5cef92] {\r\n  overflow: hidden;\n}\n.dp-p-2[data-v-0a5cef92] {\r\n  padding: 0.5rem;\n}\n.dp-p-3[data-v-0a5cef92] {\r\n  padding: 0.75rem;\n}\n.dp-py-2[data-v-0a5cef92] {\r\n  padding-top: 0.5rem;\r\n  padding-bottom: 0.5rem;\n}\n.dp-px-12[data-v-0a5cef92] {\r\n  padding-left: 3rem;\r\n  padding-right: 3rem;\n}\n.dp-pr-1[data-v-0a5cef92] {\r\n  padding-right: 0.25rem;\n}\n.dp-pointer-events-none[data-v-0a5cef92] {\r\n  pointer-events: none;\n}\n.dp-fixed[data-v-0a5cef92] {\r\n  position: fixed;\n}\n.dp-absolute[data-v-0a5cef92] {\r\n  position: absolute;\n}\n.dp-relative[data-v-0a5cef92] {\r\n  position: relative;\n}\n.dp-top-0[data-v-0a5cef92] {\r\n  top: 0;\n}\n.dp-right-1[data-v-0a5cef92] {\r\n  right: 0.25rem;\n}\n.dp--bottom-1[data-v-0a5cef92] {\r\n  bottom: -0.25rem;\n}\n.dp-left-1\\/2[data-v-0a5cef92] {\r\n  left: 50%;\n}\n.dp-top-1\\/3[data-v-0a5cef92] {\r\n  top: 33.333333%;\n}\r\n/* */\n.dp-font-mono[data-v-0a5cef92] {\r\n  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas,\r\n    Liberation Mono, Courier New, monospace;\n}\n.dp-font-medium[data-v-0a5cef92] {\r\n  font-weight: 500;\n}\n.dp-font-bold[data-v-0a5cef92] {\r\n  font-weight: 700;\n}\n.dp-rounded-sm[data-v-0a5cef92] {\r\n  border-radius: 0.125rem;\n}\n.dp-rounded[data-v-0a5cef92] {\r\n  border-radius: 0.25rem;\n}\n.dp-rounded-md[data-v-0a5cef92] {\r\n  border-radius: 0.375rem;\n}\n.dp-rounded-xl[data-v-0a5cef92] {\r\n  border-radius: 0.75rem;\n}\n.dp-rounded-full[data-v-0a5cef92] {\r\n  border-radius: 9999px;\n}\n.dp-border-dashed[data-v-0a5cef92] {\r\n  border-style: dashed;\n}\n.dp-border-b[data-v-0a5cef92] {\r\n  border-bottom-width: 1px;\n}\r\n\r\n/*** */\n.rounded-l-force[data-v-0a5cef92] {\r\n  border-top-left-radius: 0.25rem;\r\n  border-bottom-left-radius: 0.25rem;\r\n  border-top-right-radius: 0rem;\r\n  border-bottom-right-radius: 0rem;\n}\n.rounded-r-force[data-v-0a5cef92] {\r\n  border-top-right-radius: 0.25rem;\r\n  border-bottom-right-radius: 0.25rem;\r\n  border-top-left-radius: 0rem;\r\n  border-bottom-left-radius: 0rem;\n}\n.not-round[data-v-0a5cef92] {\r\n  border-top-left-radius: 0rem;\r\n  border-bottom-left-radius: 0rem;\r\n  border-top-right-radius: 0rem;\r\n  border-bottom-right-radius: 0rem;\n}\r\n";
styleInject(css_248z);

script.render = render;
script.__scopeId = "data-v-0a5cef92";

// Import vue component
// IIFE injects install function into component, allowing component
// to be registered via Vue.use() as well as Vue.component(),

var entry_esm = /*#__PURE__*/(() => {
  // Get component instance
  const installable = script; // Attach install function executed by Vue.use()

  installable.install = app => {
    app.component('VueAwesomeDatepicker', installable);
  };

  return installable;
})(); // It's possible to expose named exports when writing components that can
// also be used as directives, etc. - eg. import { RollupDemoDirective } from 'rollup-demo';
// export const RollupDemoDirective = directive;

export default entry_esm;
