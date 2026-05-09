import { useState, useEffect } from 'react';
import API from '../api';

function ClassPage() {
    const [formData, setFormData] = useState({
        classId: '',
        instructorId: '',
        day: 'Monday',
        time: '',
        classType: 'General',
        payRate: ''
    });

    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState('');
    const [classes, setClasses] = useState([]);
    const [instructors, setInstructors] = useState([]);
    const [editId, setEditId] = useState(null);
    const [errors, setErrors] = useState({});

    const timeOptions = [
        '06:00 AM',
        '07:00 AM',
        '08:00 AM',
        '09:00 AM',
        '10:00 AM',
        '11:00 AM',
        '12:00 PM',
        '01:00 PM',
        '02:00 PM',
        '03:00 PM',
        '04:00 PM',
        '05:00 PM',
        '06:00 PM',
        '07:00 PM',
        '08:00 PM'
    ];

    const normalizeTime = (time) => {
        if (!time) return '';

        let cleaned = time.toString().trim().toUpperCase();
        cleaned = cleaned.replace(/\s+/g, '');

        const match = cleaned.match(/^(\d{1,2})(?::?(\d{2}))?(AM|PM)$/);

        if (!match) {
            return time;
        }

        let hour = match[1];
        const minutes = match[2] || '00';
        const period = match[3];

        hour = hour.padStart(2, '0');

        return `${hour}:${minutes} ${period}`;
    };

    const fetchClasses = async () => {
        try {
            const response = await API.get('/api/classes');
            setClasses(response.data);
        } catch (error) {
            console.error('Error fetching classes:', error);
        }
    };

    const fetchInstructors = async () => {
        try {
            const response = await API.get('/api/instructors');
            setInstructors(response.data);
        } catch (error) {
            console.error('Error fetching instructors:', error);
        }
    };

    useEffect(() => {
        fetchClasses();
        fetchInstructors();
    }, []);

    const validateForm = () => {
        const newErrors = {};

        if (!formData.classId.trim()) {
            newErrors.classId = 'Class ID is required.';
        } else if (!formData.classId.startsWith('CL')) {
            newErrors.classId = 'Class ID must start with "CL" (example: CL001).';
        }

        if (!formData.instructorId) {
            newErrors.instructorId = 'Please select an instructor.';
        }

        if (!formData.time) {
            newErrors.time = 'Please select a class time.';
        }

        if (formData.payRate === '' || Number(formData.payRate) < 0) {
            newErrors.payRate = 'Pay rate must be 0 or greater.';
        }

        return newErrors;
    };

    const checkFrontendScheduleWarning = () => {
        const matchingClass = classes.find((yogaClass) => {
            const sameRecord = editId && yogaClass._id === editId;

            return (
                !sameRecord &&
                yogaClass.day === formData.day &&
                normalizeTime(yogaClass.time) === normalizeTime(formData.time)
            );
        });

        if (matchingClass) {
            return `Warning: ${matchingClass.classId} is already scheduled on ${formData.day} at ${normalizeTime(formData.time)}.`;
        }

        return '';
    };

    const handleChange = (event) => {
        const { name, value } = event.target;

        setFormData((prevData) => ({
            ...prevData,
            [name]: value
        }));

        setErrors((prevErrors) => ({
            ...prevErrors,
            [name]: ''
        }));

        if (messageType === 'error') {
            setMessage('');
            setMessageType('');
        }
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        const newErrors = validateForm();
        setErrors(newErrors);

        if (Object.keys(newErrors).length > 0) {
            setMessage('Please fix the highlighted fields before submitting.');
            setMessageType('error');
            return;
        }

        const frontendWarning = checkFrontendScheduleWarning();

        if (frontendWarning) {
            setMessage(frontendWarning);
            setMessageType('error');
            return;
        }

        try {
            const payload = {
                ...formData,
                time: normalizeTime(formData.time),
                payRate: Number(formData.payRate)
            };

            if (editId) {
                const response = await API.put(`/api/classes/${editId}`, payload);
                setMessage(`Class updated: ${response.data.classId}`);
            } else {
                const response = await API.post('/api/classes', payload);
                setMessage(`Class saved: ${response.data.classId}`);
            }

            setMessageType('success');
            fetchClasses();
            setEditId(null);
            setErrors({});

            setFormData({
                classId: '',
                instructorId: '',
                day: 'Monday',
                time: '',
                classType: 'General',
                payRate: ''
            });
        } catch (error) {
            setMessage(error.response?.data?.error || 'Error saving class');
            setMessageType('error');
        }
    };

    const handleDelete = async (id) => {
        const confirmed = window.confirm('Are you sure you want to delete this class?');

        if (!confirmed) {
            return;
        }

        try {
            await API.delete(`/api/classes/${id}`);
            setMessage('Class deleted successfully');
            setMessageType('success');
            fetchClasses();
        } catch (error) {
            setMessage(error.response?.data?.error || 'Error deleting class');
            setMessageType('error');
        }
    };

    const handleEdit = (yogaClass) => {
        setFormData({
            classId: yogaClass.classId,
            instructorId: yogaClass.instructorId,
            day: yogaClass.day,
            time: normalizeTime(yogaClass.time),
            classType: yogaClass.classType,
            payRate: yogaClass.payRate
        });

        setEditId(yogaClass._id);
        setErrors({});
        setMessage(`Editing class: ${yogaClass.classId}`);
        setMessageType('success');
    };

    const handleCancelEdit = () => {
        setEditId(null);
        setErrors({});
        setMessage('');
        setMessageType('');

        setFormData({
            classId: '',
            instructorId: '',
            day: 'Monday',
            time: '',
            classType: 'General',
            payRate: ''
        });
    };

    const getInstructorName = (instructorId) => {
        const instructor = instructors.find((inst) => inst.instructorId === instructorId);

        if (!instructor) {
            return instructorId;
        }

        return `${instructor.firstName} ${instructor.lastName}`;
    };

    const isFormIncomplete =
        !formData.classId.trim() ||
        !formData.instructorId ||
        !formData.time ||
        formData.payRate === '';

    return (
        <div>
            <h2>Class Management</h2>

            <div className="page-container">
                <div className="section-card">
                    <h3>{editId ? 'Edit Class' : 'Add Class'}</h3>
                    <p className="helper-text">
                        Schedule classes by assigning an instructor, selecting a day, and choosing a standard time slot.
                    </p>

                    <form onSubmit={handleSubmit}>
                        <div>
                            <label>Class ID:</label><br />
                            <input
                                type="text"
                                name="classId"
                                value={formData.classId}
                                onChange={handleChange}
                                className={errors.classId ? 'input-error' : ''}
                                placeholder="CL001"
                            />
                            {errors.classId && <div className="field-error">{errors.classId}</div>}
                        </div>

                        <div>
                            <label>Instructor:</label><br />
                            <select
                                name="instructorId"
                                value={formData.instructorId}
                                onChange={handleChange}
                                className={errors.instructorId ? 'input-error' : ''}
                            >
                                <option value="">Select Instructor</option>
                                {instructors.map((inst) => (
                                    <option key={inst._id} value={inst.instructorId}>
                                        {inst.firstName} {inst.lastName} ({inst.instructorId})
                                    </option>
                                ))}
                            </select>
                            {errors.instructorId && <div className="field-error">{errors.instructorId}</div>}
                        </div>

                        <div>
                            <label>Day:</label><br />
                            <select
                                name="day"
                                value={formData.day}
                                onChange={handleChange}
                            >
                                <option value="Sunday">Sunday</option>
                                <option value="Monday">Monday</option>
                                <option value="Tuesday">Tuesday</option>
                                <option value="Wednesday">Wednesday</option>
                                <option value="Thursday">Thursday</option>
                                <option value="Friday">Friday</option>
                                <option value="Saturday">Saturday</option>
                            </select>
                        </div>

                        <div>
                            <label>Time:</label><br />
                            <select
                                name="time"
                                value={formData.time}
                                onChange={handleChange}
                                className={errors.time ? 'input-error' : ''}
                            >
                                <option value="">Select Time</option>
                                {timeOptions.map((time) => (
                                    <option key={time} value={time}>
                                        {time}
                                    </option>
                                ))}
                            </select>
                            {errors.time && <div className="field-error">{errors.time}</div>}
                        </div>

                        <div>
                            <label>Class Type:</label><br />
                            <select
                                name="classType"
                                value={formData.classType}
                                onChange={handleChange}
                            >
                                <option value="General">General</option>
                                <option value="Special">Special</option>
                            </select>
                        </div>

                        <div>
                            <label>Pay Rate:</label><br />
                            <input
                                type="number"
                                name="payRate"
                                value={formData.payRate}
                                onChange={handleChange}
                                className={errors.payRate ? 'input-error' : ''}
                            />
                            {errors.payRate && <div className="field-error">{errors.payRate}</div>}
                        </div>

                        <button type="submit" disabled={isFormIncomplete}>
                            {editId ? 'Update Class' : 'Save Class'}
                        </button>

                        {editId && (
                            <button
                                type="button"
                                onClick={handleCancelEdit}
                                style={{ marginLeft: '10px' }}
                            >
                                Cancel Edit
                            </button>
                        )}
                    </form>

                    {message && (
                        <div className={messageType === 'error' ? 'error-message' : 'success-message'}>
                            {message}
                        </div>
                    )}
                </div>

                <div className="section-card">
                    <h3>Class List</h3>
                    <p className="helper-text">
                        Existing classes are listed below. The system prevents duplicate day/time scheduling conflicts.
                    </p>

                    {classes.length === 0 ? (
                        <p>No classes found.</p>
                    ) : (
                        <ul className="record-list">
                            {classes.map((yogaClass) => (
                                <li key={yogaClass._id}>
                                    {yogaClass.classId} - {yogaClass.day} at {normalizeTime(yogaClass.time)} - {yogaClass.classType} - Instructor: {getInstructorName(yogaClass.instructorId)}

                                    <button onClick={() => handleEdit(yogaClass)} className="inline-button">
                                        Edit
                                    </button>

                                    <button onClick={() => handleDelete(yogaClass._id)} className="inline-button">
                                        Delete
                                    </button>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>
        </div>
    );
}

export default ClassPage;