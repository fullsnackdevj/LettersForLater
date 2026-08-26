import React, { useState } from 'react';
import { 
  X, 
  Plus, 
  Check, 
  Trash2, 
  Edit3, 
  Lock, 
  Sparkles, 
  Archive, 
  RotateCcw, 
  ListTodo, 
  ArrowLeft,
  AlertTriangle
} from 'lucide-react';
import { getNickname } from '../utils/nicknames';

export default function BucketListModal({
  isOpen,
  onClose,
  bucketItems = [],
  currentUser,
  pairInfo,
  onSaveItem,
  onDeleteItem
}) {
  const currentUserId = currentUser?.uid || 'demo-user-1';
  const currentUserName = getNickname(currentUser?.displayName) || 'You';
  const user2Name = getNickname(pairInfo?.user2?.name) || 'Partner';
  const partnerName = currentUserName === user2Name ? 'Jay' : user2Name;

  // Active Tab: current user's list OR partner's list
  const [activeUserTab, setActiveUserTab] = useState(currentUserId);
  const isMyTab = activeUserTab === currentUserId;

  // View Mode: 'active' | 'archived'
  const [viewMode, setViewMode] = useState('active');

  // New item adding state
  const [newTitle, setNewTitle] = useState('');
  const [isSavingNew, setIsSavingNew] = useState(false);

  // Inline editing state
  const [editingItemId, setEditingItemId] = useState(null);
  const [editingTitle, setEditingTitle] = useState('');
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  // Delete Confirmation Dialog State
  const [itemToDelete, setItemToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  if (!isOpen) return null;

  // Filter items belonging to the active user tab
  const activeUserItems = bucketItems.filter(item => {
    if (activeUserTab === currentUserId) {
      return item.createdBy === currentUserId || !item.createdBy;
    } else {
      return item.createdBy !== currentUserId;
    }
  });

  // Active (unarchived) vs Archived items
  const activeItems = activeUserItems.filter(i => !i.isArchived);
  const archivedItems = activeUserItems.filter(i => i.isArchived);

  // Counts
  const totalMyItems = bucketItems.filter(i => (i.createdBy === currentUserId || !i.createdBy) && !i.isArchived).length;
  const doneMyItems = bucketItems.filter(i => (i.createdBy === currentUserId || !i.createdBy) && i.isCompleted && !i.isArchived).length;
  const archivedMyItems = bucketItems.filter(i => (i.createdBy === currentUserId || !i.createdBy) && i.isArchived).length;

  const totalPartnerItems = bucketItems.filter(i => i.createdBy && i.createdBy !== currentUserId && !i.isArchived).length;
  const donePartnerItems = bucketItems.filter(i => i.createdBy && i.createdBy !== currentUserId && i.isCompleted && !i.isArchived).length;
  const archivedPartnerItems = bucketItems.filter(i => i.createdBy && i.createdBy !== currentUserId && i.isArchived).length;

  const currentArchivedCount = isMyTab ? archivedMyItems : archivedPartnerItems;

  const displayedItems = viewMode === 'archived' ? archivedItems : activeItems;

  const handleAddItem = async (e) => {
    e?.preventDefault();
    const text = newTitle.trim();
    if (!text || !isMyTab || isSavingNew) return;

    setIsSavingNew(true);
    try {
      await onSaveItem({
        title: text,
        isCompleted: false,
        isArchived: false,
        createdBy: currentUserId,
        createdByName: currentUser?.displayName || 'Jay'
      });
      setNewTitle('');
    } catch (err) {
      console.error('Error adding bucket item:', err);
    } finally {
      setIsSavingNew(false);
    }
  };

  const handleStartEdit = (item, e) => {
    e?.stopPropagation();
    setEditingItemId(item.id);
    setEditingTitle(item.title || '');
  };

  const handleCancelEdit = () => {
    setEditingItemId(null);
    setEditingTitle('');
  };

  const handleSaveEdit = async (item, e) => {
    e?.preventDefault();
    e?.stopPropagation();
    const text = editingTitle.trim();
    if (!text || !isMyTab || isSavingEdit) return;

    setIsSavingEdit(true);
    try {
      await onSaveItem({
        ...item,
        title: text
      });
      setEditingItemId(null);
      setEditingTitle('');
    } catch (err) {
      console.error('Error updating bucket item:', err);
    } finally {
      setIsSavingEdit(false);
    }
  };

  const handleToggleCompleted = async (item) => {
    if (!isMyTab || editingItemId === item.id) return; // Cannot toggle while editing or if partner's
    try {
      await onSaveItem({
        ...item,
        isCompleted: !item.isCompleted
      });
    } catch (err) {
      console.error('Error toggling bucket item:', err);
    }
  };

  const handleArchive = async (item, e) => {
    e?.stopPropagation();
    if (!isMyTab) return;
    try {
      await onSaveItem({
        ...item,
        isCompleted: true,
        isArchived: true
      });
    } catch (err) {
      console.error('Error archiving bucket item:', err);
    }
  };

  const handleUnarchive = async (item, e) => {
    e?.stopPropagation();
    if (!isMyTab) return;
    try {
      await onSaveItem({
        ...item,
        isArchived: false
      });
    } catch (err) {
      console.error('Error unarchiving bucket item:', err);
    }
  };

  const handleConfirmDelete = async () => {
    if (!itemToDelete || !isMyTab || isDeleting) return;
    setIsDeleting(true);
    try {
      await onDeleteItem(itemToDelete.id);
      setItemToDelete(null);
    } catch (err) {
      console.error('Error deleting bucket item:', err);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-[#36271C]/75 backdrop-blur-md overflow-y-auto animate-fadeIn select-none"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-2xl bg-[#FAF6EE] border-2 border-[#D2C3B0] rounded-3xl shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col font-sans"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Top Header Strip */}
        <div className="bg-[#F3EDE0] border-b border-[#E2D7C7] px-4 sm:px-6 py-3.5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="wax-seal w-9 h-9 sm:w-10 sm:h-10 text-base shrink-0 shadow-md">
              ✨
            </div>
            <div>
              <h2 className="font-serif-vintage font-bold text-lg sm:text-xl text-[#36271C]">
                Our Fantasy / Bucket List
              </h2>
              <p className="text-xs text-[#7A6855] -mt-0.5">
                Dreams, adventures & wishes to check off together
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="text-[#9E8B75] hover:text-[#36271C] p-2 rounded-full hover:bg-[#EAE2D3] transition-colors cursor-pointer shrink-0"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 2 Partner Switcher Tabs + Top Right Archive Filter Icon */}
        <div className="bg-[#EDE5D6] px-4 sm:px-6 py-2.5 border-b border-[#D8CCBA] flex items-center justify-between gap-2 shrink-0">
          
          {/* Partner Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto">
            {/* Tab 1: Current User */}
            <button
              type="button"
              onClick={() => {
                setActiveUserTab(currentUserId);
                handleCancelEdit();
              }}
              className={`flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-2xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
                isMyTab
                  ? 'bg-[#36271C] text-[#FDFBF7] shadow-md'
                  : 'bg-[#FAF5EC]/70 text-[#5C4A3A] hover:bg-[#FAF5EC]'
              }`}
            >
              <span>{currentUserName}'s List</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                isMyTab ? 'bg-[#5A4535] text-[#FDFBF7]' : 'bg-[#E2D7C7] text-[#5C4A3A]'
              }`}>
                {doneMyItems}/{totalMyItems}
              </span>
            </button>

            {/* Tab 2: Partner */}
            <button
              type="button"
              onClick={() => {
                setActiveUserTab('partner-tab');
                handleCancelEdit();
              }}
              className={`flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-2xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
                !isMyTab
                  ? 'bg-[#A83232] text-[#F8E3B6] shadow-md'
                  : 'bg-[#FAF5EC]/70 text-[#5C4A3A] hover:bg-[#FAF5EC]'
              }`}
            >
              <span>{partnerName}'s List</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                !isMyTab ? 'bg-[#8B0000] text-[#F8E3B6]' : 'bg-[#E2D7C7] text-[#5C4A3A]'
              }`}>
                {donePartnerItems}/{totalPartnerItems}
              </span>
            </button>
          </div>

          {/* Top Right: Archive / Accomplished Button */}
          <button
            type="button"
            onClick={() => {
              setViewMode(prev => prev === 'archived' ? 'active' : 'archived');
              handleCancelEdit();
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-2xl text-xs font-bold transition-all cursor-pointer border shrink-0 ${
              viewMode === 'archived'
                ? 'bg-amber-800 text-white border-amber-900 shadow-sm'
                : currentArchivedCount > 0
                  ? 'bg-[#FAF5EC] hover:bg-amber-50 text-amber-900 border-amber-300 shadow-xs hover:scale-105'
                  : 'bg-[#FAF5EC]/60 text-[#9E8B75] border-[#D2C3B0]/60 opacity-60 hover:opacity-100'
            }`}
            title={viewMode === 'archived' ? 'Switch to Active List' : 'View Accomplished Archive'}
          >
            {viewMode === 'archived' ? (
              <>
                <ListTodo className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Active List</span>
              </>
            ) : (
              <>
                <Archive className="w-3.5 h-3.5 text-amber-700" />
                <span className="hidden sm:inline">Archive</span>
              </>
            )}
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold ${
              viewMode === 'archived' ? 'bg-amber-950 text-white' : 'bg-amber-100 text-amber-900'
            }`}>
              {currentArchivedCount}
            </span>
          </button>

        </div>

        {/* Lined Notebook Paper Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto max-h-[60vh] sm:max-h-[65vh] p-4 sm:p-6 space-y-4 lined-notebook-sheet">
          
          {/* Quick Input: Only on user's own tab & when in active view mode */}
          {isMyTab && viewMode === 'active' && (
            <form onSubmit={handleAddItem} className="flex items-center gap-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="+ Add a new item to your list..."
                  className="w-full bg-white/95 border border-[#D2C3B0] focus:border-[#A83232] rounded-2xl px-4 py-2.5 text-xs sm:text-sm text-[#36271C] placeholder-[#9E8B75] focus:outline-none shadow-xs transition-all font-medium"
                  maxLength={160}
                />
              </div>
              <button
                type="submit"
                disabled={!newTitle.trim() || isSavingNew}
                className="px-4 sm:px-5 py-2.5 rounded-2xl bg-[#A83232] hover:bg-[#8B0000] text-[#F8E3B6] font-bold text-xs shadow-md transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{isSavingNew ? 'Adding...' : 'Add List'}</span>
              </button>
            </form>
          )}

          {/* Subheader banner if in archived view mode */}
          {viewMode === 'archived' && (
            <div className="bg-amber-50/90 border border-amber-200 rounded-2xl p-2.5 sm:p-3 flex items-center justify-between gap-2 shadow-xs">
              <div className="flex items-center gap-2 text-xs font-bold text-amber-950">
                <Archive className="w-4 h-4 text-amber-700 shrink-0" />
                <span>Accomplished Archive ({archivedItems.length})</span>
              </div>
              <button
                type="button"
                onClick={() => setViewMode('active')}
                className="text-xs text-amber-800 hover:text-amber-950 font-semibold flex items-center gap-1 hover:underline cursor-pointer"
              >
                <ArrowLeft className="w-3 h-3" />
                <span>Back to Active List</span>
              </button>
            </div>
          )}

          {/* Partner View Only Banner */}
          {!isMyTab && (
            <div className="bg-[#FAF5EC]/90 border border-[#D4AF37]/40 rounded-2xl p-2.5 text-center text-xs text-[#7A6855] flex items-center justify-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-[#AA7C11]" />
              <span>You are viewing <strong>{partnerName}'s</strong> list (Read-Only)</span>
            </div>
          )}

          {/* Checklist Items List */}
          <div className="space-y-2 pt-1">
            {displayedItems.map((item, index) => {
              const isEditingThis = editingItemId === item.id;
              const isDone = item.isCompleted;

              return (
                <div
                  key={item.id || index}
                  className={`group flex items-center justify-between gap-3 p-3 rounded-2xl transition-all ${
                    isDone 
                      ? 'bg-[#FAF5EC]/70 border border-[#D8CCBA]' 
                      : 'bg-white/90 hover:bg-white border border-[#E2D7C7] shadow-xs'
                  }`}
                >
                  {/* Normal Display Mode */}
                  {!isEditingThis ? (
                    <>
                      {/* Checkbox + Title */}
                      <div
                        onClick={() => handleToggleCompleted(item)}
                        className={`flex items-center gap-3 flex-1 min-w-0 ${
                          isMyTab ? 'cursor-pointer' : 'cursor-default'
                        }`}
                      >
                        <button
                          type="button"
                          disabled={!isMyTab}
                          className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 transition-colors ${
                            isDone
                              ? 'bg-emerald-600 border-emerald-700 text-white'
                              : 'border-[#9E8B75] bg-white hover:border-[#36271C]'
                          }`}
                        >
                          {isDone && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                        </button>

                        <span className={`text-xs sm:text-sm font-medium leading-relaxed break-words ${
                          isDone
                            ? 'line-through text-[#8C7A67]'
                            : 'text-[#36271C]'
                        }`}>
                          {item.title}
                        </span>
                      </div>

                      {/* Action Buttons */}
                      {isMyTab && (
                        <div className="flex items-center gap-1 shrink-0 opacity-90 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                          
                          {/* When in Active View: */}
                          {viewMode === 'active' && (
                            <>
                              {/* If CHECKED (Done): Show ONLY the Archive icon (hide edit and delete) */}
                              {isDone ? (
                                <button
                                  type="button"
                                  onClick={(e) => handleArchive(item, e)}
                                  className="text-amber-800 hover:text-amber-950 bg-amber-100 hover:bg-amber-200 border border-amber-300 px-2.5 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shadow-xs font-bold text-xs"
                                  title="Archive to Accomplished"
                                >
                                  <Archive className="w-3.5 h-3.5 text-amber-800" />
                                  <span>Archive</span>
                                </button>
                              ) : (
                                /* If UNCHECKED: Show Edit & Delete */
                                <>
                                  {/* Edit Button */}
                                  <button
                                    type="button"
                                    onClick={(e) => handleStartEdit(item, e)}
                                    className="text-[#7A6855] hover:text-[#36271C] p-1.5 rounded-lg hover:bg-[#EFE9DE] transition-colors cursor-pointer"
                                    title="Edit item"
                                  >
                                    <Edit3 className="w-3.5 h-3.5" />
                                  </button>

                                  {/* Delete Button */}
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setItemToDelete(item);
                                    }}
                                    className="text-[#9E8B75] hover:text-rose-600 p-1.5 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                                    title="Delete item"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </>
                              )}
                            </>
                          )}

                          {/* When in Archived View: Show Restore & Delete */}
                          {viewMode === 'archived' && (
                            <>
                              <button
                                type="button"
                                onClick={(e) => handleUnarchive(item, e)}
                                className="text-emerald-700 hover:text-emerald-900 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-2.5 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shadow-xs font-bold text-xs"
                                title="Restore to Active List"
                              >
                                <RotateCcw className="w-3.5 h-3.5" />
                                <span>Restore</span>
                              </button>

                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setItemToDelete(item);
                                }}
                                className="text-[#9E8B75] hover:text-rose-600 p-1.5 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                                title="Delete item"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </>
                          )}
                        </div>
                      )}
                    </>
                  ) : (
                    /* Inline Editing Mode */
                    <form 
                      onSubmit={(e) => handleSaveEdit(item, e)}
                      className="flex items-center gap-2 w-full"
                    >
                      <input
                        type="text"
                        autoFocus
                        value={editingTitle}
                        onChange={(e) => setEditingTitle(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Escape') handleCancelEdit();
                        }}
                        className="flex-1 bg-white border border-[#A83232] rounded-xl px-3 py-1.5 text-xs sm:text-sm text-[#36271C] focus:outline-none font-medium"
                        maxLength={160}
                      />
                      <button
                        type="submit"
                        disabled={!editingTitle.trim() || isSavingEdit}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1 shadow-xs transition-colors cursor-pointer shrink-0"
                        title="Save changes"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>{isSavingEdit ? '...' : 'Save'}</span>
                      </button>
                      <button
                        type="button"
                        onClick={handleCancelEdit}
                        className="px-2.5 py-1.5 bg-[#FAF5EC] hover:bg-[#EAE2D3] text-[#5C4A3A] border border-[#D2C3B0] rounded-xl text-xs font-semibold transition-colors cursor-pointer shrink-0"
                        title="Cancel editing"
                      >
                        Cancel
                      </button>
                    </form>
                  )}
                </div>
              );
            })}

            {displayedItems.length === 0 && (
              <div className="text-center py-10 space-y-1.5">
                <p className="text-sm font-serif-vintage text-[#5C4A3A] font-bold">
                  {viewMode === 'archived'
                    ? "No archived items yet."
                    : isMyTab 
                      ? "Your list is waiting!" 
                      : `${partnerName} has no items.`}
                </p>
                <p className="text-xs text-[#9E8B75]">
                  {viewMode === 'archived'
                    ? "When you check an item in your list, tap Archive to store it here! ✨"
                    : isMyTab 
                      ? "Add trips, experiences, and sweet wishes above ✨" 
                      : "Check back later to see what they add 💕"}
                </p>
              </div>
            )}
          </div>

        </div>

        {/* Footer Note */}
        <div className="bg-[#F3EDE0] border-t border-[#E2D7C7] px-4 sm:px-6 py-3 flex items-center justify-between text-xs text-[#7A6855] shrink-0 font-medium">
          <span>
            {isMyTab 
              ? `You've checked off ${doneMyItems} of ${totalMyItems} active goals (${archivedMyItems} archived)`
              : `${partnerName} has checked off ${donePartnerItems} of ${totalPartnerItems} active goals (${archivedPartnerItems} archived)`
            }
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 bg-[#FAF5EC] hover:bg-[#EFE9DE] border border-[#D2C3B0] text-[#4A3B2C] font-bold rounded-xl text-xs transition-colors cursor-pointer"
          >
            Done
          </button>
        </div>

      </div>

      {/* Delete Confirmation Dialog Modal */}
      {itemToDelete && (
        <div 
          className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn select-none"
          onClick={(e) => {
            e.stopPropagation();
            setItemToDelete(null);
          }}
        >
          <div 
            className="w-full max-w-sm bg-[#FAF6EE] border-2 border-[#D4AF37]/50 rounded-3xl p-5 sm:p-6 shadow-2xl space-y-4 animate-scaleUp"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 text-rose-700">
              <div className="w-10 h-10 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold font-serif-vintage text-[#36271C]">
                  Delete Bucket Item?
                </h3>
                <p className="text-xs text-[#9E8B75]">
                  This action cannot be undone.
                </p>
              </div>
            </div>

            <div className="bg-white/80 border border-[#E2D7C7] p-3 rounded-2xl">
              <p className="text-xs text-[#5C4A3A] font-medium break-words italic">
                "{itemToDelete.title}"
              </p>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setItemToDelete(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-[#5C4A3A] bg-[#FAF5EC] hover:bg-[#EAE2D3] border border-[#D2C3B0] transition-colors cursor-pointer disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={handleConfirmDelete}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 shadow-md transition-colors cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{isDeleting ? 'Deleting...' : 'Delete'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
