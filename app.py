from flask import Flask, render_template, request, jsonify, session, redirect, url_for
from datetime import datetime, timedelta
import json
import os

app = Flask(__name__)
app.secret_key = 'zeus_healing_ledger_secret_key_2024'

# In-memory storage (in production, use a database)
appointments_data = []
profiles_data = {}

# Sample doctor availability data
AVAILABILITY = {
    "Dr. Smith (MD)": {
        "2024-12-20": ["9:00 AM", "10:00 AM", "11:00 AM"],
        "2024-12-21": ["1:00 PM", "2:00 PM", "3:00 PM"],
        "2024-12-22": ["9:00 AM", "11:00 AM", "2:00 PM"],
    },
    "Dr. Johnson (MS)": {
        "2024-12-20": ["9:30 AM", "10:30 AM", "11:30 AM"],
        "2024-12-21": ["1:30 PM", "2:30 PM", "3:30 PM"],
        "2024-12-22": ["10:00 AM", "1:00 PM", "3:00 PM"],
    },
    "Dr. Brown (ENT Specialist)": {
        "2024-12-20": ["8:00 AM", "9:00 AM", "10:00 AM"],
        "2024-12-21": ["2:00 PM", "3:00 PM", "4:00 PM"],
        "2024-12-22": ["9:00 AM", "11:00 AM", "1:00 PM"],
    },
    "Dr. Mark (Cardiac Surgeon)": {
        "2024-12-20": ["8:30 AM", "9:30 AM", "10:30 AM"],
        "2024-12-21": ["1:00 PM", "2:30 PM", "4:00 PM"],
        "2024-12-22": ["8:00 AM", "10:00 AM", "2:00 PM"],
    },
    "Dr. Madison (Gynecologist)": {
        "2024-12-20": ["9:00 AM", "11:00 AM", "2:00 PM"],
        "2024-12-21": ["10:00 AM", "1:00 PM", "3:00 PM"],
        "2024-12-22": ["9:30 AM", "11:30 AM", "2:30 PM"],
    },
    "Dr. Haley (Orthopedic)": {
        "2024-12-20": ["8:00 AM", "10:00 AM", "1:00 PM"],
        "2024-12-21": ["9:00 AM", "2:00 PM", "4:00 PM"],
        "2024-12-22": ["8:30 AM", "10:30 AM", "1:30 PM"],
    },
    "Dr. Stark (Neuro Surgeon)": {
        "2024-12-20": ["7:00 AM", "8:00 AM", "9:00 AM"],
        "2024-12-21": ["1:00 PM", "3:00 PM", "4:00 PM"],
        "2024-12-22": ["7:30 AM", "9:30 AM", "2:00 PM"],
    },
    "Dr. Tom (Pediatrician)": {
        "2024-12-20": ["9:00 AM", "10:00 AM", "11:00 AM"],
        "2024-12-21": ["2:00 PM", "3:00 PM", "4:00 PM"],
        "2024-12-22": ["9:00 AM", "1:00 PM", "3:00 PM"],
    },
    "Dr. Steve (Radiologist)": {
        "2024-12-20": ["8:00 AM", "9:00 AM", "11:00 AM"],
        "2024-12-21": ["1:30 PM", "2:30 PM", "3:30 PM"],
        "2024-12-22": ["8:30 AM", "10:00 AM", "2:30 PM"],
    }
}

DOCTORS = [
    "Dr. Smith (MD)",
    "Dr. Johnson (MS)", 
    "Dr. Brown (ENT Specialist)",
    "Dr. Mark (Cardiac Surgeon)",
    "Dr. Madison (Gynecologist)",
    "Dr. Haley (Orthopedic)",
    "Dr. Stark (Neuro Surgeon)",
    "Dr. Tom (Pediatrician)",
    "Dr. Steve (Radiologist)"
]

@app.route('/')
def index():
    return redirect(url_for('profile'))

@app.route('/profile')
def profile():
    return render_template('profile.html')

@app.route('/booking')
def booking():
    return render_template('booking.html', doctors=DOCTORS)

@app.route('/appointments')
def appointments():
    # Get appointments for current session
    session_id = session.get('session_id', 'default')
    user_appointments = [apt for apt in appointments_data if apt.get('session_id') == session_id]
    return render_template('appointments.html', appointments=user_appointments)

@app.route('/api/save_profile', methods=['POST'])
def save_profile():
    try:
        data = request.get_json()
        session_id = session.get('session_id')
        if not session_id:
            session_id = f"user_{len(profiles_data) + 1}"
            session['session_id'] = session_id
        
        profiles_data[session_id] = {
            'name': data.get('name'),
            'age': data.get('age'),
            'weight': data.get('weight'),
            'height': data.get('height'),
            'temperature': data.get('temperature'),
            'gender': data.get('gender'),
            'symptoms': data.get('symptoms')
        }
        
        return jsonify({'success': True, 'message': 'Profile saved successfully'})
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 400

@app.route('/api/get_profile')
def get_profile():
    session_id = session.get('session_id', 'default')
    profile = profiles_data.get(session_id, {})
    return jsonify(profile)

@app.route('/api/get_availability')
def get_availability():
    doctor = request.args.get('doctor')
    date = request.args.get('date')
    
    if doctor and date:
        slots = AVAILABILITY.get(doctor, {}).get(date, [])
        # Filter out already booked slots
        session_id = session.get('session_id', 'default')
        booked_slots = [apt['time'] for apt in appointments_data 
                       if apt['doctor'] == doctor and apt['date'] == date and apt.get('session_id') == session_id]
        available_slots = [slot for slot in slots if slot not in booked_slots]
        return jsonify({'slots': available_slots})
    
    return jsonify({'slots': []})

@app.route('/api/book_appointment', methods=['POST'])
def book_appointment():
    try:
        data = request.get_json()
        session_id = session.get('session_id')
        if not session_id:
            session_id = f"user_{len(profiles_data) + 1}"
            session['session_id'] = session_id
        
        appointment = {
            'session_id': session_id,
            'doctor': data.get('doctor'),
            'date': data.get('date'),
            'time': data.get('time'),
            'booked_at': datetime.now().isoformat()
        }
        
        appointments_data.append(appointment)
        
        return jsonify({'success': True, 'message': f'Appointment booked with {appointment["doctor"]} on {appointment["date"]} at {appointment["time"]}'})
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 400

@app.route('/api/get_appointments')
def get_appointments():
    session_id = session.get('session_id', 'default')
    user_appointments = [apt for apt in appointments_data if apt.get('session_id') == session_id]
    return jsonify({'appointments': user_appointments})

if __name__ == '__main__':
    app.run(debug=True)