'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Users,
  Search,
  CheckCircle2,
  Download,
  Phone,
  Mail,
  ChevronLeft,
  ChevronRight,
  Filter,
  UserCheck,
  RefreshCw
} from 'lucide-react';
import { useFest } from '@/context/FestContext';
import { Participant } from '@/types/database';
import { formatISTTime } from '@/lib/formatters';

export const ParticipantsView: React.FC = () => {
  const {
    contingents,
    allocations,
    hostels,
    externalStays,
    toggleCheckIn,
    fetchParticipantsPage,
    participantsCount
  } = useFest();

  const [page, setPage] = useState<number>(1);
  const pageSize = 20;

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedContingentId, setSelectedContingentId] = useState<string>('all');
  const [dietaryFilter, setDietaryFilter] = useState<string>('all');
  const [accessibilityOnly, setAccessibilityOnly] = useState<boolean>(false);
  const [checkInFilter, setCheckInFilter] = useState<string>('all');

  const [paginatedData, setPaginatedData] = useState<Participant[]>([]);
  const [totalFilteredCount, setTotalFilteredCount] = useState<number>(participantsCount || 2836);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Load live paginated participants from Supabase
  const loadPage = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetchParticipantsPage({
        page,
        pageSize,
        search: searchQuery,
        contingentId: selectedContingentId,
        dietary: dietaryFilter,
        accessibility: accessibilityOnly,
        checkedIn: checkInFilter,
      });
      setPaginatedData(res.data);
      setTotalFilteredCount(res.totalCount);
    } catch (e) {
      console.warn('Pagination load error:', e);
    } finally {
      setIsLoading(false);
    }
  }, [fetchParticipantsPage, page, pageSize, searchQuery, selectedContingentId, dietaryFilter, accessibilityOnly, checkInFilter]);

  useEffect(() => {
    loadPage();
  }, [loadPage]);

  // Reset page when filter changes
  const handleFilterChange = (setter: (val: any) => void, val: any) => {
    setter(val);
    setPage(1);
  };

  const totalPages = Math.max(1, Math.ceil(totalFilteredCount / pageSize));

  // Export CSV
  const handleExportCSV = () => {
    const headers = ['ID', 'Name', 'Email', 'Phone', 'Gender', 'Contingent', 'Role', 'Dietary', 'Accessibility', 'Allocated Room', 'Checked In'];
    const rows = paginatedData.map((p) => {
      const cnt = contingents.find((c) => c.id === p.contingent_id);
      const alloc = allocations.find((a) => a.participant_id === p.id && a.status !== 'vacated');
      let roomStr = 'Unallocated';
      if (alloc) {
        if (alloc.hostel_id) {
          const h = hostels.find((item) => item.id === alloc.hostel_id);
          roomStr = `${h?.name || 'Hostel'} Rm ${alloc.room_number}-${alloc.bed_number}`;
        } else if (alloc.external_stay_id) {
          const s = externalStays.find((item) => item.id === alloc.external_stay_id);
          roomStr = `${s?.name || 'Overflow'} Rm ${alloc.room_number}`;
        }
      }
      return [
        p.id,
        `"${p.name}"`,
        p.email,
        p.phone,
        p.gender,
        `"${cnt?.name || ''}"`,
        p.role,
        p.dietary_requirements,
        p.accessibility_needs ? 'YES' : 'NO',
        `"${roomStr}"`,
        p.checked_in ? 'YES' : 'NO',
      ].join(',');
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Aarohan_2026_Delegates_Page_${page}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* View Header */}
      <div className="bg-white border border-[#E5DFD3] rounded-2xl p-6 shadow-luxury flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5 mb-1.5">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest bg-[#F6EFE6] text-[#A3703F] border border-[#E5DFD3]">
              Registration Directorate
            </span>
            <span className="text-xs text-[#8F8982] font-mono">
              Live Festival Roster ({totalFilteredCount.toLocaleString()} Delegates)
            </span>
          </div>
          <h2 className="font-serif text-2xl font-bold text-[#1A1A1A]">Delegate & Contingent Roster</h2>
          <p className="text-xs text-[#6B655E] mt-0.5">
            Browse and search live participant records, dietary specializations, accessibility flags, and biometric check-ins.
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="px-4 py-2.5 rounded-xl bg-white hover:bg-[#FAF8F5] text-[#1A1A1A] text-xs font-bold border border-[#E5DFD3] shadow-sm flex items-center gap-2 transition-colors shrink-0"
        >
          <Download className="w-4 h-4 text-[#A3703F]" />
          <span>Export Page CSV</span>
        </button>
      </div>

      {/* Contingents Overview Ribbon */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
        {contingents.map((c) => {
          const isSelected = selectedContingentId === c.id;
          return (
            <div
              key={c.id}
              onClick={() => handleFilterChange(setSelectedContingentId, isSelected ? 'all' : c.id)}
              className={`p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                isSelected
                  ? 'bg-[#F6EFE6] border-[#A3703F] text-[#1A1A1A] shadow-sm'
                  : 'bg-white border-[#E5DFD3] hover:border-[#D8D1C5] text-[#6B655E]'
              }`}
            >
              <div className="flex items-center justify-between text-[11px] mb-1">
                <span className="font-semibold text-[#8F8982] truncate">{c.city}</span>
                <span className="font-mono font-bold text-[#1A1A1A]">{c.total_members}</span>
              </div>
              <p className="font-bold text-[#1A1A1A] text-xs truncate">{c.name.split('(')[0]}</p>
              <span className={`inline-block mt-1 text-[9px] uppercase font-bold px-1.5 py-0.2 rounded ${
                c.status === 'arrived'
                  ? 'bg-[#EAF3EC] text-[#2D5A3E]'
                  : c.status === 'delayed'
                  ? 'bg-[#FAF0E4] text-[#7A4E1D]'
                  : 'bg-[#F6EFE6] text-[#A3703F]'
              }`}>
                {c.status}
              </span>
            </div>
          );
        })}
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white border border-[#E5DFD3] p-4 rounded-2xl shadow-luxury flex flex-wrap items-center justify-between gap-3 text-xs">
        {/* Search Input */}
        <div className="relative flex-1 min-w-[260px]">
          <Search className="w-4 h-4 text-[#8F8982] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => handleFilterChange(setSearchQuery, e.target.value)}
            placeholder="Search across 2,836 participants by name, email, or phone..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#FAF8F5] border border-[#E5DFD3] text-[#1A1A1A] placeholder:text-[#8F8982] text-xs focus:outline-none focus:border-[#A3703F] shadow-sm font-medium"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Contingent Filter */}
          <select
            value={selectedContingentId}
            onChange={(e) => handleFilterChange(setSelectedContingentId, e.target.value)}
            className="px-3 py-2 rounded-xl bg-white border border-[#E5DFD3] text-[#1A1A1A] text-xs focus:outline-none focus:border-[#A3703F] shadow-sm font-medium"
          >
            <option value="all">All Contingents</option>
            {contingents.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          {/* Dietary Filter */}
          <select
            value={dietaryFilter}
            onChange={(e) => handleFilterChange(setDietaryFilter, e.target.value)}
            className="px-3 py-2 rounded-xl bg-white border border-[#E5DFD3] text-[#1A1A1A] text-xs focus:outline-none focus:border-[#A3703F] shadow-sm font-medium"
          >
            <option value="all">All Diets</option>
            <option value="veg">Vegetarian</option>
            <option value="jain">Jain Special</option>
            <option value="vegan">Vegan</option>
            <option value="halal">Halal</option>
          </select>

          {/* Check-in status */}
          <select
            value={checkInFilter}
            onChange={(e) => handleFilterChange(setCheckInFilter, e.target.value)}
            className="px-3 py-2 rounded-xl bg-white border border-[#E5DFD3] text-[#1A1A1A] text-xs focus:outline-none focus:border-[#A3703F] shadow-sm font-medium"
          >
            <option value="all">All Statuses</option>
            <option value="checked_in">Checked In Only</option>
            <option value="pending">Check-In Pending</option>
          </select>

          {/* Accessibility Toggle */}
          <button
            onClick={() => handleFilterChange(setAccessibilityOnly, !accessibilityOnly)}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              accessibilityOnly
                ? 'bg-[#FAF0E4] text-[#7A4E1D] border border-[#EED5BC] shadow-sm'
                : 'bg-white border border-[#E5DFD3] text-[#6B655E] hover:text-[#1A1A1A]'
            }`}
          >
            <span>♿ Accessible Only</span>
          </button>
        </div>
      </div>

      {/* Participants Table */}
      <div className="bg-white border border-[#E5DFD3] rounded-2xl overflow-hidden shadow-luxury">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-[#1A1A1A]">
            <thead className="bg-[#FAF8F5] text-[11px] font-bold uppercase tracking-wider text-[#8F8982] border-b border-[#E5DFD3]">
              <tr>
                <th className="py-3.5 px-4">Delegate Name & Role</th>
                <th className="py-3.5 px-4">Delegation / College</th>
                <th className="py-3.5 px-4">Contact Info</th>
                <th className="py-3.5 px-4">Flags (Diet / Acc)</th>
                <th className="py-3.5 px-4">Accommodation Room</th>
                <th className="py-3.5 px-4 text-center">Check-In Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EFEBE3]">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-[#8F8982]">
                    <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-[#A3703F]" />
                    <span>Loading festival delegates roster...</span>
                  </td>
                </tr>
              ) : paginatedData.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-[#8F8982]">
                    No participants matched your search criteria.
                  </td>
                </tr>
              ) : (
                paginatedData.map((p) => {
                  const pId = p.id || (p as any).participant_id;
                  const cnt = contingents.find((c) => c.id === p.contingent_id);
                  const alloc = allocations.find((a) => a.participant_id === pId && a.status !== 'vacated');
                  let roomName = 'Unallocated';
                  let isOverride = alloc?.is_override;

                  if (alloc) {
                    if (alloc.hostel_id) {
                      const h = hostels.find((item) => item.id === alloc.hostel_id);
                      roomName = `${h?.name || 'Hostel'} (${alloc.room_number}-${alloc.bed_number})`;
                    } else if (alloc.external_stay_id) {
                      const s = externalStays.find((item) => item.id === alloc.external_stay_id);
                      roomName = `${s?.name.split('(')[0] || 'Stay'} (Rm ${alloc.room_number})`;
                    }
                  } else if ((p as any).room_id) {
                    roomName = `Hostel (${(p as any).room_id})`;
                  } else if ((p as any).property_id) {
                    roomName = `Hotel (${(p as any).property_id})`;
                  }

                  return (
                    <tr key={pId} className="hover:bg-[#FAF8F5]/80 transition-colors">
                      {/* Name & Role */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-[#1A1A1A] text-sm">{p.name}</span>
                          <span className="text-[10px] uppercase font-mono px-1.5 py-0.2 rounded bg-[#FAF8F5] text-[#6B655E] border border-[#E5DFD3]">
                            {p.gender}
                          </span>
                        </div>
                        <span className="text-[10px] capitalize text-[#A3703F] font-semibold">{p.role}</span>
                      </td>

                      {/* Delegation */}
                      <td className="py-3.5 px-4">
                        <p className="font-semibold text-[#1A1A1A]">{(p as any).contingent_name || cnt?.name || 'Independent'}</p>
                        <p className="text-[10px] text-[#6B655E] truncate max-w-xs">{(p as any).college || cnt?.college}</p>
                      </td>

                      {/* Contact Info */}
                      <td className="py-3.5 px-4 font-mono text-[11px]">
                        <div className="flex items-center gap-1.5 text-[#1A1A1A]">
                          <Mail className="w-3 h-3 text-[#8F8982]" />
                          <span>{p.email}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-[#6B655E] mt-0.5">
                          <Phone className="w-3 h-3 text-[#8F8982]" />
                          <span>{p.phone}</span>
                        </div>
                      </td>

                      {/* Dietary & Accessibility Flags */}
                      <td className="py-3.5 px-4">
                        <div className="flex flex-wrap items-center gap-1.5">
                          {p.dietary_requirements && p.dietary_requirements !== 'none' && (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-[#EAF3EC] text-[#2D5A3E] border border-[#C7E2CE]">
                              {p.dietary_requirements}
                            </span>
                          )}
                          {p.accessibility_needs && (
                            <span
                              title={p.accessibility_note || 'Accessibility needs recorded'}
                              className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#FAF0E4] text-[#7A4E1D] border border-[#EED5BC] cursor-help"
                            >
                              ♿ ACCESSIBLE
                            </span>
                          )}
                        </div>
                        {p.accessibility_note && (
                          <p className="text-[10px] text-[#7A4E1D] mt-1 line-clamp-1">
                            {p.accessibility_note}
                          </p>
                        )}
                      </td>

                      {/* Room Assigned */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${
                              alloc || (p as any).room_id || (p as any).property_id
                                ? isOverride
                                  ? 'bg-[#FAF0E4] text-[#7A4E1D] border border-[#EED5BC]'
                                  : 'bg-[#FAF8F5] text-[#1A1A1A] border border-[#E5DFD3]'
                                : 'bg-[#FAECEB] text-[#7C2D2A] border border-[#F0C9C7]'
                            }`}
                          >
                            {roomName}
                          </span>
                          {isOverride && (
                            <span className="text-[9px] px-1 py-0.5 rounded bg-[#FAF0E4] text-[#7A4E1D] font-bold uppercase">
                              Override
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Check-In */}
                      <td className="py-3.5 px-4 text-center">
                        <button
                          onClick={async () => {
                            setPaginatedData((prev) =>
                              prev.map((item) => {
                                const curId = item.id || (item as any).participant_id;
                                if (curId === pId) {
                                  const nextChecked = !item.checked_in;
                                  return {
                                    ...item,
                                    checked_in: nextChecked,
                                    checked_in_at: nextChecked ? new Date().toISOString() : null,
                                  };
                                }
                                return item;
                              })
                            );
                            await toggleCheckIn(pId);
                          }}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 mx-auto active:scale-95 ${
                            p.checked_in
                              ? 'bg-[#EAF3EC] text-[#2D5A3E] border border-[#C7E2CE] hover:bg-[#d8edd9]'
                              : 'bg-[#A3703F] hover:bg-[#8C6D36] text-white shadow-sm'
                          }`}
                        >
                          {p.checked_in ? (
                            <>
                              <CheckCircle2 className="w-3.5 h-3.5 text-[#2D5A3E]" />
                              <span>Checked In</span>
                            </>
                          ) : (
                            <>
                              <UserCheck className="w-3.5 h-3.5" />
                              <span>Check In</span>
                            </>
                          )}
                        </button>
                        {p.checked_in && p.checked_in_at && (
                          <span className="block text-[9px] font-mono text-[#8F8982] mt-1" suppressHydrationWarning>
                            {formatISTTime(p.checked_in_at)}
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Server Pagination Bar */}
        <div className="p-4 border-t border-[#E5DFD3] bg-[#FAF8F5] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-[#6B655E]">
          <span className="font-mono">
            Showing {(page - 1) * pageSize + 1} to {Math.min(page * pageSize, totalFilteredCount)} of{' '}
            {totalFilteredCount.toLocaleString()} delegates
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="px-3 py-1.5 rounded-lg bg-white border border-[#E5DFD3] text-[#1A1A1A] font-medium disabled:opacity-40 hover:bg-[#FAF8F5] transition-colors flex items-center gap-1"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>Previous</span>
            </button>

            <span className="px-3 py-1 font-mono font-bold text-[#1A1A1A]">
              Page {page} of {totalPages}
            </span>

            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="px-3 py-1.5 rounded-lg bg-white border border-[#E5DFD3] text-[#1A1A1A] font-medium disabled:opacity-40 hover:bg-[#FAF8F5] transition-colors flex items-center gap-1"
            >
              <span>Next</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
