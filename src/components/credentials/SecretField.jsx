import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Eye, EyeOff, Copy, Save } from 'lucide-react';
import { toast } from 'sonner';

export default function SecretField({ 
  label, 
  value = '', 
  onChange, 
  onReveal, 
  isRevealed = false, 
  isRequired = false,
  placeholder = '',
  description = ''
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value);

  const maskValue = (val) => {
    if (!val) return '';
    if (val.length <= 4) return '•'.repeat(val.length);
    return val.slice(0, 2) + '•'.repeat(Math.max(val.length - 4, 4)) + val.slice(-2);
  };

  const handleReveal = () => {
    onReveal?.();
  };

  const handleCopy = async () => {
    if (!isRevealed) {
      toast.error('Value must be revealed before copying');
      return;
    }
    
    try {
      await navigator.clipboard.writeText(value);
      toast.success('Copied to clipboard');
    } catch (error) {
      toast.error('Failed to copy to clipboard');
    }
  };

  const handleEdit = () => {
    setEditValue(value);
    setIsEditing(true);
  };

  const handleSave = () => {
    onChange?.(editValue);
    setIsEditing(false);
    toast.success('Value updated');
  };

  const handleCancel = () => {
    setEditValue(value);
    setIsEditing(false);
  };

  const displayValue = isRevealed ? value : maskValue(value);

  return (
    <div className="space-y-2">
      <Label className="flex items-center gap-1">
        {label}
        {isRequired && <span className="text-red-500">*</span>}
      </Label>
      
      {description && (
        <p className="text-sm text-slate-600">{description}</p>
      )}

      <div className="flex gap-2">
        {isEditing ? (
          <>
            <Input
              type="password"
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              placeholder={placeholder}
              className="flex-1"
              autoFocus
            />
            <Button onClick={handleSave} size="sm">
              <Save className="w-4 h-4" />
            </Button>
            <Button onClick={handleCancel} variant="outline" size="sm">
              Cancel
            </Button>
          </>
        ) : (
          <>
            <Input
              type="text"
              value={displayValue}
              readOnly
              placeholder={value ? undefined : 'Not set'}
              className={`flex-1 font-mono ${!value ? 'text-slate-400' : ''}`}
            />
            
            {value && (
              <Button
                onClick={handleReveal}
                variant="outline"
                size="sm"
                title={isRevealed ? 'Hide value' : 'Reveal value'}
              >
                {isRevealed ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </Button>
            )}
            
            {value && isRevealed && (
              <Button
                onClick={handleCopy}
                variant="outline"
                size="sm"
                title="Copy to clipboard"
              >
                <Copy className="w-4 h-4" />
              </Button>
            )}
            
            <Button
              onClick={handleEdit}
              variant="outline"
              size="sm"
              title="Edit value"
            >
              Edit
            </Button>
          </>
        )}
      </div>
    </div>
  );
}