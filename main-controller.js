// Main Controller for Kindergarten Rapport Generator
class KindergartenRapportController {
    constructor() {
        this.currentSlide = 1;
        this.totalSlides = 7;
        this.slideConfig = {
            1: { title: "Student Information", emoji: "📋", file: "slide-1-student-info.html" },
            2: { title: "Language Skills", emoji: "📚", file: "slide-2-language-skills.html" },
            3: { title: "Academic Skills", emoji: "🔢", file: "slide-3-academic-skills.html" },
            4: { title: "Knowledge Areas", emoji: "🌍", file: "slide-4-knowledge-areas.html" },
            5: { title: "Interactive Skills", emoji: "💬", file: "slide-5-interactive-skills.html" },
            6: { title: "Physical & Creative", emoji: "🏃", file: "slide-6-physical-creative.html" },
            7: { title: "Review & Generate", emoji: "✅", file: "slide-7-review-generate.html" }
        };
        this.init();
    }

    init() {
        this.loadSlide(this.currentSlide);
        this.setupKeyboardNavigation();
        this.restoreFromSession();
    }

    // Session Storage Management
    saveToSession() {
        const data = this.gatherAllData();
        sessionStorage.setItem('kindergartenRapportData', JSON.stringify(data));
        sessionStorage.setItem('currentSlide', this.currentSlide.toString());
    }

    restoreFromSession() {
        const savedSlide = sessionStorage.getItem('currentSlide');
        if (savedSlide) {
            this.currentSlide = parseInt(savedSlide);
        }
        
        const savedData = sessionStorage.getItem('kindergartenRapportData');
        if (savedData) {
            this.populateAllData(JSON.parse(savedData));
        }
    }

    clearSession() {
        sessionStorage.removeItem('kindergartenRapportData');
        sessionStorage.removeItem('currentSlide');
    }

    // Slide Management
    async loadSlide(slideNumber) {
        try {
            const response = await fetch(this.slideConfig[slideNumber].file);
            const html = await response.text();
            
            document.getElementById('slideContent').innerHTML = html;
            this.currentSlide = slideNumber;
            this.updateProgress();
            this.updateNavigation();
            
            // Restore data for this slide
            const savedData = sessionStorage.getItem('kindergartenRapportData');
            if (savedData) {
                this.populateSlideData(slideNumber, JSON.parse(savedData));
            }

            // Special handling for review slide
            if (slideNumber === 7) {
                this.populateReviewContent();
            }
        } catch (error) {
            console.error('Error loading slide:', error);
            document.getElementById('slideContent').innerHTML = 
                '<div class="alert">⚠️ Error loading slide. Please refresh the page.</div>';
        }
    }

    nextSlide() {
        if (this.currentSlide === this.totalSlides) {
            // On last slide, scroll to generate button
            const generateBtn = document.querySelector('.action-btn');
            if (generateBtn) {
                generateBtn.scrollIntoView({ behavior: 'smooth' });
            }
            return;
        }

        if (this.validateCurrentSlide()) {
            this.saveToSession();
            this.loadSlide(this.currentSlide + 1);
        }
    }

    previousSlide() {
        if (this.currentSlide > 1) {
            this.saveToSession();
            this.loadSlide(this.currentSlide - 1);
        }
    }

