// Student Information Page JS

// Update slider value display
document.getElementById('overallAttributes').addEventListener('input', function () {
    document.getElementById('sliderValue').textContent = this.value;
    saveFormData();
});

// Save form data on input/change
document.addEventListener('input', saveFormData);
document.addEventListener('change', saveFormData);

function saveFormData() {
    const formData = {
        studentName: document.getElementById('studentName').value,
        gender: document.getElementById('gender').value,
        strengths: document.getElementById('strengths').value,
        weaknesses: document.getElementById('weaknesses').value,
        overallAttributes: document.getElementById('overallAttributes').value,
    };
    localStorage.setItem('studentData', JSON.stringify(formData));
    checkFormComplete();
}

function loadFormData() {
    const saved = localStorage.getItem('studentData');
    if (saved) {
        const data = JSON.parse(saved);
        document.getElementById('studentName').value = data.studentName || '';
        document.getElementById('strengths').value = data.strengths || '';
        document.getElementById('weaknesses').value = data.weaknesses || '';
        document.getElementById('overallAttributes').value = data.overallAttributes || '5';
        document.getElementById('sliderValue').textContent = data.overallAttributes || '5';
        document.getElementById('gender').value = data.gender || '';
    }
    checkSubjectsStatus();
    checkFormComplete();
}

function checkSubjectsStatus() {
    const subjects = localStorage.getItem('selectedSubjects');
    const subjectTitles = localStorage.getItem('selectedSubjectTitles');
    const statusIndicator = document.getElementById('subjectsStatus');

    if ((subjects && JSON.parse(subjects).length > 0) || (subjectTitles && JSON.parse(subjectTitles).length > 0)) {
        statusIndicator.textContent = 'Complete';
        statusIndicator.className = 'status-indicator status-complete';
    } else {
        statusIndicator.textContent = 'Required';
        statusIndicator.className = 'status-indicator status-pending';
    }
}

function checkFormComplete() {
    const name = document.getElementById('studentName').value;
    const gender = document.getElementById('gender').value;

    // Enable continue button if basic info is complete
    const continueBtn = document.querySelector('.button-secondary');
    if (name && gender) {
        continueBtn.style.opacity = '1';
        continueBtn.style.pointerEvents = 'auto';
    } else {
        continueBtn.style.opacity = '0.6';
        continueBtn.style.pointerEvents = 'none';
    }
}

function goToSubjects() {
    const name = document.getElementById('studentName').value;
    const gender = document.getElementById('gender').value;

    if (!name || !gender) {
        alert('Please complete the student name and gender selection before continuing.');
        return;
    }

    saveFormData();
    window.location.href = 'Subjects.html';
}

function addToAreas(text) {
    const textarea = document.getElementById('weaknesses');
    const currentValue = textarea.value.trim();

    if (currentValue.includes(text)) return; // Prevent duplicates

    textarea.value = currentValue === '' ? text : currentValue + ', ' + text;
    saveFormData();
}

function addToStrengths(text) {
    const textarea = document.getElementById('strengths');
    const currentValue = textarea.value.trim();

    if (currentValue.includes(text)) return; // Prevent duplicates

    textarea.value = currentValue === '' ? text : currentValue + ', ' + text;
    saveFormData();
}

// Load saved data on page load
window.addEventListener('load', loadFormData);

// Check for updates when returning from subjects page
window.addEventListener('focus', function () {
    checkSubjectsStatus();
    checkFormComplete();
});