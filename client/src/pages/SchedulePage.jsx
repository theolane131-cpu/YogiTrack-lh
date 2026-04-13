import { useEffect, useMemo, useState } from 'react';
import API from '../api';

function SchedulePage() {
    const [classes, setClasses] = useState([]);
    const [selectedDay, setSelectedDay] = useState('All');
    const [message, setMessage] = useState('');
    const [instructors, setInstructors] = useState([]);

    useEffect(() => {
        fetchSchedule();
        fetchInstructors();
    }, []);

    const fetchSchedule = async () => {
        try {
            const response = await API.get('/api/classes');
            setClasses(response.data);
            setMessage('');
        } catch (error) {
            setMessage('Error loading class schedule.');
        }
    };

    const fetchInstructors = async () => {
        try {
            const response = await API.get('/api/instructors');
            setInstructors(response.data);
        } catch (error) {
            console.error('Error loading instructors:', error);
        }
    };

    const getInstructorName = (instructorId) => {
        const match = instructors.find(
            (instructor) => instructor.instructorId === instructorId
        );

        return match
            ? `${match.firstName} ${match.lastName}`
            : instructorId;
    };

    const sortedClasses = useMemo(() => {
        const dayOrder = [
            'Sunday',
            'Monday',
            'Tuesday',
            'Wednesday',
            'Thursday',
            'Friday',
            'Saturday'
        ];

        const filtered =
            selectedDay === 'All'
                ? classes
                : classes.filter((item) => item.day === selectedDay);

        return [...filtered].sort((a, b) => {
            const dayComparison =
                dayOrder.indexOf(a.day) - dayOrder.indexOf(b.day);

            if (dayComparison !== 0) {
                return dayComparison;
            }

            return a.time.localeCompare(b.time);
        });
    }, [classes, selectedDay]);

    return (
        <div>
            <h2>Class Schedule</h2>
            <p className="helper-text">
                View the current class schedule by day, time, instructor, and class type.
            </p>

            <div className="section-card" style={{ marginBottom: '20px' }}>
                <label>Filter by Day:</label>
                <select
                    value={selectedDay}
                    onChange={(event) => setSelectedDay(event.target.value)}
                    style={{ maxWidth: '220px', marginTop: '8px' }}
                >
                    <option value="All">All Days</option>
                    <option value="Sunday">Sunday</option>
                    <option value="Monday">Monday</option>
                    <option value="Tuesday">Tuesday</option>
                    <option value="Wednesday">Wednesday</option>
                    <option value="Thursday">Thursday</option>
                    <option value="Friday">Friday</option>
                    <option value="Saturday">Saturday</option>
                </select>
            </div>

            {message && <div className="error-message">{message}</div>}

            <div className="section-card">
                <h3>Current Schedule</h3>

                {sortedClasses.length === 0 ? (
                    <p>No classes found for the selected day.</p>
                ) : (
                    <table className="report-table">
                        <thead>
                            <tr>
                                <th>Class ID</th>
                                <th>Day</th>
                                <th>Time</th>
                                <th>Instructor</th>
                                <th>Class Type</th>
                                <th>Pay Rate</th>
                            </tr>
                        </thead>
                        <tbody>
                            {sortedClasses.map((item) => (
                                <tr key={item._id}>
                                    <td>{item.classId}</td>
                                    <td>{item.day}</td>
                                    <td>{item.time}</td>
                                    <td>{getInstructorName(item.instructorId)}</td>
                                    <td>{item.classType}</td>
                                    <td>${item.payRate}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}

export default SchedulePage;