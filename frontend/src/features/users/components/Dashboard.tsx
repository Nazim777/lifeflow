
import { useAuthStore } from '../../auth/hooks/useAuthStore';
import DonorDashboard from './DonorDashboard';
import RecipientDashboard from './RecipientDashboard';
import HospitalDashboard from './HospitalDashboard';
import AdminDashboard from '../../admin/components/AdminDashboard';

const Dashboard = () => {
    const { user } = useAuthStore();

    switch (user?.role) {
        case 'donor':
            return <DonorDashboard />;
        case 'recipient':
            return <RecipientDashboard />;
        case 'hospital':
            return <HospitalDashboard />;
        case 'admin':
            return <AdminDashboard />;
        default:
            return <div>Unknown Role</div>;
    }
};

export default Dashboard;
