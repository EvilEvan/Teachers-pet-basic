/**
 * Debug Tools for Teacher's Pet Application
 * Add this script to your HTML pages for debugging functionality
 * <script src="debug-tools.js"></script>
 */

(function() {
    // Initialize debug tools when page loads
    window.addEventListener('DOMContentLoaded', initDebugTools);

    function initDebugTools() {
        console.log("Debug tools initialized");
        
        // Add a button to inspect localStorage
        const debugBtn = document.createElement('button');
        debugBtn.textContent = "Debug Data";
        debugBtn.style.position = "fixed";
        debugBtn.style.bottom = "10px";
        debugBtn.style.right = "10px";
        debugBtn.style.zIndex = "9999";
        debugBtn.style.background = "#f44336";
        debugBtn.style.color = "white";
        debugBtn.style.border = "none";
        debugBtn.style.borderRadius = "4px";
        debugBtn.style.padding = "8px 12px";
        debugBtn.style.cursor = "pointer";
        debugBtn.style.opacity = "0.7";
        
        debugBtn.addEventListener('click', function() {
            inspectLocalStorage();
            
            // Create options for fixing data
            const fixOptions = [
                "Fix Student Data",
                "Clear All Data",
                "Export Data",
                "Import Data"
            ];
            
            const option = prompt(
                "Debug Options:\n" +
                "1. Fix Student Data\n" +
                "2. Clear All Data\n" +
                "3. Export Data\n" +
                "4. Import Data\n\n" +
                "Enter option number (1-4):"
            );
            
            if (option === "1") fixStudentData();
            if (option === "2" && confirm("Are you sure you want to clear all data?")) clearAllData();
            if (option === "3") exportData();
            if (option === "4") importData();
        });
        
        document.body.appendChild(debugBtn);
    }
    
    // Inspect and log localStorage content
    function inspectLocalStorage() {
        console.group("LocalStorage Inspection");
        console.log("All localStorage keys:", Object.keys(localStorage));
        
        // Check for student data
        try {
            const studentData = JSON.parse(localStorage.getItem('studentData') || '{}');
            console.log("Student Data:", studentData);
            
            // Validate critical fields
            console.log("Student Name present:", !!studentData.studentName);
            console.log("Gender present:", !!studentData.gender);
        } catch (e) {
            console.error("Error parsing studentData:", e);
        }
        
        // Check for subject selections
        try {
            const subjectData = JSON.parse(localStorage.getItem('selectedSubjectData') || '[]');
            console.log("Subject Data:", subjectData);
            console.log("Selected subjects count:", subjectData.length);
        } catch (e) {
            console.error("Error parsing selectedSubjectData:", e);
        }
        
        // Check for topic selections
        try {
            const topicData = JSON.parse(localStorage.getItem('selectedTopicData') || '[]');
            console.log("Topic Data:", topicData);
            console.log("Selected topics count:", topicData.length);
        } catch (e) {
            console.error("Error parsing selectedTopicData:", e);
        }
        
        console.groupEnd();
    }
    
    // Fix student data issues
    function fixStudentData() {
        try {
            const currentData = JSON.parse(localStorage.getItem('studentData') || '{}');
            
            const name = prompt("Enter student name:", currentData.studentName || "");
            if (!name) return;
            
            const gender = confirm("Select gender: OK for male, Cancel for female") ? "he" : "she";
            
            const fixedData = {
                studentName: name,
                gender: gender,
                strengths: currentData.strengths || "",
                weaknesses: currentData.weaknesses || "",
                overallAttributes: currentData.overallAttributes || "5"
            };
            
            localStorage.setItem('studentData', JSON.stringify(fixedData));
            alert("Student data has been fixed. Try generating comments now.");
            
            // Reload page to apply changes
            if (confirm("Reload page to apply changes?")) {
                window.location.reload();
            }
        } catch (e) {
            console.error("Error fixing student data:", e);
            alert("Error fixing data: " + e.message);
        }
    }
    
    // Clear all stored data
    function clearAllData() {
        localStorage.clear();
        alert("All data cleared. Page will reload.");
        window.location.reload();
    }
    
    // Export all data to a JSON file
    function exportData() {
        const data = {};
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            data[key] = localStorage.getItem(key);
        }
        
        const dataStr = JSON.stringify(data, null, 2);
        const dataBlob = new Blob([dataStr], {type: 'application/json'});
        const url = URL.createObjectURL(dataBlob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = 'teacher-pet-data.json';
        link.click();
        
        URL.revokeObjectURL(url);
    }
    
    // Import data from JSON file
    function importData() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        
        input.onchange = e => {
            const file = e.target.files[0];
            if (!file) return;
            
            const reader = new FileReader();
            reader.onload = function(event) {
                try {
                    const data = JSON.parse(event.target.result);
                    
                    // Clear existing data first
                    localStorage.clear();
                    
                    // Import all keys
                    Object.keys(data).forEach(key => {
                        localStorage.setItem(key, data[key]);
                    });
                    
                    alert("Data imported successfully. Page will reload.");
                    window.location.reload();
                } catch (e) {
                    console.error("Error importing data:", e);
                    alert("Error importing data: " + e.message);
                }
            };
            
            reader.readAsText(file);
        };
        
        input.click();
    }
})();
