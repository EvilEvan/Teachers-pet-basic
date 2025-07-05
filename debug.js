/**
 * Debug utilities for Teacher's Pet application
 */

// Display localStorage contents in console
function debugLocalStorage() {
    console.log("==== LOCAL STORAGE DEBUG ====");
    const keys = Object.keys(localStorage);
    
    if (keys.length === 0) {
        console.log("Local storage is empty");
        return;
    }
    
    keys.forEach(key => {
        try {
            const value = localStorage.getItem(key);
            const parsed = JSON.parse(value);
            console.log(`${key}:`, parsed);
        } catch (e) {
            console.log(`${key}:`, localStorage.getItem(key), "(Not JSON)");
        }
    });
    console.log("============================");
}

// Fix student data if needed
function repairStudentData() {
    try {
        const studentData = JSON.parse(localStorage.getItem('studentData') || '{}');
        console.log("Current student data:", studentData);
        
        // Check for missing properties
        const fixed = {
            studentName: studentData.studentName || studentData.name || "",
            gender: studentData.gender || "male",
            strengths: studentData.strengths || "",
            weaknesses: studentData.weaknesses || "",
            overallAttributes: studentData.overallAttributes || studentData.overallRating || "5"
        };
        
        if (JSON.stringify(studentData) !== JSON.stringify(fixed)) {
            console.log("Fixed student data:", fixed);
            localStorage.setItem('studentData', JSON.stringify(fixed));
            return true;
        }
        return false;
    } catch (e) {
        console.error("Error repairing student data:", e);
        return false;
    }
}

// Add to any page that needs debugging with:
// <script src="debug.js"></script>
// And run in console: debugLocalStorage() or repairStudentData()
