import { useState, useEffect } from 'react';
import API from '../api';

function CustomerPage() {
    const [formData, setFormData] = useState({
        customerId: '',
        firstName: '',
        lastName: '',
        address: '',
        phone: '',
        email: '',
        preferredCommunication: 'Email',
        classBalance: 0
    });

    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState('');
    const [customers, setCustomers] = useState([]);
    const [editId, setEditId] = useState(null);
    const [errors, setErrors] = useState({});

    const fetchCustomers = async () => {
        try {
            const response = await API.get('/api/customers');
            setCustomers(response.data);
        } catch (error) {
            console.error('Error fetching customers:', error);
        }
    };

    useEffect(() => {
        fetchCustomers();
    }, []);

    const validateForm = () => {
        const newErrors = {};

        if (!formData.customerId.trim()) {
            newErrors.customerId = 'Customer ID is required.';
        }

        if (!formData.customerId.startsWith('C')) {
            newErrors.customerId = 'Customer ID must start with "C" (example: C001)';
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

        if (formData.classBalance < 0) {
            newErrors.classBalance = 'Class balance cannot be less than 0 when manually entered.';
        }

        return newErrors;
    };

    const handleChange = (event) => {
        const { name, value } = event.target;

        setFormData((prevData) => ({
            ...prevData,
            [name]: name === 'classBalance' ? Number(value) : value
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
                    `/api/customers/${editId}`,
                    formData
                );
                setMessage(`Customer updated: ${response.data.firstName} ${response.data.lastName}`);
            } else {
                const response = await API.post(
                    '/api/customers',
                    formData
                );
                setMessage(`Customer saved: ${response.data.firstName} ${response.data.lastName}`);
            }

            setMessageType('success');
            fetchCustomers();
            setEditId(null);
            setErrors({});

            setFormData({
                customerId: '',
                firstName: '',
                lastName: '',
                address: '',
                phone: '',
                email: '',
                preferredCommunication: 'Email',
                classBalance: 0
            });
        } catch (error) {
            setMessage(error.response?.data?.error || 'Error saving customer');
            setMessageType('error');
        }
    };

    const handleDelete = async (id) => {
        const confirmed = window.confirm('Are you sure you want to delete this customer?');

        if (!confirmed) {
            return;
        }

        try {
            await API.delete(`/api/customers/${id}`);
            setMessage('Customer deleted successfully');
            setMessageType('success');
            fetchCustomers();
        } catch (error) {
            setMessage(error.response?.data?.error || 'Error deleting customer');
            setMessageType('error');
        }
    };

    const handleEdit = (customer) => {
        setFormData({
            customerId: customer.customerId,
            firstName: customer.firstName,
            lastName: customer.lastName,
            address: customer.address || '',
            phone: customer.phone || '',
            email: customer.email || '',
            preferredCommunication: customer.preferredCommunication || 'Email',
            classBalance: customer.classBalance || 0
        });

        setEditId(customer._id);
        setErrors({});
        setMessage(`Editing customer: ${customer.firstName} ${customer.lastName}`);
        setMessageType('success');
    };

    const isFormIncomplete =
        !formData.customerId.trim() ||
        !formData.firstName.trim() ||
        !formData.lastName.trim();

    return (
        <div>
            <h2>Customer Management</h2>

            <div className="page-container">
                <div className="section-card">
                    <h3>{editId ? 'Edit Customer' : 'Add Customer'}</h3>

                    <form onSubmit={handleSubmit}>
                        <div>
                            <label>Customer ID:</label><br />
                            <input
                                type="text"
                                name="customerId"
                                value={formData.customerId}
                                onChange={handleChange}
                                className={errors.customerId ? 'input-error' : ''}
                            />
                            {errors.customerId && <div className="field-error">{errors.customerId}</div>}
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
                            <label>Address:</label><br />
                            <input
                                type="text"
                                name="address"
                                value={formData.address}
                                onChange={handleChange}
                            />
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

                        <div>
                            <label>Class Balance:</label><br />
                            <input
                                type="number"
                                name="classBalance"
                                value={formData.classBalance}
                                onChange={handleChange}
                                className={errors.classBalance ? 'input-error' : ''}
                            />
                            {errors.classBalance && <div className="field-error">{errors.classBalance}</div>}
                        </div>

                        <button type="submit" disabled={isFormIncomplete}>
                            {editId ? 'Update Customer' : 'Save Customer'}
                        </button>
                    </form>

                    {message && (
                        <div className={messageType === 'error' ? 'error-message' : 'success-message'}>
                            {message}
                        </div>
                    )}
                </div>

                <div className="section-card">
                    <h3>Customer List</h3>

                    <ul className="record-list">
                        {customers.map((customer) => (
                            <li key={customer._id}>
                                {customer.firstName} {customer.lastName} ({customer.customerId}) - Balance: {customer.classBalance}

                                <button onClick={() => handleEdit(customer)} className="inline-button">
                                    Edit
                                </button>

                                <button onClick={() => handleDelete(customer._id)} className="inline-button">
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

export default CustomerPage;