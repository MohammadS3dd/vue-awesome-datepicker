<template>
  <div class="wraper" @dateselected="handleDateSelected">
    <div class="datepicker">
      <div
        :dir="locale === 'Jalali' ? 'rtl' : 'ltr'"
        class="dp-header"
        :class="[locale === 'Jalali' ? '' : '', animationDirection]"
      >
        <button
          class="dp-bg-white dp-rounded-md dp-text-white dp-w-6 dp-h-6 justify-center flex dp-focus:outline-none"
          :v-show="isBackwardLimit()"
          :disabled="!isBackwardLimit()"
          :class="[!isBackwardLimit() ? 'dp-bg-gray-400' : theme.Bg400]"
          @click="PrevMonth"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            class="dp-h-full dp-w-5 dp-text-sm dp-pointer-events-none"
            :class="{ flipH: locale === 'Jalali' }"
          >
            <path fill="none" d="M0 0h24v24H0z" />
            <path
              class="fill-current dp-text-white"
              d="M7.828 11H20v2H7.828l5.364 5.364-1.414 1.414L4 12l7.778-7.778 1.414 1.414z"
            />
          </svg>
        </button>
        <transition name="fade">
          <div
            :key="changeKey"
            class="dp-absolute dp-top-1/3 dp-left-1/2 dp--translate-x-1/2 dp-transform"
          >
            <div class="dp-h-full dp-w-auto flex justify-center">
              <span
                class="dp-text-norm items-center flex dp-text-gray-800 dp-text-sm dp-font-bold"
              >
                {{ thisMonth.current.monthName }}
                {{
                  locale === "Jalali"
                    ? getPersianNumeric(thisMonth.current.year)
                    : thisMonth.current.year
                }}
              </span>
            </div>
          </div>
        </transition>
        <button
          class="dp-bg-white dp-rounded-md dp-text-white dp-w-6 dp-h-6 justify-center flex dp-focus:outline-none"
          :v-show="isForwardLimit()"
          :disabled="!isForwardLimit()"
          :class="[!isForwardLimit() ? 'dp-bg-gray-400' : theme.Bg400]"
          @click="NextMonth"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            class="dp-h-full dp-w-5 dp-text-sm dp-pointer-events-none dp-focus:outline-none"
            :class="{ flipH: locale === 'Jalali' }"
          >
            <path fill="none" d="M0 0h24v24H0z" />
            <path
              class="fill-current dp-text-white"
              d="M16.172 11l-5.364-5.364 1.414-1.414L20 12l-7.778 7.778-1.414-1.414L16.172 13H4v-2z"
            />
          </svg>
        </button>
      </div>
      <div class="calander" :class="{ rtl: locale === 'Jalali' }">
        <div class="inrow dp-py-2 dp-border-b dp-border-dashed">
          <div
            v-for="day in Settings[locale].WD"
            :key="day"
            :class="'days dp-text-base dp-font-medium ' + theme.Text500"
          >
            {{ day }}
          </div>
        </div>

        <div class="dp-main" :class="animationDirection">
          <transition name="slideX" :class="animationDirection">
            <div :key="changeKey" class="inrow dp-main-inner">
              <div
                v-for="day in prevCounter"
                :key="day + 'prev'"
                class="dp-text-gray-300 days dp-font-bold dp-h-8"
                style=""
              >
                {{
                  locale === "Jalali"
                    ? getPersianNumeric(thisMonth.prev.LD - prevCounter + day)
                    : thisMonth.prev.LD - prevCounter + day
                }}
              </div>
              <button
                v-for="day in thisMonth.current.LD"
                :key="day + 'c'"
                class="days dp-bt-m dp-font-medium dp-h-8 cursor-pointer group dp-relative"
                :class="[
                  isHoliday(day) ? 'dp-text-red-400' : '',
                  isDisabled(day) || !isSelectable(day)
                    ? 'dp-text-gray-300'
                    : 'dp-text-gray-900 ' + theme.DCHover,
                ]"
                style=""
                :disabled="isDisabled(day) || !isSelectable(day)"
                :value="day"
                @click="inp"
              >
                <span
                  class="flex dp-si dp-rounded items-center justify-center group-hover:dp-bg-transparent group-dp-focus:dp-bg-transparent dp-bg-opacity-70 justify-center items-center dp-w-7 dp-h-7 dp-pointer-events-none"
                  :value="day"
                  :class="[
                    isSelected(day) &&
                    !(isInrange(day).isFirstDay || isInrange(day).isLastDay)
                      ? 'dp-text-white day-selected  ' + theme.Bg400
                      : '',
                    isInrange(day).value
                      ? 'dp-w-full dp-text-white not-round ' + theme.Bg400
                      : '',
                    isInrange(day).isFirstDay && locale === 'Jalali'
                      ? 'rounded-r-force dp-w-full dp-text-white ' + theme.Bg400
                      : '',
                    isInrange(day).isLastDay && locale === 'Jalali'
                      ? 'rounded-l-force dp-w-full dp-text-white ' + theme.Bg400
                      : '',
                    isInrange(day).isFirstDay && locale === 'Greg'
                      ? 'rounded-l-force dp-w-full dp-text-white ' + theme.Bg400
                      : '',
                    isInrange(day).isLastDay && locale === 'Greg'
                      ? 'rounded-r-force dp-w-full dp-text-white ' + theme.Bg400
                      : '',
                    isToday(day) && !isSelected(day)
                      ? 'ring-2 ' + theme.Ring400
                      : '',
                  ]"
                >
                  <span class="dp-sii">
                    {{
                      locale === "Jalali" ? getPersianNumeric(day) : day
                    }}</span
                  >
                </span>
                <div
                  v-if="!!isEvent(day)"
                  class="dp-absolute flex justify-center items-center dp-font-mono dp-w-3 dp-h-3 dp-rounded-full dp-left-1/2 dp--bottom-1 text-xxs dp-text-white dp-transform -translate-x-1/2 dp-pointer-events-none"
                  :class="['dp-bg-' + getEventColor(day) + '-400']"
                >
                  <!-- {{ getEventCount(day) }} -->
                </div>
              </button>
              <div
                v-for="day in nextCounter"
                :key="day + 'next'"
                class="dp-text-gray-300 days dp-font-bold dp-h-8"
                style=""
              >
                {{ locale === "Jalali" ? getPersianNumeric(day) : day }}
              </div>
            </div>
          </transition>
        </div>

        <div class="flex flex-wrap dp-my-3 dp-mx-3">
          <button
            class="dp-bg-green-400 dp-text-white dp-p-2 dp-rounded-xl dp-font-bold dp-text-sm dp-mx-1 outline-none dp-focus:outline-none"
            @click="gotoToday"
          >
            {{ locale === "Jalali" ? "امروز" : "Today" }}
          </button>
          <button
            v-if="dateModel.type === 'multiple'"
            class="dp-bg-red-400 dp-text-white dp-p-2 dp-rounded-xl dp-font-bold dp-text-sm dp-mx-1 outline-none dp-focus:outline-none"
            @click="addMonth"
          >
            {{ locale === "Jalali" ? "انتخاب ماه" : "select This Month" }}
          </button>
        </div>
      </div>
    </div>
    <div
      class="flex w-full dp-rounded dp-my-3 dp-bg-white dp-p-3 flex justify-around"
      v-if="debugSelector"
    >
      <label>
        <input
          id="single"
          v-model="inputType"
          class="m-2"
          type="radio"
          :name="'selectortype' + lang"
          value="single"
          @change="handleInputtypeChange"
        />
        single
      </label>
      <label>
        <input
          id="multiple"
          v-model="inputType"
          class="m-2"
          type="radio"
          :name="'selectortype' + lang"
          value="multiple"
          @change="handleInputtypeChange"
        />
        multiple
      </label>
      <label>
        <input
          id="range"
          v-model="inputType"
          class="m-2"
          type="radio"
          :name="'selectortype' + lang"
          value="range"
          @change="handleInputtypeChange"
        />
        range
      </label>
    </div>
  </div>
