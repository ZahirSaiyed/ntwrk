"use client";

import React, { useRef, useState, useEffect } from 'react';
import { Icon, IconName } from '../icons/Icon';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
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
  
  // Should we show the controls (edit/delete buttons)
  const showControls = (isHovered || isFocused) && !disabled && (!!onEdit || !!onDelete);
  
  // Handle editing functionality
  const handleEdit = () => {
    if (onEdit && editMode === 'modal') {
      // For modal editing, just call the handler function
      (onEdit as () => void)();
      return;
    }
    
    // For inline editing
    setIsEditing(true);
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

  const chipContent = (
    <div
      ref={chipRef}
      className={chipBaseClass}
      onClick={!isEditing ? onClick : undefined}
      onKeyDown={handleKeyDown}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      tabIndex={disabled ? -1 : 0}
      role="button"
      aria-pressed={selected}
      aria-disabled={disabled}
    >
      {icon && (
        <Icon
          name={icon}
          size={iconSizes[size]}
          className={cn(
            "mr-1.5",
            selected ? "text-primary" : "text-muted-foreground"
          )}
        />
      )}
      
      {isEditing ? (
        <Input
          ref={inputRef}
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          className="h-6 px-1 py-0 text-sm border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
          onBlur={handleSave}
        />
      ) : (
        <span className="font-medium">{label}</span>
      )}
      
      {badge !== undefined && (
        <span className={cn(
          "ml-1.5 px-1.5 py-0.5 text-xs rounded-full",
          selected ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"
        )}>
          {badge}
        </span>
      )}
      
      {selected && showSelectedIcon && (
        <Icon
          name="Check"
          size={iconSizes[size]}
          className="ml-1.5 text-primary"
        />
      )}
      
      {showControls && (
        <div className="ml-1.5 flex items-center gap-0.5">
          {onEdit && (
            <Button
              variant="ghost"
              size="icon"
              className="h-5 w-5 p-0 hover:bg-transparent"
              onClick={(e) => {
                e.stopPropagation();
                handleEdit();
              }}
            >
              <Pencil className="h-3 w-3" />
            </Button>
          )}
          {onDelete && (
            <Button
              variant="ghost"
              size="icon"
              className="h-5 w-5 p-0 hover:bg-transparent"
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
            >
              <X className="h-3 w-3" />
            </Button>
          )}
        </div>
      )}
    </div>
  );

  if (tooltipContent && !isEditing) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          {chipContent}
        </TooltipTrigger>
        <TooltipContent>
          {tooltipContent}
        </TooltipContent>
      </Tooltip>
    );
  }

  return chipContent;
};

export default FilterChip; 