import React, { useState } from 'react';
import { ShoppingCart, User, Play, Terminal, Plus, Trash2, Zap, RotateCcw, CheckCircle, XCircle } from 'lucide-react';
import { UserContext, CartItem, BestCouponResponse } from '../types';
import { couponService } from '../services/couponService';

const SCENARIOS = [
  {
    name: "New User Promo",
    description: "First time user with small cart",
    user: { userId: 'u_new_01', userTier: 'Standard', lifetimeSpend: 0, ordersPlaced: 0, country: 'IN' },
    cart: [{ productId: 'p1', category: 'general', unitPrice: 100, quantity: 1 }]
  },
  {
    name: "VIP Big Spender",
    description: "Platinum user buying electronics",
    user: { userId: 'u_vip_99', userTier: 'Platinum', lifetimeSpend: 50000, ordersPlaced: 42, country: 'US' },
    cart: [
      { productId: 'tv_lg', category: 'electronics', unitPrice: 15000, quantity: 1 },
      { productId: 'cable', category: 'electronics', unitPrice: 500, quantity: 2 }
    ]
  },
  {
    name: "Regular User",
    description: "Gold user, mixed cart",
    user: { userId: 'u_reg_55', userTier: 'Gold', lifetimeSpend: 2500, ordersPlaced: 12, country: 'UK' },
    cart: [
       { productId: 'book_1', category: 'books', unitPrice: 300, quantity: 2 },
       { productId: 'pen', category: 'stationery', unitPrice: 50, quantity: 5 }
    ]
  }
];

