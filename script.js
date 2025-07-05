document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const generateBtn = document.getElementById('generate-btn');
    const copyBtn = document.getElementById('copy-btn');
    const regenerateBtn = document.getElementById('regenerate-btn');
    const startOverBtn = document.getElementById('start-over-btn');
    const commentsSection = document.getElementById('comments-section');
    const studentInfoSection = document.getElementById('student-info');
    const maleComment = document.getElementById('male-comment');
    const femaleComment = document.getElementById('female-comment');
    const overallRating = document.getElementById('overall-rating');
    const ratingValue = document.getElementById('rating-value');
    const checkboxes = document.querySelectorAll('.subject-checkbox');
    const sliders = document.querySelectorAll('.subject-slider');
    
    // Update rating value display
    overallRating.addEventListener('input', () => {
        ratingValue.textContent = overallRating.value;
    });
    
    // Enable/disable sliders based on checkboxes
    checkboxes.forEach(checkbox => {
        checkbox.addEventListener('change', () => {
            const sliderId = checkbox.id + '-slider';
            const slider = document.getElementById(sliderId);
            if (slider) {
                slider.disabled = !checkbox.checked;
            }
        });
    });
    
    // Update slider values
    sliders.forEach(slider => {
        slider.addEventListener('input', () => {
            const valueDisplay = slider.nextElementSibling;
            if (valueDisplay) {
                valueDisplay.textContent = slider.value;
            }
        });
    });
    
    // Generate Comments Button Click
    generateBtn.addEventListener('click', () => {
        const studentName = document.getElementById('student-name').value.trim();
        if (!studentName) {
            alert('Please enter the student\'s name');
            return;
        }
        
        // Save student data to localStorage properly
        const gender = document.querySelector('input[name="gender"]:checked')?.value || 'male';
        const strengths = document.getElementById('strengths')?.value.trim() || '';
        const weaknesses = document.getElementById('weaknesses')?.value.trim() || '';
        const overallRating = document.getElementById('overall-rating')?.value || '5';
        
        // Create and save the student data object
        const studentData = {
            studentName: studentName,
            gender: gender,
            strengths: strengths,
            weaknesses: weaknesses,
            overallAttributes: overallRating
        };
        
        // Save to localStorage
        localStorage.setItem('studentData', JSON.stringify(studentData));
        console.log("Saved student data:", studentData);
        
        generateComments();
        studentInfoSection.classList.add('hidden');
        commentsSection.classList.remove('hidden');
    });
    
    // Regenerate Comments Button Click
    regenerateBtn.addEventListener('click', () => {
        generateComments();
    });
    
    // Start Over Button Click
    startOverBtn.addEventListener('click', () => {
        // Don't clear localStorage, just hide/show sections
        commentsSection.classList.add('hidden');
        studentInfoSection.classList.remove('hidden');
    });
    
    // Copy Selected Comment Button Click
    copyBtn.addEventListener('click', () => {
        const maleBox = document.getElementById('male-style');
        const femaleBox = document.getElementById('female-style');
        let textToCopy = '';
        
        if (maleBox.classList.contains('selected')) {
            textToCopy = maleComment.textContent;
        } else if (femaleBox.classList.contains('selected')) {
            textToCopy = femaleComment.textContent;
        } else {
            alert('Please select a comment to copy');
            return;
        }
        
        navigator.clipboard.writeText(textToCopy)
            .then(() => {
                alert('Comment copied to clipboard!');
            })
            .catch(err => {
                console.error('Error copying text: ', err);
                alert('Failed to copy comment');
            });
    });
    
    // Make comment boxes selectable
    document.getElementById('male-style').addEventListener('click', () => {
        document.getElementById('male-style').classList.add('selected');
        document.getElementById('female-style').classList.remove('selected');
    });
    
    document.getElementById('female-style').addEventListener('click', () => {
        document.getElementById('female-style').classList.add('selected');
        document.getElementById('male-style').classList.remove('selected');
    });
    
    // Generate Comments Function
    function generateComments() {
        const studentName = document.getElementById('student-name').value.trim();
        const gender = document.querySelector('input[name="gender"]:checked').value;
        const strengths = document.getElementById('strengths').value.trim();
        const weaknesses = document.getElementById('weaknesses').value.trim();
        const overallRating = document.getElementById('overall-rating').value;
        
        // Get selected subjects and their ratings
        const selectedSubjects = [];
        checkboxes.forEach(checkbox => {
            if (checkbox.checked) {
                const sliderId = checkbox.id + '-slider';
                const slider = document.getElementById(sliderId);
                selectedSubjects.push({
                    name: checkbox.id.charAt(0).toUpperCase() + checkbox.id.slice(1),
                    rating: parseInt(slider.value)
                });
            }
        });
        
        // Generate comments
        const maleTeacherComment = generateMaleTeacherComment(studentName, gender, strengths, weaknesses, overallRating, selectedSubjects);
        const femaleTeacherComment = generateFemaleTeacherComment(studentName, gender, strengths, weaknesses, overallRating, selectedSubjects);
        
        // Update comment boxes and word counts
        maleComment.textContent = maleTeacherComment;
        document.querySelector('#male-style .word-count').textContent = `(${countWords(maleTeacherComment)} words)`;
        
        femaleComment.textContent = femaleTeacherComment;
        document.querySelector('#female-style .word-count').textContent = `(${countWords(femaleTeacherComment)} words)`;
    }
    
    // Count words in a string
    function countWords(str) {
        return str.trim().split(/\s+/).length;
    }
    
    // Generate Male Teacher Style Comment
    function generateMaleTeacherComment(name, gender, strengths, weaknesses, overallRating, subjects) {
        // Initial comment parts
        let comment = `${name} demonstrates `;
        
        // Add some general comments based on overall rating
        if (overallRating >= 8) {
            comment += `excellent progress this term, showing strong capabilities across multiple areas. `;
        } else if (overallRating >= 5) {
            comment += `satisfactory performance this term, showing appropriate developmental progress. `;
        } else {
            comment += `progress this term, though there are some areas requiring additional attention. `;
        }
        
        // Add strengths if provided
        if (strengths) {
            comment += `${getPronouns(gender).Their} strengths in ${strengths} are notable. `;
        }
        
        // Add subject-specific comments
        if (subjects.length > 0) {
            const goodSubjects = subjects.filter(s => s.rating >= 4);
            const averageSubjects = subjects.filter(s => s.rating >= 2 && s.rating < 4);
            const needsWorkSubjects = subjects.filter(s => s.rating < 2);
            
            if (goodSubjects.length > 0) {
                comment += `${getPronouns(gender).They} excel${gender === 'male' ? 's' : ''} in ${formatSubjectList(goodSubjects)}. `;
            }
            
            if (averageSubjects.length > 0) {
                comment += `${getPronouns(gender).They} show${gender === 'male' ? 's' : ''} consistent effort in ${formatSubjectList(averageSubjects)}. `;
            }
            
            if (needsWorkSubjects.length > 0) {
                comment += `${capitalizeFirstLetter(getPronouns(gender).they)} would benefit from additional practice in ${formatSubjectList(needsWorkSubjects)}. `;
            }
        }
        
        // Add weaknesses if provided
        if (weaknesses) {
            comment += `Areas needing improvement include ${weaknesses}. `;
        }
        
        // Add conclusion based on overall rating
        if (overallRating >= 7) {
            comment += `${name} is well-prepared for continued academic advancement and future learning challenges.`;
        } else if (overallRating >= 4) {
            comment += `With continued focus and support, ${name} will continue to develop the necessary skills for future success.`;
        } else {
            comment += `I recommend providing ${name} with additional support to help strengthen ${getPronouns(gender).their} foundational skills.`;
        }
        
        // Ensure minimum word count
        if (countWords(comment) < 90) {
            comment += ` ${getPronouns(gender).They} approach${gender === 'male' ? 'es' : ''} tasks with ${['dedication', 'enthusiasm', 'methodical precision', 'care', 'thoughtfulness'][Math.floor(Math.random() * 5)]} and demonstrates consistent academic growth.`;
        }
        
        // Trim if exceeds maximum
        while (countWords(comment) > 120) {
            const words = comment.split(' ');
            words.pop();
            comment = words.join(' ') + '.';
        }
        
        return comment;
    }
    
    // Generate Female Teacher Style Comment
    function generateFemaleTeacherComment(name, gender, strengths, weaknesses, overallRating, subjects) {
        // Initial comment parts
        let comment = `${name} has `;
        
        // Add some general comments based on overall rating
        if (overallRating >= 8) {
            comment += `flourished beautifully this term, displaying remarkable growth and development. `;
        } else if (overallRating >= 5) {
            comment += `progressed well throughout the term, showing positive growth in several areas. `;
        } else {
            comment += `made steps forward this term, with opportunities for further development. `;
        }
        
        // Add strengths if provided
        if (strengths) {
            comment += `${getPronouns(gender).Their} wonderful ${strengths} truly shines throughout our activities. `;
        }
        
        // Add subject-specific comments
        if (subjects.length > 0) {
            const goodSubjects = subjects.filter(s => s.rating >= 4);
            const averageSubjects = subjects.filter(s => s.rating >= 2 && s.rating < 4);
            const needsWorkSubjects = subjects.filter(s => s.rating < 2);
            
            if (goodSubjects.length > 0) {
                comment += `${getPronouns(gender).They} approach${gender === 'male' ? 'es' : ''} ${formatSubjectList(goodSubjects)} with enthusiasm and joy. `;
            }
            
            if (averageSubjects.length > 0) {
                comment += `We'll continue nurturing growth in ${formatSubjectList(averageSubjects)} with supportive guidance. `;
            }
            
            if (needsWorkSubjects.length > 0) {
                comment += `With extra encouragement, ${name} will blossom in ${formatSubjectList(needsWorkSubjects)}. `;
            }
        }
        
        // Add weaknesses if provided
        if (weaknesses) {
            comment += `We're working together on ${weaknesses}. `;
        }
        
        // Add conclusion based on overall rating
        if (overallRating >= 7) {
            comment += `${name} is ready for wonderful future adventures in learning and discovery.`;
        } else if (overallRating >= 4) {
            comment += `I'm excited to see how ${name} continues to grow with our ongoing support and encouragement.`;
        } else {
            comment += `Together we'll help ${name} build confidence and develop skills needed for future success.`;
        }
        
        // Ensure minimum word count
        if (countWords(comment) < 90) {
            comment += ` ${getPronouns(gender).They} ${gender === 'male' ? 'naturally supports' : 'naturally support'} classmates and celebrate${gender === 'male' ? 's' : ''} others' successes. ${getPronouns(gender).Their} creativity brightens our classroom.`;
        }
        
        // Trim if exceeds maximum
        while (countWords(comment) > 120) {
            const words = comment.split(' ');
            words.pop();
            comment = words.join(' ') + '.';
        }
        
        return comment;
    }
    
    // Format a list of subjects
    function formatSubjectList(subjects) {
        if (subjects.length === 0) return '';
        if (subjects.length === 1) return subjects[0].name;
        if (subjects.length === 2) return `${subjects[0].name} and ${subjects[1].name}`;
        
        return subjects.map((subject, index) => {
            if (index === subjects.length - 1) {
                return `and ${subject.name}`;
            }
            return subject.name;
        }).join(', ');
    }
    
    // Get pronouns based on gender
    function getPronouns(gender) {
        if (gender === 'male') {
            return { they: 'he', They: 'He', their: 'his', Their: 'His', them: 'him', Them: 'Him' };
        } else {
            return { they: 'she', They: 'She', their: 'her', Their: 'Her', them: 'her', Them: 'Her' };
        }
    }
    
    // Capitalize the first letter of a string
    function capitalizeFirstLetter(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }
});
