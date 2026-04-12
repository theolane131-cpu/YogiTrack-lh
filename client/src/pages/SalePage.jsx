import { useState, useEffect } from 'react';
import API from '../api';

function SalePage() {
    const [formData, setFormData] = useState({
        saleId: '',
        customerId: '',
        packageId: '',
        amountPaid: '',
        paymentMethod: 'Card',
        paymentDateTime: '',
        validityStartDate: '',
        validityEndDate: ''
    });

    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState('');
    const [sales, setSales] = useState([]);
    const [customers, setCustomers] = useState([]);
    const [packages, setPackages] = useState([]);
    const [errors, setErrors] = useState({});
    const [selectedPackageDetails, setSelectedPackageDetails] = useState(null);
    const [selectedCustomerDetails, setSelectedCustomerDetails] = useState(null);

    const fetchSales = async () => {
        try {
            const response = await API.get('/api/sales');
            setSales(response.data);
        } catch (error) {
            console.error('Error fetching sales:', error);
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

    useEffect(() => {
        fetchSales();
        fetchCustomers();
        fetchPackages();
    }, []);

    const validateForm = () => {
        const newErrors = {};

        if (!formData.saleId.trim()) {
            newErrors.saleId = 'Sale ID is required.';
        }

        if (!formData.saleId.startsWith('S')) {
            newErrors.saleId = 'Sale ID must start with "S" (example: S001)';
        }

        if (!formData.customerId) {
            newErrors.customerId = 'Please select a customer.';
        }

        if (!formData.packageId) {
            newErrors.packageId = 'Please select a package.';
        }

        if (formData.amountPaid === '' || Number(formData.amountPaid) < 0) {
            newErrors.amountPaid = 'Amount paid must be 0 or greater.';
        }

        if (
            selectedPackageDetails &&
            Number(formData.amountPaid) !== Number(selectedPackageDetails.price)
        ) {
            newErrors.amountPaid = 'Amount paid should match the selected package price.';
        }

        if (!formData.paymentDateTime) {
            newErrors.paymentDateTime = 'Payment date and time is required.';
        }

        if (!formData.validityStartDate) {
            newErrors.validityStartDate = 'Validity start date is required.';
        }

        if (!formData.validityEndDate) {
            newErrors.validityEndDate = 'Validity end date is required.';
        }

        if (
            formData.validityStartDate &&
            formData.validityEndDate &&
            formData.validityEndDate < formData.validityStartDate
        ) {
            newErrors.validityEndDate = 'Validity end date cannot be earlier than start date.';
        }

        return newErrors;
    };

    const handleChange = (event) => {
        const { name, value } = event.target;

        if (name === 'customerId') {
            const selectedCustomer = customers.find(
                (customer) => customer.customerId === value
            );
            setSelectedCustomerDetails(selectedCustomer || null);
        }

        setFormData((prevData) => ({
            ...prevData,
            [name]: value
        }));

        setErrors((prevErrors) => ({
            ...prevErrors,
            [name]: ''
        }));
    };

    const handlePackageChange = (event) => {
        const selectedPackageId = event.target.value;
        const selectedPackage = packages.find((pkg) => pkg.packageId === selectedPackageId);

        setSelectedPackageDetails(selectedPackage || null);

        setFormData((prevData) => ({
            ...prevData,
            packageId: selectedPackageId,
            amountPaid: selectedPackage ? selectedPackage.price : ''
        }));

        setErrors((prevErrors) => ({
            ...prevErrors,
            packageId: '',
            amountPaid: ''
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
                amountPaid: Number(formData.amountPaid)
            };

            const response = await API.post('/api/sales', payload);

            setMessage(
                `${response.data.message} | Updated customer balance: ${response.data.updatedCustomerBalance}`
            );
            setMessageType('success');

            fetchSales();
            fetchCustomers();
            setErrors({});
            setSelectedPackageDetails(null);
            setSelectedCustomerDetails(null);

            setFormData({
                saleId: '',
                customerId: '',
                packageId: '',
                amountPaid: '',
                paymentMethod: 'Card',
                paymentDateTime: '',
                validityStartDate: '',
                validityEndDate: ''
            });
        } catch (error) {
            setMessage(error.response?.data?.error || 'Error recording sale');
            setMessageType('error');
        }
    };

    const isFormIncomplete =
        !formData.saleId.trim() ||
        !formData.customerId ||
        !formData.packageId ||
        formData.amountPaid === '' ||
        !formData.paymentDateTime ||
        !formData.validityStartDate ||
        !formData.validityEndDate;

    return (
        <div>
            <h2>Sales Management</h2>

            <div className="page-container">
                <div className="section-card">
                    <h3>Record Sale</h3>
                    <p className="helper-text">
                        Record a package purchase for an existing customer. The customer’s class balance will update automatically.
                    </p>

                    <form onSubmit={handleSubmit}>
                        <div>
                            <label>Sale ID:</label><br />
                            <input
                                type="text"
                                name="saleId"
                                value={formData.saleId}
                                onChange={handleChange}
                                className={errors.saleId ? 'input-error' : ''}
                            />
                            {errors.saleId && <div className="field-error">{errors.saleId}</div>}
                        </div>

                        <div>
                            <label>Customer:</label><br />
                            <select
                                name="customerId"
                                value={formData.customerId}
                                onChange={handleChange}
                                className={errors.customerId ? 'input-error' : ''}
                            >
                                <option value="">Select Customer</option>
                                {customers.map((customer) => (
                                    <option key={customer._id} value={customer.customerId}>
                                        {customer.firstName} {customer.lastName} ({customer.customerId})
                                    </option>
                                ))}
                            </select>
                            {errors.customerId && <div className="field-error">{errors.customerId}</div>}
                        </div>

                        {selectedCustomerDetails && (
                            <div className="message-box">
                                Selected customer: <strong>{selectedCustomerDetails.firstName} {selectedCustomerDetails.lastName}</strong><br />
                                Current balance: <strong>{selectedCustomerDetails.classBalance}</strong>
                            </div>
                        )}

                        <div>
                            <label>Package:</label><br />
                            <select
                                name="packageId"
                                value={formData.packageId}
                                onChange={handlePackageChange}
                                className={errors.packageId ? 'input-error' : ''}
                            >
                                <option value="">Select Package</option>
                                {packages.map((pkg) => (
                                    <option key={pkg._id} value={pkg.packageId}>
                                        {pkg.packageName} ({pkg.packageId})
                                    </option>
                                ))}
                            </select>
                            {errors.packageId && <div className="field-error">{errors.packageId}</div>}
                        </div>

                        {selectedPackageDetails && (
                            <div className="message-box">
                                Selected package: <strong>{selectedPackageDetails.packageName}</strong><br />
                                Category: {selectedPackageDetails.packageCategory} | Class Type: {selectedPackageDetails.classType} | Classes: {selectedPackageDetails.numberOfClasses} | Price: ${selectedPackageDetails.price}
                            </div>
                        )}

                        <div>
                            <label>Amount Paid:</label><br />
                            <input
                                type="number"
                                name="amountPaid"
                                value={formData.amountPaid}
                                onChange={handleChange}
                                className={errors.amountPaid ? 'input-error' : ''}
                            />
                            {errors.amountPaid && <div className="field-error">{errors.amountPaid}</div>}
                        </div>

                        <div>
                            <label>Payment Method:</label><br />
                            <select
                                name="paymentMethod"
                                value={formData.paymentMethod}
                                onChange={handleChange}
                            >
                                <option value="Cash">Cash</option>
                                <option value="Card">Card</option>
                                <option value="Online">Online</option>
                            </select>
                        </div>

                        <div>
                            <label>Payment Date and Time:</label><br />
                            <input
                                type="datetime-local"
                                name="paymentDateTime"
                                value={formData.paymentDateTime}
                                onChange={handleChange}
                                className={errors.paymentDateTime ? 'input-error' : ''}
                            />
                            {errors.paymentDateTime && <div className="field-error">{errors.paymentDateTime}</div>}
                        </div>

                        <div>
                            <label>Validity Start Date:</label><br />
                            <input
                                type="date"
                                name="validityStartDate"
                                value={formData.validityStartDate}
                                onChange={handleChange}
                                className={errors.validityStartDate ? 'input-error' : ''}
                            />
                            {errors.validityStartDate && <div className="field-error">{errors.validityStartDate}</div>}
                        </div>

                        <div>
                            <label>Validity End Date:</label><br />
                            <input
                                type="date"
                                name="validityEndDate"
                                value={formData.validityEndDate}
                                onChange={handleChange}
                                className={errors.validityEndDate ? 'input-error' : ''}
                            />
                            {errors.validityEndDate && <div className="field-error">{errors.validityEndDate}</div>}
                        </div>

                        <button type="submit" disabled={isFormIncomplete}>
                            Record Sale
                        </button>
                    </form>

                    {message && (
                        <div className={messageType === 'error' ? 'error-message' : 'success-message'}>
                            {message}
                        </div>
                    )}
                </div>

                <div className="section-card">
                    <h3>Sales List</h3>
                    <p className="helper-text">
                        Review recorded sales and verify customer/package pairings.
                    </p>

                    <ul className="record-list">
                        {sales.map((sale) => (
                            <li key={sale._id}>
                                {sale.saleId} - Customer: {sale.customerId} - Package: {sale.packageId} - Amount: ${sale.amountPaid}
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
}

export default SalePage;