export default function SimulatorPage() {
  const [userContext, setUserContext] = useState<UserContext>(SCENARIOS[0].user);
  const [cartItems, setCartItems] = useState<CartItem[]>(SCENARIOS[0].cart);
  const [result, setResult] = useState<BestCouponResponse | null | 'NONE'>(null);
  const [loading, setLoading] = useState(false);

  // Cart Management
  const addCartItem = () => {
    setCartItems([...cartItems, { productId: `p${Date.now()}`, category: 'general', unitPrice: 100, quantity: 1 }]);
  };
  
  const updateCartItem = (index: number, field: keyof CartItem, value: any) => {
    const newItems = [...cartItems];
    newItems[index] = { ...newItems[index], [field]: value };
    setCartItems(newItems);
  };
  
  const removeCartItem = (index: number) => {
    setCartItems(cartItems.filter((_, i) => i !== index));
  };

  const loadScenario = (idx: number) => {
     setUserContext({...SCENARIOS[idx].user});
     setCartItems([...SCENARIOS[idx].cart]);
     setResult(null);
  };

  const handleReset = () => {
     setUserContext({ userId: '', userTier: 'Standard', lifetimeSpend: 0, ordersPlaced: 0, country: '' });
     setCartItems([]);
     setResult(null);
  };

  const handleFindBest = () => {
    setLoading(true);
    setResult(null); // Clear previous
    setTimeout(() => {
      const best = couponService.findBestCoupon(userContext, cartItems);
      setResult(best || 'NONE');
      setLoading(false);
    }, 600);
  };

  const handleConsume = () => {
    if (result && result !== 'NONE') {
        couponService.recordUsage(result.coupon.code, userContext.userId);
        alert(`Request sent: POST /coupons/${result.coupon.code}/consume\nResponse: 200 OK`);
        handleFindBest(); // Re-evaluate
    }
  }

  const cartTotal = cartItems.reduce((acc, item) => acc + (item.unitPrice * item.quantity), 0);
  const finalPrice = result && result !== 'NONE' ? Math.max(0, cartTotal - result.discountAmount) : cartTotal;

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-full">
       
       {/* LEFT COLUMN: Input Forms */}
       <div className="flex-1 flex flex-col gap-6">
          
          {/* Scenarios Header */}
          <div className="flex justify-between items-end pb-2 border-b border-gray-200">
             <div>
               <h3 className="text-lg font-bold text-gray-800">Test API</h3>
               <p className="text-sm text-gray-500">Simulate incoming requests</p>
             </div>
             <div className="flex gap-2">
                <button onClick={handleReset} className="text-xs text-gray-500 hover:text-gray-700 flex items-center gap-1 px-2 py-1 bg-gray-100 rounded border border-gray-200 transition-colors">
                   <RotateCcw size={12} /> Reset
                </button>
             </div>
          </div>

          {/* Quick Presets */}
          <div className="grid grid-cols-3 gap-2">
             {SCENARIOS.map((s, idx) => (
                <button key={idx} onClick={() => loadScenario(idx)} className="text-left px-3 py-2 bg-indigo-50 hover:bg-indigo-100 border border-indigo-100 rounded transition-colors group">
                   <div className="flex items-center gap-1.5 text-indigo-700 font-bold text-xs mb-0.5">
                      <Zap size={12} className="group-hover:fill-indigo-700 transition-all" />
                      {s.name}
                   </div>
                   <div className="text-[10px] text-indigo-400 truncate">{s.description}</div>
                </button>
             ))}
          </div>

          <div className="bg-white p-5 border border-gray-200 shadow-sm rounded-lg space-y-6">
             {/* User Context Section */}
             <div>
                <div className="flex items-center gap-2 mb-3 text-sm font-bold text-gray-700 uppercase tracking-wide">
                   <User size={16} className="text-indigo-500" /> User Context
                </div>
                <div className="grid grid-cols-2 gap-4 mb-4">
                   <div>
                      <label className="block text-xs font-semibold text-gray-500 mb-1">User ID</label>
                      <input type="text" className="w-full border border-gray-300 p-2 rounded text-sm bg-white text-gray-900 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-all" value={userContext.userId} onChange={e => setUserContext({...userContext, userId: e.target.value})} />
                   </div>
                   <div>
                      <label className="block text-xs font-semibold text-gray-500 mb-1">Tier</label>
                      <select className="w-full border border-gray-300 p-2 rounded text-sm bg-white text-gray-900 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-all" value={userContext.userTier} onChange={e => setUserContext({...userContext, userTier: e.target.value})}>
                         <option value="Standard">Standard</option>
                         <option value="Gold">Gold</option>
                         <option value="Platinum">Platinum</option>
                      </select>
                   </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                   <div className="col-span-1">
                      <label className="block text-xs font-semibold text-gray-500 mb-1">Country</label>
                      <input type="text" className="w-full border border-gray-300 p-2 rounded text-sm bg-white text-gray-900" placeholder="US, IN..." value={userContext.country || ''} onChange={e => setUserContext({...userContext, country: e.target.value})} />
                   </div>
                   <div className="col-span-1">
                      <label className="block text-xs font-semibold text-gray-500 mb-1">Spend (₹)</label>
                      <input type="number" className="w-full border border-gray-300 p-2 rounded text-sm bg-white text-gray-900" value={userContext.lifetimeSpend} onChange={e => setUserContext({...userContext, lifetimeSpend: Number(e.target.value)})} />
                   </div>
                   <div className="col-span-1">
                      <label className="block text-xs font-semibold text-gray-500 mb-1">Orders</label>
                      <input type="number" className="w-full border border-gray-300 p-2 rounded text-sm bg-white text-gray-900" value={userContext.ordersPlaced} onChange={e => setUserContext({...userContext, ordersPlaced: Number(e.target.value)})} />
                   </div>
                </div>
             </div>
             
             <div className="border-t border-gray-100 my-2"></div>

             {/* Cart Section */}
             <div className="flex flex-col h-full">
                <div className="flex items-center justify-between mb-3">
                   <div className="flex items-center gap-2 text-sm font-bold text-gray-700 uppercase tracking-wide"><ShoppingCart size={16} className="text-indigo-500" /> Cart Payload</div>
                   <button onClick={addCartItem} className="text-xs bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200 px-3 py-1.5 rounded-full flex items-center gap-1 transition-colors font-medium">
                      <Plus size={14} /> Add Item
                   </button>
                </div>
                
                {/* Cart Header */}
                <div className="flex gap-2 text-[10px] font-bold text-gray-400 uppercase mb-2 px-2">
                    <div className="flex-1">Category</div>
                    <div className="w-20 text-right">Price</div>
                    <div className="w-16 text-center">Qty</div>
                    <div className="w-6"></div>
                </div>

                <div className="space-y-2 max-h-[250px] overflow-y-auto pr-1">
                   {cartItems.map((item, idx) => (
                     <div key={idx} className="flex gap-2 items-center bg-gray-50 p-2 border border-gray-200 rounded hover:border-gray-300 transition-colors">
                        <div className="flex-1">
                           <input type="text" placeholder="Category" className="w-full p-1.5 text-sm border border-gray-300 rounded bg-white text-gray-900 focus:outline-none focus:border-indigo-400" value={item.category} onChange={e => updateCartItem(idx, 'category', e.target.value)} />
                        </div>
                        <div className="w-20">
                           <input type="number" placeholder="0" className="w-full p-1.5 text-sm border border-gray-300 rounded bg-white text-gray-900 text-right focus:outline-none focus:border-indigo-400" value={item.unitPrice} onChange={e => updateCartItem(idx, 'unitPrice', Number(e.target.value))} />
                        </div>
                        <div className="w-16">
                           <input type="number" placeholder="1" className="w-full p-1.5 text-sm border border-gray-300 rounded bg-white text-gray-900 text-center focus:outline-none focus:border-indigo-400" value={item.quantity} onChange={e => updateCartItem(idx, 'quantity', Number(e.target.value))} />
                        </div>
                        <button onClick={() => removeCartItem(idx)} className="text-gray-400 hover:text-red-500 w-6 flex justify-center">
                           <Trash2 size={16} />
                        </button>
                     </div>
                   ))}
                   {cartItems.length === 0 && (
                      <div className="text-center py-6 text-gray-400 text-sm italic border border-dashed border-gray-200 rounded bg-gray-50/50">Cart is empty</div>
                   )}
                </div>

                {/* UPDATED: Cart Footer with Conditional Discount Breakdown */}
                <div className="mt-4 border-t border-gray-100 pt-3">
                   <div className="flex justify-between items-center mb-1">
                      <span className="text-xs font-semibold text-gray-500">Subtotal ({cartItems.length} items)</span>
                      <span className={`font-bold text-gray-900 ${result && result !== 'NONE' ? 'text-sm' : 'text-lg'}`}>₹{cartTotal.toFixed(2)}</span>
                   </div>

                   {result && result !== 'NONE' && (
                      <>
                        <div className="flex justify-between items-center mb-1 text-green-600">
                            <span className="text-xs font-semibold flex items-center gap-1"><Zap size={10} fill="currentColor"/> Discount</span>
                            <span className="text-sm font-bold">-₹{result.discountAmount.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between items-center pt-2 border-t border-dashed border-gray-200 mt-2">
                            <span className="text-sm font-bold text-gray-800">Final Total</span>
                            <span className="text-xl font-bold text-indigo-600">₹{finalPrice.toFixed(2)}</span>
                        </div>
                      </>
                   )}
                </div>
             </div>
          </div>

          <button onClick={handleFindBest} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 rounded-lg shadow-md hover:shadow-lg flex justify-center items-center gap-2 transition-all transform active:scale-[0.99]">
             {loading ? (
               <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Processing...
               </div>
             ) : (
               <>
                 <Play size={20} fill="currentColor" /> POST /coupons/best
               </>
             )}
          </button>
       </div>

       {/* RIGHT COLUMN: Output Console */}
       <div className="flex-1 flex flex-col bg-[#1e1e1e] rounded-xl overflow-hidden border border-gray-800 shadow-2xl">
          <div className="bg-[#151515] px-4 py-3 border-b border-gray-800 flex justify-between items-center">
             <div className="flex items-center gap-3">
                <div className="flex gap-1.5">
                   <div className="w-3 h-3 rounded-full bg-[#ff5f56]"></div>
                   <div className="w-3 h-3 rounded-full bg-[#ffbd2e]"></div>
                   <div className="w-3 h-3 rounded-full bg-[#27c93f]"></div>
                </div>
                <div className="flex items-center gap-2 text-gray-400 font-mono text-xs ml-2 bg-[#2a2a2a] px-2 py-1 rounded">
                   <Terminal size={12} />
                   <span>api_response.log</span>
                </div>
             </div>
             <span className="text-[10px] text-gray-500 font-mono">UTF-8</span>
          </div>

          <div className="flex-1 p-0 overflow-auto font-mono text-sm relative">
              {/* Overlay Summary Header */}
              {result && !loading && result !== 'NONE' && (
                  <div className="sticky top-0 left-0 right-0 bg-[#1e1e1e]/95 backdrop-blur-sm border-b border-green-900/30 p-4 flex justify-between items-center z-10">
                     <div className="flex items-center gap-3">
                        <div className="bg-green-900/30 p-2 rounded-full">
                           <CheckCircle size={20} className="text-green-500" />
                        </div>
                        <div>
                           <div className="text-green-400 font-bold">Best Price Found</div>
                           <div className="text-xs text-gray-400">Discount Applied Automatically</div>
                        </div>
                     </div>
                     <div className="text-right">
                        <div className="flex items-baseline gap-2 justify-end">
                           <span className="text-gray-500 text-sm line-through decoration-gray-500">₹{cartTotal.toFixed(2)}</span>
                           <span className="text-white font-bold text-2xl">₹{finalPrice.toFixed(2)}</span>
                        </div>
                        <div className="text-xs text-green-500 font-medium">
                           You save ₹{result.discountAmount.toFixed(2)}
                        </div>
                     </div>
                  </div>
              )}
              
              {result === 'NONE' && !loading && (
                 <div className="sticky top-0 left-0 right-0 bg-[#1e1e1e]/95 backdrop-blur-sm border-b border-red-900/30 p-4 flex items-center gap-3 z-10">
                     <XCircle size={20} className="text-red-500" />
                     <div>
                        <div className="text-red-400 font-bold">No Coupon Applicable</div>
                        <div className="text-xs text-gray-400">Status: 200 OK (Null Result)</div>
                     </div>
                 </div>
              )}

              <div className="p-4 pt-4">
                 {!result && !loading && (
                    <div className="text-gray-600 italic select-none flex flex-col items-center justify-center h-40 gap-2">
                       <Terminal size={32} className="opacity-20" />
                       <span>Ready for request...</span>
                    </div>
                 )}
                 
                 {loading && (
                    <div className="animate-pulse space-y-2">
                       <div className="flex gap-2"><span className="text-blue-500">INFO:</span> <span className="text-gray-400">Received POST request...</span></div>
                       <div className="flex gap-2"><span className="text-blue-500">INFO:</span> <span className="text-gray-400">Analyzing User Context...</span></div>
                       <div className="flex gap-2"><span className="text-blue-500">INFO:</span> <span className="text-gray-400">Validating eligibility rules...</span></div>
                       <div className="flex gap-2"><span className="text-blue-500">INFO:</span> <span className="text-gray-400">Computing discount values...</span></div>
                    </div>
                 )}

                 {result && !loading && (
                    <>
                       <div className="text-gray-500 mb-2 select-none">// Response Body</div>
                       <pre className="text-green-400 whitespace-pre-wrap break-all leading-relaxed">
                          {JSON.stringify(result === 'NONE' ? { error: "No eligible coupons found" } : result, null, 3)}
                       </pre>
                    </>
                 )}
              </div>
          </div>

          {result && result !== 'NONE' && (
             <div className="p-3 bg-[#252525] border-t border-gray-700 flex justify-between items-center">
                <div className="flex flex-col">
                   <span className="text-gray-400 text-[10px] uppercase tracking-wider">Next Action</span>
                   <span className="text-gray-300 text-xs">Simulate coupon consumption?</span>
                </div>
                <button onClick={handleConsume} className="bg-green-700 hover:bg-green-600 text-white px-4 py-1.5 rounded text-xs font-mono transition-colors shadow-sm flex items-center gap-2">
                   APPLY_COUPON() <Play size={10} />
                </button>
             </div>
          )}
       </div>
    </div>
  );
}