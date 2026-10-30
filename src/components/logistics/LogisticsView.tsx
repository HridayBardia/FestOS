'use client';

import React, { useState } from 'react';
import {
  Truck,
  ShieldCheck,
  AlertTriangle,
  Clock,
  Phone,
  CheckCircle2,
  Box,
  Layers,
  Sparkles,
  ShoppingBag,
  MapPin
} from 'lucide-react';
import { useFest } from '@/context/FestContext';
import { formatISTTime } from '@/lib/formatters';

export const LogisticsView: React.FC = () => {
  const { vendors, logistics, merch, events, venues, updateVendorStatus } = useFest();
  const [activeTab, setActiveTab] = useState<'vendors' | 'inventory' | 'merch'>('vendors');

  return (
    <div className="space-y-6">
      {/* View Header */}
      <div className="bg-white border border-[#E5DFD3] rounded-2xl p-6 shadow-luxury flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5 mb-1.5">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest bg-[#F6EFE6] text-[#A3703F] border border-[#E5DFD3]">
              Procurement & Health Directorate
            </span>
            <span className="text-xs text-[#8F8982]">Campus Health & Equipment Supply</span>
          </div>
          <h2 className="font-serif text-2xl font-bold text-[#1A1A1A]">Vendor & Logistics Management</h2>
          <p className="text-xs text-[#6B655E] mt-0.5">
            Monitor caterer hygiene ratings, sound equipment, heavy generators, and merchandise inventories.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1.5 bg-[#FAF8F5] p-1.5 rounded-xl border border-[#E5DFD3]">
          <button
            onClick={() => setActiveTab('vendors')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'vendors'
                ? 'bg-white text-[#1A1A1A] shadow-card border border-[#E5DFD3]'
                : 'text-[#6B655E] hover:text-[#1A1A1A]'
            }`}
          >
            Vendors ({vendors.length})
          </button>
          <button
            onClick={() => setActiveTab('inventory')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'inventory'
                ? 'bg-white text-[#1A1A1A] shadow-card border border-[#E5DFD3]'
                : 'text-[#6B655E] hover:text-[#1A1A1A]'
            }`}
          >
            Logistics Equipment
          </button>
          <button
            onClick={() => setActiveTab('merch')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'merch'
                ? 'bg-white text-[#1A1A1A] shadow-card border border-[#E5DFD3]'
                : 'text-[#6B655E] hover:text-[#1A1A1A]'
            }`}
          >
            Merchandise & Kits
          </button>
        </div>
      </div>

      {/* Tab 1: Vendors Directory */}
      {activeTab === 'vendors' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {vendors.map((vnd) => {
              const isBreached = vnd.compliance_status === 'breached';
              const isWarning = vnd.compliance_status === 'warning';

              return (
                <div
                  key={vnd.id}
                  className={`rounded-2xl border p-6 shadow-luxury transition-all flex flex-col justify-between ${
                    isBreached
                      ? 'bg-[#FAECEB]/40 border-[#F0C9C7]'
                      : isWarning
                      ? 'bg-[#FAF0E4]/40 border-[#EED5BC]'
                      : 'bg-white border-[#E5DFD3]'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between text-xs mb-2">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-[#FAF8F5] text-[#6B655E] border border-[#E5DFD3]">
                        {vnd.category.replace('_', ' ')}
                      </span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        isBreached
                          ? 'bg-[#FAECEB] text-[#7C2D2A] border border-[#F0C9C7]'
                          : isWarning
                          ? 'bg-[#FAF0E4] text-[#7A4E1D] border border-[#EED5BC]'
                          : 'bg-[#EAF3EC] text-[#2D5A3E] border border-[#C7E2CE]'
                      }`}>
                        {vnd.compliance_status}
                      </span>
                    </div>

                    <h3 className="font-serif font-bold text-[#1A1A1A] text-lg mb-1">{vnd.name}</h3>
                    <p className="text-xs text-[#6B655E] mb-3 leading-relaxed">{vnd.notes}</p>

                    <div className="space-y-1.5 text-xs text-[#1A1A1A] bg-[#FAF8F5] p-3.5 rounded-xl border border-[#E5DFD3] font-mono">
                      <div className="flex items-center justify-between">
                        <span className="text-[#8F8982]">Hygiene Rating:</span>
                        <span className="font-bold text-[#A3703F]">★ {vnd.hygiene_rating} / 5.0</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-[#8F8982]">Certificate Valid:</span>
                        <span className={isBreached ? 'text-[#7C2D2A] font-bold' : 'text-[#1A1A1A]'}>
                          {vnd.hygiene_cert_valid_until}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-[#8F8982]">Hours of Service:</span>
                        <span className="text-[#2D5A3E]">{vnd.operating_hours}</span>
                      </div>
                      <div className="flex items-center justify-between pt-1 border-t border-[#E5DFD3] font-sans">
                        <span className="text-[#8F8982]">Contact:</span>
                        <span className="font-medium">{vnd.contact_name} ({vnd.contact_phone})</span>
                      </div>
                    </div>
                  </div>

                  {/* Manual Status Switcher */}
                  <div className="mt-4 pt-3.5 border-t border-[#E5DFD3] flex items-center justify-between text-xs">
                    <span className="text-[#8F8982] font-medium">Compliance:</span>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => updateVendorStatus(vnd.id, 'compliant', 'Audit cleared by Health Inspector')}
                        className="px-2.5 py-1 rounded-lg bg-[#EAF3EC] text-[#2D5A3E] border border-[#C7E2CE] hover:bg-[#d8edd9] text-[10px] font-bold"
                      >
                        Pass
                      </button>
                      <button
                        onClick={() => updateVendorStatus(vnd.id, 'warning', 'Warning issued regarding shift cover')}
                        className="px-2.5 py-1 rounded-lg bg-[#FAF0E4] text-[#7A4E1D] border border-[#EED5BC] hover:bg-[#f6e6d3] text-[10px] font-bold"
                      >
                        Warn
                      </button>
                      <button
                        onClick={() => updateVendorStatus(vnd.id, 'breached', 'Sanitary or license breach flagged')}
                        className="px-2.5 py-1 rounded-lg bg-[#FAECEB] text-[#7C2D2A] border border-[#F0C9C7] hover:bg-[#f7dad8] text-[10px] font-bold"
                      >
                        Halt
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 2: Logistics Equipment Inventory */}
      {activeTab === 'inventory' && (
        <div className="bg-white border border-[#E5DFD3] rounded-2xl overflow-hidden shadow-luxury">
          <div className="p-5 border-b border-[#E5DFD3]">
            <h3 className="font-serif font-bold text-base text-[#1A1A1A]">
              Heavy Infrastructure & Audio-Visual Depot
            </h3>
            <p className="text-xs text-[#6B655E]">Tracking generator fuel, crowd barricades, and stage line arrays.</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-[#1A1A1A]">
              <thead className="bg-[#FAF8F5] text-[11px] font-bold uppercase tracking-wider text-[#8F8982] border-b border-[#E5DFD3]">
                <tr>
                  <th className="py-3 px-4">Equipment Item</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Total Stock</th>
                  <th className="py-3 px-4">In Active Use</th>
                  <th className="py-3 px-4">Standby Available</th>
                  <th className="py-3 px-4">Current Depot Location</th>
                  <th className="py-3 px-4">Condition</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EFEBE3] font-mono text-[11px]">
                {logistics.map((item) => (
                  <tr key={item.id} className="hover:bg-[#FAF8F5]/80 transition-colors">
                    <td className="py-3 px-4 font-sans font-bold text-[#1A1A1A] text-xs">{item.item_name}</td>
                    <td className="py-3 px-4 uppercase text-[#8F8982]">{item.category}</td>
                    <td className="py-3 px-4 font-bold text-[#1A1A1A]">{item.total_quantity}</td>
                    <td className="py-3 px-4 text-[#A3703F] font-bold">{item.in_use_quantity}</td>
                    <td className="py-3 px-4 text-[#2D5A3E] font-bold">{item.available_quantity}</td>
                    <td className="py-3 px-4 font-sans text-[#6B655E]">{item.location}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        item.condition === 'optimal'
                          ? 'bg-[#EAF3EC] text-[#2D5A3E] border border-[#C7E2CE]'
                          : 'bg-[#FAF0E4] text-[#7A4E1D] border border-[#EED5BC]'
                      }`}>
                        {item.condition}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Merchandise & Welcome Kits */}
      {activeTab === 'merch' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {merch.map((m) => {
            const distPct = Math.round((m.distributed_stock / (m.total_stock || 1)) * 100);
            return (
              <div key={m.id} className="bg-white border border-[#E5DFD3] rounded-2xl p-5 shadow-luxury">
                <div className="flex items-center justify-between text-xs mb-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-[#FAF8F5] text-[#6B655E] border border-[#E5DFD3]">
                    Target: {m.target_group}
                  </span>
                  <span className="font-mono text-[#A3703F] font-bold">Size: {m.size}</span>
                </div>

                <h4 className="font-serif font-bold text-[#1A1A1A] text-base mb-3">{m.item_name}</h4>

                <div className="space-y-1.5 text-xs">
                  <div className="flex items-center justify-between text-[#8F8982]">
                    <span>Disbursed:</span>
                    <span className="font-mono font-bold text-[#1A1A1A]">{m.distributed_stock} / {m.total_stock} ({distPct}%)</span>
                  </div>
                  <div className="w-full bg-[#F4F1EA] rounded-full h-1.5 overflow-hidden">
                    <div
                      className="h-full bg-[#A3703F] rounded-full"
                      style={{ width: `${distPct}%` }}
                    ></div>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-[#6B655E] pt-1">
                    <span>Remaining in Stock:</span>
                    <span className="font-mono font-bold text-[#2D5A3E]">{m.remaining_stock} pcs</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
