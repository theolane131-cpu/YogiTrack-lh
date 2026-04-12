import { useState } from 'react';
import API from '../api';

function ReportsPage() {
    const [reportType, setReportType] = useState('');
    const [reportTitle, setReportTitle] = useState('');
    const [reportData, setReportData] = useState(null);
    const [message, setMessage] = useState('');

    const loadReport = async (selectedType) => {
        try {
            let response;
            let title = '';

            if (selectedType === 'package-sales') {
                response = await API.get('/api/reports/package-sales');
                title = 'Package Sales Report';
            } else if (selectedType === 'instructor-performance') {
                response = await API.get('/api/reports/instructor-performance');
                title = 'Instructor Performance Report';
            } else if (selectedType === 'customer-status') {
                response = await API.get('/api/reports/customer-status');
                title = 'Customer Status Report';
            } else if (selectedType === 'teacher-payments') {
                response = await API.get('/api/reports/teacher-payments');
                title = 'Teacher Payment Report';
            }

            setReportType(selectedType);
            setReportTitle(title);
            setReportData(response.data);
            setMessage('');
        } catch (error) {
            setMessage('Error loading report');
            setReportData(null);
        }
    };

    const renderPackageSalesReport = () => {
        if (!reportData) return null;

        return (
            <div>
                <div style={{ display: 'flex', gap: '16px', marginBottom: '20px', flexWrap: 'wrap' }}>
                    <div className="section-card" style={{ flex: '1', minWidth: '200px' }}>
                        <h4>Total Sales Count</h4>
                        <p>{reportData.totalSalesCount}</p>
                    </div>

                    <div className="section-card" style={{ flex: '1', minWidth: '200px' }}>
                        <h4>Total Sales Amount</h4>
                        <p>${reportData.totalSalesAmount}</p>
                    </div>
                </div>

                <h4>Sales Details</h4>
                <table className="report-table">
                    <thead>
                        <tr>
                            <th>Sale ID</th>
                            <th>Customer ID</th>
                            <th>Package ID</th>
                            <th>Amount Paid</th>
                            <th>Payment Method</th>
                        </tr>
                    </thead>
                    <tbody>
                        {reportData.sales.map((sale) => (
                            <tr key={sale._id}>
                                <td>{sale.saleId}</td>
                                <td>{sale.customerId}</td>
                                <td>{sale.packageId}</td>
                                <td>${sale.amountPaid}</td>
                                <td>{sale.paymentMethod}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        );
    };

    const renderInstructorPerformanceReport = () => {
        if (!Array.isArray(reportData) || reportData.length === 0) {
            return <p>No instructor performance data available yet.</p>;
        }

        return (
            <div>
                {reportData.map((instructor) => (
                    <div key={instructor.instructorId} className="section-card" style={{ marginBottom: '16px' }}>
                        <h4>
                            {instructor.firstName} {instructor.lastName} ({instructor.instructorId})
                        </h4>
                        <p><strong>Total Check-Ins:</strong> {instructor.totalCheckIns}</p>

                        <h5>Classes</h5>
                        {instructor.classes.length > 0 ? (
                            <ul className="record-list">
                                {instructor.classes.map((cls) => (
                                    <li key={cls.classId}>
                                        {cls.classId} - {cls.day} at {cls.time} - {cls.classType}
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p>No classes assigned.</p>
                        )}
                    </div>
                ))}
            </div>
        );
    };

    const renderCustomerStatusReport = () => {
        if (!Array.isArray(reportData) || reportData.length === 0) {
            return <p>No customer status data available yet.</p>;
        }

        return (
            <div>
                {reportData.map((customer) => (
                    <div key={customer.customerId} className="section-card" style={{ marginBottom: '16px' }}>
                        <h4>
                            {customer.firstName} {customer.lastName} ({customer.customerId})
                        </h4>
                        <p><strong>Class Balance:</strong> {customer.classBalance}</p>

                        <h5>Packages</h5>
                        {customer.packages.length > 0 ? (
                            <ul className="record-list">
                                {customer.packages.map((pkg, index) => (
                                    <li key={index}>
                                        {pkg.packageId} - Start: {new Date(pkg.validityStartDate).toLocaleDateString()} - End: {new Date(pkg.validityEndDate).toLocaleDateString()}
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p>No packages found.</p>
                        )}
                    </div>
                ))}
            </div>
        );
    };

    const renderTeacherPaymentsReport = () => {
        if (!Array.isArray(reportData) || reportData.length === 0) {
            return <p>No teacher payment data available yet.</p>;
        }

        return (
            <div>
                {reportData.map((teacher) => (
                    <div key={teacher.instructorId} className="section-card" style={{ marginBottom: '16px' }}>
                        <h4>
                            {teacher.firstName} {teacher.lastName} ({teacher.instructorId})
                        </h4>
                        <p><strong>Total Payment:</strong> ${teacher.totalPayment}</p>

                        <h5>Class Payment Details</h5>
                        {teacher.classes.length > 0 ? (
                            <table className="report-table">
                                <thead>
                                    <tr>
                                        <th>Class ID</th>
                                        <th>Day</th>
                                        <th>Time</th>
                                        <th>Pay Rate</th>
                                        <th>Check-Ins</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {teacher.classes.map((cls) => (
                                        <tr key={cls.classId}>
                                            <td>{cls.classId}</td>
                                            <td>{cls.day}</td>
                                            <td>{cls.time}</td>
                                            <td>${cls.payRate}</td>
                                            <td>{cls.checkIns}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        ) : (
                            <p>No classes found.</p>
                        )}
                    </div>
                ))}
            </div>
        );
    };

    const renderReportContent = () => {
        if (!reportData) {
            return <p>Select a report to view its results.</p>;
        }

        if (reportType === 'package-sales') {
            return renderPackageSalesReport();
        }

        if (reportType === 'instructor-performance') {
            return renderInstructorPerformanceReport();
        }

        if (reportType === 'customer-status') {
            return renderCustomerStatusReport();
        }

        if (reportType === 'teacher-payments') {
            return renderTeacherPaymentsReport();
        }

        return <p>No report selected.</p>;
    };

    return (
        <div>
            <h2>Reports</h2>

            <div className="page-container">
                <div className="section-card">
                    <h3>Report Options</h3>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        <button onClick={() => loadReport('package-sales')}>
                            Package Sales Report
                        </button>

                        <button onClick={() => loadReport('instructor-performance')}>
                            Instructor Performance
                        </button>

                        <button onClick={() => loadReport('customer-status')}>
                            Customer Status
                        </button>

                        <button onClick={() => loadReport('teacher-payments')}>
                            Teacher Payments
                        </button>
                    </div>

                    {message && <div className="error-message">{message}</div>}
                </div>

                <div className="section-card">
                    <h3>{reportTitle || 'Report Output'}</h3>
                    {renderReportContent()}
                </div>
            </div>
        </div>
    );
}

export default ReportsPage;