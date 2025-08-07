// Profile page JavaScript

document.addEventListener('DOMContentLoaded', function() {
    // Load existing profile data
    loadProfile();
    
    // Add event listener for form submission
    document.getElementById('healthForm').addEventListener('submit', function(e) {
        e.preventDefault();
        saveProfile();
    });
});

function saveProfile() {
    const formData = {
        name: document.getElementById('name').value,
        age: document.getElementById('age').value,
        weight: document.getElementById('weight').value,
        height: document.getElementById('height').value,
        temperature: document.getElementById('temperature').value,
        gender: document.querySelector('input[name="gender"]:checked')?.value,
        symptoms: document.getElementById('symptoms').value
    };

    // Send data to Flask backend
    fetch('/api/save_profile', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            showMessage(data.message, 'success');
            updateProfileDisplay(formData);
            document.getElementById('profileDisplay').style.display = 'block';
            document.getElementById('healthForm').reset();
        } else {
            showMessage(data.message, 'error');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        showMessage('Error saving profile. Please try again.', 'error');
    });
}

function loadProfile() {
    fetch('/api/get_profile')
    .then(response => response.json())
    .then(data => {
        if (data && Object.keys(data).length > 0) {
            // Populate form with existing data
            document.getElementById('name').value = data.name || '';
            document.getElementById('age').value = data.age || '';
            document.getElementById('weight').value = data.weight || '';
            document.getElementById('height').value = data.height || '';
            document.getElementById('temperature').value = data.temperature || '';
            
            if (data.gender) {
                document.getElementById(data.gender).checked = true;
            }
            
            document.getElementById('symptoms').value = data.symptoms || '';
            
            // Show profile display
            updateProfileDisplay(data);
            document.getElementById('profileDisplay').style.display = 'block';
        }
    })
    .catch(error => {
        console.error('Error loading profile:', error);
    });
}

function updateProfileDisplay(profileData) {
    document.getElementById('displayName').textContent = profileData.name || '';
    document.getElementById('displayAge').textContent = profileData.age || '';
    document.getElementById('displayWeight').textContent = profileData.weight || '';
    document.getElementById('displayHeight').textContent = profileData.height || '';
    document.getElementById('displayTemperature').textContent = profileData.temperature || '';
    document.getElementById('displayGender').textContent = profileData.gender || '';
    document.getElementById('displaySymptoms').textContent = profileData.symptoms || '';
}

function showMessage(message, type) {
    // Remove existing messages
    const existingMessages = document.querySelectorAll('.message');
    existingMessages.forEach(msg => msg.remove());
    
    // Create new message element
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type}`;
    messageDiv.textContent = message;
    
    // Insert message at the top of the container
    const container = document.querySelector('.container');
    container.insertBefore(messageDiv, container.firstChild);
    
    // Remove message after 5 seconds
    setTimeout(() => {
        messageDiv.remove();
    }, 5000);
}