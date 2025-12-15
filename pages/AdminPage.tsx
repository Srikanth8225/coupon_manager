import React, { useState, useEffect } from 'react';
import { Plus, X, Edit2, Trash2, PauseCircle, PlayCircle, AlertCircle } from 'lucide-react';
import { couponService } from '../services/couponService';
import { Coupon, DiscountType } from '../types';

export default function AdminPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
  const [refresh, setRefresh] = useState(0);

  useEffect(() => {
    setCoupons(couponService.getAllCoupons());
  }, [refresh]);

  const handleCreateNew = () => {
    setEditingCoupon(null);
    setShowModal(true);
  };

  const handleEdit = (coupon: Coupon) => {
    setEditingCoupon(coupon);
    setShowModal(true);
  };

  const handleDelete = (code: string) => {
    if (window.confirm(`Are you sure you want to permanently delete coupon "${code}"?`)) {
      couponService.deleteCoupon(code);
      setRefresh(p => p + 1);
    }
  };

  const handleToggleStatus = (coupon: Coupon) => {
    const newStatus = coupon.isActive === false ? true : false;
    couponService.updateCoupon(coupon.code, { ...coupon, isActive: newStatus });
    setRefresh(p => p + 1);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-200">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Coupon Database</h2>
          <p className="text-sm text-gray-500">Manage, edit, pause, or remove coupons</p>
        </div>
        <button
          onClick={handleCreateNew}
          className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors text-sm font-medium flex items-center gap-2 shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Create New Coupon
        </button>
      </div>

      <div className="overflow-x-auto border border-gray-200 rounded-lg shadow-sm bg-white">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Code</th>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Description</th>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Discount</th>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Validity</th>
              <th className="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {coupons.length === 0 && (
               <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-gray-500 italic">
                     No coupons found. Database is empty.
                  </td>
               </tr>
            )}
            {coupons.map((coupon) => (
              <tr key={coupon.code} className={`hover:bg-gray-50 transition-colors ${coupon.isActive === false ? 'bg-gray-50 opacity-75' : ''}`}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`font-mono font-bold px-2 py-1 rounded border ${coupon.isActive === false ? 'text-gray-500 bg-gray-200 border-gray-300' : 'text-indigo-700 bg-indigo-50 border-indigo-100'}`}>
                    {coupon.code}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-900">{coupon.description}</div>
                  {coupon.usageLimitPerUser && (
                     <div className="text-xs text-gray-500 mt-1">Limit: {coupon.usageLimitPerUser}/user</div>
                  )}
                  {(!coupon.eligibility || Object.keys(coupon.eligibility).length === 0) ? null : (
                     <div className="flex flex-wrap gap-1 mt-1">
                        {coupon.eligibility?.minCartValue && <span className="text-[10px] bg-yellow-50 text-yellow-700 px-1.5 py-0.5 rounded border border-yellow-200">Min: ₹{coupon.eligibility.minCartValue}</span>}
                        {coupon.eligibility?.allowedUserTiers && <span className="text-[10px] bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded border border-blue-200">Tiers: {coupon.eligibility.allowedUserTiers.join(', ')}</span>}
                     </div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-semibold text-gray-900">
                    {coupon.discountType === DiscountType.FLAT ? '₹' : ''}{coupon.discountValue}{coupon.discountType === DiscountType.PERCENT ? '%' : ''}
                  </div>
                  {coupon.maxDiscountAmount && (
                     <div className="text-xs text-gray-400">Max: ₹{coupon.maxDiscountAmount}</div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                   {coupon.isActive !== false ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                         <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span> Active
                      </span>
                   ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                         <PauseCircle size={10} /> Paused
                      </span>
                   )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                   <div className="text-xs text-gray-500 flex flex-col">
                      <span>{new Date(coupon.startDate).toLocaleDateString()}</span>
                      <span className="text-gray-300 mx-auto transform rotate-90 w-3">|</span>
                      <span className="text-gray-900 font-medium">{new Date(coupon.endDate).toLocaleDateString()}</span>
                   </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                   <div className="flex justify-end gap-2">
                      <button 
                        onClick={() => handleToggleStatus(coupon)}
                        title={coupon.isActive !== false ? "Pause Coupon" : "Resume Coupon"}
                        className={`p-1.5 rounded hover:bg-gray-200 transition-colors ${coupon.isActive !== false ? 'text-orange-500' : 'text-green-600'}`}>
                         {coupon.isActive !== false ? <PauseCircle size={16} /> : <PlayCircle size={16} />}
                      </button>
                      <button 
                        onClick={() => handleEdit(coupon)} 
                        title="Edit"
                        className="p-1.5 rounded hover:bg-gray-200 text-blue-600 transition-colors">
                         <Edit2 size={16} />
                      </button>
                      <button 
                        onClick={() => handleDelete(coupon.code)}
                        title="Delete"
                        className="p-1.5 rounded hover:bg-red-100 text-red-500 hover:text-red-700 transition-colors">
                         <Trash2 size={16} />
                      </button>
                   </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-4 text-xs text-gray-400 text-right">
         Total Records: {coupons.length}
      </div>

      {showModal && (
        <CouponModal 
           initialData={editingCoupon || undefined}
           onClose={() => setShowModal(false)} 
           onSuccess={() => { setShowModal(false); setRefresh(p => p + 1); }} 
        />
      )}
    </div>
  );
}

function CouponModal({ initialData, onClose, onSuccess }: { initialData?: Coupon, onClose: () => void, onSuccess: () => void }) {
  const isEditMode = !!initialData;
  const [formData, setFormData] = useState<Partial<Coupon>>({
    discountType: DiscountType.FLAT,
    discountValue: 0,
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 86400000 * 30).toISOString().split('T')[0],
    isActive: true
  });
  const [error, setError] = useState('');

  useEffect(() => {
     if (initialData) {
        setFormData({
           ...initialData,
           startDate: initialData.startDate.split('T')[0],
           endDate: initialData.endDate.split('T')[0]
        });
     }
  }, [initialData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (!formData.code || !formData.description || formData.discountValue === undefined) {
        throw new Error("Missing required fields");
      }
      
      const payload: Coupon = {
        code: formData.code.toUpperCase(),
        description: formData.description,
        discountType: formData.discountType as DiscountType,
        discountValue: Number(formData.discountValue),
        startDate: new Date(formData.startDate as string).toISOString(),
        endDate: new Date(formData.endDate as string).toISOString(),
        maxDiscountAmount: formData.maxDiscountAmount ? Number(formData.maxDiscountAmount) : undefined,
        usageLimitPerUser: formData.usageLimitPerUser ? Number(formData.usageLimitPerUser) : undefined,
        isActive: formData.isActive,
        eligibility: {
          minCartValue: formData.eligibility?.minCartValue ? Number(formData.eligibility.minCartValue) : undefined,
          allowedUserTiers: formData.eligibility?.allowedUserTiers,
          applicableCategories: formData.eligibility?.applicableCategories
        }
      };

      if (isEditMode) {
         couponService.updateCoupon(payload.code, payload);
      } else {
         couponService.createCoupon(payload);
      }
      onSuccess();
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50 p-4 backdrop-blur-sm">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg overflow-hidden border border-gray-200 animate-in fade-in zoom-in duration-200">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
          <h3 className="font-bold text-gray-800 flex items-center gap-2">
             {isEditMode ? <Edit2 size={16} className="text-indigo-600"/> : <Plus size={16} className="text-green-600"/>} 
             {isEditMode ? 'Edit Coupon' : 'Create Coupon'}
          </h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
           {error && (
              <div className="p-3 bg-red-50 text-red-700 text-sm rounded border border-red-200 flex items-center gap-2">
                 <AlertCircle size={14} /> {error}
              </div>
           )}
           
           <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Coupon Code</label>
                <input 
                  required 
                  disabled={isEditMode}
                  type="text" 
                  className={`w-full p-2 border border-gray-300 rounded focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 bg-white text-gray-900 ${isEditMode ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : ''}`}
                  placeholder="CODE123"
                  value={formData.code || ''}
                  onChange={e => setFormData({...formData, code: e.target.value})} 
                />
              </div>
               <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                <select className="w-full p-2 border border-gray-300 rounded bg-white text-gray-900" 
                  value={formData.discountType}
                  onChange={e => setFormData({...formData, discountType: e.target.value as DiscountType})}>
                  <option value={DiscountType.FLAT}>Flat Amount</option>
                  <option value={DiscountType.PERCENT}>Percentage</option>
                </select>
              </div>
           </div>

           <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <input required type="text" className="w-full p-2 border border-gray-300 rounded bg-white text-gray-900" 
                placeholder="Description of the offer"
                value={formData.description || ''}
                onChange={e => setFormData({...formData, description: e.target.value})} />
           </div>

           <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Value</label>
                <input required type="number" min="0" className="w-full p-2 border border-gray-300 rounded bg-white text-gray-900" 
                  value={formData.discountValue}
                  onChange={e => setFormData({...formData, discountValue: Number(e.target.value)})} />
              </div>
              {formData.discountType === DiscountType.PERCENT && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Max Cap (₹)</label>
                  <input type="number" min="0" className="w-full p-2 border border-gray-300 rounded bg-white text-gray-900" 
                    value={formData.maxDiscountAmount || ''}
                    onChange={e => setFormData({...formData, maxDiscountAmount: Number(e.target.value)})} />
                </div>
              )}
           </div>

           <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Valid From</label>
                <input required type="date" className="w-full p-2 border border-gray-300 rounded bg-white text-gray-900" 
                   value={formData.startDate as string}
                   onChange={e => setFormData({...formData, startDate: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Valid Until</label>
                <input required type="date" className="w-full p-2 border border-gray-300 rounded bg-white text-gray-900" 
                   value={formData.endDate as string}
                   onChange={e => setFormData({...formData, endDate: e.target.value})} />
              </div>
           </div>

           <div className="p-3 bg-gray-50 border border-gray-200 rounded">
              <h4 className="font-medium text-gray-800 text-sm mb-2">Eligibility Rules</h4>
              <div className="space-y-3">
                 <div className="grid grid-cols-2 gap-3">
                    <div>
                        <label className="block text-xs text-gray-600 mb-1">Min Cart Amount</label>
                        <input type="number" className="w-full p-1 border border-gray-300 rounded text-sm bg-white text-gray-900" 
                          value={formData.eligibility?.minCartValue || ''}
                          onChange={e => setFormData({
                            ...formData, 
                            eligibility: { ...formData.eligibility, minCartValue: Number(e.target.value) } 
                          })} />
                    </div>
                    <div>
                        <label className="block text-xs text-gray-600 mb-1">Limit Per User</label>
                        <input type="number" className="w-full p-1 border border-gray-300 rounded text-sm bg-white text-gray-900" 
                          value={formData.usageLimitPerUser || ''}
                          onChange={e => setFormData({...formData, usageLimitPerUser: Number(e.target.value)})} />
                    </div>
                 </div>
                 
                 {/* Simple Toggles for Demo */}
                 <div className="flex items-center gap-2">
                     <input type="checkbox" id="status" 
                        checked={formData.isActive !== false}
                        onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
                        className="rounded text-indigo-600 focus:ring-indigo-500"
                     />
                     <label htmlFor="status" className="text-sm text-gray-700 select-none cursor-pointer">Coupon is Active</label>
                 </div>
              </div>
           </div>

           <div className="flex justify-end gap-3 pt-2">
              <button type="button" onClick={onClose} className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded text-sm font-medium">Cancel</button>
              <button type="submit" className="px-4 py-2 text-white bg-indigo-600 hover:bg-indigo-700 rounded text-sm font-medium shadow-sm">
                 {isEditMode ? 'Update Coupon' : 'Create Coupon'}
              </button>
           </div>
        </form>
      </div>
    </div>
  );
}