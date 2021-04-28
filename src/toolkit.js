export default  {
    isLeapYear (year) {
      const ary =
        year > 1342
          ? [1, 5, 9, 13, 17, 22, 26, 30]
          : [1, 5, 9, 13, 17, 21, 26, 30]
      const _b = year % 33
      return ary.includes(_b)
    },
    getLastDayOfMonth ({ year, month }) {
      const y = year
      const m = month
      if (m >= 1 && m <= 6) {
        return 31
      } else if (m >= 7 && m < 12) {
        return 30
      } else if (this.isLeapYear(y)) {
        /* Leap year */
        return 30
      } else {
        return 29
      }
    },
    getGregorian (pd) {
      let jy = pd.year
      const jm = pd.month
      const jd = pd.date
      let gy
      if (jy > 979) {
        gy = 1600
        jy -= 979
      } else {
        gy = 621
      }
      let days =
        365 * jy +
        parseInt(jy / 33) * 8 +
        parseInt(((jy % 33) + 3) / 4) +
        78 +
        jd +
        (jm < 7 ? (jm - 1) * 31 : (jm - 7) * 30 + 186)
      gy += 400 * parseInt(days / 146097)
      days %= 146097
      if (days > 36524) {
        gy += 100 * parseInt(--days / 36524)
        days %= 36524
        if (days >= 365) days++
      }
      gy += 4 * parseInt(days / 1461)
      days %= 1461
      if (days > 365) {
        gy += parseInt((days - 1) / 365)
        days = (days - 1) % 365
      }
      let gd = days + 1
      const sala = [
        0,
        31,
        (gy % 4 === 0 && gy % 100 !== 0) || gy % 400 === 0 ? 29 : 28,
        31,
        30,
        31,
        30,
        31,
        31,
        30,
        31,
        30,
        31
      ]
      let gm
      for (gm = 0; gm < 13; gm++) {
        const v = sala[gm]
        if (gd <= v) break
        gd -= v
      }
      const pdt = new Date(gy, gm - 1, gd, 1, 0, 0, 0)
      const gds = [1, 2, 3, 4, 5, 6, 0]
      return { gregorian: pdt, weekday: gds[pdt.getDay()] }
    },
    getJalali (dt) {
      let gy = dt.getFullYear()
      const gm = dt.getMonth() + 1
      const gd = dt.getDate()
      let jy
      const gdm = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334]
      if (gy > 1600) {
        jy = 979
        gy -= 1600
      } else {
        jy = 0
        gy -= 621
      }
      const gy2 = gm > 2 ? gy + 1 : gy
      let days =
        365 * gy +
        parseInt((gy2 + 3) / 4) -
        parseInt((gy2 + 99) / 100) +
        parseInt((gy2 + 399) / 400) -
        80 +
        gd +
        gdm[gm - 1]
      jy += 33 * parseInt(days / 12053)
      days %= 12053
      jy += 4 * parseInt(days / 1461)
      days %= 1461
      if (days > 365) {
        jy += parseInt((days - 1) / 365)
        days = (days - 1) % 365
      }
      const jm =
        days < 186
          ? 1 + parseInt(days / 31)
          : 7 + parseInt((days - 186) / 30)
      const jd = 1 + (days < 186 ? days % 31 : (days - 186) % 30)
      dt = new Date()
      const pd = {}
      pd.year = jy
      pd.month = jm
      pd.date = jd
      pd.gDate = dt
      return pd
    },
    now () {
      return this.getJalali(new Date())
    },
    nextMonth ({ year, month }) {
      const m = (month % 12) + 1
      const y = parseInt(month / 12) + year
      return { year: y, month: m }
    },
    prevMonth ({ year, month }) {
      const m = ((12 + ((month - 2) % 12)) % 12) + 1
      const y = year + (month === 1 ? -1 : 0)
      return { year: y, month: m }
    },
    getMeta (now) {
      now.date = 1
      const nextm = this.nextMonth({ year: now.year, month: now.month })
      nextm.date = 1
      const ng = this.getGregorian(nextm)
      const g = this.getGregorian(now)
      const prevLWD = (g.weekday + 6) % 7
      const currLWD = (ng.weekday + 6) % 7
      const currLD = this.getLastDayOfMonth(now)
      const prevLD = this.getLastDayOfMonth(this.prevMonth(now))
      return { currLD, prevLWD, prevLD, currLWD }
    }
  }