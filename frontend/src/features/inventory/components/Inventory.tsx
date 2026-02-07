import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import api from '../../../api/axios';
import { Plus, Trash2, Edit2, Save, X } from 'lucide-react';
import { format } from 'date-fns';

interface InventoryItem {
    _id: string;
    bloodGroup: string;
    units: number;
    expiryDate: string;
}

const Inventory = () => {
    const [inventory, setInventory] = useState<InventoryItem[]>([]);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [showAddForm, setShowAddForm] = useState(false);
    const { register, handleSubmit, reset } = useForm();

    const fetchInventory = async () => {
        try {
            const res = await api.get('/inventory');
            setInventory(res.data);
        } catch (error) {
            console.error('Failed to fetch inventory', error);
        }
    };

    useEffect(() => {
        fetchInventory();
    }, []);

    const onAdd = async (data: any) => {
        try {
            await api.post('/inventory', data);
            fetchInventory();
            setShowAddForm(false);
            reset();
        } catch (error) {
            console.error('Failed to add item', error);
        }
    };

    const onDelete = async (id: string) => {
        if (!window.confirm('Are you sure?')) return;
        try {
            await api.delete(`/inventory/${id}`);
            fetchInventory();
        } catch (error) {
            console.error('Failed to delete item', error);
        }
    };

    const onUpdate = async (id: string, data: any) => {
        try {
            await api.patch(`/inventory/${id}`, data);
            setEditingId(null);
            fetchInventory();
        } catch (error) {
            console.error('Failed to update item', error);
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Blood Inventory</h2>
                    <p className="text-gray-500">Manage hospital blood stock</p>
                </div>
                <button
                    onClick={() => setShowAddForm(true)}
                    className="flex items-center gap-2 bg-red-500 text-white px-4 py-2 rounded-xl hover:bg-red-600 transition-colors shadow-sm font-medium"
                >
                    <Plus className="w-5 h-5" />
                    Add Stock
                </button>
            </div>

            {showAddForm && (
                <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm animate-in fade-in slide-in-from-top-4">
                    <h3 className="font-bold mb-4">Add New Stock</h3>
                    <form onSubmit={handleSubmit(onAdd)} className="flex gap-4 items-end">
                        <div className="flex-1">
                            <label className="text-xs font-medium text-gray-500 mb-1 block">Blood Group</label>
                            <select {...register('bloodGroup')} className="w-full p-2 border rounded-lg" required>
                                {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bg => <option key={bg} value={bg}>{bg}</option>)}
                            </select>
                        </div>
                        <div className="flex-1">
                            <label className="text-xs font-medium text-gray-500 mb-1 block">Units</label>
                            <input type="number" {...register('units')} className="w-full p-2 border rounded-lg" required />
                        </div>
                        <div className="flex-1">
                            <label className="text-xs font-medium text-gray-500 mb-1 block">Expiry Date</label>
                            <input type="date" {...register('expiryDate')} className="w-full p-2 border rounded-lg" required />
                        </div>
                        <button type="submit" className="bg-green-500 text-white p-2 rounded-lg hover:bg-green-600">
                            <Save className="w-5 h-5" />
                        </button>
                        <button type="button" onClick={() => setShowAddForm(false)} className="bg-gray-100 text-gray-500 p-2 rounded-lg hover:bg-gray-200">
                            <X className="w-5 h-5" />
                        </button>
                    </form>
                </div>
            )}

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 border-b border-gray-100">
                        <tr>
                            <th className="p-4 font-medium text-gray-500">Blood Group</th>
                            <th className="p-4 font-medium text-gray-500">Units</th>
                            <th className="p-4 font-medium text-gray-500">Expiry Date</th>
                            <th className="p-4 font-medium text-gray-500 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {inventory.map((item) => (
                            <tr key={item._id} className="hover:bg-gray-50">
                                <td className="p-4 font-bold text-gray-900">
                                    <span className="w-8 h-8 flex items-center justify-center bg-red-50 text-primary rounded-lg">
                                        {item.bloodGroup}
                                    </span>
                                </td>
                                <td className="p-4 text-gray-600">
                                    {editingId === item._id ? (
                                        <input defaultValue={item.units} className="border rounded p-1 w-20" id={`units-${item._id}`} />
                                    ) : (
                                        item.units
                                    )}
                                </td>
                                <td className="p-4 text-gray-600">
                                    {format(new Date(item.expiryDate), 'MMM d, yyyy')}
                                </td>
                                <td className="p-4 text-right flex justify-end gap-2">
                                    {editingId === item._id ? (
                                        <button
                                            onClick={() => {
                                                const input = document.getElementById(`units-${item._id}`) as HTMLInputElement;
                                                onUpdate(item._id, { units: Number(input.value) });
                                            }}
                                            className="text-green-500 hover:bg-green-50 p-2 rounded-lg"
                                        >
                                            <Save className="w-4 h-4" />
                                        </button>
                                    ) : (
                                        <button onClick={() => setEditingId(item._id)} className="text-blue-500 hover:bg-blue-50 p-2 rounded-lg">
                                            <Edit2 className="w-4 h-4" />
                                        </button>
                                    )}
                                    <button onClick={() => onDelete(item._id)} className="text-red-500 hover:bg-red-50 p-2 rounded-lg">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {inventory.length === 0 && (
                            <tr>
                                <td colSpan={4} className="p-8 text-center text-gray-400">Inventory is empty.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Inventory;
