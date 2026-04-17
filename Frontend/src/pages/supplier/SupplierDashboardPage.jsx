import React from 'react';
import SupplierDashboardLayout from '../../components/supplier/SupplierDashboardLayout';
import SupplierOrdersTab from './SupplierOrdersTab';

const SupplierDashboardPage = () => {
    return (
        <SupplierDashboardLayout title="Supplier Orders">
            <div className="min-h-[400px]">
                <SupplierOrdersTab />
            </div>
        </SupplierDashboardLayout>
    );
};

export default SupplierDashboardPage;
