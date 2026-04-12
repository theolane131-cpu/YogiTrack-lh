import { useState, useEffect } from 'react';
import API from '../api';

function PackagePage() {
    const [formData, setFormData] = useState({
        packageId: '',
        packageName: '',
        packageCategory: 'General',
        numberOfClasses: '1',
        classType: 'General',
        startDate: '',
        endDate: '',
        price: ''
    });

    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState('');
    const [packages, setPackages] = useState([]);
    const [editId, setEditId] = useState(null);
    const [errors, setErrors] = useState({});

    const fetchPackages = async () => {
        try {
            const response = await API.get('/api/packages');
            setPackages(response.data);
        } catch (error) {
            console.error('Error fetching packages:', error);
        }
    };

    useEffect(() => {
        fetchPackages();
    }, []);

    const validateForm = () => {
        const newErrors = {};

        if (!formData.packageId.trim()) {
            newErrors.packageId = 'Package ID is required.';
        }

        if (!formData.packageId.startsWith('P')) {
            newErrors.packageId = 'Package ID must start with "P" (example: P001)';
        }

        if (!formData.packageName.trim()) {
            newErrors.packageName = 'Package name is required.';
        }

        if (!formData.startDate) {
            newErrors.startDate = 'Start date is required.';
        }

        if (!formData.endDate) {
            newErrors.endDate = 'End date is required.';
        }

        if (formData.startDate && formData.endDate && formData.endDate < formData.startDate) {
            newErrors.endDate = 'End date cannot be earlier than start date.';
        }

        if (formData.price === '' || Number(formData.price) < 0) {
            newErrors.price = 'Price must be 0 or greater.';
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
            const payload = {
                ...formData,
                price: Number(formData.price)
            };

            if (editId) {
                const response = await API.put(
                    `/api/packages/${editId}`,
                    payload
                );
                setMessage(`Package updated: ${response.data.packageName}`);
            } else {
                const response = await API.post(
                    '/api/packages',
                    payload
                );
                setMessage(`Package saved: ${response.data.packageName}`);
            }

            setMessageType('success');
            fetchPackages();
            setEditId(null);
            setErrors({});

            setFormData({
                packageId: '',
                packageName: '',
                packageCategory: 'General',
                numberOfClasses: '1',
                classType: 'General',
                startDate: '',
                endDate: '',
                price: ''
            });
        } catch (error) {
            setMessage(error.response?.data?.error || 'Error saving package');
            setMessageType('error');
        }
    };

    const handleDelete = async (id) => {
        const confirmed = window.confirm('Are you sure you want to delete this package?');

        if (!confirmed) {
            return;
        }

        try {
            await API.delete(`/api/packages/${id}`);
            setMessage('Package deleted successfully');
            setMessageType('success');
            fetchPackages();
        } catch (error) {
            setMessage(error.response?.data?.error || 'Error deleting package');
            setMessageType('error');
        }
    };

    const handleEdit = (pkg) => {
        setFormData({
            packageId: pkg.packageId,
            packageName: pkg.packageName,
            packageCategory: pkg.packageCategory,
            numberOfClasses: pkg.numberOfClasses,
            classType: pkg.classType,
            startDate: pkg.startDate ? pkg.startDate.substring(0, 10) : '',
            endDate: pkg.endDate ? pkg.endDate.substring(0, 10) : '',
            price: pkg.price
        });

        setEditId(pkg._id);
        setErrors({});
        setMessage(`Editing package: ${pkg.packageName}`);
        setMessageType('success');
    };

    const isFormIncomplete =
        !formData.packageId.trim() ||
        !formData.packageName.trim() ||
        !formData.startDate ||
        !formData.endDate ||
        formData.price === '';

    return (
        <div>
            <h2>Package Management</h2>

            <div className="page-container">
                <div className="section-card">
                    <h3>{editId ? 'Edit Package' : 'Add Package'}</h3>

                    <form onSubmit={handleSubmit}>
                        <div>
                            <label>Package ID:</label><br />
                            <input
                                type="text"
                                name="packageId"
                                value={formData.packageId}
                                onChange={handleChange}
                                className={errors.packageId ? 'input-error' : ''}
                            />
                            {errors.packageId && <div className="field-error">{errors.packageId}</div>}
                        </div>

                        <div>
                            <label>Package Name:</label><br />
                            <input
                                type="text"
                                name="packageName"
                                value={formData.packageName}
                                onChange={handleChange}
                                className={errors.packageName ? 'input-error' : ''}
                            />
                            {errors.packageName && <div className="field-error">{errors.packageName}</div>}
                        </div>

                        <div>
                            <label>Package Category:</label><br />
                            <select
                                name="packageCategory"
                                value={formData.packageCategory}
                                onChange={handleChange}
                            >
                                <option value="General">General</option>
                                <option value="Senior">Senior</option>
                            </select>
                        </div>

                        <div>
                            <label>Number of Classes:</label><br />
                            <select
                                name="numberOfClasses"
                                value={formData.numberOfClasses}
                                onChange={handleChange}
                            >
                                <option value="1">1</option>
                                <option value="4">4</option>
                                <option value="10">10</option>
                                <option value="Unlimited">Unlimited</option>
                            </select>
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
                            <label>Start Date:</label><br />
                            <input
                                type="date"
                                name="startDate"
                                value={formData.startDate}
                                onChange={handleChange}
                                className={errors.startDate ? 'input-error' : ''}
                            />
                            {errors.startDate && <div className="field-error">{errors.startDate}</div>}
                        </div>

                        <div>
                            <label>End Date:</label><br />
                            <input
                                type="date"
                                name="endDate"
                                value={formData.endDate}
                                onChange={handleChange}
                                className={errors.endDate ? 'input-error' : ''}
                            />
                            {errors.endDate && <div className="field-error">{errors.endDate}</div>}
                        </div>

                        <div>
                            <label>Price:</label><br />
                            <input
                                type="number"
                                name="price"
                                value={formData.price}
                                onChange={handleChange}
                                className={errors.price ? 'input-error' : ''}
                            />
                            {errors.price && <div className="field-error">{errors.price}</div>}
                        </div>

                        <button type="submit" disabled={isFormIncomplete}>
                            {editId ? 'Update Package' : 'Save Package'}
                        </button>
                    </form>

                    {message && (
                        <div className={messageType === 'error' ? 'error-message' : 'success-message'}>
                            {message}
                        </div>
                    )}
                </div>

                <div className="section-card">
                    <h3>Package List</h3>

                    <ul className="record-list">
                        {packages.map((pkg) => (
                            <li key={pkg._id}>
                                {pkg.packageName} ({pkg.packageId}) - {pkg.packageCategory} - {pkg.numberOfClasses} classes - ${pkg.price}

                                <button onClick={() => handleEdit(pkg)} className="inline-button">
                                    Edit
                                </button>

                                <button onClick={() => handleDelete(pkg._id)} className="inline-button">
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

export default PackagePage;