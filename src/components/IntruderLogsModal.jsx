import React from 'react';
import { X, ShieldAlert, Trash2, Clock, Camera } from 'lucide-react';

export default function IntruderLogsModal({ isOpen, onClose, intruderLogs, onDeleteLog }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#36271C]/75 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-xl bg-[#FDFBF7] border-2 border-rose-300 rounded-3xl shadow-2xl overflow-hidden max-h-[85vh] flex flex-col p-6">
        
        {/* Tape Strip */}
        <div className="tape-strip"></div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-[#9E8B75] hover:text-[#36271C] p-1.5 rounded-full hover:bg-[#EFE9DE] transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 pb-4 border-b border-[#E2D7C7]">
          <div className="w-12 h-12 rounded-full bg-rose-100 border border-rose-300 flex items-center justify-center text-rose-700 shrink-0">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold font-serif-vintage text-[#36271C]">
              Intruder Security Logs ({intruderLogs.length})
            </h2>
            <p className="text-xs text-[#9E8B75]">
              Photos captured automatically after 3 failed passcode attempts
            </p>
          </div>
        </div>

        {/* Intruder Snapshots Grid */}
        <div className="py-4 overflow-y-auto space-y-4 flex-1">
          {intruderLogs.length > 0 ? (
            intruderLogs.map((log) => (
              <div
                key={log.id}
                className="bg-[#FAF5EC] border border-[#E2D7C7] p-4 rounded-2xl flex flex-col sm:flex-row items-center gap-4 shadow-sm"
              >
                {/* Captured Photo */}
                {log.photoDataUrl ? (
                  <img
                    src={log.photoDataUrl}
                    alt="Intruder Snapshot"
                    className="w-32 h-32 object-cover rounded-xl border-2 border-white shadow-md shrink-0 bg-black"
                  />
                ) : (
                  <div className="w-32 h-32 rounded-xl bg-gray-200 border-2 border-white flex flex-col items-center justify-center text-gray-500 text-xs text-center p-2 shrink-0">
                    <Camera className="w-6 h-6 mb-1 text-gray-400" />
                    <span>Camera Blocked</span>
                  </div>
                )}

                {/* Info & Delete */}
                <div className="flex-1 space-y-2 text-center sm:text-left">
                  <div className="inline-flex items-center gap-1.5 bg-rose-100 text-rose-800 text-[11px] font-bold px-2.5 py-0.5 rounded-full border border-rose-200">
                    <ShieldAlert className="w-3 h-3" />
                    <span>3 Failed Attempts Captured</span>
                  </div>

                  <div className="text-xs text-[#4A3B2C] space-y-1">
                    <p className="flex items-center justify-center sm:justify-start gap-1 font-mono font-semibold text-[#8B0000]">
                      <Clock className="w-3.5 h-3.5 text-[#C86D51]" />
                      <span>{log.timestampPHT}</span>
                    </p>
                  </div>

                  <button
                    onClick={() => onDeleteLog(log.id)}
                    className="inline-flex items-center gap-1.5 text-xs text-rose-700 hover:text-rose-900 font-bold hover:underline pt-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete Snapshot Log</span>
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="p-8 text-center text-[#9E8B75] space-y-2">
              <ShieldAlert className="w-10 h-10 mx-auto text-emerald-600 opacity-60" />
              <p className="font-bold text-sm text-[#36271C]">No Security Alerts</p>
              <p className="text-xs">Your vault is safe! Zero intruder attempts recorded.</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-[#E2D7C7] text-right">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-[#A83232] hover:bg-[#8B0000] text-[#F8E3B6] text-xs font-bold rounded-xl shadow transition-colors"
          >
            Close Security Logs
          </button>
        </div>

      </div>
    </div>
  );
}