</template>

<script>
import { defineComponent } from "vue";
import toolkit from "./toolkit.js";
export default defineComponent({
  props: {
    date: { type: Object },
    lang: { type: String },
    type: { type: String },
    debugSelector: { type: Boolean ,default:false },
    colorTheme: { type: String },
    preSelectedModel: { type: Object },
    holidayMap: { type: Object },
    disabledMap: { type: Object },
    events: { type: Array },
    forwardLimit: { type: Object },
    backwardLimit: { type: Object },
    selectable: { type: Object },
  },
  setup(props, ctx) {
    const dmHandle = (t) => {
      ctx.emit("datemodel", t);
      ctx.emit("update:modelValue", t);
    };
    return { dmHandle, toolkit };
  },
  data() {
    return {
      toolkit: {},
      inpday: null,
      Settings: {
        Jalali: {
          monthNames: [
            "فروردین",
            "اردیبهشت",
            "خرداد",
            "تیر",
            "مرداد",
            "شهریور",
            "مهر",
            "آبان",
            "آذر",
            "دی",
            "بهمن",
            "اسفند",
          ],
          WD: ["ش", "ی", "د", "س", "چ", "پ", "ج"],
          setup: [0, 1, 2, 3, 4, 5, 6],
          persianNumeric: ["٠", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"],
        },
        Greg: {
          WD: ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"],
          setup: [0, 1, 2, 3, 4, 5, 6],
        },
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
      animationIn: "",
      animationDirection: "",
      changeKey: 0.1,
      dateselected: {},
    };
  },
  computed: {
    theme() {
      const defaultTheme = {
        Bg400: "dp-bg-yellow-400",
        Text500: "dp-text-yellow-500",
        Ring400: "dp-ring-yellow-400",
        DCHover: "days-curr-yellow",
      };

      let theme = defaultTheme;

      if (this.colorTheme === "yellow" || this.colorTheme === "Yellow") {
        theme = defaultTheme;
      }

      if (this.colorTheme === "pink" || this.colorTheme === "Pink") {
        theme = {
          Bg400: "dp-bg-pink-400",
          Text500: "dp-text-pink-500",
          Ring400: "dp-ring-pink-400",
          DCHover: "days-curr-pink",
        };
      }
      return theme;
    },
    now() {
      if (this.locale === "Jalali") {
        return this.toolkit.now();
      } else {
        const now = new Date();
        return {
          year: now.getFullYear(),
          month: now.getMonth(),
          date: now.getDate(),
        };
      }
    },

    prevCounter() {
      return this.prevMap[
        (7 + (this.thisMonth.prev.LWDM - this.thisMonth.settings[0])) % 7
      ];
    },
    nextCounter() {
      return this.nextMap[
        (7 + (this.thisMonth.current.LWDM - this.thisMonth.settings[0])) % 7
      ];
    },
    thisMonth() {
      let today, curr, prev, cal;
      if (this.locale === "Jalali") {
        const meta = this.toolkit.getMeta(this.month);
        cal = {
          prev: { LD: meta.prevLD, LWDM: meta.prevLWD },
          current: {
            month: this.month.month,
            monthSTD: this.month.month,
            LD: meta.currLD,
            LWDM: meta.currLWD,
            year: this.month.year,
            monthName: this.Settings.Jalali.monthNames[this.month.month - 1],
          },
          settings: this.Settings[this.locale].setup,
        };
      } else {
        today = this.month;
        curr = new Date(today.year, today.month + 1, 0);
        prev = new Date(today.year, today.month, 0);
        cal = {
          prev: { LD: prev.getDate(), LWDM: prev.getDay() },
          current: {
            month: curr.getMonth(),
            monthSTD: curr.getMonth() + 1,
            LD: curr.getDate(),
            LWDM: curr.getDay(),
            year: curr.getFullYear(),
            monthName: curr.toLocaleString("default", { month: "long" }),
          },
          settings: this.Settings[this.locale].setup,
        };
      }

      return cal;
    },
    locale() {
      return this.lang === "Jalali" ? "Jalali" : "Greg";
    },
  },
  watch: {
    // inputType() {
    //   this.dateModel = { type: this.inputType, dates: [] }
    //   this.calcSelected()
    // },
    dateModel() {
      this.dmHandle(this.dateModel);

      // this.$emit('datemodel', this.dateModel)
    },
    dateselected() {
      this.handleDateSelected(this.dateselected);
    },
    month() {
      this.changeKey = Math.random();
    },
  },
  created() {
    this.month = this.now;
  },
  mounted() {
    this.month = this.now;
    // this.$on('dateselected', this.handleDateSelected)
    this.inputType = this.preSelectedModel?.type || this.type || "single";

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
      this.animationDirection =
        this.locale === "Jalali" ? "direction-prev" : "direction-next";

      this.month = this.toolkit.nextMonth(this.month);
    },
    PrevMonth() {
      this.animationDirection =
        this.locale === "Jalali" ? "direction-next" : "direction-prev";
      this.month = this.toolkit.prevMonth(this.month);
    },
    normalizeDate(dateObj) {
      return {
        year: Number.parseInt(dateObj?.year),
        month: Number.parseInt(dateObj?.month),
        date: Number.parseInt(dateObj?.date),
      };
    },
    handleDateSelected(event) {
      const normalized = this.normalizeDate(event);
      // let dateModel = this.dateModel

      if (
        this.selectedDateMap?.[normalized?.year]?.[normalized?.month]?.[
          normalized?.date
        ]
      ) {
        const arr = this.dateModel.dates.filter((el) => {
          el = this.normalizeDate(el);

          return (
            !(
              el?.year === normalized?.year &&
              el?.month === normalized?.month &&
              el?.date === normalized?.date
            ) || event.all
          );
        });
        this.dateModel.dates = arr;
      } else {
        switch (this.inputType) {
          case "single":
            this.dateModel = {
              type: "single",
              dates: [normalized],
            };
            break;
          case "range":
            if (this.dateModel) this.dateModel.type = "range";
            if (this.dateModel?.dates?.length === 1) {
              this.dateModel.dates.push(normalized);
            } else {
              this.dateModel.dates = [normalized];
            }
            break;
          case "multiple":
            if (!this.dateModel.dates) {
              this.dateModel = {
                type: "multiple",
                dates: [],
              };
            }
            this.dateModel?.dates && this.dateModel.dates.push(normalized);
        }
      }
      // this.dateModel = dateModel
      this.calcSelected();
    },
    isHoliday(day) {
      const thisMonth = this.thisMonth;

      return (
        !!this.holidayMap?.[thisMonth.current.year]?.[
          thisMonth.current.monthSTD
        ]?.[day] ||
        ((thisMonth.prev.LWDM + day + 1) % 7 === 0 && this.locale === "Jalali")
      );
    },
    calcSelected() {
      const dateModel = this.dateModel;
      if (dateModel?.dates) {
        const map = {};
        for (let i = 0; i < dateModel.dates.length; i++) {
          const year = dateModel.dates[i].year;
          const month = dateModel.dates[i].month;
          const date = dateModel.dates[i].date;
          if (!map[year]) {
            map[year] = {};
          }
          if (!map[year]?.[month]) {
            map[year][month] = {};
          }
          if (!map.year?.month?.date) {
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
          const year = model[i].year;
          const month = model[i].month;
          const date = model[i].date;
          const count = model[i].count;
          const color = model[i].color;
          if (!map[year]) {
            map[year] = {};
          }
          if (!map[year]?.[month]) {
            map[year][month] = {};
          }
          if (!map.year?.month?.date) {
            map[year][month][date] = {};
          }
          map[year][month][date] = { count, color };
        }
        this.eventsMap = map;
      }
    },
    calcMapSelectable() {
      const model = this.selectable;
      if (model) {
        const map = {};
        for (let i = 0; i < model.dates?.length; i++) {
          const year = model.dates?.[i].year;
          const month = model.dates?.[i].month;
          const date = model.dates?.[i].date;

          if (!map[year]) {
            map[year] = {};
          }
          if (!map[year]?.[month]) {
            map[year][month] = {};
          }
          if (!map.year?.month?.date) {
            map[year][month][date] = true;
          }
        }

        this.isSelectableMap = map;
      }
    },
    isSelectable(day) {
      const thisMonth = this.thisMonth;
      if (this.selectable?.type === "multiple") {
        return !!this.isSelectableMap?.[thisMonth.current.year]?.[
          thisMonth.current.monthSTD
        ]?.[day];
      }
      return true;
    },
    isEvent(day) {
      const thisMonth = this.thisMonth;

      return !!this.eventsMap?.[thisMonth.current.year]?.[
        thisMonth.current.monthSTD
      ]?.[day];
    },
    isSelected(day) {
      const thisMonth = this.thisMonth;

      return !!this.selectedDateMap?.[thisMonth.current.year]?.[
        thisMonth.current.monthSTD
      ]?.[day];
    },

    isDisabled(day) {
      const thisMonth = this.thisMonth;

      return !!this.disabledMap?.[thisMonth.current.year]?.[
        thisMonth.current.monthSTD
      ]?.[day];
    },
    isInrange(day) {
      if (
        this.dateModel?.type === "range" &&
        this.dateModel?.dates.length === 2
      ) {
        const thisMonth = this.thisMonth;
        const now = new Date(
          thisMonth.current.year,
          thisMonth.current.monthSTD,
          day
        );
        const f = this.normalizeDate(this.dateModel?.dates?.[0]);
        const s = this.normalizeDate(this.dateModel?.dates?.[1]);
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
          isLastDay: +sD === +now,
        };
      }

      return {
        value: false,
        isFirstDay: false,
        isLastDay: false,
      };
    },
    inp(event) {
      this.inpday = parseInt(event.target.value);

      const day = this.inpday ? this.inpday : 1;
      const m = this.thisMonth.current.monthSTD;

      this.dateselected = {
        year: this.thisMonth.current.year,
        month: m,
        date: day,
      };

      return "" + this.thisMonth.current.year + "/" + m + "/" + day;
    },
    handleInputtypeChange() {
      this.dateModel = { type: this.inputType, dates: [] };
      this.calcSelected();
    },
    getEventCount(day) {
      const thisMonth = this.thisMonth;
      return this.eventsMap?.[thisMonth.current.year]?.[
        thisMonth.current.monthSTD
      ]?.[day]?.count;
    },
    getEventColor(day) {
      const thisMonth = this.thisMonth;
      return this.eventsMap?.[thisMonth.current.year]?.[
        thisMonth.current.monthSTD
      ]?.[day]?.color;
    },
    getPersianNumeric(day) {
      let str = "";
      if ((typeof str === "string", typeof day === "number")) {
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
            all: true,
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
      const now = new Date();
      const nowJalali = this.toolkit.getJalali(now);

      return (
        (nowJalali.year === this.thisMonth.current.year &&
          nowJalali.month === this.thisMonth.current.monthSTD &&
          nowJalali.date === day) ||
        (now.getFullYear() === this.thisMonth.current.year &&
          now.getMonth() + 1 === this.thisMonth.current.monthSTD &&
          now.getDate() === day)
      );
    },
  },
});
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
:root {
  -moz-tab-size: 4;
  -o-tab-size: 4;
  tab-size: 4;
}

html {
  line-height: 1.15;
  -webkit-text-size-adjust: 100%;
}

body {
  margin: 0;
  font-family: system-ui, -apple-system, Segoe UI, Roboto, Ubuntu, Cantarell,
    Noto Sans, sans-serif, "Segoe UI", Helvetica, Arial, "Apple Color Emoji",
    "Segoe UI Emoji";
}

hr {
  height: 0;
  color: inherit;
}

abbr[title] {
  -webkit-text-decoration: underline dotted;
  text-decoration: underline dotted;
}

b,
strong {
  font-weight: bolder;
}

code,
kbd,
pre,
samp {
  font-family: ui-monospace, SFMono-Regular, Consolas, "Liberation Mono", Menlo,
    monospace;
  font-size: 1em;
}

small {
  font-size: 80%;
}

sub,
sup {
  font-size: 75%;
  line-height: 0;
  position: relative;
  vertical-align: baseline;
}

sub {
  bottom: -0.25em;
}

sup {
  top: -0.5em;
}

table {
  text-indent: 0;
  border-color: inherit;
}

button,
input,
optgroup,
select,
textarea {
  font-family: inherit;
  font-size: 100%;
  line-height: 1.15;
  margin: 0;
}

button,
select {
  text-transform: none;
}

[type="button"],
button {
  -webkit-appearance: button;
}

legend {
  padding: 0;
}

progress {
  vertical-align: baseline;
}

summary {
  display: list-item;
}

blockquote,
dd,
dl,
figure,
h1,
h2,
h3,
h4,
h5,
h6,
hr,
p,
pre {
  margin: 0;
}

button {
  background-color: transparent;
  background-image: none;
}

button:focus {
  outline: 1px dotted;
  outline: 5px auto -webkit-focus-ring-color;
}

fieldset,
ol,
ul {
  margin: 0;
  padding: 0;
}

ol,
ul {
  list-style: none;
}

html {
  font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Ubuntu,
    Cantarell, Noto Sans, sans-serif, BlinkMacSystemFont, "Segoe UI",
    "Helvetica Neue", Arial, "Noto Sans", "Apple Color Emoji", "Segoe UI Emoji",
    "Segoe UI Symbol", "Noto Color Emoji";
  line-height: 1.5;
}

body {
  font-family: inherit;
  line-height: inherit;
}

*,
:after,
:before {
  box-sizing: border-box;
  border: 0 solid #e5e7eb;
}

hr {
  border-top-width: 1px;
}

img {
  border-style: solid;
}

textarea {
  resize: vertical;
}

input::-moz-placeholder,
textarea::-moz-placeholder {
  opacity: 1;
  color: #9ca3af;
}

input:-ms-input-placeholder,
textarea:-ms-input-placeholder {
  opacity: 1;
  color: #9ca3af;
}

input::placeholder,
textarea::placeholder {
  opacity: 1;
  color: #9ca3af;
}

button {
  cursor: pointer;
}

table {
  border-collapse: collapse;
}

h1,
h2,
h3,
h4,
h5,
h6 {
  font-size: inherit;
  font-weight: inherit;
}

a {
  color: inherit;
  text-decoration: inherit;
}

button,
input,
optgroup,
select,
textarea {
  padding: 0;
  line-height: inherit;
  color: inherit;
}

code,
kbd,
pre,
samp {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas,
    "Liberation Mono", "Courier New", monospace;
}

audio,
canvas,
embed,
iframe,
img,
object,
svg,
video {
  display: block;
  vertical-align: middle;
}

img,
video {
  max-width: 100%;
  height: auto;
}
* {
  --ttw-shadow: 0 0 transparent;
  --ttw-ring-inset: var(--ttw-empty);
  --ttw-ring-offset-width: 0px;
  --ttw-ring-offset-color: #fff;
  --ttw-ring-color: rgba(59, 130, 246, 0.5);
  --ttw-ring-offset-shadow: 0 0 transparent;
  --ttw-ring-shadow: 0 0 transparent;
}
.wraper {
  font-family: iranyekan, "Vazir";
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-rendering: optimizeLegibility;
  background-color: transparent;
  display: flex;
  flex-direction: column;
  height: auto;
  width: auto;
}
.datepicker {
  width: 20rem;
  height: auto;
  --ttw-bg-opacity: 1;
  background-color: rgba(249, 250, 251, var(--ttw-bg-opacity));
  display: flex;
  flex-direction: column;
  border-radius: 0.125rem;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
}
.dp-header {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  height: 3rem;
  padding: 0.75rem;
  padding-left: 3rem;
  padding-right: 3rem;
  position: relative;
  width: 100%;
}
.calendar {
  direction: ltr;
  margin-top: 0.5rem;
  margin-bottom: 0.5rem;
}
.dp-main {
  height: 13rem;
  overflow: hidden;
  padding-right: 0.25rem;
  position: relative;
  width: 100%;
}
.dp-main-inner {
  flex-wrap: wrap;
  height: 100%;
  width: 100%;
}

.inrow {
  font-size: 0.85rem;
  font-weight: 300;
  flex: 1 0 21%;
  display: flex;
  flex-direction: row;
  width: 100%;
}
.days {
  flex: 0 0 14%;
  display: flex;
  align-items: center;
  justify-content: center;
}
.dp-bt-m {
  cursor: pointer;
  font-weight: 500;
  height: 2rem;
  position: relative;
  --ttw-text-opacity: 1;
  color: rgba(17, 24, 39, var(--ttw-text-opacity));
}
.dp-si {
  -webkit-text-size-adjust: 100%;
  tab-size: 4;
  -webkit-font-smoothing: antialiased;
  user-select: none;
  direction: ltr;
  font-family: inherit;
  font-size: 100%;
  text-transform: none;
  line-height: inherit;
  cursor: pointer;
  font-weight: 500;
  --ttw-text-opacity: 1;
  color: rgba(17, 24, 39, var(--ttw-text-opacity));
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  border-width: 0;
  border-style: solid;
  border-color: #e5e7eb;
  --ttw-shadow: 0 0 #0000;
  --ttw-ring-inset: var(--ttw-empty, /*!*/ /*!*/);
  --ttw-ring-offset-width: 0px;
  --ttw-ring-offset-color: #fff;
  --ttw-ring-color: rgba(59, 130, 246, 0.5);
  --ttw-ring-offset-shadow: 0 0 #0000;
  --ttw-ring-shadow: 0 0 #0000;
  --ttw-bg-opacity: 0.7;
  border-radius: 0.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 1.75rem;
  pointer-events: none;
  width: 1.75rem;
}
.dp-sii {
  display: flex;
  position: absolute;
  left: 50%;
  --ttw-translate-y: 0;
  --ttw-rotate: 0;
  --ttw-skew-x: 0;
  --ttw-skew-y: 0;
  --ttw-scale-x: 1;
  --ttw-scale-y: 1;
  transform: translateX(var(--ttw-translate-x))
    translateY(var(--ttw-translate-y)) rotate(var(--ttw-rotate))
    skewX(var(--ttw-skew-x)) skewY(var(--ttw-skew-y)) scaleX(var(--ttw-scale-x))
    scaleY(var(--ttw-scale-y));
  --ttw-translate-x: -50%;
}
.days:focus {
  outline: none;
}
.days-curr-yellow:hover span {
  --ttw-bg-opacity: 1;
  background-color: rgba(252, 211, 77, var(--ttw-bg-opacity));
}
.days-curr-yellow:focus {
  outline: none;
}
.days-curr-pink:hover span {
  --ttw-bg-opacity: 1;
  background-color: rgba(249, 168, 212, var(--ttw-bg-opacity));
}
.days-curr-pink:focus {
  outline: none;
}

.btn {
  border-radius: 0.25rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 2.5rem;
}
.rtl {
  direction: rtl;
}
.flipH {
  display: block;
  transform: scale(-1, 1);
}
.inp {
  width: 18rem;
  height: 2rem;
  text-align: center;
  border-radius: 0.375rem;
  margin-top: 0.75rem;
  outline: 2px solid transparent;
  outline-offset: 2px;
}
.day-selected {
  opacity: 1;
  /*  background-color: rgba(110, 231, 183, 1); */
}
.day-selected:hover {
  --ttw-bg-opacity: 1;
  background-color: rgba(252, 211, 77, var(--ttw-bg-opacity));
}
.day-selected span {
  background-color: transparent;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
.fade-enter-to,
.fade-leave-from {
  opacity: 1;
}
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s;
}

.slideX-enter-from,
.slideX-leave-to {
  opacity: 0;
}
.direction-next .slideX-leave-to {
  -webkit-transform: translateX(-100%);
  transform: translateX(-100%);
}
.direction-next .slideX-enter-from,
.direction-prev .slideX-leave-to {
  -webkit-transform: translateX(100%);
  transform: translateX(100%);
}
.direction-prev .slideX-enter-from {
  -webkit-transform: translateX(-100%);
  transform: translateX(-100%);
}
.slideX-enter-active,
.slideX-leave-active {
  position: absolute;
  top: 0;
  left: 0;
  opacity: 1;
  -webkit-transform: translateX(0);
  transform: translateX(0);
  -webkit-transition: all 0.3s ease-out;
  transition: all 0.3s ease-out;
}
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s;
}
.fade-enter,
.fade-leave-to {
  opacity: 0;
}
/* */
*,
::before,
::after {
  box-sizing: border-box;
  border-width: 0;
  border-top-width: 0px;
  border-right-width: 0px;
  border-bottom-width: 0px;
  border-left-width: 0px;
  border-style: solid;
  border-top-style: solid;
  border-right-style: solid;
  border-bottom-style: solid;
  border-left-style: solid;
  border-color: #e5e7eb;
  border-top-color: rgb(229, 231, 235);
  border-right-color: rgb(229, 231, 235);
  border-bottom-color: rgb(229, 231, 235);
  border-left-color: rgb(229, 231, 235);
}
button {
  background-color: transparent;
  background-image: none;
  cursor: pointer;
}

.fill-current {
  fill: currentColor;
}

.dp-text-white {
  --ttw-text-opacity: 1;
  color: rgba(255, 255, 255, var(--ttw-text-opacity));
}
.dp-text-gray-300 {
  --ttw-text-opacity: 1;
  color: rgba(209, 213, 219, var(--ttw-text-opacity));
}
.dp-text-gray-900 {
  --ttw-text-opacity: 1;
  color: rgba(17, 24, 39, var(--ttw-text-opacity));
}
.dp-text-yellow-500 {
  --ttw-text-opacity: 1;
  color: rgba(245, 158, 11, var(--ttw-text-opacity));
}
.dp-text-pink-500 {
  --ttw-text-opacity: 1;
  color: rgba(236, 72, 153, var(--ttw-text-opacity));
}

.dp-text-red-400 {
  --ttw-text-opacity: 1;
  color: rgba(248, 113, 113, var(--ttw-text-opacity));
}

.dp-text-gray-800 {
  --ttw-text-opacity: 1;
  color: rgba(31, 41, 55, var(--ttw-text-opacity));
}

.dp-bg-transparent {
  background-color: transparent;
}

.dp-bg-white {
  --ttw-bg-opacity: 1;
  background-color: rgba(255, 255, 255, var(--ttw-bg-opacity));
}

.dp-bg-gray-100 {
  --ttw-bg-opacity: 1;
  background-color: rgba(243, 244, 246, var(--ttw-bg-opacity));
}

.dp-bg-gray-400 {
  --ttw-bg-opacity: 1;
  background-color: rgba(156, 163, 175, var(--ttw-bg-opacity));
}

.dp-bg-red-300 {
  --ttw-bg-opacity: 1;
  background-color: rgba(252, 165, 165, var(--ttw-bg-opacity));
}

.dp-bg-red-400 {
  --ttw-bg-opacity: 1;
  background-color: rgba(248, 113, 113, var(--ttw-bg-opacity));
}

.dp-bg-yellow-400 {
  --ttw-bg-opacity: 1;
  background-color: rgba(251, 191, 36, var(--ttw-bg-opacity));
}
.dp-bg-pink-400 {
  --ttw-bg-opacity: 1;
  background-color: rgba(244, 114, 182, var(--ttw-bg-opacity));
}
.dp-bg-green-400 {
  --ttw-bg-opacity: 1;
  background-color: rgba(52, 211, 153, var(--ttw-bg-opacity));
}

.dp-group:hover .group-hover\:bg-transparent {
  background-color: transparent;
}

.dp-bg-opacity-70 {
  --ttw-bg-opacity: 0.7;
}
.ring-2 {
  --ttw-ring-offset-shadow: var(--ttw-ring-inset) 0 0 0
    var(--ttw-ring-offset-width) var(--ttw-ring-offset-color);
  --ttw-ring-shadow: var(--ttw-ring-inset) 0 0 0
    calc(2px + var(--ttw-ring-offset-width)) var(--ttw-ring-color);
  box-shadow: var(--ttw-ring-offset-shadow), var(--ttw-ring-shadow),
    0 0 transparent;
  box-shadow: var(--ttw-ring-offset-shadow), var(--ttw-ring-shadow),
    var(--ttw-shadow, 0 0 transparent);
}
.dp-ring-yellow-400 {
  --ttw-ring-opacity: 1;
  --ttw-ring-color: rgba(251, 191, 36, var(--ttw-ring-opacity));
}
.dp-ring-pink-400 {
  --ttw-ring-opacity: 1;
  --ttw-ring-color: rgba(244, 114, 182, var(--ttw-ring-opacity));
}
.flex {
  display: flex;
}

.table {
  display: table;
}

.flex-row {
  flex-direction: row;
}

.flex-col {
  flex-direction: column;
}

.flex-wrap {
  flex-wrap: wrap;
}

.items-center {
  align-items: center;
}

.content-center {
  align-content: center;
}

.justify-center {
  justify-content: center;
}

.justify-between {
  justify-content: space-between;
}

.justify-around {
  justify-content: space-around;
}

.flex-grow {
  flex-grow: 1;
}

.dp-font-mono {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas,
    Liberation Mono, Courier New, monospace;
}

.dp-font-medium {
  font-weight: 500;
}

.dp-font-bold {
  font-weight: 700;
}

.dp-h-3 {
  height: 0.75rem;
}

.dp-h-6 {
  height: 1.5rem;
}

.dp-h-7 {
  height: 1.75rem;
}

.dp-h-8 {
  height: 2rem;
}

.dp-h-10 {
  height: 2.5rem;
}

.dp-h-12 {
  height: 3rem;
}

.dp-h-52 {
  height: 13rem;
}

.dp-h-full {
  height: 100%;
}

.h-screen {
  height: 100vh;
}
.dp-w-full {
  width: 100%;
}
.dp-h-full {
  height: 100%;
}

.dp-transform {
  --ttw-translate-x: 0;
  --ttw-translate-y: 0;
  --ttw-rotate: 0;
  --ttw-skew-x: 0;
  --ttw-skew-y: 0;
  --ttw-scale-x: 1;
  --ttw-scale-y: 1;
  transform: translateX(var(--ttw-translate-x))
    translateY(var(--ttw-translate-y)) rotate(var(--ttw-rotate))
    skewX(var(--ttw-skew-x)) skewY(var(--ttw-skew-y)) scaleX(var(--ttw-scale-x))
    scaleY(var(--ttw-scale-y));
}

.dp-transition {
  transition-property: background-color, border-color, color, fill, stroke,
    opacity, box-shadow, transform, filter, -webkit-backdrop-filter;
  transition-property: background-color, border-color, color, fill, stroke,
    opacity, box-shadow, transform, filter, backdrop-filter;
  transition-property: background-color, border-color, color, fill, stroke,
    opacity, box-shadow, transform, filter, backdrop-filter,
    -webkit-backdrop-filter;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 0.15s;
}
.dp--translate-x-1\/2 {
  --ttw-translate-x: -50%;
}
.dp-text-sm {
  font-size: 0.875rem;
  line-height: 1.25rem;
}

.dp-text-base {
  font-size: 1rem;
  line-height: 1.5rem;
}

.dp-m-2 {
  margin: 0.5rem;
}

.dp-mx-1 {
  margin-left: 0.25rem;
  margin-right: 0.25rem;
}

.dp-mx-3 {
  margin-left: 0.75rem;
  margin-right: 0.75rem;
}

.dp-my-3 {
  margin-top: 0.75rem;
  margin-bottom: 0.75rem;
}

.dp-focus\:outline-none:focus,
.outline-none {
  outline: 2px solid transparent;
  outline-offset: 2px;
}

.dp-overflow-hidden {
  overflow: hidden;
}

.dp-p-2 {
  padding: 0.5rem;
}

.dp-p-3 {
  padding: 0.75rem;
}

.dp-py-2 {
  padding-top: 0.5rem;
  padding-bottom: 0.5rem;
}

.dp-px-12 {
  padding-left: 3rem;
  padding-right: 3rem;
}

.dp-pr-1 {
  padding-right: 0.25rem;
}

.dp-pointer-events-none {
  pointer-events: none;
}

.dp-fixed {
  position: fixed;
}

.dp-absolute {
  position: absolute;
}

.dp-relative {
  position: relative;
}

.dp-top-0 {
  top: 0;
}

.dp-right-1 {
  right: 0.25rem;
}

.dp--bottom-1 {
  bottom: -0.25rem;
}

.dp-left-1\/2 {
  left: 50%;
}

.dp-top-1\/3 {
  top: 33.333333%;
}
/* */
.dp-font-mono {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas,
    Liberation Mono, Courier New, monospace;
}

.dp-font-medium {
  font-weight: 500;
}

.dp-font-bold {
  font-weight: 700;
}

.dp-rounded-sm {
  border-radius: 0.125rem;
}

.dp-rounded {
  border-radius: 0.25rem;
}

.dp-rounded-md {
  border-radius: 0.375rem;
}

.dp-rounded-xl {
  border-radius: 0.75rem;
}

.dp-rounded-full {
  border-radius: 9999px;
}

.dp-border-dashed {
  border-style: dashed;
}

.dp-border-b {
  border-bottom-width: 1px;
}

/*** */
.rounded-l-force {
  border-top-left-radius: 0.25rem;
  border-bottom-left-radius: 0.25rem;
  border-top-right-radius: 0rem;
  border-bottom-right-radius: 0rem;
}
.rounded-r-force {
  border-top-right-radius: 0.25rem;
  border-bottom-right-radius: 0.25rem;
  border-top-left-radius: 0rem;
  border-bottom-left-radius: 0rem;
}
.not-round {
  border-top-left-radius: 0rem;
  border-bottom-left-radius: 0rem;
  border-top-right-radius: 0rem;
  border-bottom-right-radius: 0rem;
}
</style>
