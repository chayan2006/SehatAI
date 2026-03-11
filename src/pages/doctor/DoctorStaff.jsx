import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { format, addMonths, subMonths, startOfMonth, endOfMonth, startOfWeek, endOfWeek, isSameMonth, isSameDay, addDays } from 'date-fns';

const initialStaff = [
  { id: 1, name: 'Dr. Sarah Ahmed', email: 'sarah.a@sehat.ai', role: 'Doctor', department: 'Cardiology', status: 'On Duty', avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB26neHwgzOKIzFAfbIrbPphVBfjbrXh2aoxR_TjUEHAgwQriPTqBjv6rtinX8tgOFOQVXThbj0GAOxs73p_0Keh3YATtavtKd08cD5PBwHpBckAlNYqyZOCpz9OGQeVixT7WCG7iuP_EB6q2SDdydJTLy2d0O3psiMnSa2XYY-lYFj90sbYkQA0qeJatwxlaTUolZ6hTzflLxhOagoWshmdBqyfGZGZ5NGSY24OnIVQN3GwoPhK7CZtTB64ed-Rlnf36bTzjBsR0hS' },
  { id: 2, name: 'James Wilson', email: 'j.wilson@sehat.ai', role: 'Nurse', department: 'Emergency Room', status: 'Off Duty', avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBsK5A5FtO0-5WJtwVmdAun_ck1SUmuLECKl7eEJs1Be1zEVOLPpiS37Vupjfu3Whq32FEx-18F41LZOWwaZU3AH57cwQ2njXrPHqEdmQsFRDZibHCBCNg9zvX3437pSmOZzAY4bxEZ6o539WB_aGaCNOcJky52VC4YEJtFlKqxyF8RT_ciGzoUQ9ZiTLe1zrJdaod6xyg6P-z7Qaq4tS-C4eT7-U2HaLLv4-5zgmmJhEhaPyusQYcZViRpJcfjII2vpuODEShCeEvZ' },
  { id: 3, name: 'Dr. Elena Ross', email: 'elena.r@sehat.ai', role: 'Doctor', department: 'ICU', status: 'On Duty', avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDDATaMlS8UgoAPmjj3OeGfKNf_nP6eE5rv8iCuQ3Dn9iN0UYUgl-UgrgSBl-e6NPEiknGd4ZCcACajkQx5Um_7fvufnOyYdvF0NjkfLpFHoS8UrPik6IO6i-flEpoTpzFpIBq4sWwUh5oN094NUUBM1-ZEvEAnGE7-Uqw0efhNYDA42L1GdvgYoZaapPyZBWsMG8jQEq4jFXul-hobl3KMrkwNX0IutuplJnJ5zE1znx2dCwcucwTKbiN5nlceECpC05WQgyHxs8-j' },
  { id: 4, name: 'Mark Thompson', email: 'm.thompson@sehat.ai', role: 'Admin', department: 'General Admin', status: 'On Duty', avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDhP31TGHlUETlrzXAXoz1JnXdyIJK0hOPNAyEa6wAryQbsbU4N_1DmYBTGx7WZvXhOS6PiRvt-wvVfYBAgKK-7jOMoEoDVtB2hx5aSDSY_UJK0sjIy6jMGMLyuTNnrnXpu9R1Dqx0NVtr6Z0JfDeLqKufOj0H1QEncC9hajKuNfqIDTaxRLqyF9oD6-vlIC6B44-iH2QHLUr69ghoMxBFDqpBWtkQ_MpgkddUaEvPutwJd1UW9O9PvLUMwNOCQ9FkhKoM8wlIdGNTu' },
];

const initialActivities = [
  { id: 1, user: 'Dr. Sarah Ahmed', text: 'checked in for shift', time: '2 mins ago', icon: 'login', colorClass: 'bg-[#00b289]/20 text-[#00b289]' },
  { id: 2, user: 'James Wilson', text: 'submitted leave request', time: '15 mins ago', icon: 'event_note', colorClass: 'bg-amber-100 text-amber-600' },
  { id: 3, user: 'Shift Swap', text: 'approved for ER Dept', time: '1 hour ago', icon: 'sync', colorClass: 'bg-blue-100 text-blue-600' },
  { id: 4, user: 'Mark Thompson', text: 'onboarded as New Staff member', time: '3 hours ago', icon: 'person_add', colorClass: 'bg-emerald-100 text-emerald-600' },
];

const today = new Date();

export default function DoctorStaff() {
  const [staffList, setStaffList] = useState(initialStaff);
  const [activities, setActivities] = useState(initialActivities);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Dialog controls
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState(null);
  const [isAssignShiftOpen, setIsAssignShiftOpen] = useState(false);
  
  // Forms
  const emptyStaffForm = { name: '', email: '', role: 'Doctor', department: '', status: 'On Duty' };
  const [formData, setFormData] = useState(emptyStaffForm);
  const [shiftData, setShiftData] = useState({ date: format(today, 'yyyy-MM-dd'), type: 'Morning Shift (ER)', staffId: '' });

  // Schedules / Shifts
  const [shifts, setShifts] = useState([
    { id: 1, date: format(today, 'yyyy-MM-dd'), type: 'Morning Shift (ER)', time: '06:00 AM - 02:00 PM', count: 12, color: 'bg-[#00b289]' },
    { id: 2, date: format(today, 'yyyy-MM-dd'), type: 'Evening Shift (ICU)', time: '02:00 PM - 10:00 PM', count: 8, color: 'bg-blue-500' },
    { id: 3, date: format(addDays(today, 1), 'yyyy-MM-dd'), type: 'Morning Shift (ER)', time: '06:00 AM - 02:00 PM', count: 10, color: 'bg-[#00b289]' },
  ]);

  // Calendar State
  const [currentMonth, setCurrentMonth] = useState(today);
  const [selectedDate, setSelectedDate] = useState(today);

  // Derived Stats
  const totalStaff = staffList.length + 1280; // Baseline to show large number
  const onDutyCount = staffList.filter(s => s.status === 'On Duty').length + 452;
  const onLeaveCount = staffList.filter(s => s.status === 'Off Duty').length + 30;

  const filteredStaff = staffList.filter(s => 
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    s.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.department.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const logActivity = (user, text, icon, colorClass) => {
    setActivities(prev => [{
      id: Date.now(),
      user,
      text,
      time: 'Just now',
      icon,
      colorClass
    }, ...prev.slice(0, 5)]); // Keep max 6 items
  };

  const handleSaveStaff = (e) => {
    e.preventDefault();
    if (editingStaff) {
      setStaffList(staffList.map(s => s.id === editingStaff.id ? { ...s, ...formData } : s));
      logActivity(formData.name, 'updated profile information', 'sync', 'bg-blue-100 text-blue-600');
    } else {
      const newStaff = {
        ...formData,
        id: Date.now(),
        // Simple avatar fallback
        avatar: 'https://cdn-icons-png.flaticon.com/512/3774/3774299.png'
      };
      setStaffList([newStaff, ...staffList]);
      logActivity(newStaff.name, 'onboarded as New Staff member', 'person_add', 'bg-emerald-100 text-emerald-600');
    }
    setIsAddOpen(false);
    setIsEditOpen(false);
    setFormData(emptyStaffForm);
  };

  const openEdit = (staff) => {
    setEditingStaff(staff);
    setFormData({ name: staff.name, email: staff.email, role: staff.role, department: staff.department, status: staff.status });
    setIsEditOpen(true);
  };

  const deleteStaff = (id, name) => {
    setStaffList(staffList.filter(s => s.id !== id));
    logActivity(name, 'was removed from the directory', 'person_remove', 'bg-red-100 text-red-600');
  }

  const handleAssignShift = (e) => {
    e.preventDefault();
    const assignedStaff = staffList.find(s => s.id.toString() === shiftData.staffId);
    if (!assignedStaff) return;
    
    const existingShiftIndex = shifts.findIndex(s => s.date === shiftData.date && s.type === shiftData.type);
    
    let updatedShifts = [...shifts];
    if (existingShiftIndex >= 0) {
      updatedShifts[existingShiftIndex] = {
        ...updatedShifts[existingShiftIndex],
        count: updatedShifts[existingShiftIndex].count + 1
      };
    } else {
      updatedShifts.push({
        id: Date.now(),
        date: shiftData.date,
        type: shiftData.type,
        time: shiftData.type.includes('Morning') ? '06:00 AM - 02:00 PM' : shiftData.type.includes('Evening') ? '02:00 PM - 10:00 PM' : '10:00 PM - 06:00 AM',
        count: 1,
        color: shiftData.type.includes('Morning') ? 'bg-[#00b289]' : shiftData.type.includes('Evening') ? 'bg-blue-500' : 'bg-purple-500'
      });
    }
    setShifts(updatedShifts);
    logActivity(assignedStaff.name, `assigned to ${shiftData.type} on ${format(new Date(shiftData.date), 'MMM do')}`, 'event_available', 'bg-purple-100 text-purple-600');
    setIsAssignShiftOpen(false);
  };

  // Calendar render logic
  const renderCalendarDays = () => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart, { weekStartsOn: 1 });
    const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });

    const rows = [];
    let days = [];
    let day = startDate;

    while (day <= endDate) {
      for (let i = 0; i < 7; i++) {
        const cloneDay = day;
        const formattedDate = format(day, "d");
        const dayShifts = shifts.filter(s => s.date === format(cloneDay, 'yyyy-MM-dd'));
        const isSelected = isSameDay(day, selectedDate);
        const isCurMonth = isSameMonth(day, monthStart);
        
        days.push(
          <div 
            key={day.toString()} 
            className={`p-2 text-xs font-semibold relative cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg flex flex-col items-center
              ${!isCurMonth ? "text-slate-300 dark:text-slate-600" : "text-slate-700 dark:text-slate-300"}
              ${isSelected ? "bg-[#00b289] text-white hover:bg-[#00b289]/90 !text-white" : ""}
            `}
            onClick={() => setSelectedDate(cloneDay)}
          >
            <span>{formattedDate}</span>
            {dayShifts.length > 0 && (
              <div className="flex gap-0.5 mt-1">
                {dayShifts.map((s, idx) => (
                  <span key={idx} className={`w-1 h-1 rounded-full ${isSelected ? 'bg-white' : s.color}`}></span>
                ))}
              </div>
            )}
          </div>
        );
        day = addDays(day, 1);
      }
      rows.push(<div className="grid grid-cols-7 gap-1 text-center" key={day.toString()}>{days}</div>);
      days = [];
    }
    return rows;
  };

  const selectedDayShifts = shifts.filter(s => s.date === format(selectedDate, 'yyyy-MM-dd'));

  return (
    <div className="flex-1 overflow-y-auto w-full">
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-8 py-4 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-6 flex-1">
          <h2 className="text-xl font-bold">Staff Management</h2>
          <div className="relative w-full max-w-md">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">search</span>
            <input 
              className="w-full bg-slate-100 dark:bg-slate-800 border-none rounded-lg pl-10 pr-4 py-2 text-sm focus:ring-2 focus:ring-[#00b289]" 
              placeholder="Search staff by name, role or department..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              type="text"
            />
          </div>
        </div>
        <div className="flex items-center gap-4">
          <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
            <DialogTrigger asChild>
              <button className="bg-[#00b289] hover:bg-[#00b289]/90 transition-colors text-white px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2">
                <span className="material-symbols-outlined text-sm">add</span> Add New Staff
              </button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Add New Staff</DialogTitle>
                <DialogDescription>Enter staff member details to add them to the directory.</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSaveStaff}>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input id="name" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="e.g. Dr. Jane Smith" required />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input id="email" type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} placeholder="e.g. jane@sehat.ai" required />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="role">Role</Label>
                      <select id="role" className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm" value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})}>
                        <option>Doctor</option>
                        <option>Nurse</option>
                        <option>Admin</option>
                        <option>Technician</option>
                      </select>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="status">Status</Label>
                      <select id="status" className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm" value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})}>
                        <option>On Duty</option>
                        <option>Off Duty</option>
                      </select>
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="department">Department</Label>
                    <Input id="department" value={formData.department} onChange={e => setFormData({...formData, department: e.target.value})} placeholder="e.g. Cardiology" required />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setIsAddOpen(false)}>Cancel</Button>
                  <Button type="submit" className="bg-[#00b289] hover:bg-[#00b289]/90 text-white">Save Staff</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Edit Dialog - Hidden but controlled via state */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Staff Profile</DialogTitle>
            <DialogDescription>Update information for {editingStaff?.name}.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSaveStaff}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-name">Full Name</Label>
                <Input id="edit-name" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-email">Email Address</Label>
                <Input id="edit-email" type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="edit-role">Role</Label>
                  <select id="edit-role" className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm" value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})}>
                    <option>Doctor</option>
                    <option>Nurse</option>
                    <option>Admin</option>
                    <option>Technician</option>
                  </select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-status">Status</Label>
                  <select id="edit-status" className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm" value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})}>
                    <option>On Duty</option>
                    <option>Off Duty</option>
                  </select>
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-department">Department</Label>
                <Input id="edit-department" value={formData.department} onChange={e => setFormData({...formData, department: e.target.value})} required />
              </div>
            </div>
            <DialogFooter className="flex items-center justify-between sm:justify-between w-full">
               <button 
                type="button" 
                onClick={(e) => { e.preventDefault(); deleteStaff(editingStaff.id, editingStaff.name); setIsEditOpen(false); }}
                className="text-red-500 hover:text-red-700 text-sm font-semibold flex items-center"
               >
                 <span className="material-symbols-outlined text-sm mr-1">delete</span> Remove User
               </button>
               <div className="flex gap-2">
                <Button type="button" variant="outline" onClick={() => setIsEditOpen(false)}>Cancel</Button>
                <Button type="submit" className="bg-[#00b289] hover:bg-[#00b289]/90 text-white">Save Changes</Button>
               </div>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <div className="p-8 space-y-8">
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <p className="text-slate-500 text-sm font-medium">Total Staff</p>
            <div className="flex items-end justify-between mt-2">
              <h3 className="text-3xl font-bold">{totalStaff.toLocaleString()}</h3>
              <span className="text-emerald-500 text-sm font-medium flex items-center">+12% <span className="material-symbols-outlined text-xs">arrow_upward</span></span>
            </div>
          </div>
          <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <p className="text-slate-500 text-sm font-medium">On-Duty Now</p>
            <div className="flex items-end justify-between mt-2">
              <h3 className="text-3xl font-bold">{onDutyCount.toLocaleString()}</h3>
              <span className="text-emerald-500 text-sm font-medium flex items-center">+5% <span className="material-symbols-outlined text-xs">arrow_upward</span></span>
            </div>
          </div>
          <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <p className="text-slate-500 text-sm font-medium">Staff on Leave</p>
            <div className="flex items-end justify-between mt-2">
              <h3 className="text-3xl font-bold">{onLeaveCount}</h3>
              <span className="text-rose-500 text-sm font-medium flex items-center">-2% <span className="material-symbols-outlined text-xs">arrow_downward</span></span>
            </div>
          </div>
          <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <p className="text-slate-500 text-sm font-medium">Avg Shift Length</p>
            <div className="flex items-end justify-between mt-2">
              <h3 className="text-3xl font-bold">8.5 hrs</h3>
              <span className="text-emerald-500 text-sm font-medium flex items-center">+0.2% <span className="material-symbols-outlined text-xs">arrow_upward</span></span>
            </div>
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col h-[700px]">
            <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between shrink-0">
              <h4 className="font-bold">Staff Directory</h4>
              <span className="text-slate-400 text-sm font-medium">{filteredStaff.length} Member{filteredStaff.length !== 1 ? 's' : ''} Found</span>
            </div>
            <div className="overflow-x-auto flex-1 h-full">
              <table className="w-full text-left border-collapse">
                <thead className="sticky top-0 z-10 bg-slate-50 dark:bg-slate-800">
                  <tr className="text-slate-500 text-xs uppercase tracking-wider font-semibold border-b border-slate-200 dark:border-slate-700">
                    <th className="px-6 py-4 bg-slate-50 dark:bg-slate-800">Staff Name</th>
                    <th className="px-6 py-4 bg-slate-50 dark:bg-slate-800">Role</th>
                    <th className="px-6 py-4 bg-slate-50 dark:bg-slate-800">Department</th>
                    <th className="px-6 py-4 bg-slate-50 dark:bg-slate-800">Status</th>
                    <th className="px-6 py-4 bg-slate-50 dark:bg-slate-800">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredStaff.length === 0 ? (
                    <tr><td colSpan="5" className="p-8 text-center text-slate-500">No staff matches your search query.</td></tr>
                  ) : filteredStaff.map(staff => (
                    <tr key={staff.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <img className="w-10 h-10 rounded-full object-cover" alt={`${staff.name} avatar`} src={staff.avatar} />
                          <div>
                            <p className="font-semibold text-sm">{staff.name}</p>
                            <p className="text-xs text-slate-500">{staff.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold uppercase ${
                          staff.role === 'Doctor' ? 'bg-[#00b289]/10 text-[#00b289]' : 
                          staff.role === 'Nurse' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600' : 
                          'bg-slate-100 dark:bg-slate-800 text-slate-600'
                        }`}>
                          {staff.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm">{staff.department}</td>
                      <td className="px-6 py-4">
                        <span className={`flex items-center gap-1.5 text-xs font-medium ${staff.status === 'On Duty' ? 'text-emerald-600' : 'text-slate-400'}`}>
                          <span className={`w-2 h-2 rounded-full ${staff.status === 'On Duty' ? 'bg-emerald-500' : 'bg-slate-300'}`}></span> {staff.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <button onClick={() => openEdit(staff)} className="text-slate-400 hover:text-[#00b289] transition-colors p-2 hover:bg-[#00b289]/10 rounded-full flex items-center justify-center">
                          <span className="material-symbols-outlined text-sm">edit</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="space-y-8">
            {/* Scheduling Calendar */}
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
              <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <h4 className="font-bold text-sm">Staff Schedule</h4>
                <div className="flex items-center gap-2">
                  <Dialog open={isAssignShiftOpen} onOpenChange={setIsAssignShiftOpen}>
                    <DialogTrigger asChild>
                      <button className="text-[10px] font-bold bg-[#00b289]/10 text-[#00b289] px-2 py-1 rounded uppercase tracking-wider hover:bg-[#00b289]/20 transition-colors">
                        Assign
                      </button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Assign Shift</DialogTitle>
                        <DialogDescription>Assign a staff member to a shift slot.</DialogDescription>
                      </DialogHeader>
                      <form onSubmit={handleAssignShift}>
                        <div className="grid gap-4 py-4">
                          <div className="grid gap-2">
                            <Label>Staff Member</Label>
                            <select required className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm" value={shiftData.staffId} onChange={e => setShiftData({...shiftData, staffId: e.target.value})}>
                              <option value="" disabled>Select Staff</option>
                              {staffList.map(s => (
                                <option key={s.id} value={s.id}>{s.name} ({s.role})</option>
                              ))}
                            </select>
                          </div>
                          <div className="grid gap-2">
                            <Label>Date</Label>
                            <Input required type="date" value={shiftData.date} onChange={e => setShiftData({...shiftData, date: e.target.value})} />
                          </div>
                          <div className="grid gap-2">
                            <Label>Shift Block</Label>
                            <select required className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm" value={shiftData.type} onChange={e => setShiftData({...shiftData, type: e.target.value})}>
                              <option>Morning Shift (ER)</option>
                              <option>Evening Shift (ICU)</option>
                              <option>Night Shift (Ward)</option>
                            </select>
                          </div>
                        </div>
                        <DialogFooter>
                          <Button type="submit" className="bg-[#00b289] text-white">Save Assignment</Button>
                        </DialogFooter>
                      </form>
                    </DialogContent>
                  </Dialog>
                  
                  <div className="flex items-center gap-1 border-l pl-2">
                    <button onClick={() => setCurrentMonth(subMonths(currentMonth, 1))} className="p-1 hover:bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-center">
                      <span className="material-symbols-outlined text-sm">chevron_left</span>
                    </button>
                    <span className="text-xs font-medium uppercase tracking-tight w-20 text-center">{format(currentMonth, 'MMM yyyy')}</span>
                    <button onClick={() => setCurrentMonth(addMonths(currentMonth, 1))} className="p-1 hover:bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-center">
                      <span className="material-symbols-outlined text-sm">chevron_right</span>
                    </button>
                  </div>
                </div>
              </div>
              <div className="p-4">
                <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-bold text-slate-400 mb-2">
                  <span>MO</span><span>TU</span><span>WE</span><span>TH</span><span>FR</span><span>SA</span><span>SU</span>
                </div>
                {renderCalendarDays()}
                
                <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
                  <p className="text-[10px] font-bold text-slate-400 uppercase flex justify-between">
                    Shifts for {format(selectedDate, 'MMM do')}
                  </p>
                  
                  {selectedDayShifts.length === 0 ? (
                    <p className="text-xs text-slate-500 italic p-2 text-center">No shifts scheduled</p>
                  ) : (
                    selectedDayShifts.map(shift => (
                      <div key={shift.id} className="flex items-center gap-3">
                        <div className={`w-1 h-8 ${shift.color} rounded-full`}></div>
                        <div className="flex-1">
                          <p className="text-xs font-bold leading-none text-slate-700">{shift.type}</p>
                          <p className="text-[10px] text-slate-500 mt-1">{shift.time}</p>
                        </div>
                        <span className="text-[10px] bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded font-medium">{shift.count} Staff</span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Activities */}
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
              <div className="p-4 border-b border-slate-200 dark:border-slate-800">
                <h4 className="font-bold text-sm">Recent Staff Activity</h4>
              </div>
              <div className="p-4 space-y-4">
                {activities.map(act => (
                  <div key={act.id} className="flex gap-3">
                    <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${act.colorClass}`}>
                      <span className="material-symbols-outlined text-base leading-none">{act.icon}</span>
                    </div>
                    <div>
                      <p className="text-xs text-slate-700"><span className="font-bold">{act.user}</span> {act.text}</p>
                      <p className="text-[10px] text-slate-500 mt-0.5">{act.time}</p>
                    </div>
                  </div>
                ))}
              </div>
              <button className="w-full py-3 text-[10px] font-bold text-slate-400 hover:text-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 transition-colors uppercase tracking-widest">
                View Load History
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
