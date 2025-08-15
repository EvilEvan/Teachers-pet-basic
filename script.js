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
    
    // Placeholder for generateComments function if it's ever needed here.
    // The main logic is in Subjects.html
    function generateComments() {
        // This function is intentionally left empty as the primary
        // comment generation logic is handled in Subjects.html
        console.log("Comment generation is handled by Subjects.html");
    }
});
