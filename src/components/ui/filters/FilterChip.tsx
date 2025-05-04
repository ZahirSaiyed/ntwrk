"use client";

import React, { useRef, useState, useEffect } from 'react';
import { Icon, IconName } from '../icons/Icon';
import { useTooltip } from '../TooltipProvider';
import { X, Pencil, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export interface FilterChipProps {
  label: string;
  icon?: IconName;
  selected?: boolean;
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
  badge?: number | string;
  color?: string;
  size?: 'sm' | 'md' | 'lg';
  tooltipContent?: string;
  showSelectedIcon?: boolean;
  onEdit?: ((newLabel: string) => void) | (() => void);
  onDelete?: () => void;
  editMode?: 'inline' | 'modal';
}

/**
 * FilterChip component for toggling filters with shadcn-inspired design
 * 
 * Usage:
 * ```tsx
 * <FilterChip 
 *   label="Active" 
 *   icon="Activity" 
 *   selected={filter === 'active'} 
 *   onClick={() => setFilter(filter === 'active' ? '' : 'active')} 
 * />
 * ```
 */
export const FilterChip: React.FC<FilterChipProps> = ({
  label,
  icon,
  selected = false,
  onClick,
  className = '',
  disabled = false,
  badge,
  color,
  size = 'md',
  tooltipContent,
  showSelectedIcon = true,
  onEdit,
  onDelete,
  editMode = 'inline',
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(label);
  const [isFocused, setIsFocused] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const chipRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { showTooltip, hideTooltip } = useTooltip();
  const tooltipTimerRef = useRef<NodeJS.Timeout | null>(null);
  
  // Should we show the controls (edit/delete buttons)
  const showControls = (isHovered || isFocused) && !disabled && (!!onEdit || !!onDelete);
  
  // Handle tooltip logic with improved delay
  const handleMouseEnter = () => {
    setIsHovered(true);
    if (tooltipContent && chipRef.current && !isEditing) {
      // Clear any existing timeout
      if (tooltipTimerRef.current) {
        clearTimeout(tooltipTimerRef.current);
      }
      
      // Use a timeout to prevent showing tooltip on quick mouse movements
      tooltipTimerRef.current = setTimeout(() => {
        showTooltip(tooltipContent, chipRef.current!.getBoundingClientRect());
      }, 300);
    }
  };
  
  const handleMouseLeave = () => {
    setIsHovered(false);
    
    // Clear any pending show timeouts
    if (tooltipTimerRef.current) {
      clearTimeout(tooltipTimerRef.current);
      tooltipTimerRef.current = null;
    }
    
    // Hide tooltip immediately for snappiness
    if (tooltipContent) {
      hideTooltip();
    }
  };

  // Handle editing functionality
  const handleEdit = () => {
    if (onEdit && editMode === 'modal') {
      // For modal editing, just call the handler function
      (onEdit as () => void)();
      return;
    }
    
    // For inline editing
    setIsEditing(true);
    hideTooltip(); // Hide tooltip when editing
  };

  const handleSave = () => {
    if (editValue.trim() && onEdit && editMode === 'inline') {
      (onEdit as (newLabel: string) => void)(editValue);
      setIsEditing(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (isEditing) {
      if (e.key === "Enter") {
        handleSave();
      } else if (e.key === "Escape") {
        setEditValue(label);
        setIsEditing(false);
      }
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onClick?.();
    }
  };

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (tooltipTimerRef.current) {
        clearTimeout(tooltipTimerRef.current);
      }
    };
  }, []);

  // Focus the input when editing starts
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);

  // Handle focus management for accessibility
  useEffect(() => {
    const handleFocusIn = () => setIsFocused(true);
    const handleFocusOut = (e: FocusEvent) => {
      if (chipRef.current && !chipRef.current.contains(e.relatedTarget as Node)) {
        setIsFocused(false);
        if (isEditing) {
          handleSave();
        }
      }
    };

    const element = chipRef.current;
    if (element) {
      element.addEventListener("focusin", handleFocusIn);
      element.addEventListener("focusout", handleFocusOut);
      return () => {
        element.removeEventListener("focusin", handleFocusIn);
        element.removeEventListener("focusout", handleFocusOut);
      }
    }
  }, [isEditing]);

  // Size-based configuration
  const iconSizes = {
    sm: 14,
    md: 16,
    lg: 18
  };

  // Common chip class based on shadcn styling
  const chipBaseClass = cn(
    "inline-flex items-center rounded-full border transition-all duration-200",
    "shadow-sm focus:outline-none",
    {
      "px-2 py-1 text-xs": size === 'sm',
      "px-3 py-1.5 text-sm": size === 'md',
      "px-4 py-2 text-base": size === 'lg',
    },
    selected 
      ? "bg-primary/10 text-primary border-primary/30 font-medium hover:bg-primary/20"
      : "bg-white text-foreground border-border hover:border-border/80 hover:bg-muted/20 hover:shadow-md",
    disabled ? "opacity-50 pointer-events-none" : "cursor-pointer",
    isEditing && "ring-2 ring-offset-2 ring-offset-background ring-primary/30",
    className
  );

  return (
    <div
      ref={chipRef}
      className={chipBaseClass}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onKeyDown={handleKeyDown}
      tabIndex={disabled ? -1 : 0}
      role={onClick ? "button" : "generic"}
      aria-pressed={onClick ? selected : undefined}
      onClick={isEditing ? undefined : onClick}
      aria-label={`Filter by ${label}${selected ? ' (selected)' : ''}`}
    >
      {isEditing ? (
        <div className="flex items-center gap-1 animate-in fade-in duration-200">
          <Input
            ref={inputRef}
            type="text"
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onKeyDown={handleKeyDown}
            className="h-6 w-24 rounded-sm border-none bg-transparent p-0 px-1 text-sm focus-visible:ring-1 focus-visible:ring-offset-0"
            autoFocus
          />
          <Button
            variant="ghost"
            size="icon"
            className="h-5 w-5 rounded-full p-0 text-green-600 hover:text-green-700 hover:bg-green-50 dark:text-green-500 dark:hover:text-green-400 dark:hover:bg-gray-800"
            onClick={handleSave}
            aria-label="Save"
          >
            <Check className="h-3 w-3" />
          </Button>
        </div>
      ) : (
        <>
          {icon && (
            <Icon 
              name={icon} 
              size={iconSizes[size]} 
              className={cn("mr-1.5", selected ? "text-primary" : "text-muted-foreground")}
            />
          )}
          
          <span className={cn("transition-all duration-200", showControls ? "mr-1.5" : "mr-0")}>{label}</span>
          
          {selected && showSelectedIcon && !showControls && (
            <Icon
              name="Check"
              size={iconSizes[size] - 2}
              className="text-primary ml-1.5"
            />
          )}
          
          {badge !== undefined && (
            <span 
              className={cn(
                "rounded-full px-2 py-0.5 text-xs ml-1.5 font-medium",
                selected ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"
              )}
            >
              {badge}
            </span>
          )}
          
          {/* Edit and Delete buttons that fade in on hover/focus */}
          <div
            className={cn(
              "flex items-center gap-1 transition-all duration-200",
              showControls ? "opacity-100 max-w-[80px] ml-1" : "opacity-0 max-w-0 ml-0 pointer-events-none"
            )}
          >
            {onEdit && (
              <Button
                variant="ghost"
                size="icon"
                className="h-5 w-5 rounded-full p-0 text-muted-foreground hover:text-foreground hover:bg-muted"
                onClick={(e) => {
                  e.stopPropagation();
                  handleEdit();
                }}
                aria-label="Edit filter"
                tabIndex={showControls ? 0 : -1}
              >
                <Pencil className="h-3 w-3" />
                <span className="sr-only">Edit</span>
              </Button>
            )}
            
            {onDelete && (
              <Button
                variant="ghost"
                size="icon"
                className="h-5 w-5 rounded-full p-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete();
                }}
                aria-label="Remove filter"
                tabIndex={showControls ? 0 : -1}
              >
                <X className="h-3 w-3" />
                <span className="sr-only">Remove</span>
              </Button>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default FilterChip; 