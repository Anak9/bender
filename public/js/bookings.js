import getMonthDays from '../../utils/calendar';
import { bookClass } from './stripe';

const createMonth = (year, month) => {
  const days = getMonthDays(year, month);

  let i = 0;
  document.querySelectorAll('.week').forEach((week) => {
    week.innerHTML = '';

    for (let j = 0; j < 7; j++) {
      const label = document.createElement('label');

      label.innerHTML = `
        <input class='booking-day' type='radio' name='day' value='${days[i]}'>
        <div class='day'>
          <span> ${days[i].getDate()} </span>
        </div>
      `;

      week.appendChild(label);
      i++;
    }
  });
};

const setClasses = () => {
  const weekContainer = document.querySelector('.week__container');
  // make DAY inputs work like a 'radio' input
  let activeDay;
  const days = document.querySelectorAll('.booking-day');
  days.forEach((el) => {
    // check if days is available
    if (
      new Date(el.value).toISOString().slice(0, 10) <
      new Date().toISOString().slice(0, 10)
    ) {
      el.parentElement.classList = 'unavailable__day';
    } else {
      el.parentElement.classList = 'available__day';

      el.addEventListener('change', (e) => {
        if (activeDay) activeDay.parentElement.classList.remove('checked-day');
        e.target.parentElement.classList = 'checked-day';
        activeDay = e.target;
        weekContainer.dataset.dayPicked = e.target.value;

        // SHOW SELECTED DAY
        document.getElementById('day__picked__label').innerHTML = `${new Date(
          e.target.value
        ).toLocaleDateString('en-us', { month: 'long', day: '2-digit' })}`;
      });
    }
  });
};

const updateMonth = (monthLabel, currentMonth, currentYear) => {
  monthLabel.innerHTML = `${new Date(currentYear, currentMonth)
    .toLocaleString('en-US', { month: 'long' })
    .toUpperCase()}  /  ${currentYear}`;

  createMonth(currentYear, currentMonth);
  setClasses();
};

const showCreditCardNumber = () => {
  const card = document.createElement('div');

  card.innerHTML = `
    <h3> COPY and use this fake credit card number in the next page ;)</h3>
    <h4> 4242 4242 4242 4242</h4>
  `;

  card.classList = 'credit-card';

  document
    .querySelector('body')
    .insertBefore(card, document.querySelector('body').firstChild.nextSibling);
};

export const initBookingsEvents = () => {
  // SET CALENDAR VALUES
  const today = new Date();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();
  const monthLabel = document.getElementById('month__label');

  // GET PREVIOUS MONTH
  document.getElementById('previous__month').addEventListener('click', () => {
    if (currentMonth === 0) {
      currentMonth = 11;
      currentYear = currentYear - 1;
    } else {
      currentMonth = currentMonth - 1;
    }

    updateMonth(monthLabel, currentMonth, currentYear);
  });

  // GET NEXT MONTH
  document.getElementById('next__month').addEventListener('click', () => {
    if (currentMonth === 11) {
      currentMonth = 0;
      currentYear = currentYear + 1;
    } else {
      currentMonth = currentMonth + 1;
    }

    updateMonth(monthLabel, currentMonth, currentYear);
  });

  // SHOW SELECTED HOUR
  document.querySelector('.timetable').addEventListener('click', (e) => {
    document.getElementById('hour__picked__label').innerHTML = e.target.value;
  });

  setClasses();

  document.getElementById('booking__btn').addEventListener('click', () => {
    const day = document.querySelector('.week__container').dataset.dayPicked;
    day = new Date(day).toLocaleDateString('en-us');
    day.replace('/', '-');

    const hour = document.querySelector('.booking-hour:checked').value;
    const teacherId = document.getElementById('booking__btn').dataset.teacherId;

    const modality = document.querySelector('.online__onsite:checked').value;
    const group =
      document.querySelector('.private__group:checked').value === 'true';

    showCreditCardNumber();

    setTimeout(() => {
      bookClass(teacherId, day.replaceAll('/', '-'), hour, modality, group);
      // console.log(teacherId, day.replaceAll('/', '-'), hour, modality, group);
    }, 6000);
  });
};
