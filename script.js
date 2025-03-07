document.addEventListener('DOMContentLoaded', function() {
    const monthNames = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
    const daysInWeek = 7;
    let currentDate = new Date();
    let currentMonth = currentDate.getMonth();
    let currentYear = 2025; 
    let selectedDay = null;
    let activities = JSON.parse(localStorage.getItem('calendarActivities2025')) || {};


    const calendarGrid = document.getElementById('calendar-grid');
    const currentMonthYearElement = document.getElementById('current-month-year');
    const prevMonthButton = document.getElementById('prev-month');
    const nextMonthButton = document.getElementById('next-month');
    const todayButton = document.getElementById('today-btn');
    const activityModal = document.getElementById('activity-modal');
    const modalTitle = document.getElementById('modal-title');
    const activityList = document.getElementById('activity-list');
    const activityTitleInput = document.getElementById('activity-title');
    const activityDescriptionInput = document.getElementById('activity-description');
    const saveActivityButton = document.getElementById('save-activity');
    const closeModalButton = document.getElementById('close-modal');

    renderCalendar();

    prevMonthButton.addEventListener('click', () => {
        if (currentMonth === 0) {
            return;
        }
        currentMonth--;
        renderCalendar();
    });

    nextMonthButton.addEventListener('click', () => {
        if (currentMonth === 11) {
            return;
        }
        currentMonth++;
        renderCalendar();
    });

    todayButton.addEventListener('click', () => {
        const today = new Date();
        if (today.getFullYear() === 2025) {
            currentMonth = today.getMonth();
            renderCalendar();
            
            const todayDate = today.getDate();
            const dayElements = document.querySelectorAll('.calendar-day');
            dayElements.forEach(day => {
                if (parseInt(day.dataset.day) === todayDate && !day.classList.contains('text-gray-400')) {
                    day.click();
                }
            });
        }
    });

    closeModalButton.addEventListener('click', () => {
        activityModal.classList.add('hidden');
    });

    saveActivityButton.addEventListener('click', () => {
        const title = activityTitleInput.value.trim();
        const description = activityDescriptionInput.value.trim();
        
        if (title) {
            const dateKey = `${selectedDay}-${currentMonth + 1}-${currentYear}`;
            
            if (!activities[dateKey]) {
                activities[dateKey] = [];
            }
            
            activities[dateKey].push({
                title: title,
                description: description,
                timestamp: new Date().toISOString()
            });
            
            localStorage.setItem('calendarActivities2025', JSON.stringify(activities));
            
            activityTitleInput.value = '';
            activityDescriptionInput.value = '';
            
            renderActivitiesList(dateKey);
            updateCalendarIndicators();
        }
    });

    function renderCalendar() {
        const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
        const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0);
        const daysInMonth = lastDayOfMonth.getDate();
        const startingDayOfWeek = firstDayOfMonth.getDay(); 
        
        currentMonthYearElement.textContent = `${monthNames[currentMonth]} ${currentYear}`;
        
        calendarGrid.innerHTML = '';
        
        for (let i = 0; i < startingDayOfWeek; i++) {
            const emptyDay = document.createElement('div');
            emptyDay.className = 'calendar-day bg-white p-2 text-gray-400';
            calendarGrid.appendChild(emptyDay);
        }
        
        for (let day = 1; day <= daysInMonth; day++) {
            const dayElement = document.createElement('div');
            dayElement.className = 'calendar-day bg-white p-2 cursor-pointer flex flex-col';
            dayElement.dataset.day = day;
            
            const dateNumber = document.createElement('span');
            dateNumber.className = 'text-lg font-semibold';
            dateNumber.textContent = day;
            
            const activitiesContainer = document.createElement('div');
            activitiesContainer.className = 'mt-1 flex-grow text-xs text-gray-600 overflow-hidden';
            
            dayElement.appendChild(dateNumber);
            dayElement.appendChild(activitiesContainer);
            
            const today = new Date();
            if (today.getDate() === day && today.getMonth() === currentMonth && today.getFullYear() === currentYear) {
                dayElement.classList.add('bg-blue-50', 'border-2', 'border-blue-500');
            }
            
            dayElement.addEventListener('click', function() {
                selectedDay = day;
                const dateKey = `${day}-${currentMonth + 1}-${currentYear}`;
                modalTitle.textContent = `Atividades para ${day.toString().padStart(2, '0')}/${(currentMonth + 1).toString().padStart(2, '0')}/${currentYear}`;
                renderActivitiesList(dateKey);
                activityModal.classList.remove('hidden');
            });
            
            calendarGrid.appendChild(dayElement);
        }
        
        updateCalendarIndicators();
    }

    function updateCalendarIndicators() {
        const days = document.querySelectorAll('.calendar-day');
        days.forEach(day => {
            const dayNumber = day.dataset.day;
            if (!dayNumber) return;
            
            const dateKey = `${dayNumber}-${currentMonth + 1}-${currentYear}`;
            const dayActivities = activities[dateKey];
            
            day.classList.remove('has-activity');
            const activitiesContainer = day.querySelector('div');
            activitiesContainer.innerHTML = '';
            
            if (dayActivities && dayActivities.length > 0) {
                day.classList.add('has-activity');
                
                for (let i = 0; i < Math.min(dayActivities.length, 2); i++) {
                    const activityPreview = document.createElement('div');
                    activityPreview.className = 'truncate text-xs bg-blue-100 rounded px-1 my-1';
                    activityPreview.textContent = dayActivities[i].title;
                    activitiesContainer.appendChild(activityPreview);
                }
                
                if (dayActivities.length > 2) {
                    const moreLabel = document.createElement('div');
                    moreLabel.className = 'text-xs text-blue-500';
                    moreLabel.textContent = `+${dayActivities.length - 2} mais`;
                    activitiesContainer.appendChild(moreLabel);
                }
            }
        });
    }

    function renderActivitiesList(dateKey) {
        activityList.innerHTML = '';
        
        const dayActivities = activities[dateKey];
        
        if (!dayActivities || dayActivities.length === 0) {
            const noActivities = document.createElement('p');
            noActivities.className = 'text-gray-500 italic';
            noActivities.textContent = 'Nenhuma atividade para este dia.';
            activityList.appendChild(noActivities);
            return;
        }
        
        dayActivities.forEach((activity, index) => {
            const activityItem = document.createElement('div');
            activityItem.className = 'activity-item p-3 border-l-4 border-blue-500 bg-gray-50 rounded mb-2';
            
            const activityHeader = document.createElement('div');
            activityHeader.className = 'flex justify-between items-center';
            
            const activityTitle = document.createElement('h3');
            activityTitle.className = 'font-bold text-blue-600';
            activityTitle.textContent = activity.title;
            
            const deleteButton = document.createElement('button');
            deleteButton.className = 'text-red-500 hover:text-red-700';
            deleteButton.innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" />
                </svg>
            `;
            
            deleteButton.addEventListener('click', () => {
                dayActivities.splice(index, 1);
                
                if (dayActivities.length === 0) {
                    delete activities[dateKey];
                }
                
                localStorage.setItem('calendarActivities2025', JSON.stringify(activities));
                renderActivitiesList(dateKey);
                updateCalendarIndicators();
            });
            
            activityHeader.appendChild(activityTitle);
            activityHeader.appendChild(deleteButton);
            
            const activityDescription = document.createElement('p');
            activityDescription.className = 'text-gray-600 mt-1';
            activityDescription.textContent = activity.description || '(Sem descrição)';
            
            const timestamp = new Date(activity.timestamp);
            const timeInfo = document.createElement('div');
            timeInfo.className = 'text-xs text-gray-400 mt-2';
            timeInfo.textContent = `Adicionado em: ${timestamp.toLocaleDateString()} às ${timestamp.toLocaleTimeString()}`;
            
            activityItem.appendChild(activityHeader);
            activityItem.appendChild(activityDescription);
            activityItem.appendChild(timeInfo);
            
            activityList.appendChild(activityItem);
        });
    }

    window.addEventListener('click', (e) => {
        if (e.target === activityModal) {
            activityModal.classList.add('hidden');
        }
    });
});
