// Appointments page JavaScript

document.addEventListener('DOMContentLoaded', function() {
    loadAppointments();
});

function loadAppointments() {
    const appointmentList = document.getElementById('appointmentList');
    
    fetch('/api/get_appointments')
    .then(response => response.json())
    .then(data => {
        appointmentList.innerHTML = '';
        
        const appointments = data.appointments || [];
        
        if (appointments.length === 0) {
            appointmentList.innerHTML = '<p>No appointments booked yet.</p>';
        } else {
            appointments.forEach(appointment => {
                const appointmentDiv = document.createElement('div');
                appointmentDiv.className = 'appointment-item';
                
                const formattedDate = formatDate(appointment.date);
                
                appointmentDiv.innerHTML = `
                    <p><strong>Doctor:</strong> ${appointment.doctor}</p>
                    <p><strong>Date:</strong> ${formattedDate}</p>
                    <p><strong>Time:</strong> ${appointment.time}</p>
                `;
                
                appointmentList.appendChild(appointmentDiv);
            });
        }
    })
    .catch(error => {
        console.error('Error loading appointments:', error);
        appointmentList.innerHTML = '<p>Error loading appointments. Please try again.</p>';
    });
}

function formatDate(dateString) {
    const date = new Date(dateString);
    const options = { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        weekday: 'long'
    };
    return date.toLocaleDateString('en-US', options);
}