import { useState, useEffect } from 'react';
import API from '../api';

function AttendancePage() {
    const [formData, setFormData] = useState({
        attendanceId: '',
        classId: '',
        instructorId: '',
        attendanceDate: '',
        customerIds: []
    });

    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState('');
    const [attendanceRecords, setAttendanceRecords] = useState([]);
    const [classes, setClasses] = useState([]);
    const [customers, setCustomers] = useState([]);
    const [packages, setPackages] = useState([]);
    const [customerStatusData, setCustomerStatusData] = useState([]);
    const [errors, setErrors] = useState({});
    const [selectedClassDetails, setSelectedClassDetails] = useState(null);

    const fetchAttendance = async () => {
        try {
            const response = await API.get('/api/attendance');
            setAttendanceRecords(response.data);
        } catch (error) {
            console.error('Error fetching attendance:', error);
        }
    };

    const fetchClasses = async () => {
        try {
            const response = await API.get('/api/classes');
            setClasses(response.data);
        } catch (error) {
            console.error('Error fetching classes:', error);
        }
    };

    const fetchCustomers = async () => {
        try {
            const response = await API.get('/api/customers');
            setCustomers(response.data);
        } catch (error) {
            console.error('Error fetching customers:', error);
        }
    };

    const fetchPackages = async () => {
        try {
            const response = await API.get('/api/packages');
            setPackages(response.data);
        } catch (error) {
            console.error('Error fetching packages:', error);
        }
    };

    const fetchCustomerStatus = async () => {
        try {
            const response = await API.get('/api/reports/customer-status');
            setCustomerStatusData(response.data);
        } catch (error) {
            console.error('Error fetching customer status:', error);
        }
    };

    useEffect(() => {
        fetchAttendance();
        fetchClasses();
        fetchCustomers();
        fetchPackages();
        fetchCustomerStatus();
    }, []);

    const validateForm = () => {
        const newErrors = {};

        if (!formData.attendanceId.trim()) {
            newErrors.attendanceId = 'Attendance ID is required.';
        }

        if (!formData.attendanceId.startsWith('A')) {
            newErrors.attendanceId = 'Attendance ID must start with "A" (example: A001)';
        }

        if (!formData.classId) {
            newErrors.classId = 'Please select a class.';
        }

        if (!formData.attendanceDate) {
            newErrors.attendanceDate = 'Attendance date is required.';
        }

        if (formData.customerIds.length === 0) {
            newErrors.customerIds = 'Please select at least one customer.';
        }

        return newErrors;
    };

    const handleChange = (event) => {
        const { name, value } = event.target;

        if (name === 'classId') {
            const selectedClass = classes.find((cls) => cls.classId === value);
            setSelectedClassDetails(selectedClass || null);

            setFormData((prevData) => ({
                ...prevData,
                classId: value,
                instructorId: selectedClass ? selectedClass.instructorId : ''
            }));

            setErrors((prevErrors) => ({
                ...prevErrors,
                classId: ''
            }));
        } else {
            setFormData((prevData) => ({
                ...prevData,
                [name]: value
            }));

            setErrors((prevErrors) => ({
                ...prevErrors,
                [name]: ''
            }));
        }
    };

    const handleCustomerSelection = (customerId) => {
        setFormData((prevData) => {
            const alreadySelected = prevData.customerIds.includes(customerId);

            const updatedCustomerIds = alreadySelected
                ? prevData.customerIds.filter((id) => id !== customerId)
                : [...prevData.customerIds, customerId];

            return {
                ...prevData,
                customerIds: updatedCustomerIds
            };
        });

        setErrors((prevErrors) => ({
            ...prevErrors,
            customerIds: ''
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
            const response = await API.post(
                '/api/attendance',
                formData
            );

            const updatedBalances = response.data.updatedCustomers
                .map((customer) => `${customer.customerId}: ${customer.newBalance}`)
                .join(', ');

            setMessage(
                `${response.data.message} | Updated balances: ${updatedBalances}`
            );
            setMessageType('success');

            fetchAttendance();
            fetchCustomers();
            fetchCustomerStatus();
            setErrors({});
            setSelectedClassDetails(null);

            setFormData({
                attendanceId: '',
                classId: '',
                instructorId: '',
                attendanceDate: '',
                customerIds: []
            });
        } catch (error) {
            setMessage(error.response?.data?.error || 'Error recording attendance');
            setMessageType('error');
        }
    };

    const getWeekdayFromDateTime = (dateTimeString) => {
        if (!dateTimeString) return '';
        const date = new Date(dateTimeString);
        return date.toLocaleDateString('en-US', { weekday: 'long' });
    };

    const selectedAttendanceDay = getWeekdayFromDateTime(formData.attendanceDate);

    const hasDateMismatch =
        selectedClassDetails &&
        formData.attendanceDate &&
        selectedAttendanceDay !== selectedClassDetails.day;

    const getCustomerPackageWarnings = (customer) => {
        if (!selectedClassDetails) return [];

        const statusRecord = customerStatusData.find(
            (item) => item.customerId === customer.customerId
        );

        if (!statusRecord || !statusRecord.packages || statusRecord.packages.length === 0) {
            return ['No package found for this customer.'];
        }

        const referenceDate = formData.attendanceDate
            ? new Date(formData.attendanceDate)
            : new Date();

        const activePackages = statusRecord.packages.filter((pkg) => {
            const start = new Date(pkg.validityStartDate);
            const end = new Date(pkg.validityEndDate);
            return referenceDate >= start && referenceDate <= end;
        });

        if (activePackages.length === 0) {
            return ['No active package for the selected attendance date.'];
        }

        const activePackageDetails = activePackages
            .map((pkg) => packages.find((p) => p.packageId === pkg.packageId))
            .filter(Boolean);

        const requiredClassType = selectedClassDetails.classType;
        const hasMatchingPackage = activePackageDetails.some(
            (pkg) => pkg.classType === requiredClassType
        );

        if (!hasMatchingPackage) {
            return [`No active ${requiredClassType} package matches this class.`];
        }

        return [];
    };

    const isFormIncomplete =
        !formData.attendanceId.trim() ||
        !formData.classId ||
        !formData.attendanceDate ||
        formData.customerIds.length === 0;

    return (
        <div>
            <h2>Attendance Management</h2>

            <div className="page-container">
                <div className="section-card">
                    <h3>Record Attendance</h3>
                    <p className="helper-text">
                        Select a scheduled class, verify the instructor, and check in the customers who attended.
                    </p>

                    <form onSubmit={handleSubmit}>
                        <div>
                            <label>Attendance ID:</label><br />
                            <input
                                type="text"
                                name="attendanceId"
                                value={formData.attendanceId}
                                onChange={handleChange}
                                className={errors.attendanceId ? 'input-error' : ''}
                            />
                            {errors.attendanceId && <div className="field-error">{errors.attendanceId}</div>}
                        </div>

                        <div>
                            <label>Class:</label><br />
                            <select
                                name="classId"
                                value={formData.classId}
                                onChange={handleChange}
                                className={errors.classId ? 'input-error' : ''}
                            >
                                <option value="">Select Class</option>
                                {classes.map((cls) => (
                                    <option key={cls._id} value={cls.classId}>
                                        {cls.classId} - {cls.day} {cls.time}
                                    </option>
                                ))}
                            </select>
                            {errors.classId && <div className="field-error">{errors.classId}</div>}
                        </div>

                        {selectedClassDetails && (
                            <div className="message-box">
                                Selected class: <strong>{selectedClassDetails.classId}</strong><br />
                                Day: {selectedClassDetails.day} | Time: {selectedClassDetails.time} | Type: {selectedClassDetails.classType} | Instructor: {selectedClassDetails.instructorId}
                            </div>
                        )}

                        <div>
                            <label>Instructor ID:</label><br />
                            <input
                                type="text"
                                name="instructorId"
                                value={formData.instructorId}
                                readOnly
                            />
                        </div>

                        <div>
                            <label>Attendance Date:</label><br />
                            <input
                                type="datetime-local"
                                name="attendanceDate"
                                value={formData.attendanceDate}
                                onChange={handleChange}
                                className={errors.attendanceDate ? 'input-error' : ''}
                            />
                            {errors.attendanceDate && <div className="field-error">{errors.attendanceDate}</div>}
                        </div>

                        {hasDateMismatch && (
                            <div className="warning-message">
                                Warning: The selected attendance date falls on <strong>{selectedAttendanceDay}</strong>, but the class is scheduled for <strong>{selectedClassDetails.day}</strong>. Please verify the date/time before submitting.
                            </div>
                        )}

                        <div>
                            <label>Select Customers:</label><br />
                            <p className="helper-text">
                                Customers with low or negative balances can still be selected; balances will be updated after attendance is recorded.
                            </p>

                            {customers.map((customer) => {
                                const warnings = getCustomerPackageWarnings(customer);
                                const isLowBalance = customer.classBalance === 0;
                                const isNegativeBalance = customer.classBalance < 0;

                                return (
                                    <div key={customer._id} style={{ marginBottom: '12px' }}>
                                        <label style={{ fontWeight: 'normal' }}>
                                            <input
                                                type="checkbox"
                                                checked={formData.customerIds.includes(customer.customerId)}
                                                onChange={() => handleCustomerSelection(customer.customerId)}
                                                style={{ width: 'auto', marginRight: '8px' }}
                                            />
                                            {customer.firstName} {customer.lastName} ({customer.customerId}) - Balance:{' '}
                                            <span
                                                className={
                                                    isNegativeBalance
                                                        ? 'balance-negative'
                                                        : isLowBalance
                                                            ? 'balance-low'
                                                            : ''
                                                }
                                            >
                                                {customer.classBalance}
                                            </span>
                                        </label>

                                        {(isLowBalance || isNegativeBalance) && (
                                            <div className="warning-message" style={{ marginTop: '6px' }}>
                                                {isNegativeBalance
                                                    ? 'Warning: This customer already has a negative balance.'
                                                    : 'Warning: This customer currently has a balance of 0 and may go negative.'}
                                            </div>
                                        )}

                                        {warnings.length > 0 && (
                                            <div className="warning-message" style={{ marginTop: '6px' }}>
                                                {warnings.join(' ')}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                            {errors.customerIds && <div className="field-error">{errors.customerIds}</div>}
                        </div>

                        <button type="submit" disabled={isFormIncomplete}>
                            Record Attendance
                        </button>
                    </form>

                    {message && (
                        <div className={messageType === 'error' ? 'error-message' : 'success-message'}>
                            {message}
                        </div>
                    )}
                </div>

                <div className="section-card">
                    <h3>Attendance Records</h3>
                    <p className="helper-text">
                        Review previously recorded attendance submissions.
                    </p>

                    <ul className="record-list">
                        {attendanceRecords.map((record) => (
                            <li key={record._id}>
                                {record.attendanceId} - Class: {record.classId} - Instructor: {record.instructorId} - Customers: {record.customerIds.join(', ')}
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
}

export default AttendancePage;