    validateCurrentSlide() {
        if (this.currentSlide === 1) {
            const studentName = document.getElementById('studentName')?.value?.trim();
            if (!studentName) {
                alert('Please enter the student\\'s name before proceeding.');
                document.getElementById('studentName')?.focus();
                return false;
            }
        }
        return true;
    }

    // Progress Management
    updateProgress() {
        const progressPercent = (this.currentSlide / this.totalSlides) * 100;
        const progressFill = document.getElementById('progressFill');
        const progressText = document.getElementById('progressText');
        const slideIndicator = document.getElementById('slideIndicator');

        if (progressFill) progressFill.style.width = progressPercent + '%';
        if (progressText) {
            progressText.textContent = 
                `Step ${this.currentSlide} of ${this.totalSlides}: ${this.slideConfig[this.currentSlide].title}`;
        }
        if (slideIndicator) {
            slideIndicator.textContent = `${this.currentSlide} / ${this.totalSlides}`;
        }
    }

    updateNavigation() {
        const prevBtn = document.getElementById('prevBtn');
        const nextBtn = document.getElementById('nextBtn');

        if (prevBtn) prevBtn.disabled = this.currentSlide === 1;
        if (nextBtn) {
            nextBtn.disabled = this.currentSlide === this.totalSlides;
            nextBtn.textContent = this.currentSlide === this.totalSlides ? 'Generate Report 🎯' : 'Next ➡️';
        }
    }

    // Data Management
    gatherAllData() {
        const subjects = ['english', 'phonics', 'math', 'iq', 'social', 'science', 'conversation', 'arts', 'pe', 'puppet'];
        const data = {
            studentInfo: {
                name: this.getElementValue('studentName'),
                gender: this.getElementValue('gender'),
                strengths: this.getElementValue('strengths'),
                weaknesses: this.getElementValue('weaknesses'),
                overallAttributes: this.getElementValue('overallAttributes'),
                shyness: this.getElementValue('shyness')
            },
            subjects: {}
        };

        subjects.forEach(subject => {
            data.subjects[subject] = {
                score: this.getElementValue(subject + 'Slider'),
                hadFun: this.getElementChecked(subject + 'Fun'),
                skills: this.getCheckedSkills(subject)
            };
        });

        return data;
    }

    populateAllData(data) {
        // Student info
        if (data.studentInfo) {
            this.setElementValue('studentName', data.studentInfo.name);
            this.setElementValue('gender', data.studentInfo.gender);
            this.setElementValue('strengths', data.studentInfo.strengths);
            this.setElementValue('weaknesses', data.studentInfo.weaknesses);
            this.setElementValue('overallAttributes', data.studentInfo.overallAttributes);
            this.setElementValue('shyness', data.studentInfo.shyness);
        }

        // Subjects
        if (data.subjects) {
            Object.entries(data.subjects).forEach(([subject, subjectData]) => {
                this.setElementValue(subject + 'Slider', subjectData.score);
                this.setElementChecked(subject + 'Fun', subjectData.hadFun);
                this.updateSliderValue(subject);
                
                if (subjectData.skills) {
                    this.setCheckedSkills(subject, subjectData.skills);
                }
            });
        }
    }

    populateSlideData(slideNumber, data) {
        // Only populate data relevant to current slide
        setTimeout(() => {
            if (slideNumber === 1 && data.studentInfo) {
                this.setElementValue('studentName', data.studentInfo.name);
                this.setElementValue('gender', data.studentInfo.gender);
                this.setElementValue('strengths', data.studentInfo.strengths);
                this.setElementValue('weaknesses', data.studentInfo.weaknesses);
                this.setElementValue('overallAttributes', data.studentInfo.overallAttributes);
                this.setElementValue('shyness', data.studentInfo.shyness);
            } else if (slideNumber > 1 && data.subjects) {
                const subjectMap = {
                    2: ['english', 'phonics'],
                    3: ['math', 'iq'],
                    4: ['social', 'science'],
                    5: ['conversation', 'arts'],
                    6: ['pe', 'puppet']
                };

                const relevantSubjects = subjectMap[slideNumber];
                if (relevantSubjects) {
                    relevantSubjects.forEach(subject => {
                        const subjectData = data.subjects[subject];
                        if (subjectData) {
                            this.setElementValue(subject + 'Slider', subjectData.score);
                            this.setElementChecked(subject + 'Fun', subjectData.hadFun);
                            this.updateSliderValue(subject);
                            if (subjectData.skills) {
                                this.setCheckedSkills(subject, subjectData.skills);
                            }
                        }
                    });
                }
            }
        }, 100); // Small delay to ensure DOM is ready
    }

    // Utility functions
    getElementValue(id) {
        const element = document.getElementById(id);
        return element ? element.value : '';
    }

    setElementValue(id, value) {
        const element = document.getElementById(id);
        if (element && value !== undefined && value !== null) {
            element.value = value;
        }
    }

    getElementChecked(id) {
        const element = document.getElementById(id);
        return element ? element.checked : false;
    }

    setElementChecked(id, checked) {
        const element = document.getElementById(id);
        if (element && checked !== undefined) {
            element.checked = checked;
        }
    }

    getCheckedSkills(subject) {
        const checkboxes = document.querySelectorAll(`input[name="${subject}"]:checked`);
        return Array.from(checkboxes).map(cb => cb.nextElementSibling?.textContent || '');
    }

    setCheckedSkills(subject, skills) {
        const checkboxes = document.querySelectorAll(`input[name="${subject}"]`);
        checkboxes.forEach(checkbox => {
            const label = checkbox.nextElementSibling?.textContent || '';
            checkbox.checked = skills.includes(label);
        });
    }

    updateSliderValue(subject) {
        const slider = document.getElementById(subject + 'Slider');
        const valueSpan = document.getElementById(subject + 'Value');
        if (slider && valueSpan) {
            valueSpan.textContent = slider.value;
        }
    }

    // Comment Generation
    generateComments() {
        const studentName = this.getElementValue('studentName');
        if (!studentName) {
            alert('Please enter the student\\'s name first.');
            this.loadSlide(1);
            return;
        }

        const studentData = this.gatherAllData();
        const comment1 = this.generateComment1(studentName, studentData);
        const comment2 = this.generateComment2(studentName, studentData);

        document.getElementById('comment1').innerHTML = `
            <h4>Comment Option 1:</h4>
            <p>${comment1}</p>
            <button class="copy-btn" onclick="rapportController.copyToClipboard('${comment1.replace(/'/g, "\\\\'")}')">📋 Copy Comment 1</button>
        `;

        document.getElementById('comment2').innerHTML = `
            <h4>Comment Option 2:</h4>
            <p>${comment2}</p>
            <button class="copy-btn" onclick="rapportController.copyToClipboard('${comment2.replace(/'/g, "\\\\'")}')">📋 Copy Comment 2</button>
        `;

        document.getElementById('commentsSection').style.display = 'block';
        document.getElementById('commentsSection').scrollIntoView({ behavior: 'smooth' });
    }

    generateComment1(name, data) {
        const strengths = this.getTopStrengths(data.subjects);
        const performanceLevel = this.getOverallPerformance(data.subjects);
        
        let comment = `${name} has shown ${performanceLevel} progress throughout this term. `;
        
        if (strengths.length > 0) {
            comment += `${name} particularly excels in ${strengths.slice(0, 2).join(' and ')}, demonstrating strong foundational skills. `;
        }
        
        if (data.studentInfo.strengths) {
            comment += `${name}'s natural strengths in ${data.studentInfo.strengths.toLowerCase()} have been evident in classroom activities. `;
        }
        
        comment += this.getSpecificAchievements(data.subjects, name);
        
        const funSubjects = this.getFunSubjects(data.subjects);
        if (funSubjects.length > 0) {
            if (funSubjects.length === 1) {
                comment += `${name} particularly enjoyed ${funSubjects[0]} activities and showed great enthusiasm during these lessons. `;
            } else if (funSubjects.length === 2) {
                comment += `${name} had lots of fun with ${funSubjects[0]} and ${funSubjects[1]} activities, showing wonderful engagement. `;
            } else {
                comment += `${name} demonstrated real joy in learning, particularly enjoying ${funSubjects.slice(0, 2).join(', ')} and other activities throughout the term. `;
            }
        }
        
        if (parseInt(data.studentInfo.shyness) > 6) {
            comment += `While initially reserved, ${name} has gradually become more confident in participating in group activities. `;
        } else if (parseInt(data.studentInfo.shyness) < 4) {
            comment += `${name} shows excellent social confidence and actively participates in all classroom discussions. `;
        }
        
        comment += `Keep up the wonderful work, ${name}! Your enthusiasm for learning is truly inspiring.`;
        
        return comment;
    }

    generateComment2(name, data) {
        const strengths = this.getTopStrengths(data.subjects);
        const performanceLevel = this.getOverallPerformance(data.subjects);
        
        let comment = `${name} has demonstrated ${performanceLevel} development across various learning areas this term. `;
        
        comment += this.getSpecificSubjectComments(data.subjects, name);
        
        const funSubjects = this.getFunSubjects(data.subjects);
        if (funSubjects.length > 0) {
            if (funSubjects.length === 1) {
                comment += `It's been wonderful to see how much ${name} enjoyed ${funSubjects[0]} this term. `;
            } else if (funSubjects.length === 2) {
                comment += `${name} showed real enthusiasm for ${funSubjects[0]} and ${funSubjects[1]}, which made learning even more enjoyable. `;
            } else {
                comment += `${name}'s enthusiasm was particularly evident in ${funSubjects.slice(0, 2).join(' and ')} activities, creating a positive learning atmosphere. `;
            }
        }
        
        if (data.studentInfo.strengths) {
            comment += `${name}'s abilities in ${data.studentInfo.strengths.toLowerCase()} continue to shine through in daily activities. `;
        }
        
        if (parseInt(data.studentInfo.overallAttributes) >= 7) {
            comment += `${name} consistently shows a positive attitude towards learning and works well with peers. `;
        }
        
        if (data.studentInfo.weaknesses) {
            comment += `We will continue to support ${name} in developing skills in areas that need more practice. `;
        }
        
        comment += `${name}, you should be proud of all your achievements this term. Your hard work and dedication are truly commendable!`;
        
        return comment;
    }

    // Helper functions for comment generation
    getTopStrengths(subjects) {
        const subjectNames = {
            english: 'English',
            phonics: 'Phonics',
            math: 'Mathematics',
            iq: 'General Knowledge',
            social: 'Social Studies',
            science: 'Science',
            conversation: 'Communication',
            arts: 'Arts & Crafts',
            pe: 'Physical Education',
            puppet: 'Story Participation'
        };
        
        return Object.entries(subjects)
            .filter(([key, data]) => parseInt(data.score) >= 4)
            .map(([key, data]) => subjectNames[key])
            .slice(0, 3);
    }

    getOverallPerformance(subjects) {
        const scores = Object.values(subjects).map(s => parseInt(s.score || 3));
        const average = scores.reduce((a, b) => a + b, 0) / scores.length;
        
        if (average >= 4.5) return 'excellent';
        if (average >= 3.5) return 'good';
        if (average >= 2.5) return 'steady';
        return 'developing';
    }

    getSpecificAchievements(subjects, name) {
        let achievements = '';
        
        if (parseInt(subjects.math?.score || 0) >= 4) {
            achievements += `${name} shows strong number recognition and counting skills. `;
        }
        
        if (parseInt(subjects.english?.score || 0) >= 4) {
            achievements += `Letter recognition and vocabulary development are particular strengths for ${name}. `;
        }
        
        if (parseInt(subjects.arts?.score || 0) >= 4) {
            achievements += `${name} displays creativity and fine motor skills in arts and crafts activities. `;
        }
        
        return achievements;
    }

    getSpecificSubjectComments(subjects, name) {
        let comments = '';
        const highScoring = Object.entries(subjects).filter(([key, data]) => parseInt(data.score || 0) >= 4);
        
        if (highScoring.length > 0) {
            const [subject, data] = highScoring[0];
            const subjectMap = {
                english: 'English language activities',
                phonics: 'phonetic awareness',
                math: 'mathematical concepts',
                science: 'science exploration',
                arts: 'creative expression'
            };
            
            comments += `${name} has shown particular strength in ${subjectMap[subject] || subject}. `;
        }
        
        return comments;
    }

    getFunSubjects(subjects) {
        const subjectNames = {
            english: 'English',
            phonics: 'Phonics',
            math: 'Mathematics',
            iq: 'General Knowledge',
            social: 'Social Studies',
            science: 'Science',
            conversation: 'Communication',
            arts: 'Arts & Crafts',
            pe: 'Physical Education',
            puppet: 'Story Participation'
        };
        
        return Object.entries(subjects)
            .filter(([key, data]) => data.hadFun)
            .map(([key, data]) => subjectNames[key]);
    }

    copyToClipboard(text) {
        navigator.clipboard.writeText(text).then(() => {
            alert('Comment copied to clipboard! 📋✅');
            
            // Clear session after successful copy to allow for refresh/new student
            this.clearSession();
            
            // Option to start fresh
            if (confirm('Comment copied successfully! Would you like to clear all fields to start a new report?')) {
                this.clearAllFields();
            }
        }, (err) => {
            console.error('Could not copy text: ', err);
            const textArea = document.createElement('textarea');
            textArea.value = text;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            alert('Comment copied to clipboard! 📋✅');
        });
    }

    clearAllFields() {
        if (confirm('Are you sure you want to clear all fields? This action cannot be undone.')) {
            this.clearSession();
            this.loadSlide(1);
            alert('All fields have been cleared successfully!');
        }
    }

    populateReviewContent() {
        const data = this.gatherAllData();
        const studentName = data.studentInfo.name;
        let reviewHTML = '';

        if (!studentName) {
            reviewHTML = '<div class="alert">⚠️ Please go back and enter the student\\'s name to continue.</div>';
        } else {
            reviewHTML = `
                <div class="review-grid">
                    <div class="review-card">
                        <h4>👤 Student Details</h4>
                        <p><strong>Name:</strong> ${studentName}</p>
                        <p><strong>Gender:</strong> ${data.studentInfo.gender || 'Not specified'}</p>
                    </div>
            `;

            // Calculate overall performance
            let totalScore = 0;
            let subjectCount = 0;
            let funSubjects = [];

            Object.entries(data.subjects).forEach(([subject, subjectData]) => {
                const score = parseInt(subjectData.score || 3);
                totalScore += score;
                subjectCount++;
                if (subjectData.hadFun) {
                    const subjectNames = {
                        english: 'English', phonics: 'Phonics', math: 'Mathematics',
                        iq: 'General Knowledge', social: 'Social Studies', science: 'Science',
                        conversation: 'Communication', arts: 'Arts & Crafts', pe: 'Physical Education',
                        puppet: 'Story Participation'
                    };
                    funSubjects.push(subjectNames[subject]);
                }
            });

            const averageScore = (totalScore / subjectCount).toFixed(1);

            reviewHTML += `
                    <div class="review-card">
                        <h4>📊 Performance Summary</h4>
                        <p><strong>Average Score:</strong> ${averageScore}/5</p>
                        <p><strong>Subjects Enjoyed:</strong> ${funSubjects.length}</p>
                    </div>
                </div>

                <div class="section">
                    <h4>🎯 Ready to Generate Comments</h4>
                    <p>All information has been collected. Click the "Generate Rapport Comments" button below to create personalized comments for ${studentName}.</p>
                    <p>You'll receive two different comment options to choose from, both following the established format and including references to subjects where ${studentName} had fun.</p>
                </div>
            `;
        }

        const reviewContent = document.getElementById('reviewContent');
        if (reviewContent) {
            reviewContent.innerHTML = reviewHTML;
        }
    }

    setupKeyboardNavigation() {
        document.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowLeft') {
                this.previousSlide();
            } else if (e.key === 'ArrowRight') {
                this.nextSlide();
            }
        });
    }
}

// Global functions for backward compatibility
let rapportController;

function nextSlide() {
    if (rapportController) rapportController.nextSlide();
}

function previousSlide() {
    if (rapportController) rapportController.previousSlide();
}

function updateSliderValue(subject) {
    if (rapportController) rapportController.updateSliderValue(subject);
}

function generateComments() {
    if (rapportController) rapportController.generateComments();
}

function clearAllFields() {
    if (rapportController) rapportController.clearAllFields();
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    rapportController = new KindergartenRapportController();
});
