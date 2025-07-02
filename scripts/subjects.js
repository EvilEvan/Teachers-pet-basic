// Subjects Page JS

let selectedTopics = [];
let selectedComment = null;

function updateSelectionCount() {
    const count = document.querySelectorAll('.topic-checkbox:checked').length;
    document.getElementById('selectionCount').textContent = count;
}

function selectAll() {
    document.querySelectorAll('.topic-checkbox, .subject-checkbox').forEach((checkbox) => {
        checkbox.checked = true;
    });
    updateSelectionCount();
    saveSelections();
}

function clearAll() {
    document.querySelectorAll('.topic-checkbox, .subject-checkbox').forEach((checkbox) => {
        checkbox.checked = false;
    });
    updateSelectionCount();
    saveSelections();
}

function saveSelections() {
    const selectedTopics = [];
    const selectedSubjects = [];

    document.querySelectorAll('.topic-checkbox:checked').forEach((checkbox) => {
        selectedTopics.push(checkbox.value);
    });

    document.querySelectorAll('.subject-checkbox:checked').forEach((checkbox) => {
        selectedSubjects.push(checkbox.value);
    });

    localStorage.setItem('selectedSubjects', JSON.stringify(selectedTopics));
    localStorage.setItem('selectedSubjectTitles', JSON.stringify(selectedSubjects));
}

function loadSelections() {
    const savedTopics = localStorage.getItem('selectedSubjects');
    const savedSubjects = localStorage.getItem('selectedSubjectTitles');

    if (savedTopics) {
        const selectedValues = JSON.parse(savedTopics);
        document.querySelectorAll('.topic-checkbox').forEach((checkbox) => {
            if (selectedValues.includes(checkbox.value)) {
                checkbox.checked = true;
            }
        });
    }

    if (savedSubjects) {
        const selectedSubjectValues = JSON.parse(savedSubjects);
        document.querySelectorAll('.subject-checkbox').forEach((checkbox) => {
            if (selectedSubjectValues.includes(checkbox.value)) {
                checkbox.checked = true;
            }
        });
    }

    updateSelectionCount();
}

function goBack() {
    saveSelections();
    window.location.href = 'student-information.html';
}

function generateComments() {
    const studentData = JSON.parse(localStorage.getItem('studentData') || '{}');
    const selectedTopics = JSON.parse(localStorage.getItem('selectedSubjects') || '[]');
    const selectedSubjects = JSON.parse(localStorage.getItem('selectedSubjectTitles') || '[]');

    if (!studentData.studentName || !studentData.gender) {
        alert('Please complete student information first by going back to the previous page.');
        return;
    }

    if (selectedTopics.length === 0 && selectedSubjects.length === 0) {
        alert('Please select at least one topic or subject area before generating comments.');
        return;
    }

    // Generate two different comments
    const comment1 = generateComment(studentData, selectedTopics, selectedSubjects, 1);
    const comment2 = generateComment(studentData, selectedTopics, selectedSubjects, 2);

    document.getElementById('commentText1').innerHTML = comment1;
    document.getElementById('commentText2').innerHTML = comment2;

    // Display word counts
    const wordCount1 = comment1.split(' ').length;
    const wordCount2 = comment2.split(' ').length;
    document.getElementById('wordCount1').textContent = `(${wordCount1} words)`;
    document.getElementById('wordCount2').textContent = `(${wordCount2} words)`;

    document.getElementById('generatedComments').style.display = 'block';

    // Scroll to comments
    document.getElementById('generatedComments').scrollIntoView({ behavior: 'smooth' });
}

