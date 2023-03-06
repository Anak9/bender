// BOOKING CALENDAR

// creates an ARRAY OF ALL DAYS dates of the month
const getMonthDays = (year, month) => {
  const daysArray = [];

  // add days of previous month
  const daysWeekNumber = new Date(year, month, 1).getDay(); // week day of first day of month
  let aux = new Date(year, month, 1);
  for (let i = 0; i < daysWeekNumber; i++) {
    aux.setDate(aux.getDate() - 1);
    daysArray.unshift(new Date(+aux));
  }

  // for addings days of first week of next month
  const lastDay = new Date(year, month + 1, 0).getDay();
  const numDaysOfNextMonth = 7 - lastDay - 1;

  // adds days of the selected month + first week next month
  const numDaysInMonth = new Date(year, month + 1, 0).getDate();
  aux = new Date(year, month, 1);
  for (let j = 0; j < numDaysInMonth + numDaysOfNextMonth; j++) {
    daysArray.push(new Date(aux));
    aux.setDate(aux.getDate() + 1);
  }

  return daysArray;
};

module.exports = getMonthDays;
