import React, { useState, useEffect } from 'react';
import { Plus, X, Search, Filter } from 'lucide-react';
import { couponService } from '../services/couponService';
import { Coupon, DiscountType } from '../types';

export default function AdminPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [refresh, setRefresh] = useState(0);

  useEffect(() => {
    setCoupons(couponService.getAllCoupons());
  }, [refresh]);

  const toggleModal = () => setShowModal(!showModal);

  return (
    <div>
      <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-200">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Coupon Database</h2>
          <p className="text-sm text-gray-500">List of all active and inactive coupons</p>
        </div>
        <button
          onClick={toggleModal}
          className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors text-sm font-medium flex items-center gap-2 shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Create New Coupon
        </button>
      </div>

      {/* Standard Table View - Typical for Student CRUD Projects */}
      <div className="overflow-x-auto border border-gray-200 rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Code</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Description</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Discount</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Rules</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Validity</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {coupons.length === 0 && (
               <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-gray-500 italic">
                     No coupons found. Database is empty.
                  </td>
               </tr>
            )}
            {coupons.map((coupon) => (
              <tr key={coupon.code} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="font-mono font-bold text-indigo-700 bg-indigo-50 px-2 py-1 rounded border border-indigo-100">
                    {coupon.code}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-900">{coupon.description}</div>
                  {coupon.usageLimitPerUser && (
                     <div className="text-xs text-gray-500 mt-1">Limit: {coupon.usageLimitPerUser}/user</div>
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
                <td className="px-6 py-4">
                  <div className="flex flex-col gap-1">
                     {(!coupon.eligibility || Object.keys(coupon.eligibility).length === 0) && <span className="text-xs text-gray-400">- None -</span>}
                     {coupon.eligibility?.minCartValue && <span className="text-xs bg-gray-100 px-2 py-0.5 rounded w-fit border border-gray-200">Min Cart: ₹{coupon.eligibility.minCartValue}</span>}
                     {coupon.eligibility?.allowedUserTiers && <span className="text-xs bg-gray-100 px-2 py-0.5 rounded w-fit border border-gray-200">Tiers: {coupon.eligibility.allowedUserTiers.join(', ')}</span>}
                     {coupon.eligibility?.applicableCategories && <span className="text-xs bg-gray-100 px-2 py-0.5 rounded w-fit border border-gray-200">Cats: {coupon.eligibility.applicableCategories.join(', ')}</span>}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                   <div className="text-xs text-gray-500">
                      Ends: <span className="text-gray-900 font-medium">{new Date(coupon.endDate).toLocaleDateString()}</span>
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

      {showModal && <CreateCouponModal onClose={toggleModal} onSuccess={() => { toggleModal(); setRefresh(p => p + 1); }} />}
    </div>
  );
}

function CreateCouponModal({ onClose, onSuccess }: { onClose: () => void, onSuccess: () => void }) {
  const [formData, setFormData] = useState<Partial<Coupon>>({
    discountType: DiscountType.FLAT,
    discountValue: 0,
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 86400000 * 30).toISOString().split('T')[0],
  });
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (!formData.code || !formData.description || formData.discountValue === undefined) {
        throw new Error("Missing required fields");
      }
      
      couponService.createCoupon({
        code: formData.code.toUpperCase(),
        description: formData.description,
        discountType: formData.discountType as DiscountType,
        discountValue: Number(formData.discountValue),
        startDate: new Date(formData.startDate as string).toISOString(),
        endDate: new Date(formData.endDate as string).toISOString(),
        maxDiscountAmount: formData.maxDiscountAmount ? Number(formData.maxDiscountAmount) : undefined,
        usageLimitPerUser: formData.usageLimitPerUser ? Number(formData.usageLimitPerUser) : undefined,
        eligibility: {
          minCartValue: formData.eligibility?.minCartValue ? Number(formData.eligibility.minCartValue) : undefined,
        }
      });
      onSuccess();
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg overflow-hidden border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
          <h3 className="font-bold text-gray-800">Add Coupon</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
           {error && <div className="p-3 bg-red-100 text-red-700 text-sm rounded border border-red-200">{error}</div>}
           
           <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Coupon Code</label>
                <input required type="text" className="w-full p-2 border border-gray-300 rounded focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 bg-white text-gray-900" 
                  placeholder="CODE123"
                  onChange={e => setFormData({...formData, code: e.target.value})} />
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
                onChange={e => setFormData({...formData, description: e.target.value})} />
           </div>

           <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Value</label>
                <input required type="number" min="0" className="w-full p-2 border border-gray-300 rounded bg-white text-gray-900" 
                  onChange={e => setFormData({...formData, discountValue: Number(e.target.value)})} />
              </div>
              {formData.discountType === DiscountType.PERCENT && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Max Cap (₹)</label>
                  <input type="number" min="0" className="w-full p-2 border border-gray-300 rounded bg-white text-gray-900" 
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
              <h4 className="font-medium text-gray-800 text-sm mb-2">Basic Eligibility</h4>
              <div className="grid grid-cols-2 gap-3">
                 <div>
                    <label className="block text-xs text-gray-600 mb-1">Min Cart Amount</label>
                    <input type="number" className="w-full p-1 border border-gray-300 rounded text-sm bg-white text-gray-900" 
                      onChange={e => setFormData({
                        ...formData, 
                        eligibility: { ...formData.eligibility, minCartValue: Number(e.target.value) } 
                      })} />
                 </div>
                 <div>
                    <label className="block text-xs text-gray-600 mb-1">Limit Per User</label>
                    <input type="number" className="w-full p-1 border border-gray-300 rounded text-sm bg-white text-gray-900" 
                      onChange={e => setFormData({...formData, usageLimitPerUser: Number(e.target.value)})} />
                 </div>
              </div>
           </div>

           <div className="flex justify-end gap-3 pt-2">
              <button type="button" onClick={onClose} className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded text-sm font-medium">Cancel</button>
              <button type="submit" className="px-4 py-2 text-white bg-indigo-600 hover:bg-indigo-700 rounded text-sm font-medium">Save to Memory</button>
           </div>
        </form>
      </div>
    </div>
  );
}