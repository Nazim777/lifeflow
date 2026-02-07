export interface User {
    _id: string;
    name: string;
    email: string;
    role: 'donor' | 'recipient' | 'hospital' | 'admin';
    bloodGroup?: string;
    location?: {
        city: string;
        area: string;
        address?: string;
    };
    phone?: string;
    isVerified?: boolean;
    isBlocked?: boolean;
    hospitalProfile?: Hospital;
}

export interface Hospital extends User {
    institutionName?: string;
    contactNumber?: string;
}

export interface BloodRequest {
    _id: string;
    requesterId: User | string; // Populated or ID
    hospitalId?: Hospital | string; // Populated or ID
    patientName: string;
    bloodGroup: string;
    units: number;
    urgency: 'normal' | 'critical';
    location: {
        city: string;
        area: string;
    };
    requiredDate: string;
    status: 'pending' | 'accepted' | 'completed' | 'cancelled';
    assignedDonorId?: User | string;
    createdAt: string;
    expiresAt?: string;
}

export interface Notification {
    _id: string;
    userId: string;
    title: string;
    message: string;
    type: 'request' | 'status' | 'system';
    isRead: boolean;
    createdAt: string;
}
