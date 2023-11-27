const _HIDDENCLASS = 'hidden';
const _ACTIVECLASS = 'active';
const _LOADINGCLASS = 'loading';
const _CHECKEDCLASS = 'checked';
const _INACTIVECLASS = 'inactive';

const getElement = selector => document.querySelector(selector);

const closeAlert = () => getElement('.alert').classList.add(_HIDDENCLASS);

const closeAllPopups = (exceptClass = '') => {
  document.querySelectorAll('.popup').forEach(popup => !popup.classList.contains(exceptClass) && popup.classList.remove(_ACTIVECLASS));
  hideOverlay();
};

const toggleVisibility = (element, className) => getElement(element)?.classList.toggle(className);

const showOverlay = () => toggleVisibility('.overlay', _ACTIVECLASS);

const hideOverlay = () => toggleVisibility('.overlay', _ACTIVECLASS);

const toggleOverlay = () => document.querySelectorAll('.popup').forEach(popup => popup.classList.contains(_ACTIVECLASS) && showOverlay()) || hideOverlay();

const toggleAriaExpanded = element => element.setAttribute('aria-expanded', String(!(element.getAttribute('aria-expanded') === 'true')));

const toggleNotification = (elementSelector, popupClass) => event => {
  toggleVisibility(elementSelector, _ACTIVECLASS);
  toggleAriaExpanded(event.currentTarget);
  closeAllPopups(popupClass);
  toggleOverlay();
};

const toggleNotificationAlerts = toggleNotification('.notification-alert', 'notification-alert');
const toggleNotificationMenu = toggleNotification('.notification-menu', 'notification-menu');

const highlightItem = itemID => getElement(`#${itemID}`).focus();

window.onload = () => {
  const notificationMenuItems = document.querySelectorAll('#notification-menu [role=menuitem]');
  notificationMenuItems.forEach((menuItem, index) => {
    menuItem.addEventListener(
      'keydown',
      event => {
        const name = event.key;
        const nextIndex = name === 'ArrowDown' || name === 'ArrowRight' ? index + 1 : name === 'ArrowUp' || name === 'ArrowLeft' ? index - 1 : -1;
        const lastIndex = notificationMenuItems.length - 1;
        const nextMenuItem = notificationMenuItems[nextIndex >= 0 && nextIndex <= lastIndex ? nextIndex : 0];
        nextMenuItem.focus();
      },
      false
    );
  });
};


const closeTrialAlert = () => {
    const alert = document.querySelector('.trial-alert');
    if (alert) {
        alert.remove();
    }
};

// Add event listeners for buttons with the class 'trial-alert-close'
const closeButtons = document.querySelectorAll('.trial-alert-close');
closeButtons.forEach(button => {
    button.addEventListener('click', closeTrialAlert);
});

/*     Tasks Functions */

// Tasks list open
const openTaskLists = () => {
  // expand tasks...

  const tasksListContainer = document.querySelector('.task-list');
  const isTasksListExpanded = tasksListContainer.style.maxHeight === '2000px';

  const taskListItem = document.querySelector('.task-list--items');
  const arrowButton = document.querySelector('#task-list-header--arrow');

  if (isTasksListExpanded) {
    tasksListContainer.style.maxHeight = '140px';
    taskListItem.classList.add(_HIDDENCLASS);

    arrowButton.setAttribute('aria-expanded', 'false');
    arrowButton.setAttribute('aria-label', 'open setup tasks');
  } else {
    taskListItem.classList.remove(_HIDDENCLASS);
    tasksListContainer.style.maxHeight = '2000px';
    arrowButton.setAttribute('aria-expanded', 'true');
    arrowButton.setAttribute('aria-label', 'close setup tasks');
  }

  //...then rotate arrow icon
  const arrowIcon = document.querySelector('#task-list-header--arrow');
  arrowIcon.classList.toggle('rotate-180');
};


