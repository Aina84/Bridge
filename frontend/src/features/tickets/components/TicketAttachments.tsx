import React from 'react';
import { Paperclip, Download, FileIcon } from 'lucide-react';
import type { Attachment } from '@/types/ticket.types';

interface Props {
    attachments: Attachment[];
}

export const TicketAttachments: React.FC<Props> = ({ attachments }) => {
    if (!attachments || attachments.length === 0) return null;

    const formatFileSize = (bytes: number) => {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
    };

    return (
        <div className="space-y-2 mt-4">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                <Paperclip className="h-3.5 w-3.5" />
                Pièces jointes ({attachments.length})
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {attachments.map((file) => (
                    <a
                        key={file.id}
                        href={file.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 p-2 rounded-lg border border-slate-200 bg-white hover:border-primary-300 hover:bg-primary-50 transition-all group"
                    >
                        <div className="h-8 w-8 rounded bg-slate-100 flex items-center justify-center text-slate-500 group-hover:bg-primary-100 group-hover:text-primary-600 transition-colors">
                            <FileIcon className="h-4 w-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-slate-700 truncate group-hover:text-primary-700 transition-colors">
                                {file.fileName}
                            </p>
                            <p className="text-[10px] text-slate-400">
                                {formatFileSize(file.fileSize)}
                            </p>
                        </div>
                        <Download className="h-3.5 w-3.5 text-slate-300 group-hover:text-primary-400 transition-colors shrink-0" />
                    </a>
                ))}
            </div>
        </div>
    );
};
