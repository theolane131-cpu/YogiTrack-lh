import { useState, useEffect } from 'react';
import API from '../api';

function InstructorPage() {
    const [formData, setFormData] = useState({
        instructorId: '',
        firstName: '',
        lastName: '',
        phone: '',
        email: '',
        preferredCommunication: 'Email'
    });

    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState('');
    const [instructors, setInstructors] = useState([]);
    const [editId, setEditId] = useState(null);
    const [errors, setErrors] = useState({});

    const fetchInstructors = async () => {
        try {
            const response = await API.get('/api/instructors');
            setInstructors(response.data);
        } catch (error) {
            console.error('Error fetching instructors:', error);
        }
    };

    useEffect(() => {
        fetchInstructors();
    }, []);

    const validateForm = () => {
        const newErrors = {};

        if (!formData.instructorId.trim()) {
            newErrors.instructorId = 'Instructor ID is required.';
        }

        if (!formData.instructorId.startsWith('I')) {
            newErrors.instructorId = 'Instructor ID must start with "I" (example: I001)';
        }

        if (!formData.firstName.trim()) {
            newErrors.firstName = 'First name is required.';
        }

        if (!formData.lastName.trim()) {
            newErrors.lastName = 'Last name is required.';
        }

        if (formData.email && !formData.email.includes('@')) {
            newErrors.email = 'Enter a valid email address.';
        }

        return newErrors;
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

        try {
            if (editId) {
                const response = await API.put(
                    `/api/instructors/${editId}`,
                    formData
                );

                setMessage(`Instructor updated: ${response.data.firstName} ${response.data.lastName}`);
                setMessageType('success');
            } else {
                const response = await API.post(
                    '/api/instructors',
                    formData
                );

                setMessage(`Instructor saved: ${response.data.firstName} ${response.data.lastName}`);
                setMessageType('success');
            }

            fetchInstructors();
            setEditId(null);
            setErrors({});

            setFormData({
                instructorId: '',
                firstName: '',
                lastName: '',
                phone: '',
                email: '',
                preferredCommunication: 'Email'
            });
        } catch (error) {
            setMessage(error.response?.data?.error || 'Error saving instructor');
            setMessageType('error');
        }
    };

    const handleDelete = async (id) => {
        const confirmed = window.confirm('Are you sure you want to delete this instructor?');

        if (!confirmed) {
            return;
        }

        try {
            await API.delete(`/api/instructors/${id}`);
            setMessage('Instructor deleted successfully');
            setMessageType('success');
            fetchInstructors();
        } catch (error) {
            setMessage(error.response?.data?.error || 'Error deleting instructor');
            setMessageType('error');
        }
    };

    const handleEdit = (instructor) => {
        setFormData({
            instructorId: instructor.instructorId,
            firstName: instructor.firstName,
            lastName: instructor.lastName,
            phone: instructor.phone || '',
            email: instructor.email || '',
            preferredCommunication: instructor.preferredCommunication || 'Email'
        });

        setEditId(instructor._id);
        setErrors({});
        setMessage(`Editing instructor: ${instructor.firstName} ${instructor.lastName}`);
        setMessageType('success');
    };

    const isFormIncomplete =
        !formData.instructorId.trim() ||
        !formData.firstName.trim() ||
        !formData.lastName.trim();

    return (
        <div>
            <h2>Instructor Management</h2>

            <div className="page-container">
                <div className="section-card">
                    <h3>{editId ? 'Edit Instructor' : 'Add Instructor'}</h3>

                    <form onSubmit={handleSubmit}>
                        <div>
                            <label>Instructor ID:</label><br />
                            <input
                                type="text"
                                name="instructorId"
                                value={formData.instructorId}
                                onChange={handleChange}
                                className={errors.instructorId ? 'input-error' : ''}
                            />
                            {errors.instructorId && <div className="field-error">{errors.instructorId}</div>}
                        </div>

                        <div>
                            <label>First Name:</label><br />
                            <input
                                type="text"
                                name="firstName"
                                value={formData.firstName}
                                onChange={handleChange}
                                className={errors.firstName ? 'input-error' : ''}
                            />
                            {errors.firstName && <div className="field-error">{errors.firstName}</div>}
                        </div>

                        <div>
                            <label>Last Name:</label><br />
                            <input
                                type="text"
                                name="lastName"
                                value={formData.lastName}
                                onChange={handleChange}
                                className={errors.lastName ? 'input-error' : ''}
                            />
                            {errors.lastName && <div className="field-error">{errors.lastName}</div>}
                        </div>

                        <div>
                            <label>Phone:</label><br />
                            <input
                                type="text"
                                name="phone"
                                value={formData.phone}
                                onChange={handleChange}
                            />
                        </div>

                        <div>
                            <label>Email:</label><br />
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                className={errors.email ? 'input-error' : ''}
                            />
                            {errors.email && <div className="field-error">{errors.email}</div>}
                        </div>

                        <div>
                            <label>Preferred Communication:</label><br />
                            <select
                                name="preferredCommunication"
                                value={formData.preferredCommunication}
                                onChange={handleChange}
                            >
                                <option value="Email">Email</option>
                                <option value="Phone">Phone</option>
                                <option value="Text">Text</option>
                            </select>
                        </div>

                        <button type="submit" disabled={isFormIncomplete}>
                            {editId ? 'Update Instructor' : 'Save Instructor'}
                        </button>
                    </form>

                    {message && (
                        <div className={messageType === 'error' ? 'error-message' : 'success-message'}>
                            {message}
                        </div>
                    )}
                </div>

                <div className="section-card">
                    <h3>Instructor List</h3>

                    <ul className="record-list">
                        {instructors.map((inst) => (
                            <li key={inst._id}>
                                {inst.firstName} {inst.lastName} ({inst.instructorId})

                                <button
                                    onClick={() => handleEdit(inst)}
                                    className="inline-button"
                                >
                                    Edit
                                </button>

                                <button
                                    onClick={() => handleDelete(inst._id)}
                                    className="inline-button"
                                >
                                    Delete
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
}

export default InstructorPage;