function generateComment(studentData, selectedTopics, selectedSubjects, variant) {
    // This function is identical to the inline version previously present.
    // Copied verbatim for external script use.

    const name = studentData.studentName;
    const pronoun = studentData.gender === 'he' ? 'He' : studentData.gender === 'she' ? 'She' : 'They';
    const possessive = studentData.gender === 'he' ? 'his' : studentData.gender === 'she' ? 'her' : 'their';
    const pronounLower = pronoun.toLowerCase();
    const verb = studentData.gender === 'they' ? 'have' : 'has';
    const isAre = studentData.gender === 'they' ? 'are' : 'is';
    const verbPast = studentData.gender === 'they' ? 'were' : 'was';

    const overall = parseInt(studentData.overallAttributes || 5);
    const performanceData = {
        9: { desc: 'exceptional', adverb: 'consistently', achievement: 'outstanding progress' },
        8: { desc: 'excellent', adverb: 'confidently', achievement: 'remarkable growth' },
        7: { desc: 'very good', adverb: 'effectively', achievement: 'significant development' },
        6: { desc: 'good', adverb: 'steadily', achievement: 'positive progress' },
        5: { desc: 'satisfactory', adverb: 'gradually', achievement: 'steady improvement' },
        4: { desc: 'developing', adverb: 'persistently', achievement: 'encouraging development' },
        3: { desc: 'emerging', adverb: 'determinedly', achievement: 'foundational growth' },
    };
    const perf = performanceData[Math.min(overall, 9)] || performanceData[5];

    const subjectDescriptors = {
        English: ['letter recognition', 'early literacy skills', 'foundational reading concepts', 'alphabet knowledge'],
        Phonics: ['sound awareness', 'phonemic skills', 'letter-sound connections', 'pronunciation development'],
        Mathematics: ['number recognition', 'counting abilities', 'mathematical concepts', 'numerical understanding'],
        'Physical Education': ['motor skills', 'physical coordination', 'athletic abilities', 'movement activities'],
        'Social Studies': ['social awareness', 'environmental understanding', 'community concepts', 'cultural knowledge'],
        Science: ['scientific curiosity', 'exploratory learning', 'investigative skills', 'natural phenomena understanding'],
        Conversation: ['verbal communication', 'language expression', 'conversational skills', 'oral development'],
    };

    const openings = [
        `${name} ${verb} demonstrated ${perf.desc} engagement throughout this reporting period.`,
        `${name} ${verb} shown ${perf.achievement} across multiple learning areas this term.`,
        `${name} ${verb} approached learning opportunities with ${perf.desc} enthusiasm and effort.`,
    ];

    function random(arr) {
        return arr[Math.floor(Math.random() * arr.length)];
    }

    let comment = random(openings) + ' ';

    // Include subject areas
    if (selectedSubjects.length > 0) {
        const subjectsList = selectedSubjects.join(', ');
        comment += `${pronoun} ${verb} actively engaged in ${subjectsList}. `;
    }

    // Include specific topics
    if (selectedTopics.length > 0) {
        comment += `${pronoun} ${verb} participated in activities such as ${selectedTopics.slice(0, 3).join(', ')}${selectedTopics.length > 3 ? ', and more' : ''}. `;
    }

    // Strengths
    if (studentData.strengths) {
        comment += `${pronoun} shows strengths in ${studentData.strengths}. `;
    }

    // Areas for improvement
    if (studentData.weaknesses) {
        comment += `To support further growth, focusing on ${studentData.weaknesses} will be beneficial. `;
    }

    // Closing sentence variations
    const closings = [
        `${pronoun} ${verb} ${perf.adverb} displayed ${perf.achievement}, and ${isAre} encouraged to continue exploring new learning opportunities.`,
        `Overall, ${pronounLower} ${isAre} making ${perf.achievement}; continued encouragement will help maintain this momentum.`,
        `With ongoing support, ${name} will undoubtedly continue to build on ${possessive} achievements and thrive.`,
    ];

    comment += random(closings);

    return comment;
}

function selectComment(option) {
    selectedComment = option;
    document.querySelectorAll('.comment-option').forEach((el) => el.classList.remove('selected'));
    document.getElementById(`comment${option}`).classList.add('selected');
}

function copySelectedComment() {
    if (!selectedComment) {
        alert('Please select a comment to copy.');
        return;
    }

    const text = document.getElementById(`commentText${selectedComment}`).innerText;
    navigator.clipboard.writeText(text).then(() => alert('Comment copied to clipboard!'));
}

function startOver() {
    localStorage.removeItem('selectedSubjects');
    localStorage.removeItem('selectedSubjectTitles');
    localStorage.removeItem('studentData');
    window.location.href = 'student-information.html';
}

// Initialise selections on page load
window.addEventListener('load', loadSelections);