//ONCHECK
const onCheck = (taskIndex, taskName = 'checkbox item') => {
  const indicators = document.querySelectorAll('.task-list-section-indicators');
  const currentIndicator = indicators[taskIndex];

  // initiate loading animation...
  currentIndicator.classList.add(_LOADINGCLASS);

  // ...update checkbox status...
  const indicatorStatus = document.querySelectorAll('.indicator-status');
  const currentIndicatorStatus = indicatorStatus[taskIndex];
  currentIndicatorStatus.ariaLabel = 'Loading. Please wait...';

  // ...then check the checkbox after a few seconds
  setTimeout(() => {
    currentIndicator.classList.remove(_LOADINGCLASS);
    currentIndicator.classList.add(_CHECKEDCLASS);

    const setupTasks = document.querySelectorAll('.task-list-section-item-content');
    closeAllTasks(setupTasks);
    updateProgress();
    moveToNextIncompleteTask(indicators);

    currentIndicatorStatus.ariaLabel = `Successfully marked ${taskName} as done`;
    currentIndicator.ariaLabel = currentIndicator.ariaLabel.replace('as done', 'as not done');
  }, 1500);
};

//UNCHECK

const unCheck = (taskIndex, taskName = 'checkbox item') => {
  const indicators = document.querySelectorAll('.task-list-section-indicators');
  const currentIndicator = indicators[taskIndex];

  currentIndicator.classList.remove(_CHECKEDCLASS);
  currentIndicator.classList.add(_LOADINGCLASS);

  // update checkbox status...
  const indicatorStatus = document.querySelectorAll('.indicator-status');
  const currentIndicatorStatus = indicatorStatus[taskIndex];
  currentIndicatorStatus.ariaLabel = 'Loading. Please wait...';

  // ...then uncheck the checkbox after a few seconds
  setTimeout(() => {
    currentIndicator.classList.remove(_LOADINGCLASS);

    const setupTasks = document.querySelectorAll('.task-list-section-item');
    closeAllTasks(setupTasks);
    updateProgress();
    moveToNextIncompleteTask(indicators);

    currentIndicatorStatus.ariaLabel = `Successfully marked ${taskName} as not done`;
    currentIndicator.ariaLabel = currentIndicator.ariaLabel.replace('as not done', 'as done');
  }, 1500);
};



const closeAllTasks = () => {
  document.querySelectorAll('.task-list-section-item.active').forEach(setupTask => {
    setupTask.classList.replace(_ACTIVECLASS, _INACTIVECLASS);

    const currentButton = setupTask.querySelector('.task-list-section-heading');
    if (currentButton) {
      currentButton.setAttribute('aria-expanded', 'false');
    }
  });
};


const openTaskList = taskIndex => {
  const setupTasks = document.querySelectorAll('.task-list-section-item');
  const clickedTask = setupTasks[taskIndex];

  closeAllTasks(setupTasks);

  // Open clicked task and update aria expanded
  clickedTask.classList.replace(_INACTIVECLASS, _ACTIVECLASS);
  document.querySelectorAll('.task-list-section-heading')[taskIndex].setAttribute('aria-expanded', 'true');
};


const getCompletedTasks = () => {
  const indicators = document.querySelectorAll('.task-list-section-indicators');
  return Array.from(indicators).reduce((count, indicator) => count + indicator.classList.contains(_CHECKEDCLASS), 0);
};


const updateProgress = () => {
  const indicators = document.querySelectorAll('.task-list-section-indicators');
  const numberOfTasks = indicators.length;
  const completedTasks = Array.from(indicators).filter(indicator => indicator.classList.contains(_CHECKEDCLASS)).length;

  // update progress...
  document.querySelector('.task-list-header--task-completion p').innerText = `${completedTasks} / ${numberOfTasks} completed`;
  document.querySelector('#tasks-completion').value = `${(completedTasks / numberOfTasks) * 100}`;

  // ...then update progress aria text
  document.querySelector('#progress-text').setAttribute(
    'aria-label',
    `${completedTasks} out of ${numberOfTasks} steps completed`
  );
};


const moveToNextIncompleteTask = indicators => {
  const index = Array.from(indicators).findIndex(indicator => !indicator.classList.contains(_CHECKEDCLASS));
  if (index !== -1) {
    openTaskList(index);
  }
};

