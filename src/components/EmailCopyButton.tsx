import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { toast } from 'sonner';
import { Mail } from 'lucide-react';

interface EmailCopyButtonProps {
  emails: string[];
  groupName: string;
  variant?: 'default' | 'minimal';
}

export function EmailCopyButton({ emails, groupName, variant = 'default' }: EmailCopyButtonProps) {
  const [copying, setCopying] = useState(false);

  const handleCopyEmails = useCallback(async () => {
    if (copying) return;
    
    try {
      setCopying(true);
      // Simplified format - just comma-separated emails
      const formattedEmails = emails.join(', ');
      await navigator.clipboard.writeText(formattedEmails);
      
      toast.success('Emails copied to clipboard!', {
        description: `${emails.length} email${emails.length === 1 ? '' : 's'} copied`
      });
    } catch (error) {
      toast.error('Failed to copy emails');
    } finally {
      const timer = setTimeout(() => setCopying(false), 1000);
      return () => clearTimeout(timer);
    }
  }, [emails, copying]);

  const button = (
    <Button
      variant={variant === 'minimal' ? 'ghost' : 'outline'}
      size={variant === 'minimal' ? 'icon' : 'sm'}
      onClick={handleCopyEmails}
      className={`
        transition-all duration-200 relative
        ${variant === 'minimal' ? 'p-1 h-6 w-6' : ''}
        ${copying ? 'text-green-600' : variant === 'minimal' ? 'text-gray-400 hover:text-gray-600' : ''}
        ${copying && variant !== 'minimal' ? 'bg-green-50' : ''}
        group
      `}
      disabled={copying || emails.length === 0}
    >
      <Mail className={`w-4 h-4 ${variant !== 'minimal' ? 'mr-2' : ''} group-hover:scale-105 transition-transform`} />
      {variant !== 'minimal' && 'Copy Emails'}
    </Button>
  );

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          {button}
        </TooltipTrigger>
        <TooltipContent 
          className="bg-[#1E1E3F] text-white px-3 py-2 rounded-lg shadow-lg border border-[#2D2D5F]"
          sideOffset={5}
        >
          <div className="flex items-center gap-2">
            <Mail className="w-4 h-4" />
            <span>
              {copying 
                ? '✓ Copied to clipboard!' 
                : `Copy ${emails.length} email${emails.length === 1 ? '' : 's'}`
              }
            </span>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
} 