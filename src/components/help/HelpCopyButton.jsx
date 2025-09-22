import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Copy, Check } from 'lucide-react';
import { toast } from 'sonner';

export default function HelpCopyButton({ textToCopy }) {
  const [isCopied, setIsCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(textToCopy).then(() => {
      setIsCopied(true);
      toast.success("Copied to clipboard!");
      setTimeout(() => setIsCopied(false), 2000);
    }, () => {
      toast.error("Failed to copy.");
    });
  };

  return (
    <Button
      size="icon"
      variant="ghost"
      className="absolute top-2 right-2 h-7 w-7 text-slate-400 hover:bg-slate-700 hover:text-white"
      onClick={handleCopy}
    >
      {isCopied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
    </Button>
  );
}