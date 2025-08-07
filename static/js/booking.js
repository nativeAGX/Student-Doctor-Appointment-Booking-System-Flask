// Booking page JavaScript

document.addEventListener('DOMContentLoaded', function() {
    // Set minimum date to today
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('appointmentDate').setAttribute('min', today);
    
    // Add event listeners
    document.getElementById('doctor').addEventListener('change', updateTimeSlots);
    document.getElementById('appointmentDate').addEventListener('change', updateTimeSlots);
});

function updateTimeSlots() {
    const doctorSelect = document.getElementById('doctor');
    const dateInput = document.getElementById('appointmentDate');
    const timeSlotsContainer = document.getElementById('timeSlots');

    const selectedDoctor = doctorSelect.value;
    const selectedDate = dateInput.value;

    // Clear previous time slots
    timeSlotsContainer.innerHTML = '';

    if (selectedDoctor && selectedDate) {
        // Fetch availability from backend
        fetch(`/api/get_availability?doctor=${encodeURIComponent(selectedDoctor)}&date=${selectedDate}`)
        .then(response => response.json())
        .then(data => {
            const slots = data.slots || [];
            
            if (slots.length > 0) {
                slots.forEach(slot => {
                    const row = document.createElement('tr');
                    row.innerHTML = `
                        <td>${slot}</td>
                        <td>
                            <button type="button" onclick="bookAppointment('${selectedDoctor}', '${selectedDate}', '${slot}')">
                                Book
                            </button>
                        </td>
                    `;
                    timeSlotsContainer.appendChild(row);
                });
            } else {
                const row = document.createElement('tr');
                row.innerHTML = '<td colspan="2">No availability for this date</td>';
                timeSlotsContainer.appendChild(row);
            }
        })
        .catch(error => {
            console.error('Error fetching availability:', error);
            const row = document.createElement('tr');
            row.innerHTML = '<td colspan="2">Error loading availability</td>';
            timeSlotsContainer.appendChild(row);
        });
    }
}

function bookAppointment(doctor, date, time) {
    const appointmentData = {
        doctor: doctor,
        date: date,
        time: time
    };

    fetch('/api/book_appointment', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(appointmentData)
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            showMessage(data.message, 'success');
            // Refresh time slots to remove the booked slot
            updateTimeSlots();
        } else {
            showMessage(data.message, 'error');
        }
    })
    .catch(error => {
        console.error('Error booking appointment:', error);
        showMessage('Error booking appointment. Please try again.', 'error');
    });
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