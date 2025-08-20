import React from 'react';
import { Button } from '@/components/ui/button';
import { Image, Camera, FileText, Paperclip } from 'lucide-react';
import { AttachmentType } from '@/types';

interface AttachmentMenuProps {
    onAttachment: (type: AttachmentType) => void;
    fileInputRef: React.RefObject<HTMLInputElement>;
}

const AttachmentMenu: React.FC<AttachmentMenuProps> = React.memo(({ onAttachment, fileInputRef }) => (
    <div className="absolute bottom-16 left-2 bg-popover border rounded-lg shadow-lg p-2 animate-in slide-in-from-bottom-2">
        <div className="grid grid-cols-2 gap-2 w-48">
            <Button
                variant="ghost"
                size="sm"
                onClick={() => onAttachment('photo')}
                className="flex items-center gap-2 justify-start h-10"
            >
                <Image className="h-4 w-4 text-blue-500" />
                <span className="text-sm">Photo</span>
            </Button>
            <Button
                variant="ghost"
                size="sm"
                onClick={() => onAttachment('camera')}
                className="flex items-center gap-2 justify-start h-10"
            >
                <Camera className="h-4 w-4 text-green-500" />
                <span className="text-sm">Camera</span>
            </Button>
            <Button
                variant="ghost"
                size="sm"
                onClick={() => onAttachment('document')}
                className="flex items-center gap-2 justify-start h-10"
            >
                <FileText className="h-4 w-4 text-orange-500" />
                <span className="text-sm">Document</span>
            </Button>
            <Button
                variant="ghost"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-2 justify-start h-10"
            >
                <Paperclip className="h-4 w-4 text-purple-500" />
                <span className="text-sm">File</span>
            </Button>
        </div>
    </div>
));

AttachmentMenu.displayName = 'AttachmentMenu';

export default AttachmentMenu;