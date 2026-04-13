function DashboardPage({ onNavigate }) {
    const sections = [
        {
            key: 'instructors',
            title: 'Instructors',
            description: 'Add, update, and manage instructor records.'
        },
        {
            key: 'customers',
            title: 'Customers',
            description: 'Maintain customer information and class balances.'
        },
        {
            key: 'packages',
            title: 'Packages',
            description: 'Manage class packages, pricing, and validity dates.'
        },
        {
            key: 'classes',
            title: 'Classes',
            description: 'Create classes, assign instructors, and prevent schedule conflicts.'
        },
        {
            key: 'sales',
            title: 'Sales',
            description: 'Record package purchases and update customer balances.'
        },
        {
            key: 'attendance',
            title: 'Attendance',
            description: 'Record class attendance and automatically adjust balances.'
        },
        {
            key: 'reports',
            title: 'Reports',
            description: 'Review sales, instructor activity, customer status, and teacher payments.'
        },
        {
            key: 'schedule',
            title: 'Schedule',
            description: 'View the current class schedule by day, time, instructor, and type.'
        },
    ];

    return (
        <div>
            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                <img
                    src="/yoga-hom-logo.png"
                    alt="Yoga H'om Logo"
                    className="dashboard-logo"
                />

                <h2>Dashboard</h2>
                <p className="helper-text" style={{ marginBottom: '24px' }}>
                    Welcome to YogiTrack. Select a section below to manage studio operations.
                </p>
            </div>

            <div className="dashboard-grid">
                {sections.map((section) => (
                    <button
                        key={section.key}
                        className="dashboard-card-button"
                        onClick={() => onNavigate(section.key)}
                    >
                        <div className="section-card dashboard-card">
                            <h3>{section.title}</h3>
                            <p>{section.description}</p>
                        </div>
                    </button>
                ))}
            </div>
        </div>
    );
}

export default DashboardPage;